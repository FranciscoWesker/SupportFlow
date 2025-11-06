import type { ApiConfig } from '@/types';

// Permite leer variables definidas en tiempo de ejecución via window.__ENV__ (inyectadas por Nginx)
const runtimeEnv = (globalThis as unknown as { __ENV__?: Record<string, string> }).__ENV__ || {};

export const apiConfig: ApiConfig = {
  googleGeminiApiKey:
    (import.meta as any).env?.VITE_GOOGLE_GEMINI_API_KEY || runtimeEnv.VITE_GOOGLE_GEMINI_API_KEY,
  huggingfaceApiKey:
    (import.meta as any).env?.VITE_HUGGINGFACE_API_KEY || runtimeEnv.VITE_HUGGINGFACE_API_KEY,
};

export const validateApiConfig = (): boolean => {
  return !!(apiConfig.googleGeminiApiKey || apiConfig.huggingfaceApiKey);
};

export const getApiProvider = (): 'gemini' | 'huggingface' | null => {
  if (apiConfig.googleGeminiApiKey) return 'gemini';
  if (apiConfig.huggingfaceApiKey) return 'huggingface';
  return null;
};
