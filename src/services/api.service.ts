import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';
import { createAxiosInstance } from './axios.config';

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sendMessage = async (
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<ApiResponse> => {
  try {
    const sanitized = sanitizeInput(message);
    const axiosInstance = createAxiosInstance('');
    const r = await axiosInstance.post('/api/chat', {
      message: sanitized,
      history: conversationHistory,
    });
    return { success: true, message: r.data?.message || '' };
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    return {
      success: false,
      message: 'Error del servidor',
      error:
        axiosError.response?.data?.error ||
        axiosError.message ||
        'Error desconocido',
    };
  }
};
