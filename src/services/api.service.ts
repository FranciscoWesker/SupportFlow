import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';
import { createAxiosInstance } from './axios.config';
import logger from '@/utils/logger';

export const sendMessage = async (
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<ApiResponse> => {
  try {
    // No sanitizar aquí, el servidor lo hará
    if (!message || !message.trim()) {
      return {
        success: false,
        message: 'El mensaje no puede estar vacío',
        error: 'Mensaje vacío',
      };
    }

    // Usar URL relativa en producción (mismo dominio) o localhost en desarrollo
    const baseURL =
      import.meta.env.MODE === 'production' ? '' : 'http://localhost:10000';
    const axiosInstance = createAxiosInstance(baseURL);

    // Use logger util: debug/info are disabled in production
    logger.debug(
      'Enviando mensaje a:',
      baseURL || window.location.origin,
      '/api/chat'
    );

    const r = await axiosInstance.post('/api/chat', {
      message: message.trim(),
      history: conversationHistory,
    });

    if (r.data?.success && r.data?.message) {
      return { success: true, message: r.data.message };
    }

    return {
      success: false,
      message: r.data?.error || 'Error desconocido',
      error: r.data?.error || 'Error desconocido',
    };
  } catch (error) {
    const axiosError = error as AxiosError<{
      error?: string;
      success?: boolean;
    }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      'Error desconocido';

    return {
      success: false,
      message: 'Error del servidor',
      error: errorMessage,
    };
  }
};
