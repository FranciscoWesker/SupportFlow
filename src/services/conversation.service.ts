import { AxiosError } from 'axios';
import type {
  Conversation,
  ConversationResponse,
  MessageResponse,
  SearchResponse,
  Message,
} from '@/types';
import { createAxiosInstance } from './axios.config';
import logger from '@/utils/logger';

const getBaseURL = () => {
  return import.meta.env.MODE === 'production' ? '' : 'http://localhost:10000';
};

/**
 * Obtener todas las conversaciones
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const axiosInstance = createAxiosInstance(getBaseURL());
    const response =
      await axiosInstance.get<ConversationResponse>('/api/conversations');

    if (response.data?.success && response.data.conversations) {
      return response.data.conversations;
    }

    return [];
  } catch (error) {
    const axiosError = error as AxiosError<ConversationResponse>;
    logger.error('Error al obtener conversaciones:', axiosError.message);
    return [];
  }
};

/**
 * Obtener una conversación con sus mensajes
 */
export const getConversation = async (
  id: string
): Promise<{ conversation: Conversation; messages: Message[] } | null> => {
  try {
    const axiosInstance = createAxiosInstance(getBaseURL());
    const response = await axiosInstance.get<
      ConversationResponse & { messages: Message[] }
    >(`/api/conversations/${id}`);

    if (response.data?.success && response.data.conversation) {
      return {
        conversation: response.data.conversation,
        messages: response.data.messages || [],
      };
    }

    return null;
  } catch (error) {
    const axiosError = error as AxiosError<ConversationResponse>;
    logger.error('Error al obtener conversación:', axiosError.message);
    return null;
  }
};

/**
 * Crear una nueva conversación
 */
export const createConversation = async (
  title?: string
): Promise<Conversation | null> => {
  try {
    const axiosInstance = createAxiosInstance(getBaseURL());
    const response = await axiosInstance.post<ConversationResponse>(
      '/api/conversations',
      {
        title: title || 'Nueva conversación',
      }
    );

    if (response.data?.success && response.data.conversation) {
      return response.data.conversation;
    }

    return null;
  } catch (error) {
    const axiosError = error as AxiosError<ConversationResponse>;
    logger.error('Error al crear conversación:', axiosError.message);
    return null;
  }
};

/**
 * Actualizar título de conversación
 */
export const updateConversation = async (
  id: string,
  title: string
): Promise<Conversation | null> => {
  try {
    const axiosInstance = createAxiosInstance(getBaseURL());
    const response = await axiosInstance.put<ConversationResponse>(
      `/api/conversations/${id}`,
      {
        title,
      }
    );

    if (response.data?.success && response.data.conversation) {
      return response.data.conversation;
    }

    return null;
  } catch (error) {
    const axiosError = error as AxiosError<ConversationResponse>;
    logger.error('Error al actualizar conversación:', axiosError.message);
    return null;
  }
};

/**
 * Eliminar una conversación
 */
export const deleteConversation = async (id: string): Promise<boolean> => {
  try {
    const axiosInstance = createAxiosInstance(getBaseURL());
    const response = await axiosInstance.delete<{
      success: boolean;
      error?: string;
    }>(`/api/conversations/${id}`);

    return response.data?.success || false;
  } catch (error) {
    const axiosError = error as AxiosError<{
      success: boolean;
      error?: string;
    }>;
    logger.error('Error al eliminar conversación:', axiosError.message);
    return false;
  }
};

/**
 * Guardar un mensaje en una conversación
 */
export const saveMessage = async (
  conversationId: string,
  content: string,
  sender: 'user' | 'bot'
): Promise<Message | null> => {
  try {
    const axiosInstance = createAxiosInstance(getBaseURL());
    const response = await axiosInstance.post<MessageResponse>(
      `/api/conversations/${conversationId}/messages`,
      {
        content,
        sender,
      }
    );

    if (response.data?.success && response.data.message) {
      return response.data.message;
    }

    return null;
  } catch (error) {
    const axiosError = error as AxiosError<MessageResponse>;
    logger.error('Error al guardar mensaje:', axiosError.message);
    return null;
  }
};

/**
 * Actualizar feedback de un mensaje
 */
export const updateMessageFeedback = async (
  messageId: string,
  feedback: 'up' | 'down' | null
): Promise<Message | null> => {
  try {
    const axiosInstance = createAxiosInstance(getBaseURL());
    const response = await axiosInstance.put<MessageResponse>(
      `/api/messages/${messageId}/feedback`,
      {
        feedback,
      }
    );

    if (response.data?.success && response.data.message) {
      return response.data.message;
    }

    return null;
  } catch (error) {
    const axiosError = error as AxiosError<MessageResponse>;
    logger.error('Error al actualizar feedback:', axiosError.message);
    return null;
  }
};

/**
 * Buscar en conversaciones
 */
export const searchConversations = async (
  query: string
): Promise<Conversation[]> => {
  try {
    const axiosInstance = createAxiosInstance(getBaseURL());
    const response = await axiosInstance.get<SearchResponse>(
      '/api/conversations/search',
      {
        params: { q: query },
      }
    );

    if (response.data?.success && response.data.conversations) {
      return response.data.conversations;
    }

    return [];
  } catch (error) {
    const axiosError = error as AxiosError<SearchResponse>;
    logger.error('Error en búsqueda:', axiosError.message);
    return [];
  }
};
