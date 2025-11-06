import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 10000;
const isProduction = process.env.NODE_ENV === 'production';

// Configurar cliente de Google GenAI
const ai = new GoogleGenAI({});

// ============================================
// CONFIGURACIÓN BÁSICA
// ============================================
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false 
}));

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
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones, intenta de nuevo más tarde'
    });
  }
});

// ============================================
// LOGGING MIDDLEWARE (solo para API)
// ============================================
app.use('/api', (req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`, {
    body: req.body ? 'presente' : 'ausente',
    ip: req.ip,
    time: new Date().toISOString()
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

// Aplicar rate limiting solo a /api/chat
app.use('/api/chat', limiter);

// Función de sanitización
const sanitize = (s) => String(s || '').trim().replace(/[<>]/g, '');

// Endpoint principal de chat
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('[CHAT] Iniciando procesamiento');

    // Validar body
    if (!req.body) {
      console.error('[CHAT] Body vacío');
      return res.status(400).json({
        success: false,
        error: 'Body de la petición vacío',
      });
    }

    const { message, history = [], provider } = req.body;

    // Validar mensaje
    if (!message || typeof message !== 'string') {
      console.error('[CHAT] Mensaje inválido:', typeof message);
      return res.status(400).json({
        success: false,
        error: 'Mensaje inválido o vacío',
      });
    }

    const cleanMessage = sanitize(message);
    if (!cleanMessage || cleanMessage.length === 0) {
      console.error('[CHAT] Mensaje vacío después de sanitizar');
      return res.status(400).json({
        success: false,
        error: 'Mensaje vacío',
      });
    }

    console.log('[CHAT] Mensaje válido:', cleanMessage.substring(0, 50) + '...');

    // Obtener API key de Gemini
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      console.error('[CHAT] Clave de API de Gemini no configurada');
      return res.status(503).json({
        success: false,
        error: 'Clave de API de Gemini no configurada',
      });
    }

    // Configurar el modelo de Gemini
    const geminiModel = 'models/gemini-2.5-flash';

    // Preparar el payload para la API de Gemini
    const payload = {
      model: geminiModel,
      prompt: cleanMessage,
      temperature: 0.7,
      max_output_tokens: 100,
    };

    console.log('[CHAT] Enviando request a Gemini (modelo):', geminiModel);

    // Enviar la solicitud a la API de Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: cleanMessage,
    });

    console.log('[CHAT] Respuesta de Gemini recibida:', response.status);

    if (!response.text) {
      console.error('[CHAT] Respuesta de Gemini sin texto:', JSON.stringify(response.data, null, 2));
      throw new Error('Respuesta vacía de Gemini');
    }

    const text = response.text;
    const duration = Date.now() - startTime;

    console.log(`[CHAT] Respuesta procesada en ${duration}ms`);
    return res.json({ success: true, message: text });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[CHAT] Error después de ${duration}ms:`, {
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
const distDir = path.resolve(__dirname, '../dist');

console.log('[SERVER] Directorio dist:', distDir);

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
      console.error('[SPA] Error sirviendo index.html:', err);
      res.status(500).send('Error al cargar la aplicación');
    }
  });
});

// ============================================
// MANEJO DE ERRORES 404 PARA POST
// ============================================
app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ 
    success: false, 
    error: 'Error interno del servidor' 
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const server = app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`✅ Servidor Express iniciado`);
  console.log(`📡 Puerto: ${port}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health: http://localhost:${port}/health`);
  console.log(`🧪 Test: http://localhost:${port}/api/test`);
  console.log(`💬 Chat: http://localhost:${port}/api/chat`);
  console.log(`🔑 Gemini: ${process.env.GOOGLE_GEMINI_API_KEY ? '✅' : '❌'}`);
  console.log(`🔑 HuggingFace: ${process.env.HUGGINGFACE_API_KEY ? '✅' : '❌'}`);
  console.log('='.repeat(60));
});

// Manejo de señales para shutdown graceful
const shutdown = () => {
  console.log('\n🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('⚠️ Forzando cierre del servidor');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
