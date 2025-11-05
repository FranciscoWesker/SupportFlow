import { AxiosError } from 'axios';
import { apiConfig } from '@/config/api.config';
import type { ApiResponse } from '@/types';
import { createAxiosInstance } from './axios.config';

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

const createGeminiPayload = (messages: Array<{ role: string; content: string }>) => {
  return {
    contents: messages.map((msg) => ({
      parts: [{ text: msg.content }],
      role: msg.role === 'user' ? 'user' : 'model',
    })),
  };
};

const createHuggingFacePayload = (messages: Array<{ role: string; content: string }>) => {
  const conversation = messages
    .map((msg) => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`)
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
    const messages = [...conversationHistory, { role: 'user', content: sanitizedMessage }];
    const payload = createGeminiPayload(messages);

    const axiosInstance = createAxiosInstance('https://generativelanguage.googleapis.com');
    
    const response = await axiosInstance.post(
      `/v1beta/models/gemini-pro:generateContent?key=${apiConfig.googleGeminiApiKey}`,
      payload
    );

    const botResponse =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude generar una respuesta.';

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
    const messages = [...conversationHistory, { role: 'user', content: sanitizedMessage }];
    const payload = createHuggingFacePayload(messages);

    const axiosInstance = createAxiosInstance('https://api-inference.huggingface.co');
    
    const response = await axiosInstance.post(
      '/models/microsoft/DialoGPT-medium',
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiConfig.huggingfaceApiKey}`,
        },
      }
    );

    const botResponse = response.data.generated_text || 'Lo siento, no pude generar una respuesta.';

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
  if (apiConfig.googleGeminiApiKey) {
    return sendMessageToGemini(message, conversationHistory);
  }

  if (apiConfig.huggingfaceApiKey) {
    return sendMessageToHuggingFace(message, conversationHistory);
  }

  // Modo demo si no hay API keys configuradas
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Este es un mensaje de demostración. Por favor, configura las API keys en tu archivo .env para usar el chatbot real.',
      });
    }, 1000);
  });
};

