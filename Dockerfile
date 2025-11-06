# Multi-stage build para optimizar el tamaño de la imagen
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
# Usa npm ci si hay lockfile, y haz fallback a npm install si falla
RUN if [ -f package-lock.json ]; then \
      npm ci || npm install ; \
    else \
      npm install ; \
    fi

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Stage de producción
FROM node:20-alpine AS runner
WORKDIR /app

# Copiar package.json para instalar solo dependencias de producción
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./

# Instalar solo dependencias de producción
RUN npm ci --only=production || npm install --only=production

# Copiar artefactos construidos y servidor
COPY --from=builder /app/dist ./dist
COPY server ./server

ENV NODE_ENV=production
EXPOSE 10000
CMD ["node", "server/index.mjs"]

