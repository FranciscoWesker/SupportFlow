import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import logger from './logger.mjs';
import { connectMongoDB, disconnectMongoDB, isMongoDBConnected } from './db/mongodb.mjs';
import Conversation from './models/Conversation.mjs';
import Message from './models/Message.mjs';
import { decrypt } from './utils/encryption.mjs';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 10000;
const isProduction = process.env.NODE_ENV === 'production';

// Leer clave de Gemini (prefiere GOOGLE_GEMINI_API_KEY pero acepta GEMINI_API_KEY por compatibilidad)
const geminiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Configurar cliente de Google GenAI con la clave (si está presente)
const ai = new GoogleGenAI({ apiKey: geminiKey });

// ============================================
// CONFIGURACIÓN BÁSICA
// ============================================
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
// Función para generar nonce único por request
const generateNonce = () => {
  return crypto.randomBytes(16).toString('base64');
};

// Middleware para generar nonce y agregarlo al request
app.use((req, res, next) => {
  req.nonce = generateNonce();
  next();
});

// Helmet: configuración de seguridad con CSP usando nonces
// En desarrollo, usamos una CSP más permisiva para facilitar el desarrollo (hot-reload, etc.)
// pero mantenemos las protecciones básicas activas.
// Si tu app consulta APIs externas (Sentry, CDNs, websockets, HuggingFace, etc.) añade sus orígenes a connectSrc/scriptSrc/imgSrc.
const helmetOptions = isProduction
  ? {
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'https://supportflow-yorh.onrender.com',
            (req, res) => `'nonce-${req.nonce}'`, // Nonce dinámico por request
          ],
          styleSrc: ["'self'", "'unsafe-inline'"], // Vite genera estilos inline
          imgSrc: ["'self'", 'data:', 'https://supportflow-yorh.onrender.com'],
          // Añade dominios externos aquí según sea necesario (ej: HuggingFace inference API)
          connectSrc: ["'self'", 'https://api-inference.huggingface.co', 'https://supportflow-yorh.onrender.com'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      // HSTS: solo aplicable si sirves HTTPS en producción
      hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
      // Opcional: activar COOP/COEP si tu app lo requiere (p. ej. SharedArrayBuffer). Descomenta si lo necesitas.
      // crossOriginEmbedderPolicy: true,
      // crossOriginOpenerPolicy: { policy: 'same-origin' },
    }
  : {
      // En desarrollo: CSP más permisiva pero aún segura
      // Permite unsafe-inline/unsafe-eval para facilitar hot-reload de Vite
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http://localhost', 'http://127.0.0.1'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'http://localhost', 'http://127.0.0.1'],
          connectSrc: ["'self'", 'http://localhost', 'http://127.0.0.1', 'ws://localhost', 'ws://127.0.0.1', 'https://api-inference.huggingface.co'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      // En desarrollo no activamos HSTS
      hsts: false,
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    };

app.use(helmet(helmetOptions));

app.use(cors({ 
  origin: true, 
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '1mb' }));

// ============================================
// RATE LIMITING
// ============================================
// Limiter general para todas las rutas /api (protección básica)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // peticiones por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones, intenta de nuevo más tarde'
    });
  }
});

// Limiter más estricto solo para /api/chat
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones al chat, intenta de nuevo más tarde'
    });
  }
});

// ============================================
// LOGGING MIDDLEWARE (solo para API)
// ============================================
// Aplicar limitadores antes de las rutas
app.use('/api', apiLimiter);
// Limitar específicamente el chat
app.use('/api/chat', chatLimiter);

app.use('/api', (req, res, next) => {
  logger.info({
    route: '/api',
    method: req.method,
    path: req.path,
    bodyPresent: Boolean(req.body),
    ip: req.ip,
    time: new Date().toISOString(),
  });
  next();
});

// ============================================
// RUTAS DE API (ANTES de archivos estáticos)
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ENDPOINTS DE CONVERSACIONES
// ============================================

// Listar todas las conversaciones
app.get('/api/conversations', async (req, res) => {
  try {
    // Verificar conexión a MongoDB
    if (!isMongoDBConnected()) {
      logger.warn({ event: 'mongodb_not_connected', endpoint: '/api/conversations' });
      return res.status(503).json({
        success: false,
        error: 'Servicio de base de datos no disponible',
      });
    }

    const conversations = await Conversation.find({})
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .lean();

    // Descifrar conversaciones manualmente para evitar problemas con métodos estáticos
    const decryptedConversations = conversations.map(conv => ({
      ...conv,
      title: decrypt(conv.title || 'Nueva conversación'),
    }));
    
    res.json({
      success: true,
      conversations: decryptedConversations,
    });
  } catch (error) {
    logger.error({ 
      event: 'conversations_list_error', 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({
      success: false,
      error: 'Error al listar conversaciones',
    });
  }
});

// Obtener una conversación con sus mensajes
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar ObjectId para prevenir inyección NoSQL
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de conversación inválido',
      });
    }
    
    // Convertir a ObjectId válido para la consulta
    const objectId = new mongoose.Types.ObjectId(id);
    const conversation = await Conversation.findById(objectId).lean();
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversación no encontrada',
      });
    }

    const messages = await Message.find({ conversationId: objectId })
      .sort({ timestamp: 1 })
      .lean();

    const decryptedConversation = {
      ...conversation,
      title: decrypt(conversation.title),
    };
    // Descifrar mensajes manualmente para evitar problemas con métodos estáticos
    const decryptedMessages = messages.map(msg => ({
      ...msg,
      content: decrypt(msg.content || ''),
    }));

    res.json({
      success: true,
      conversation: decryptedConversation,
      messages: decryptedMessages,
    });
  } catch (error) {
    logger.error({ event: 'conversation_get_error', error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener conversación',
    });
  }
});

// Crear nueva conversación
app.post('/api/conversations', async (req, res) => {
  try {
    const { title } = req.body;
    
    const conversation = new Conversation({
      title: title || 'Nueva conversación',
      messageCount: 0,
      lastMessageAt: new Date(),
    });

    await conversation.save();
    
    const decryptedConversation = {
      ...conversation.toObject(),
      title: conversation.getDecryptedTitle(),
    };

    res.status(201).json({
      success: true,
      conversation: decryptedConversation,
    });
  } catch (error) {
    logger.error({ event: 'conversation_create_error', error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al crear conversación',
    });
  }
});

// Actualizar título de conversación
app.put('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    // Validar ObjectId para prevenir inyección NoSQL
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de conversación inválido',
      });
    }

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Título inválido',
      });
    }

    // Convertir a ObjectId válido para la consulta
    const objectId = new mongoose.Types.ObjectId(id);
    const conversation = await Conversation.findById(objectId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversación no encontrada',
      });
    }

    conversation.title = title;
    await conversation.save();

    const decryptedConversation = {
      ...conversation.toObject(),
      title: conversation.getDecryptedTitle(),
    };

    res.json({
      success: true,
      conversation: decryptedConversation,
    });
  } catch (error) {
    logger.error({ event: 'conversation_update_error', error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar conversación',
    });
  }
});

// Eliminar conversación
app.delete('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ObjectId para prevenir inyección NoSQL
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de conversación inválido',
      });
    }

    // Convertir a ObjectId válido para la consulta
    const objectId = new mongoose.Types.ObjectId(id);

    // Eliminar mensajes asociados
    await Message.deleteMany({ conversationId: objectId });
    
    // Eliminar conversación
    const conversation = await Conversation.findByIdAndDelete(objectId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversación no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Conversación eliminada',
    });
  } catch (error) {
    logger.error({ event: 'conversation_delete_error', error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al eliminar conversación',
    });
  }
});

// Guardar mensaje en conversación
app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, sender } = req.body;

    // Validar ObjectId para prevenir inyección NoSQL
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de conversación inválido',
      });
    }

    if (!content || !sender || !['user', 'bot'].includes(sender)) {
      return res.status(400).json({
        success: false,
        error: 'Datos de mensaje inválidos',
      });
    }

    // Convertir a ObjectId válido para la consulta
    const objectId = new mongoose.Types.ObjectId(id);
    const conversation = await Conversation.findById(objectId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversación no encontrada',
      });
    }

    const message = new Message({
      conversationId: objectId,
      content: sanitize(content),
      sender,
      timestamp: new Date(),
    });

    await message.save();

    // Actualizar conversación
    conversation.messageCount += 1;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const decryptedMessage = {
      ...message.toObject(),
      content: message.getDecryptedContent(),
    };

    res.status(201).json({
      success: true,
      message: decryptedMessage,
    });
  } catch (error) {
    logger.error({ event: 'message_save_error', error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al guardar mensaje',
    });
  }
});

// Actualizar feedback de mensaje
app.put('/api/messages/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    // Validar ObjectId para prevenir inyección NoSQL
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID de mensaje inválido',
      });
    }

    // Validar que feedback sea un valor literal (string o null/undefined)
    // Previene inyección NoSQL asegurando que no sea un objeto con operadores
    let validFeedback = null;
    if (feedback !== undefined && feedback !== null) {
      // Asegurar que feedback sea un string literal, no un objeto
      if (typeof feedback !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Feedback debe ser un string o null',
        });
      }
      // Validar que solo sea 'up' o 'down'
      if (!['up', 'down'].includes(feedback)) {
        return res.status(400).json({
          success: false,
          error: 'Feedback inválido. Debe ser "up" o "down"',
        });
      }
      validFeedback = feedback;
    }

    // Convertir a ObjectId válido para la consulta
    const objectId = new mongoose.Types.ObjectId(id);
    const message = await Message.findByIdAndUpdate(
      objectId,
      { feedback: validFeedback },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Mensaje no encontrado',
      });
    }

    const decryptedMessage = {
      ...message.toObject(),
      content: message.getDecryptedContent(),
    };

    res.json({
      success: true,
      message: decryptedMessage,
    });
  } catch (error) {
    logger.error({ event: 'message_feedback_error', error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar feedback',
    });
  }
});

// Búsqueda en conversaciones
app.get('/api/conversations/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query de búsqueda inválido',
      });
    }

    // Buscar en mensajes (contenido descifrado)
    const messages = await Message.find({}).lean();
    const matchingMessages = messages.filter(msg => {
      const decryptedContent = decrypt(msg.content);
      return decryptedContent.toLowerCase().includes(q.toLowerCase());
    });

    // Obtener IDs únicos de conversaciones y validarlos
    const conversationIds = [...new Set(matchingMessages.map(msg => msg.conversationId?.toString()).filter(Boolean))];
    
    // Validar y convertir todos los IDs a ObjectId para prevenir inyección NoSQL
    const validObjectIds = conversationIds
      .filter(id => isValidObjectId(id))
      .map(id => new mongoose.Types.ObjectId(id));
    
    if (validObjectIds.length === 0) {
      return res.json({
        success: true,
        conversations: [],
        count: 0,
      });
    }
    
    const conversations = await Conversation.find({
      _id: { $in: validObjectIds },
    }).lean();

    // Descifrar conversaciones manualmente
    const decryptedConversations = conversations.map(conv => ({
      ...conv,
      title: decrypt(conv.title || 'Nueva conversación'),
    }));

    res.json({
      success: true,
      conversations: decryptedConversations,
      count: decryptedConversations.length,
    });
  } catch (error) {
    logger.error({ event: 'conversations_search_error', error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error en búsqueda',
    });
  }
});

// Nota: rate limiting aplicado globalmente y para /api/chat más arriba

// Función de sanitización
const sanitize = (s) => String(s || '').trim().replace(/[<>]/g, '');

// Función de validación de ObjectId de MongoDB
// Previene inyección NoSQL validando que el ID sea un ObjectId válido
const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // Validar que sea un ObjectId válido de MongoDB (24 caracteres hexadecimales)
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
};

// ============================================
// ENDPOINT PRINCIPAL DE CHAT
// ============================================
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info({ event: 'chat_process_start' });

    // Validar body
    if (!req.body) {
      logger.warn({ event: 'chat_empty_body' });
      return res.status(400).json({
        success: false,
        error: 'Body de la petición vacío',
      });
    }

  const { message, provider, history } = req.body;

    // Validar mensaje
    if (!message || typeof message !== 'string') {
      logger.warn({ event: 'chat_invalid_message', type: typeof message });
      return res.status(400).json({
        success: false,
        error: 'Mensaje inválido o vacío',
      });
    }

    const cleanMessage = sanitize(message);
    if (!cleanMessage || cleanMessage.length === 0) {
      logger.warn({ event: 'chat_empty_after_sanitize' });
      return res.status(400).json({
        success: false,
        error: 'Mensaje vacío',
      });
    }

  // No registrar texto de usuario en logs; registrar solo metadatos
  logger.debug({ 
    event: 'chat_message_valid', 
    length: cleanMessage.length,
    hasHistory: Boolean(history && Array.isArray(history) && history.length > 0)
  });

    // Selección de proveedor
    const hfKey = process.env.HUGGINGFACE_API_KEY;
    const hfModel = process.env.HUGGINGFACE_MODEL || 'gpt2';

    const preferHf = Boolean(hfKey) && (provider === 'huggingface' || !geminiKey);

    if (preferHf) {
      logger.info({ event: 'chat_use_hf', model: hfModel });

      try {
        const hfResp = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: cleanMessage })
        });

        const hfData = await hfResp.json();

        // Manejo flexible de respuesta: algunos modelos devuelven [{generated_text}] u objetcs
        let text = '';
        if (Array.isArray(hfData) && hfData[0]?.generated_text) {
          text = hfData[0].generated_text;
        } else if (hfData.generated_text) {
          text = hfData.generated_text;
        } else if (typeof hfData === 'string') {
          text = hfData;
        } else if (hfData.error) {
          throw new Error(hfData.error || 'Error de HuggingFace');
        } else {
          // Último recurso: stringify
          text = JSON.stringify(hfData);
        }

    const duration = Date.now() - startTime;
    logger.info({ event: 'chat_hf_response', durationMs: duration });
        return res.json({ success: true, message: text });
      } catch (hfErr) {
        logger.error({ event: 'chat_hf_error', error: hfErr?.message || hfErr });
        return res.status(502).json({ success: false, error: 'Error en HuggingFace' });
      }
    }

    // Si llegamos aquí, usamos Gemini
    const geminiModel = 'models/gemini-2.5-flash';

    if (!geminiKey) {
      logger.error({ event: 'chat_gemini_key_missing' });
      return res.status(503).json({
        success: false,
        error: 'Clave de API de Gemini no configurada',
      });
    }

  logger.info({ event: 'chat_use_gemini', model: geminiModel });

    // Preparar el historial de conversación para Gemini
    // La API de Gemini espera un array de mensajes con role y content
    let contents = cleanMessage;
    if (history && Array.isArray(history) && history.length > 0) {
      // Construir el array de mensajes para Gemini
      // Formato: [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
      const historyMessages = history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model', // Gemini usa 'model' en lugar de 'assistant'
        parts: [{ text: msg.content }],
      }));
      
      // Agregar el mensaje actual
      historyMessages.push({
        role: 'user',
        parts: [{ text: cleanMessage }],
      });
      
      contents = historyMessages;
    } else {
      // Si no hay historial, usar solo el mensaje actual
      contents = {
        role: 'user',
        parts: [{ text: cleanMessage }],
      };
    }

    // Enviar la solicitud a la API de Gemini
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: Array.isArray(contents) ? contents : [contents],
    });

  logger.info({ event: 'chat_gemini_response', status: response.status });

    if (!response.text) {
      logger.error({ event: 'chat_gemini_no_text', data: response.data });
      throw new Error('Respuesta vacía de Gemini');
    }

    const text = response.text;
    const duration = Date.now() - startTime;

    logger.info({ event: 'chat_response_processed', durationMs: duration });
    return res.json({ success: true, message: text });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error({
      event: 'chat_error',
      durationMs: duration,
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    const status = error?.response?.status || 500;
    const message = error?.response?.data?.error?.message || error?.message || 'Error interno del servidor';

    return res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS (DESPUÉS de API)
// ============================================
// Limiter para rutas estáticas / SPA — protege sendFile/res.sendFile de acceso excesivo al FS
const staticLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200, // requests per minute per IP to static assets
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones a recursos estáticos, intenta de nuevo más tarde'
    });
  }
});

// Aplicar limiter a rutas estáticas y SPA catch-all
app.use(staticLimiter);
const distDir = path.resolve(__dirname, '../dist');

logger.info({ event: 'server_dist_dir', distDir });

// Servir archivos estáticos
app.use(express.static(distDir, {
  maxAge: isProduction ? '1d' : '0',
  etag: true
}));

// ============================================
// CATCH-ALL para SPA (DEBE SER EL ÚLTIMO)
// ============================================
app.get('*', (req, res) => {
  // No servir index.html para rutas de API
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return res.status(404).json({ 
      success: false, 
      error: 'Ruta no encontrada' 
    });
  }
  
  // En producción, inyectar nonce en scripts inline del HTML
  if (isProduction) {
    try {
      const indexPath = path.join(distDir, 'index.html');
      let html = readFileSync(indexPath, 'utf8');
      
      // Inyectar nonce en todos los scripts que no lo tengan ya
      // Reemplazar <script> con <script nonce="...">
      // Esta regex captura todos los scripts (incluyendo type="module") y agrega el nonce
      html = html.replace(
        /<script(?![^>]*\snonce=)([^>]*)>/gi,
        (match, attributes) => {
          // Si el script ya tiene nonce, no hacer nada
          if (attributes.includes('nonce=')) {
            return match;
          }
          // Agregar nonce al inicio de los atributos
          return `<script nonce="${req.nonce}"${attributes}>`;
        }
      );
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      logger.error({ event: 'spa_html_error', error: err?.message || err });
      res.status(500).send('Error al cargar la aplicación');
    }
  } else {
    // En desarrollo, servir normalmente
    res.sendFile(path.join(distDir, 'index.html'), (err) => {
      if (err) {
        logger.error({ event: 'spa_sendfile_error', error: err?.message || err });
        res.status(500).send('Error al cargar la aplicación');
      }
    });
  }
});

// ============================================
// MANEJO DE ERRORES 404 PARA POST
// ============================================
app.use((req, res) => {
  logger.warn({ event: 'not_found', method: req.method, path: req.path });
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
  });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  logger.error({ event: 'server_error', error: err?.message || err });
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
// Conectar a MongoDB antes de iniciar el servidor
connectMongoDB().catch((error) => {
  logger.error({ 
    event: 'mongodb_connection_failed_startup', 
    error: error.message 
  });
  // Continuar sin MongoDB si falla (modo degradado)
});

const server = app.listen(port, '0.0.0.0', async () => {
  logger.info({
    event: 'server_start',
    port,
    env: process.env.NODE_ENV || 'development',
    endpoints: { 
      health: '/health', 
      test: '/api/test', 
      chat: '/api/chat',
      conversations: '/api/conversations'
    },
    geminiConfigured: Boolean(geminiKey),
    huggingfaceConfigured: Boolean(process.env.HUGGINGFACE_API_KEY),
    mongodbConfigured: Boolean(process.env.MONGODB_URI),
  });
});

// Manejo de señales para shutdown graceful
const shutdown = async () => {
  logger.info({ event: 'shutdown_start' });
  
  // Desconectar MongoDB
  await disconnectMongoDB();
  
  server.close(() => {
    logger.info({ event: 'shutdown_complete' });
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    logger.error({ event: 'shutdown_forced' });
    process.exit(1);
  }, 10000);

};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
