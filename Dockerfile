# Multi-stage build para optimizar el tamaño de la imagen
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Stage de producción
FROM node:20-alpine AS runner
WORKDIR /app

# Copiar artefactos construidos y servidor
COPY --from=builder /app/dist ./dist
COPY server ./server

ENV NODE_ENV=production
EXPOSE 10000
CMD ["node", "server/index.mjs"]

