import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';
import { createAxiosInstance } from './axios.config';

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

const createGeminiPayload = (
  messages: Array<{ role: string; content: string }>
) => {
  return {
    contents: messages.map(msg => ({
      parts: [{ text: msg.content }],
      role: msg.role === 'user' ? 'user' : 'model',
    })),
  };
};

const createHuggingFacePayload = (
  messages: Array<{ role: string; content: string }>
) => {
  const conversation = messages
    .map(
      msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
    )
    .join('\n');
  return {
    inputs: conversation,
    parameters: {
      max_new_tokens: 250,
      temperature: 0.7,
    },
  };
};

export const sendMessageToGemini = async (
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<ApiResponse> => {
  try {
    const sanitizedMessage = sanitizeInput(message);
    const messages = [
      ...conversationHistory,
      { role: 'user', content: sanitizedMessage },
    ];
    const payload = createGeminiPayload(messages);

    const axiosInstance = createAxiosInstance(
      'https://generativelanguage.googleapis.com'
    );

    const response = await axiosInstance.post(
      `/v1beta/models/gemini-pro:generateContent?key=${apiConfig.googleGeminiApiKey}`,
      payload
    );

    const botResponse =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Lo siento, no pude generar una respuesta.';

    return {
      success: true,
      message: botResponse,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      success: false,
      message: 'Error al comunicarse con la API de Gemini.',
      error: axiosError.response?.status
        ? `Error ${axiosError.response.status}: ${axiosError.response.statusText}`
        : axiosError.message || 'Error desconocido',
    };
  }
};

export const sendMessageToHuggingFace = async (
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<ApiResponse> => {
  try {
    const sanitizedMessage = sanitizeInput(message);
    const messages = [
      ...conversationHistory,
      { role: 'user', content: sanitizedMessage },
    ];
    const payload = createHuggingFacePayload(messages);

    const axiosInstance = createAxiosInstance(
      'https://api-inference.huggingface.co'
    );

    const response = await axiosInstance.post(
      '/models/microsoft/DialoGPT-medium',
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiConfig.huggingfaceApiKey}`,
        },
      }
    );

    const botResponse =
      response.data.generated_text ||
      'Lo siento, no pude generar una respuesta.';

    return {
      success: true,
      message: botResponse,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      success: false,
      message: 'Error al comunicarse con la API de Hugging Face.',
      error: axiosError.response?.status
        ? `Error ${axiosError.response.status}: ${axiosError.response.statusText}`
        : axiosError.message || 'Error desconocido',
    };
  }
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
    const axiosError = error as AxiosError;
    return {
      success: false,
      message: 'Error del servidor',
      error: axiosError.response?.data?.error || axiosError.message || 'Error desconocido',
    };
  }
};
