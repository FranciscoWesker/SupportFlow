<div align="center">

# 🤖 SupportFlow

### Sistema de Automatización de Soporte con IA

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

*Sistema inteligente de soporte técnico con IA • Desarrollado por Francisco Castaño*

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [Despliegue](#-despliegue)

---

</div>

## 🌟 Descripción

**SupportFlow** es un sistema completo de automatización de soporte técnico que utiliza inteligencia artificial para responder consultas automáticamente. Incluye:

- 🤖 **IA Dual**: Modelo local offline (Qwen2.5-3B) y API de Cerebras (Llama-3.3-70B)
- 💻 **Backend Python**: API REST con FastAPI
- 🎨 **Frontend Moderno**: Interfaz web responsive y profesional
- 📊 **Análisis de Sentimiento**: Detecta el tono de las consultas
- 🚀 **API REST**: Integrable con cualquier sistema

---

## ✨ Características

### 🧠 Motor de IA Dual

<table>
<tr>
<td>

**Modelo Local** (Qwen2.5-3B-Instruct)
- ✅ Funciona offline
- ✅ Rápido y eficiente
- ✅ 3 mil millones de parámetros
- ✅ Excelente para soporte técnico
- 💰 Sin costos

</td>
<td>

**Cerebras API** (Llama-3.3-70B)
- ✅ Máxima calidad
- ✅ 70 mil millones de parámetros
- ✅ >2,200 tokens/segundo
- ✅ Mejor entendimiento de contexto
- 🆓 1M tokens gratis/día

</td>
</tr>
</table>

### 🎯 Casos de Uso

- **Soporte Técnico**: Respuestas automatizadas a consultas comunes
- **Asistente Virtual**: Chatbot para atención al cliente
- **Análisis de Feedback**: Detección automática de sentimiento
- **Automatización**: Integración con sistemas existentes
- **Sistema de Tickets**: Generación automática de respuestas

---

## 🚀 Instalación

### Requisitos Previos

- Python 3.9+
- CUDA (opcional, para GPU)
- 8GB RAM mínimo (para modelo local)
- 6GB espacio en disco (primera vez)

### Pasos Rápidos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/SupportFlow.git
cd SupportFlow

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp env.example .env
# Editar .env y agregar tu HUGGINGFACE_API_KEY

# 5. Iniciar el servidor
cd backend
python main.py
```

### Acceso al Sistema

- 🌐 **Backend API**: http://localhost:8000
- 🎨 **Frontend**: Abre `frontend/index.html` en tu navegador
- 📚 **Documentación API**: http://localhost:8000/docs

---

## 📖 Uso

### Desde el Frontend

1. Abre `frontend/index.html` en tu navegador
2. Selecciona el modelo (Local o Cerebras)
3. Escribe tu consulta
4. Presiona Enter

### Desde la API

#### Endpoint de Chat

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mi aplicación no funciona",
    "use_cerebras": false
  }'
```

#### Python

```python
import requests

response = requests.post('http://localhost:8000/chat', json={
    'message': 'Necesito ayuda con mi cuenta',
    'use_cerebras': False
})

print(response.json()['reply'])
```

#### JavaScript

```javascript
fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: 'Tengo un problema',
        use_cerebras: false
    })
})
.then(res => res.json())
.then(data => console.log(data.reply));
```

---

## 🌐 Despliegue

### Render.com (Recomendado - GRATIS)

```bash
# 1. Ejecutar script de deploy
./deploy-render.sh

# 2. Ir a render.com y seguir instrucciones
```

Más información: [DEPLOY_FREE.md](DEPLOY_FREE.md)

### Otras Opciones

- **Fly.io**: Plan gratuito disponible
- **Railway**: $5 créditos gratis/mes
- **PythonAnywhere**: URL personalizada
- **Replit**: Siempre activo

---

## 📂 Estructura del Proyecto

```
SupportFlow/
├── backend/                 # Backend Python
│   ├── main.py             # Servidor FastAPI
│   ├── AIEngine.py          # Motor de IA
│   └── AIEngine_prod.py     # Versión producción
├── frontend/                # Frontend JavaScript
│   ├── index.html           # Interfaz web
│   ├── app.js               # Cliente JavaScript
│   └── styles.css            # Estilos
├── examples/                # Ejemplos de uso
│   ├── test_api.py          # Tests de API
│   └── integration_example.py
├── requirements.txt         # Dependencias Python
├── deploy-render.sh         # Script de deploy
└── README.md               # Esta documentación
```

---

## 🎨 Tecnologías

<table>
<tr>
<td align="center" width="20%">

**Backend**
- FastAPI
- PyTorch
- Transformers
- HuggingFace

</td>
<td align="center" width="20%">

**Frontend**
- HTML5
- CSS3
- JavaScript
- Responsive Design

</td>
<td align="center" width="20%">

**IA & ML**
- Qwen2.5-3B-Instruct
- Llama-3.3-70B
- Cerebras API
- HuggingFace Hub

</td>
<td align="center" width="20%">

**APIs**
- REST API
- Chat Completions
- Sentiment Analysis
- CORS Enabled

</td>
</tr>
</table>

---

## 📊 Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Información de la API |
| `GET` | `/health` | Estado del sistema |
| `POST` | `/chat` | Procesa consulta de soporte |
| `POST` | `/analyze` | Analiza sentimiento |

---

## 📚 Documentación Adicional

- 🚀 [Guía de Inicio Rápido](docs/QUICK_START.md)
- 🌐 [Despliegue en Producción](docs/DEPLOY.md)
- 🆓 [Backends Gratis](docs/DEPLOY_FREE.md)
- 💼 [Deploy Avanzado](docs/DEPLOY_PROD.md)
- 📋 [Resumen del Proyecto](docs/RESUMEN.md)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más información.

---

## 👤 Autor

**Francisco Castaño**

- GitHub: [@franciscocastano](https://github.com/FranciscoWesker)
- Email: franxxW@proton.me
---

## 🙏 Agradecimientos

- [HuggingFace](https://huggingface.co/) por los modelos y la infraestructura
- [Cerebras Systems](https://www.cerebras.ai/) por la API de alta velocidad
- [FastAPI](https://fastapi.tiangolo.com/) por el framework web
- [Qwen Team](https://github.com/QwenLM) por el excelente modelo Qwen2.5

---

<div align="center">

### ⭐ Si este proyecto te fue útil, considera darle una estrella

**Desarrollado con ❤️ para automatizar el soporte técnico**

[⬆ Volver arriba](#-supportflow)

</div>
