import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import logger from './logger.mjs';

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
// Helmet: configuración de seguridad con CSP apropiada para desarrollo y producción.
// En desarrollo, usamos una CSP más permisiva para facilitar el desarrollo (hot-reload, etc.)
// pero mantenemos las protecciones básicas activas.
// Si tu app consulta APIs externas (Sentry, CDNs, websockets, HuggingFace, etc.) añade sus orígenes a connectSrc/scriptSrc/imgSrc.
const helmetOptions = isProduction
  ? {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://supportflow-yorh.onrender.com'],
          // Evitamos 'unsafe-inline' en style-src para mayor seguridad. Si detectas problemas, añade nonces o hashes.
          styleSrc: ["'self'"],
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

// Nota: rate limiting aplicado globalmente y para /api/chat más arriba

// Función de sanitización
const sanitize = (s) => String(s || '').trim().replace(/[<>]/g, '');

// Endpoint principal de chat
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

  const { message, provider } = req.body;

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
  logger.debug({ event: 'chat_message_valid', length: cleanMessage.length });

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

    // Enviar la solicitud a la API de Gemini
    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: cleanMessage,
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
  
  // Servir index.html para todas las demás rutas (SPA)
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) {
      logger.error({ event: 'spa_sendfile_error', error: err?.message || err });
      res.status(500).send('Error al cargar la aplicación');
    }
  });
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
const server = app.listen(port, '0.0.0.0', () => {
  logger.info({
    event: 'server_start',
    port,
    env: process.env.NODE_ENV || 'development',
    endpoints: { health: '/health', test: '/api/test', chat: '/api/chat' },
    geminiConfigured: Boolean(geminiKey),
    huggingfaceConfigured: Boolean(process.env.HUGGINGFACE_API_KEY),
  });
});

// Manejo de señales para shutdown graceful
const shutdown = () => {
  logger.info({ event: 'shutdown_start' });
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
