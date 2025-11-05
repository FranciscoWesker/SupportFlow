# SupportFlow

Sistema de chatbot profesional de soporte técnico construido con React, TypeScript y Chat UI Kit de Chatscope. Diseñado para resolver consultas y problemas comunes de usuarios mediante una interfaz moderna, responsive y accesible.

## Descripción

SupportFlow es una aplicación web de chat interactivo que permite a los usuarios obtener asistencia técnica mediante un sistema de conversación inteligente. El sistema integra APIs de inteligencia artificial (Google Gemini y Hugging Face) para proporcionar respuestas contextuales y mantener el historial de conversación.

## Características Principales

- **Interfaz Moderna y Responsive**: Diseño limpio y adaptable a todos los dispositivos (móviles, tablets y desktop)
- **Tema Claro/Oscuro**: Soporte para modo claro y oscuro con persistencia de preferencias
- **Chat Contextual**: El bot mantiene el contexto de la conversación, recordando mensajes anteriores
- **Animaciones Fluidas**: Transiciones suaves implementadas con Framer Motion
- **Seguridad**: Manejo seguro de API keys mediante variables de entorno
- **Integración con APIs**: Soporte para Google Gemini y Hugging Face
- **Accesibilidad**: Componentes accesibles y semánticos siguiendo estándares WCAG
- **Dockerizado**: Listo para desplegar con Docker y Docker Compose
- **CI/CD**: Configuración incluida para GitHub Actions y Render.com

## Stack Tecnológico

- **React 18**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para mayor seguridad de tipos
- **Vite**: Build tool y servidor de desarrollo de alto rendimiento
- **TailwindCSS**: Framework CSS utilitario para estilos responsivos
- **Framer Motion**: Biblioteca para animaciones fluidas
- **Axios**: Cliente HTTP para peticiones a APIs
- **Chat UI Kit**: Componentes de chat de Chatscope
- **ESLint & Prettier**: Herramientas de linting y formateo de código

## Requisitos Previos

- Node.js 20 o superior
- npm, yarn o pnpm
- API keys de Google Gemini o Hugging Face (opcional para modo demo)

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd SupportFlow
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y añade tus API keys:

```env
VITE_GOOGLE_GEMINI_API_KEY=tu_api_key_de_gemini
VITE_HUGGINGFACE_API_KEY=tu_api_key_de_huggingface
```

**Nota**: Si no configuras las API keys, el chatbot funcionará en modo demo con respuestas simuladas.

## Desarrollo

### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Previsualiza la build de producción |
| `npm run lint` | Ejecuta el linter |
| `npm run lint:fix` | Corrige errores de linting automáticamente |
| `npm run format` | Formatea el código con Prettier |
| `npm run format:check` | Verifica el formato del código |
| `npm run type-check` | Verifica tipos de TypeScript |

## Docker

### Construir la Imagen

```bash
docker build -t supportflow .
```

### Ejecutar con Docker

```bash
docker run -p 3000:80 \
  -e VITE_GOOGLE_GEMINI_API_KEY=tu_api_key \
  -e VITE_HUGGINGFACE_API_KEY=tu_api_key \
  supportflow
```

### Docker Compose

```bash
docker-compose up -d
```

## Despliegue en Render

### Configuración Automática

1. Crear un nuevo servicio Web en Render
2. Conectar tu repositorio de GitHub
3. Configurar las variables de entorno:
   - `VITE_GOOGLE_GEMINI_API_KEY`
   - `VITE_HUGGINGFACE_API_KEY`
4. Render detectará automáticamente el archivo `render.yaml`

### Configuración Manual

Si prefieres configurar manualmente:

- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run preview`
- **Environment**: `Node`

## Estructura del Proyecto

```
SupportFlow/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Chat.tsx
│   │   ├── ChatInput.tsx
│   │   ├── Header.tsx
│   │   └── MessageBubble.tsx
│   ├── config/              # Configuraciones
│   │   └── api.config.ts
│   ├── hooks/               # Custom hooks
│   │   ├── useChat.ts
│   │   └── useTheme.ts
│   ├── services/            # Servicios y APIs
│   │   ├── api.service.ts
│   │   └── axios.config.ts
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── .github/
│   └── workflows/           # GitHub Actions
│       └── ci.yml
├── public/                  # Archivos estáticos
├── Dockerfile               # Configuración Docker
├── docker-compose.yml       # Docker Compose
├── render.yaml              # Configuración Render
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Seguridad

El proyecto implementa las siguientes medidas de seguridad:

- Las API keys se manejan exclusivamente mediante variables de entorno
- Sanitización de entradas del usuario para prevenir ataques XSS
- Validación de tipos con TypeScript para prevenir errores en tiempo de ejecución
- Auditoría de dependencias con `npm audit`
- Compatible con Dependabot de GitHub para actualizaciones automáticas de seguridad
- Sin exposición de claves en el código fuente o el repositorio

## Calidad de Código

El proyecto incluye las siguientes herramientas para mantener la calidad del código:

- **ESLint**: Detección de errores y problemas de código
- **Prettier**: Formateo consistente del código
- **TypeScript**: Verificación estática de tipos
- **GitHub Actions**: CI/CD automatizado con análisis estático

## Convenciones de Commits

Este proyecto sigue el estándar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan el código)
- `refactor:` Refactorización de código
- `test:` Añadir o modificar tests
- `chore:` Cambios en tareas de construcción o herramientas

**Ejemplo:**

```bash
git commit -m "feat: añadir soporte para tema oscuro"
```

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Añade AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Agradecimientos

- [Chatscope](https://www.chatscope.io/) - Chat UI Kit
- [Vite](https://vitejs.dev/) - Build tool
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [Framer Motion](https://www.framer.com/motion/) - Biblioteca de animaciones

## Soporte

Para preguntas o problemas, por favor abre un issue en el repositorio.

---

Desarrollado para proporcionar soporte técnico de calidad.
