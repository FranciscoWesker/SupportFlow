# 📋 Resumen - SupportFlow

## ¿Qué es SupportFlow?

SupportFlow es un **sistema completo de automatización de soporte técnico** que utiliza inteligencia artificial para responder consultas automáticamente. Funciona tanto con modelos locales (sin necesidad de internet después de la instalación) como con la API de Cerebras (mayor calidad, requiere conexión).

## 🎯 ¿Qué incluye?

### Backend (Python + FastAPI)
✅ API REST completa  
✅ Motor de IA con modelos duales  
✅ Análisis de sentimiento  
✅ Integración con Cerebras vía HuggingFace  
✅ Respuestas automáticas  

### Frontend (JavaScript)
✅ Interfaz web moderna y responsive  
✅ Chat en tiempo real  
✅ Selector de modelo (Local/Cerebras)  
✅ Análisis de sentimiento integrado  
✅ Diseño profesional  

### Características Adicionales
✅ Scripts de inicio automáticos (Linux/Windows)  
✅ Ejemplos de integración  
✅ Tests de API  
✅ Documentación completa  
✅ Guía de despliegue  

## 🚀 ¿Cómo usar?

### Opción Rápida (Recomendada)

```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

### Opción Manual

```bash
# 1. Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar
cd backend
python main.py
```

### Acceder al Sistema

1. **API**: http://localhost:8000
2. **Frontend**: Abre `frontend/index.html` en tu navegador
3. **Docs**: http://localhost:8000/docs

## 📂 Estructura del Proyecto

```
SupportFlow/
├── backend/              # Backend Python (FastAPI)
│   ├── main.py          # Servidor principal
│   └── AIEngine.py      # Motor de IA
├── frontend/            # Frontend JavaScript
│   ├── index.html       # Interfaz
│   ├── app.js          # Cliente JS
│   └── styles.css      # Estilos
├── examples/            # Ejemplos de uso
│   ├── test_api.py     # Tests de API
│   └── integration_example.py  # Integración
├── requirements.txt    # Dependencias Python
├── start.sh            # Script Linux/Mac
├── start.bat           # Script Windows
├── README.md           # Documentación completa
├── QUICK_START.md      # Inicio rápido
└── DEPLOY.md           # Guía de despliegue
```

## 🤖 Modelos Disponibles

### Modelo Local (DialoGPT)
- ✅ Funciona offline (después de primera descarga)
- ✅ Rápido y eficiente
- ✅ Sin costos
- ⚠️ Calidad media

### Cerebras (Llama-3.3-70B)
- ✅ Excelente calidad de respuestas
- ✅ Modelo avanzado (70B parámetros)
- ⚠️ Requiere API key de HuggingFace
- ⚠️ Requiere conexión a internet
- ✅ 1 millón de tokens gratis/día

## 📡 Endpoints de la API

### `GET /health`
Verifica el estado del sistema

### `POST /chat`
Procesa una consulta de soporte
```json
{
  "message": "Mi aplicación no funciona",
  "use_cerebras": false
}
```

### `POST /analyze`
Analiza el sentimiento de un mensaje

## 💡 Ejemplos de Uso

### Ejemplo 1: Desde el Frontend
1. Abre `frontend/index.html`
2. Escribe: "Mi cuenta no inicia sesión"
3. Selecciona modelo
4. Presiona Enter

### Ejemplo 2: Desde Python
```python
import requests

response = requests.post('http://localhost:8000/chat', json={
    'message': 'Necesito ayuda con mi cuenta',
    'use_cerebras': False
})

print(response.json()['reply'])
```

### Ejemplo 3: Ejecutar Tests
```bash
python examples/test_api.py
```

## ⚙️ Configuración

### Configurar Cerebras (Opcional)

1. Obtén API key en: https://huggingface.co/settings/tokens
2. Copia `env.example` a `.env`
3. Edita `.env` y agrega tu clave

```env
HUGGINGFACE_API_KEY=tu_clave_aqui
```

## 🎨 Características de la Interfaz

- 🎨 Diseño moderno con gradientes
- 💬 Chat en tiempo real
- 📊 Indicador de confianza
- 😊 Análisis de sentimiento
- 🔄 Selector de modelo dinámico
- 📱 Responsive (móvil y desktop)

## 🔧 Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|-----------|
| Python | Backend |
| FastAPI | Framework web |
| PyTorch | Deep learning |
| Transformers | Modelos de HuggingFace |
| HuggingFace Hub | Integración Cerebras |
| JavaScript | Frontend |
| HTML/CSS | Interfaz web |

## 📚 Documentación

- **README.md**: Documentación completa del proyecto
- **QUICK_START.md**: Guía de inicio rápido
- **DEPLOY.md**: Instrucciones de despliegue en producción
- **examples/**: Ejemplos de código

## 🎯 Casos de Uso

### 1. Soporte Técnico Automatizado
Respuestas instantáneas a consultas comunes

### 2. Sistema de Tickets
Generación automática de respuestas para tickets

### 3. Asistente Virtual
Chatbot para atención al cliente

### 4. Análisis de Feedback
Detección automática de sentimiento

## ✨ Ventajas

✅ **Módulo**: Separación clara backend/frontend  
✅ **Flexible**: Funciona con o sin Cerebras  
✅ **Extensible**: Fácil agregar nuevas funciones  
✅ **Documentado**: Documentación completa  
✅ **Ejemplos**: Código de ejemplo incluido  
✅ **Producción**: Listo para desplegar  

## 🐛 Solución de Problemas

### "No se puede conectar"
Verifica que el servidor esté corriendo en el puerto 8000

### "Modelo no carga"
Primera vez requiere internet para descargar (~500MB)

### "Cerebras no funciona"
Verifica tu API key en el archivo `.env`

## 📈 Próximos Pasos

1. **Ejecutar el sistema**: `./start.sh` o `start.bat`
2. **Probar con ejemplos**: `python examples/test_api.py`
3. **Abrir frontend**: `frontend/index.html`
4. **Configurar Cerebras** (opcional): Agregar API key
5. **Integrar** en tu proyecto: Usar `examples/integration_example.py`

## 🎉 ¡Listo!

Tu sistema de automatización de soporte está completamente funcional. Puedes:

- Usarlo localmente con modelos gratuitos
- Integrarlo con Cerebras para mayor calidad
- Desplegarlo en producción
- Extenderlo con nuevas funcionalidades

---

**Dudas?** Revisa README.md o QUICK_START.md

**Problemas?** Ejecuta los tests: `python examples/test_api.py`

**Integración?** Usa: `python examples/integration_example.py`

