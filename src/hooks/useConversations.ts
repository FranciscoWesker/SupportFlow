import { useState, useCallback, useEffect } from 'react';
import type { Conversation } from '@/types';
import {
  getConversations,
  createConversation,
  deleteConversation,
  updateConversation,
  searchConversations,
} from '@/services/conversation.service';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar conversaciones al montar
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      setError('Error al cargar conversaciones');
      console.error('Error al cargar conversaciones:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewConversation = useCallback(async (title?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newConversation = await createConversation(title);
      if (newConversation) {
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(newConversation._id);
        return newConversation;
      }
      return null;
    } catch (err) {
      setError('Error al crear conversación');
      console.error('Error al crear conversación:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeConversation = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await deleteConversation(id);
      if (success) {
        setConversations(prev => prev.filter(conv => conv._id !== id));
        if (currentConversationId === id) {
          setCurrentConversationId(null);
        }
        return true;
      }
      return false;
    } catch (err) {
      setError('Error al eliminar conversación');
      console.error('Error al eliminar conversación:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId]);

  const updateConversationTitle = useCallback(async (id: string, title: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateConversation(id, title);
      if (updated) {
        setConversations(prev =>
          prev.map(conv => (conv._id === id ? updated : conv))
        );
        return updated;
      }
      return null;
    } catch (err) {
      setError('Error al actualizar conversación');
      console.error('Error al actualizar conversación:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      await loadConversations();
      return [];
    }
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchConversations(query);
      return results;
    } catch (err) {
      setError('Error en búsqueda');
      console.error('Error en búsqueda:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [loadConversations]);

  const selectConversation = useCallback((id: string | null) => {
    setCurrentConversationId(id);
  }, []);

  const getCurrentConversation = useCallback(() => {
    return conversations.find(conv => conv._id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  return {
    conversations,
    currentConversationId,
    currentConversation: getCurrentConversation(),
    isLoading,
    error,
    loadConversations,
    createNewConversation,
    removeConversation,
    updateConversationTitle,
    search,
    selectConversation,
  };
};

