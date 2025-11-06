#!/bin/sh
set -e

# Usar PORT de variable de entorno o 80 como fallback
PORT=${PORT:-80}

# Generar configuración de nginx con el puerto correcto
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Iniciar nginx
exec nginx -g 'daemon off;'

