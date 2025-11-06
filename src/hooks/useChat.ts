import { useState, useCallback, useRef } from 'react';
import type { Message } from '@/types';
import { sendMessage as sendMessageToApi } from '@/services/api.service';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        '¡Hola! Soy SupportFlow, tu asistente de soporte técnico. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  // Ref para evitar envíos concurrentes (race conditions entre eventos y setState)
  const sendingRef = useRef(false);

  const addMessage = useCallback((content: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading || sendingRef.current) return;

      // Marcar envío en curso para evitar llamadas duplicadas
      sendingRef.current = true;

      // Agregar mensaje del usuario
      addMessage(content, 'user');

      // Agregar mensaje de carga del bot
      const loadingMessageId =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const loadingMessage: Message = {
        id: loadingMessageId,
        content: '',
        sender: 'bot',
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages(prev => [...prev, loadingMessage]);
      setIsLoading(true);

      try {
        // Preparar historial de conversación
        const conversationHistory = messages
          .filter(msg => !msg.isLoading)
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }));

        // Enviar mensaje a la API
        const response = await sendMessageToApi(content, conversationHistory);

        // Remover mensaje de carga y agregar respuesta
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          return [
            ...filtered,
            {
              id:
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
              content: response.message,
              sender: 'bot',
              timestamp: new Date(),
            },
          ];
        });
      } catch (_error) {
        // Remover mensaje de carga y agregar mensaje de error
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          return [
            ...filtered,
            {
              id:
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
              content:
                'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
              sender: 'bot',
              timestamp: new Date(),
            },
          ];
        });
      } finally {
        setIsLoading(false);
        sendingRef.current = false;
      }
    },
    [messages, addMessage, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        content:
          '¡Hola! Soy SupportFlow, tu asistente de soporte técnico. ¿En qué puedo ayudarte hoy?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
