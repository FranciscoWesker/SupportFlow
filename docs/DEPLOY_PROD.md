# 🚀 Guía de Despliegue en Producción - SupportFlow

## ❌ ¿Por qué NO Vercel?

- Límite de 50MB por función serverless
- Modelos de IA locales pesan 6GB+
- No hay GPU disponible
- FastAPI no es serverless nativo

## ✅ Opciones Recomendadas

### Opción 1: Render (RECOMENDADO) 🌟

**Ventajas:**
- ✅ Soporte nativo para Python
- ✅ Build automático desde Git
- ✅ HTTPS gratuito
- ✅ Servidor siempre activo
- ✅ Soporta modelos pesados (con RAM suficiente)

**Despliegue:**

1. **Crear cuenta en [Render.com](https://render.com)**

2. **Crear nuevo servicio Web Service**

3. **Configuración:**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Variables de entorno:**
   ```env
   HUGGINGFACE_API_KEY=tu_clave
   PORT=10000
   ```

5. **Plan**: Starter ($7/mes) o Profesional si necesitas más RAM

### Opción 2: Railway 🚂

**Despliegue:**

```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Iniciar proyecto
railway init

# Desplegar
railway up
```

**Configurar variables:**
```bash
railway variables set HUGGINGFACE_API_KEY=tu_clave
```

### Opción 3: Fly.io ✈️

**Despliegue:**

```bash
# Instalar flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Desplegar
flyctl launch
```

## 🎯 Configuración Optimizada para Producción

### Usar SOLO Cerebras (sin modelo local)

Para producción, es mejor usar solo Cerebras API:

```python
# backend/AIEngine_prod.py
class AIEngine:
    def __init__(self):
        # Solo usar Cerebras, no cargar modelo local
        self.hf_api_key = os.getenv("HUGGINGFACE_API_KEY", "")
        if not self.hf_api_key:
            raise ValueError("HUGGINGFACE_API_KEY es requerida en producción")
        
        self.cerebras_client = InferenceClient(
            provider="cerebras",
            api_key=self.hf_api_key
        )
        self.cerebras_available = True
        self.local_model_available = False
```

### Frontend Separado en Vercel

Puedes desplegar el frontend en Vercel y apuntar al backend en Render:

1. **Crear archivo `vercel.json` en frontend:**
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://tu-backend-render.onrender.com/$1"
    }
  ]
}
```

2. **Actualizar `frontend/app.js`:**
```javascript
// Cambiar la URL del API
const API_URL = process.env.VERCEL ? 
    'https://tu-backend-render.onrender.com' : 
    'http://localhost:8000';
```

## 📋 Pasos para Desplegar en Render

### 1. Preparar repositorio Git

```bash
git init
git add .
git commit -m "SupportFlow - Listo para producción"
git remote add origin tu-repositorio
git push -u origin main
```

### 2. Crear servicio en Render

1. Ve a https://render.com
2. Click "New +" → "Web Service"
3. Conecta tu repositorio de Git
4. Configura:
   - **Name**: supportflow
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Agregar variables de entorno

En Render → Environment:
```
HUGGINGFACE_API_KEY=tu_clave_aqui
PORT=10000
PYTHON_VERSION=3.12
```

### 4. Deploy

Render construirá y desplegará automáticamente.

### 5. Frontend en Vercel (Opcional)

```bash
cd frontend
vercel --prod
```

Actualiza la URL del API en `app.js` para apuntar a tu Render.

## 🎯 Arquitectura Recomendada

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │ ← Interfaz React/HTML
│                 │
└────────┬────────┘
         │
         ↓ API Calls
┌─────────────────┐
│   Backend       │
│   (Render)      │ ← FastAPI + Cerebras
│                 │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Cerebras API  │
│   (HuggingFace) │ ← LLama-3.3-70B
└─────────────────┘
```

## 💰 Costos Estimados

- **Render**: $7/mes (Starter plan)
- **Cerebras API**: Gratis hasta 1M tokens/día
- **Vercel**: Gratis (hobby)
- **Total**: ~$7/mes

## ⚡ Alternativa: Versión Ultra-Ligera

Si quieres algo más barato, usa OpenAI API en lugar de Cerebras:

```python
# Reemplazar en AIEngine.py
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
response = client.chat.completions.create(
    model="gpt-4-turbo-preview",
    messages=messages
)
```

## 🔧 Docker (Opcional)

También puedes crear un Dockerfile:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 8000

CMD cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

Luego desplegar en Railway, Fly.io, o cualquier servicio que soporte Docker.

## 📝 Checklist de Producción

- [ ] Actualizar `.env` con API keys reales
- [ ] Usar solo Cerebras (no modelo local)
- [ ] Configurar CORS correctamente
- [ ] Añadir rate limiting
- [ ] Configurar logging
- [ ] Monitoreo de errores (Sentry)
- [ ] HTTPS/SSL configurado
- [ ] Backup de configuración

---

**¿Necesitas ayuda?** Revisa la documentación específica de cada plataforma.

