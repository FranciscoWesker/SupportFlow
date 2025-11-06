import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 10000;

// ============================================
// CONFIGURACIÓN BÁSICA
// ============================================
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES GLOBALES
// ============================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));

// ============================================
// RUTAS DE API - DEBEN IR ANTES DE TODO
// ============================================

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint de prueba
app.get('/api/test', (_req, res) => {
  res.json({ success: true, message: 'Servidor funcionando correctamente' });
});

// Rate limiting para API
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  validate: {
    trustProxy: false,
  },
});

// Aplicar rate limiting solo a rutas de API
app.use('/api/', limiter);

// Middleware de logging para API
app.use('/api/', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    body: req.body,
    ip: req.ip,
  });
  next();
});

// Función de sanitización
const sanitize = (s) => String(s || '').trim().replace(/[<>]/g, '');

// Endpoint principal de chat
app.post('/api/chat', async (req, res) => {
  try {
    console.log('POST /api/chat - Iniciando procesamiento');

    // Validar body
    if (!req.body) {
      console.error('POST /api/chat - Body vacío');
      return res.status(400).json({ success: false, error: 'Body de la petición vacío' });
    }

    const { message, history = [], provider } = req.body;

    // Validar mensaje
    if (!message || typeof message !== 'string') {
      console.error('POST /api/chat - Mensaje inválido:', message);
      return res.status(400).json({ success: false, error: 'Mensaje inválido o vacío' });
    }

    const cleanMessage = sanitize(message);
    if (!cleanMessage || cleanMessage.length === 0) {
      console.error('POST /api/chat - Mensaje vacío después de sanitizar');
      return res.status(400).json({ success: false, error: 'Mensaje vacío' });
    }

    console.log('POST /api/chat - Mensaje válido:', cleanMessage.substring(0, 50));

    // Obtener API keys
    const googleKey = process.env.GOOGLE_GEMINI_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_KEY;

    // Seleccionar proveedor
    const selected = provider || (googleKey ? 'gemini' : hfKey ? 'huggingface' : null);
    if (!selected) {
      console.error('POST /api/chat - No hay proveedor configurado');
      return res.status(500).json({ success: false, error: 'No hay proveedor configurado' });
    }

    console.log('POST /api/chat - Usando proveedor:', selected);

    // Procesar con Gemini
    if (selected === 'gemini') {
      const payload = {
        contents: [...history, { role: 'user', content: cleanMessage }].map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      };
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleKey}`;
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
      console.log('POST /api/chat - Respuesta de Gemini recibida');
      return res.json({ success: true, message: text });
    }

    // Procesar con Hugging Face
    if (selected === 'huggingface') {
      const conversation = [...history, { role: 'user', content: cleanMessage }]
        .map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
        .join('\n');
      const payload = {
        inputs: conversation,
        parameters: { max_new_tokens: 250, temperature: 0.7 },
      };
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${hfKey}`,
          },
        }
      );
      const text = response.data?.generated_text || 'Sin respuesta';
      console.log('POST /api/chat - Respuesta de Hugging Face recibida');
      return res.json({ success: true, message: text });
    }

    return res.status(500).json({ success: false, error: 'Proveedor no soportado' });
  } catch (error) {
    console.error('POST /api/chat - Error:', error);
    const status = error?.response?.status || 500;
    const message = error?.message || 'Error interno del servidor';
    return res.status(status).json({ success: false, error: message });
  }
});

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS (SPA)
// ============================================
const distDir = path.resolve(__dirname, '../dist');
app.use(express.static(distDir));

// ============================================
// CATCH-ALL PARA SPA (solo GET, no API)
// ============================================
app.get('*', (req, res) => {
  // Si es una ruta de API, no servir index.html
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
  }
  // Si es /health, no servir index.html
  if (req.path === '/health') {
    return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
  }
  // Servir index.html para todas las demás rutas (SPA)
  res.sendFile(path.join(distDir, 'index.html'));
});

// ============================================
// MANEJO DE RUTAS POST NO ENCONTRADAS
// ============================================
app.post('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
  }
  return res.status(404).json({ success: false, error: 'Endpoint API no encontrado' });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`✅ Servidor Express iniciado correctamente`);
  console.log(`📡 Puerto: ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
  console.log(`💬 Chat endpoint: http://localhost:${port}/api/chat`);
  console.log(`🔑 GOOGLE_GEMINI_API_KEY: ${process.env.GOOGLE_GEMINI_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`🔑 HUGGINGFACE_API_KEY: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
  console.log('='.repeat(60));
  
  // Verificar rutas registradas
  const routes = [];
  if (app._router && app._router.stack) {
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods);
        routes.push(`${methods.join(',').toUpperCase()} ${middleware.route.path}`);
      }
    });
  }
  console.log('📋 Rutas registradas:', routes.length > 0 ? routes : 'No se pudieron detectar');
  console.log('='.repeat(60));
});
