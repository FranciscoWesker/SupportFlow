# 🚀 Guía de Despliegue - SupportFlow

## Despliegue Local

### Opción 1: Script Automático

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bash
start.bat
```

### Opción 2: Manual

1. **Crear entorno virtual:**
```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

3. **Configurar variables (opcional):**
```bash
cp env.example .env
# Editar .env con tu API key
```

4. **Ejecutar:**
```bash
cd backend
python main.py
```

## Verificación

### 1. Verificar que el servidor está corriendo

```bash
curl http://localhost:8000/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "cerebras_available": true/false,
  "local_model_available": true
}
```

### 2. Probar la API

```bash
# Desde Python
python examples/test_api.py

# Desde curl
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "use_cerebras": false}'
```

### 3. Abrir el frontend

Abre `frontend/index.html` en tu navegador o:

```bash
# Opción 1: Abrir directamente
xdg-open frontend/index.html  # Linux
open frontend/index.html      # Mac
start frontend/index.html     # Windows

# Opción 2: Servidor simple
cd frontend
python -m http.server 8080
# Luego abre http://localhost:8080
```

## Despliegue en Producción

### Docker (Recomendado)

#### Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Puerto
EXPOSE 8000

# Ejecutar
CMD ["python", "backend/main.py"]
```

#### Compilar y ejecutar

```bash
# Construir imagen
docker build -t supportflow .

# Ejecutar contenedor
docker run -p 8000:8000 \
  -e HUGGINGFACE_API_KEY=tu_clave \
  supportflow
```

### Cloud Platforms

#### Heroku

```bash
# Crear Procfile
echo "web: uvicorn backend.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Desplegar
heroku create supportflow-app
git push heroku main
```

#### Railway

```bash
# Instalar CLI
npm i -g @railway/cli

# Login y desplegar
railway login
railway init
railway up
```

#### Render

1. Conecta tu repositorio en https://render.com
2. Configura:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd backend && python main.py`
3. Agrega variables de entorno

### Variables de Entorno para Producción

```env
# En tu plataforma de despliegue
HUGGINGFACE_API_KEY=tu_clave_produccion
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

## Optimizaciones de Producción

### 1. Usar ASGI Production Server

```bash
pip install gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 2. Configurar Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /ruta/a/frontend/;
    }
}
```

### 3. Security

```python
# En main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tu-dominio.com"],  # Especificar dominios
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## Monitoreo

### Health Check

```bash
# Agregar endpoint de monitoreo
curl http://localhost:8000/health

# Integrar con servicios de monitoreo
# Ejemplo: Uptime Robot, Pingdom, etc.
```

### Logs

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Con Docker
docker logs -f supportflow
```

## Escalabilidad

### Horizontal Scaling

```bash
# Múltiples instancias con load balancer
docker-compose up --scale backend=3
```

### Modelo Compartido

Para producción, considera:
- Usar un servicio de caché (Redis) para respuestas frecuentes
- Compartir modelos entre instancias
- Usar inferencia remota para ahorrar recursos

## Troubleshooting

### Problema: "Port already in use"

```bash
# Cambiar puerto
export SERVER_PORT=8001
python backend/main.py

# O matar proceso
lsof -ti:8000 | xargs kill
```

### Problema: "Model too large"

```bash
# Usar modelo más pequeño
# Editar AIEngine.py
model_name = "microsoft/DialoGPT-small"
```

### Problema: "Out of memory"

```bash
# Reducir batch size
# Editar AIEngine.py
self.local_pipeline = pipeline(
    ...,
    model_kwargs={"low_cpu_mem_usage": True}
)
```

## Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Servidor en ejecución
- [ ] Frontend accesible
- [ ] Health check funcionando
- [ ] API respondiendo correctamente
- [ ] Modelos cargados
- [ ] Logs configurados
- [ ] Backup configurado
- [ ] Monitoreo activo
- [ ] SSL/HTTPS configurado (producción)

## Recursos Adicionales

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [HuggingFace Models](https://huggingface.co/models)
- [Cerebras Documentation](https://inference-docs.cerebras.ai/)

