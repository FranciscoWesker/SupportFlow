// Este archivo se procesa en tiempo de ejecución por Nginx (envsubst)
window.__ENV__ = {
  VITE_GOOGLE_GEMINI_API_KEY: "${VITE_GOOGLE_GEMINI_API_KEY}",
  VITE_HUGGINGFACE_API_KEY: "${VITE_HUGGINGFACE_API_KEY}",
};


