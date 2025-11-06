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

// Configurar trust proxy: solo confiar en el primer proxy (Render)
// Esto es más seguro que 'true' y evita que cualquiera falsifique X-Forwarded-For
app.set('trust proxy', 1);

// Seguridad básica
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limiting
// Deshabilitar validación de trust proxy ya que estamos detrás de Render (proxy confiable)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  validate: {
    trustProxy: false, // Deshabilitar validación ya que confiamos en el proxy de Render
  },
});
app.use('/api/', limiter);

// Sanitización mínima
const sanitize = s => String(s || '').trim().replace(/[<>]/g, '');

// Endpoint de chat - DEBE estar antes del middleware de archivos estáticos
app.post('/api/chat', async (req, res) => {
  try {
    console.log('POST /api/chat recibido', {
      body: req.body,
      contentType: req.get('content-type'),
      method: req.method,
      path: req.path,
    });

    // Validar que el body existe
    if (!req.body) {
      console.error('Request body vacío');
      return res.status(400).json({ success: false, error: 'Body de la petición vacío' });
    }

    const { message, history = [], provider } = req.body;

    // Validar que el mensaje existe y no está vacío
    if (!message || typeof message !== 'string') {
      console.error('Mensaje inválido:', message);
      return res.status(400).json({ success: false, error: 'Mensaje inválido o vacío' });
    }

    const cleanMessage = sanitize(message);
    if (!cleanMessage || cleanMessage.length === 0) {
      console.error('Mensaje vacío después de sanitizar');
      return res.status(400).json({ success: false, error: 'Mensaje vacío' });
    }

    const googleKey = process.env.GOOGLE_GEMINI_API_KEY;
    const hfKey = process.env.HUGGINGFACE_API_KEY;

    const selected = provider || (googleKey ? 'gemini' : hfKey ? 'huggingface' : null);
    if (!selected) return res.status(500).json({ success: false, error: 'No hay proveedor configurado' });

    if (selected === 'gemini') {
      const payload = {
        contents: [...history, { role: 'user', content: cleanMessage }].map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      };
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleKey}`;
      const r = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
      const text = r.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
      return res.json({ success: true, message: text });
    }

    if (selected === 'huggingface') {
      const conversation = [...history, { role: 'user', content: cleanMessage }]
        .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
        .join('\n');
      const payload = {
        inputs: conversation,
        parameters: { max_new_tokens: 250, temperature: 0.7 },
      };
      const r = await axios.post(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        payload,
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hfKey}` } }
      );
      const text = r.data?.generated_text || 'Sin respuesta';
      return res.json({ success: true, message: text });
    }

    return res.status(500).json({ success: false, error: 'Proveedor no soportado' });
  } catch (e) {
    const status = e?.response?.status || 500;
    return res.status(status).json({ success: false, error: e?.message || 'Error' });
  }
});

// Servir estáticos (producción) - DEBE ir después de las rutas de API
const distDir = path.resolve(__dirname, '../dist');

// Servir archivos estáticos
app.use(express.static(distDir));

// Catch-all para SPA: solo para GET requests que no sean /api/* o /health
app.get('*', (req, res) => {
  // Si es una ruta de API o health, devolver 404
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return res.status(404).json({ success: false, error: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT) || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`API endpoint: http://localhost:${port}/api/chat`);
  console.log(`GOOGLE_GEMINI_API_KEY: ${process.env.GOOGLE_GEMINI_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
  console.log(`HUGGINGFACE_API_KEY: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configurada' : '❌ No configurada'}`);
});


