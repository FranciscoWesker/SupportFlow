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

ENV NODE_ENV=production

# Copiar artefactos y dependencias desde builder (ya instaladas)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY server ./server

# Podar dependencias a producción (omite devDependencies)
RUN npm prune --omit=dev || true

EXPOSE 10000
CMD ["node", "server/index.mjs"]

