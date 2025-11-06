#!/bin/sh
set -e

# Usar PORT de variable de entorno o 80 como fallback
PORT=${PORT:-80}

# Generar configuración de nginx con el puerto correcto
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Generar env.js a partir de la plantilla si existe
if [ -f /usr/share/nginx/html/env.template.js ]; then
  envsubst '${VITE_GOOGLE_GEMINI_API_KEY} ${VITE_HUGGINGFACE_API_KEY}' < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js
fi

# Iniciar nginx
exec nginx -g 'daemon off;'

