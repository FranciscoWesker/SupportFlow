# Guía Completa - SupportFlow

## Descripción

SupportFlow es un sistema de automatización de soporte técnico con inteligencia artificial que proporciona asistencia técnica profesional mediante modelos de lenguaje avanzados.

## Características Principales

### Motor de IA
- **Modelo**: Cerebras API (Llama-3.3-70B via HuggingFace)
- **Análisis**: Contexto avanzado para respuestas precisas
- **Formato**: Respuestas estructuradas en Markdown
- **Rendimiento**: >2,200 tokens/segundo

### Stack Tecnológico
- **Backend**: Python + FastAPI
- **Frontend**: JavaScript + Tailwind CSS
- **API**: REST completa e integrable
- **Despliegue**: Render.com con configuración automática

### Funcionalidades
- Chat interactivo con animaciones profesionales
- Renderizado dinámico de Markdown
- Análisis de sentimiento automático
- Interfaz responsive y moderna
- API REST documentada

## Instalación Local

### Requisitos
- Python 3.9+
- Git
- Cuenta de HuggingFace (para API key)

### Pasos de Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/FranciscoWesker/SupportFlow.git
cd SupportFlow
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar API Key** (Opcional)
```bash
cp env.example .env
# Editar .env y agregar:
# HUGGINGFACE_API_KEY=tu_clave_aqui
```

Obtén tu API key en: https://huggingface.co/settings/tokens

5. **Ejecutar aplicación**
```bash
cd backend
python main.py
```

Abre en el navegador: http://localhost:8000

## Despliegue en Producción

### Render.com (Recomendado)

1. **Crear cuenta** en https://render.com

2. **Crear servicio Web Service**

3. **Configuración**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Plan: Free (o Starter para más recursos)

4. **Variables de entorno**:
   - `HUGGINGFACE_API_KEY`: Tu clave de API
   - `PORT`: Será establecido automáticamente por Render

5. **Despliegue automático**:
   - Conecta tu repositorio GitHub
   - Render despliega automáticamente en cada push

### Usar render.yaml

El proyecto incluye `render.yaml` para despliegue automático:

```yaml
version: "1"
services:
- type: web
  name: SupportFlow
  runtime: python
  repo: https://github.com/FranciscoWesker/SupportFlow
  plan: free
```

Solo importa el blueprint en Render y se configura automáticamente.

## Uso

### Interfaz Web

1. Abre la aplicación en tu navegador
2. Escribe tu consulta en el campo de texto
3. El asistente analizará y proporcionará:
   - Diagnóstico del problema
   - Causa probable
   - Solución paso a paso
   - Medidas de prevención

### API REST

#### Endpoint: POST /chat

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mi aplicación no funciona",
    "use_cerebras": true
  }'
```

Respuesta:
```json
{
  "reply": "Análisis del problema...",
  "confidence": 0.85,
  "model_used": "Cerebras (Llama-3.3-70B)",
  "timestamp": "2025-10-27T12:00:00"
}
```

#### Endpoint: GET /health

```bash
curl http://localhost:8000/health
```

Respuesta:
```json
{
  "status": "healthy",
  "cerebras_available": true
}
```

#### Endpoint: POST /analyze

Analiza el sentimiento de un mensaje:

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "Necesito ayuda urgente"}'
```

## Integración con Otros Sistemas

### Python

```python
import requests

response = requests.post('http://localhost:8000/chat', json={
    'message': 'Mi servidor tiene problemas',
    'use_cerebras': True
})

print(response.json()['reply'])
```

### JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: 'Necesito soporte técnico',
        use_cerebras: true
    })
});

const data = await response.json();
console.log(data.reply);
```

## Estructura del Proyecto

```
SupportFlow/
├── backend/
│   ├── main.py           # FastAPI app
│   ├── AIEngine.py       # Motor de IA
│   └── __init__.py
├── frontend/
│   ├── index.html        # Interfaz principal
│   ├── app.js           # Lógica del frontend
│   └── styles.css       # Estilos
├── examples/
│   ├── test_api.py      # Tests de API
│   └── integration_example.py
├── docs/                # Documentación
├── requirements.txt     # Dependencias Python
├── render.yaml         # Configuración Render
└── README.md           # Documentación principal
```

## Configuración Avanzada

### Variables de Entorno

Crear archivo `.env`:

```env
HUGGINGFACE_API_KEY=tu_clave_aqui
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

### Personalización del Prompt

Editar `backend/AIEngine.py` en la función `_use_cerebras`:

```python
system_prompt = """Tu sistema de instrucciones personalizado aquí"""
```

## Solución de Problemas

### Error: HUGGINGFACE_API_KEY no configurada
**Solución**: Agregar la key en `.env` o exportar variable de entorno

### Error: Puerto ya en uso
**Solución**: Cambiar puerto en `.env` o en el comando: `uvicorn main:app --port 8001`

### Frontend no carga
**Solución**: Verificar que el backend esté corriendo en el puerto correcto

## Tecnologías Utilizadas

- **Python 3.9+**: Lenguaje del backend
- **FastAPI**: Framework web moderno
- **Hugging Face API**: Integración con modelos de IA
- **Tailwind CSS**: Framework de estilos
- **JavaScript**: Lógica del frontend
- **Render.com**: Plataforma de despliegue

## Recursos Adicionales

- **Documentación FastAPI**: https://fastapi.tiangolo.com
- **Hugging Face**: https://huggingface.co
- **Render Docs**: https://render.com/docs
- **Demo en vivo**: https://supportflow-yorh.onrender.com

## Contribuir

Contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu feature branch
3. Commit tus cambios
4. Push a la branch
5. Abre un Pull Request

## Licencia

MIT License - Ver `LICENSE` para más detalles

## Autor

**Francisco Castaño** - [LinkedIn](https://www.linkedin.com/in/francisco-salgado-casta%C3%B1o-77a952277/)

---

Para más información, visita: https://github.com/FranciscoWesker/SupportFlow

