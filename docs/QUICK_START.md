# 🚀 Inicio Rápido - SupportFlow

## Instalación en 3 pasos

### 1️⃣ Instalar dependencias

```bash
# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar paquetes
pip install -r requirements.txt
```

### 2️⃣ Configurar (opcional)

Si quieres usar Cerebras API:

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env y agregar tu API key
nano .env  # o usar tu editor favorito
```

Obtén tu API key en: https://huggingface.co/settings/tokens

### 3️⃣ Ejecutar

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bash
start.bat
```

**O manualmente:**
```bash
cd backend
python main.py
```

## 🌐 Acceder al sistema

1. **Backend API**: http://localhost:8000
2. **Frontend**: Abre `frontend/index.html` en tu navegador
3. **Documentación API**: http://localhost:8000/docs

## 📝 Uso básico

### Desde el navegador
1. Abre `frontend/index.html`
2. Escribe tu consulta
3. Selecciona modelo (Local o Cerebras)
4. Presiona Enter

### Desde línea de comandos

```bash
# Prueba el endpoint de chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, necesito ayuda", "use_cerebras": false}'

# Verificar estado
curl http://localhost:8000/health
```

## ✨ Características

- ✅ **Modelo Local**: Funciona offline con DialoGPT
- ✅ **Cerebras API**: Mayor calidad con Llama-3.3-70B (requiere API key)
- ✅ **Interfaz Web**: Chat moderno y responsive
- ✅ **Análisis de Sentimiento**: Detecta el tono de los mensajes
- ✅ **API REST**: Integrable con cualquier sistema

## 🎯 Ejemplos

### Python
```python
import requests

response = requests.post('http://localhost:8000/chat', json={
    'message': 'Mi app no funciona',
    'use_cerebras': False
})

print(response.json()['reply'])
```

### JavaScript
```javascript
fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: 'Necesito ayuda',
        use_cerebras: false
    })
})
.then(res => res.json())
.then(data => console.log(data.reply));
```

## 🔧 Solución de problemas

### "No se puede conectar al servidor"
- Verifica que el servidor está corriendo en el puerto 8000
- Revisa los logs en la terminal

### "Modelo local no carga"
- Primera vez necesita internet para descargar
- Verifica que tienes espacio en disco (500MB+)
- Revisa los logs de error

### "Cerebras no funciona"
- Verifica que tu API key es válida
- Asegúrate de tener el archivo `.env` configurado
- Revisa que tienes créditos en HuggingFace

## 📚 Más información

Consulta el [README.md](README.md) para documentación completa.

