#!/bin/bash

# Script de despliegue automático a Render.com
# Uso: ./deploy-render.sh

echo "🚀 Deploy a Render.com (GRATIS)"
echo "================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Error: No estás en el directorio raíz del proyecto${NC}"
    exit 1
fi

# Verificar que el archivo de producción existe
if [ ! -f "backend/AIEngine_prod.py" ]; then
    echo -e "${YELLOW}⚠️  AIEngine_prod.py no encontrado, creándolo...${NC}"
fi

# Copiar versión de producción
echo -e "${YELLOW}📝 Preparando versión de producción...${NC}"
cp backend/AIEngine.py backend/AIEngine_backup.py
cp backend/AIEngine_prod.py backend/AIEngine.py
echo -e "${GREEN}✓ Versión de producción activada${NC}"

# Verificar variables de entorno
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}   Por favor crea .env con tu HUGGINGFACE_API_KEY${NC}"
    read -p "¿Continuar sin .env? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar que tenemos git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado${NC}"
    exit 1
fi

# Estado de git
echo ""
echo -e "${YELLOW}📊 Estado de Git:${NC}"
git status --short

# Confirmar despliegue
echo ""
read -p "¿Deseas hacer commit y deploy? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelado"
    exit 1
fi

# Commit
echo ""
echo -e "${YELLOW}📦 Haciendo commit...${NC}"
git add .
git commit -m "Deploy a Render.com - Versión de producción"
echo -e "${GREEN}✓ Commit realizado${NC}"

# Mostrar próximos pasos
echo ""
echo -e "${GREEN}✅ Archivos listos para deploy${NC}"
echo ""
echo "📋 Próximos pasos en Render.com:"
echo ""
echo "1. Ve a: https://render.com"
echo "2. Click en 'New +' → 'Web Service'"
echo "3. Conecta tu repositorio de Git"
echo "4. Configura:"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port \$PORT"
echo "5. Agrega variables de entorno:"
echo "   - HUGGINGFACE_API_KEY=tu_clave"
echo "   - PORT=10000"
echo "6. Click 'Create Web Service'"
echo ""
echo -e "${GREEN}🚀 Tu backend será deployeado automáticamente${NC}"
echo ""
echo "URL esperada: https://supportflow.onrender.com"

