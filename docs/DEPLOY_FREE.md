# 🆓 Backends GRATIS para SupportFlow

## 🥇 MEJOR OPCIÓN: Render.com (GRATIS)

### Plan Gratuito de Render:
- ✅ **512 MB RAM**
- ✅ **0.1 CPU**
- ✅ **100 GB de ancho de banda/mes**
- ⚠️ **Spins down después de 15 min de inactividad**
- ⚠️ **Sin persistencia de disco** (pero funciona para tu caso)

### Despliegue en Render (GRATIS):

1. **Crear cuenta**: https://render.com

2. **Nuevo Web Service**

3. **Configuración**:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   Environment: Python 3
   ```

4. **Variables de entorno**:
   ```
   HUGGINGFACE_API_KEY=tu_clave
   PORT=10000
   ```

5. **⚠️ IMPORTANTE**: Usar `AIEngine_prod.py` (sin modelo local)

**Costo**: **GRATIS** ✅

---

## 🥈 Fly.io (GRATIS)

### Plan Gratuito:
- ✅ **256 MB RAM compartida**
- ✅ **3 VMs compartidas**
- ✅ **160 GB ancho de banda/mes**
- ✅ **Persistencia de disco**

### Despliegue:

```bash
# 1. Instalar CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
flyctl auth login

# 3. Inicializar
cd backend
flyctl launch

# 4. Configurar variables
flyctl secrets set HUGGINGFACE_API_KEY=tu_clave

# 5. Desplegar
flyctl deploy
```

**Costo**: **GRATIS** hasta 3 VMs

---

## 🥉 Railway.app (GRATIS con Créditos)

### Plan:
- ✅ **$5 en créditos gratis cada mes**
- ✅ **500 horas de ejecución gratis**
- ✅ **Suficiente para proyecto pequeño**

### Despliegue:

```bash
# 1. Instalar CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Inicializar
railway init

# 4. Configurar
railway add

# 5. Variables
railway variables set HUGGINGFACE_API_KEY=tu_clave

# 6. Deploy
railway up
```

**Costo**: **GRATIS** con $5 créditos/mes

---

## 🎯 PythonAnywhere (GRATIS)

### Plan Gratuito:
- ✅ **1 aplicación web**
- ✅ **512 MB de almacenamiento**
- ✅ **Siempre activo**
- ⚠️ **URL tu-nombre.pythonanywhere.com**

### Despliegue:

1. **Crear cuenta**: https://pythonanywhere.com

2. **Consola Bash**

3. **Clonar repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/SupportFlow
   cd SupportFlow
   ```

4. **Instalar dependencias**:
   ```bash
   pip3.10 install --user -r requirements.txt
   ```

5. **Configurar web app**:
   ```
   Source code: /home/tuusuario/SupportFlow/backend
   WSGI file: /var/www/tuusuario_pythonanywhere_com_wsgi.py
   ```

**Costo**: **GRATIS** ✅

---

## 🚀 Replit (GRATIS)

### Plan:
- ✅ **Plan gratuito disponible**
- ✅ **Siempre activo**
- ✅ **Auto-deploy desde Git**

### Despliegue:

1. **Crear cuenta**: https://replit.com

2. **Importar desde GitHub**

3. **Configurar variables de entorno**

4. **Run**: Se despliega automáticamente

**Costo**: **GRATIS** ✅

---

## 🎮 Comparación de Opciones Gratuitas

| Plataforma | RAM | CPU | Persistencia | Spin Down | Recomendado |
|-----------|-----|-----|--------------|-----------|-------------|
| **Render** | 512MB | 0.1 | No | 15 min | ⭐⭐⭐⭐⭐ |
| **Fly.io** | 256MB | Compartida | Sí | No | ⭐⭐⭐⭐ |
| **Railway** | Varía | Varía | Sí | 15 min | ⭐⭐⭐⭐ |
| **PythonAnywhere** | 512MB | Limitado | Sí | No | ⭐⭐⭐ |
| **Replit** | Varía | Limitado | Sí | No | ⭐⭐⭐ |

---

## 🏆 RECOMENDACIÓN FINAL

### Para Production Real:
```
🥇 Render.com (GRATIS)
   • Suficiente RAM
   • Fácil de configurar
   • Auto-deploy desde Git
   • ✅ MEJOR OPCIÓN
```

### Para Desarrollo:
```
🥈 Fly.io (GRATIS)
   • Más RAM disponible
   • Persistencia de disco
   • Buena documentación
```

### Para Testing:
```
🥉 Railway (GRATIS)
   • $5 créditos/mes
   • Herramientas modernas
   • Debug avanzado
```

---

## 🔧 Pasos para Render (GRATIS)

### 1. Preparar Repositorio

```bash
# Cambiar a versión de producción
cp backend/AIEngine_prod.py backend/AIEngine.py

# Commit
git add .
git commit -m "Optimizado para producción"

# Push
git push origin main
```

### 2. Crear Servicio en Render

1. Ve a https://render.com
2. **New +** → **Web Service**
3. Conecta tu repositorio Git
4. Configura:
   ```
   Name: supportflow
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### 3. Variables de Entorno

En la pestaña **Environment**:
```
HUGGINGFACE_API_KEY=tu_clave_real_aqui
PORT=10000
```

### 4. Deploy

Render construirá y desplegará automáticamente.

### 5. URL

Tu backend estará en: `https://supportflow.onrender.com`

---

## 📱 Frontend en Vercel (GRATIS)

### Desplegar Frontend:

```bash
# En directorio frontend
cd frontend

# Editar app.js para apuntar a tu Render
# Cambiar: const API_URL = 'https://supportflow.onrender.com';

# Deploy
vercel --prod
```

O desde Vercel Dashboard:
1. Ve a https://vercel.com
2. Importar proyecto (frontend folder)
3. Deploy automático

**Costo**: **GRATIS** ✅

---

## 💰 Comparación de Costos

| Plataforma | Costo | Límites | Recomendado |
|-----------|-------|---------|-------------|
| Render (Free) | **$0** | 512MB RAM, spin down | ⭐⭐⭐⭐⭐ |
| Fly.io (Free) | **$0** | 256MB RAM, 3 VMs | ⭐⭐⭐⭐ |
| Railway (Free) | **$0** | $5 créditos/mes | ⭐⭐⭐⭐ |
| PythonAnywhere | **$0** | 512MB, limitado | ⭐⭐⭐ |
| **Total** | **$0** | Funcional | ✅ |

---

## ✅ Checklist de Despliegue Gratis

- [ ] Usar `AIEngine_prod.py` (sin modelo local)
- [ ] Configurar HUGGINGFACE_API_KEY
- [ ] Subir a Git (GitHub/GitLab)
- [ ] Crear cuenta en Render.com
- [ ] Conectar repositorio
- [ ] Configurar variables de entorno
- [ ] Deploy automático
- [ ] Probar API desde navegador
- [ ] Frontend en Vercel (opcional)

---

## 🎉 Resultado Final

```
Backend (Render): https://supportflow.onrender.com
Frontend (Vercel): https://supportflow.vercel.app
Costo Total: $0/mes
Cerebras API: 1M tokens/día GRATIS
```

**Completamente funcional y 100% GRATIS** 🎉

