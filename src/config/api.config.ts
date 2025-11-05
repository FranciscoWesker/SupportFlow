import type { ApiConfig } from '@/types';

export const apiConfig: ApiConfig = {
  googleGeminiApiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
  huggingfaceApiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY,
};

export const validateApiConfig = (): boolean => {
  return !!(apiConfig.googleGeminiApiKey || apiConfig.huggingfaceApiKey);
};

export const getApiProvider = (): 'gemini' | 'huggingface' | null => {
  if (apiConfig.googleGeminiApiKey) return 'gemini';
  if (apiConfig.huggingfaceApiKey) return 'huggingface';
  return null;
};

