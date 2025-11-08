import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message } from '@/types';
import { sendMessage as sendMessageToApi } from '@/services/api.service';
import { saveMessage, getConversation } from '@/services/conversation.service';
import { useConversations } from './useConversations';

interface UseChatOptions {
  conversationId?: string | null;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { conversationId } = options;
  const { loadConversations } = useConversations();
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

  // Cargar mensajes de MongoDB si hay conversationId
  useEffect(() => {
    if (conversationId) {
      const loadConversation = async () => {
        try {
          const data = await getConversation(conversationId);
          if (data && data.messages && data.messages.length > 0) {
            // Convertir mensajes de MongoDB al formato del frontend
            const formattedMessages: Message[] = data.messages.map(
              (msg: Message) => ({
                id: msg._id || msg.id || Date.now().toString(),
                _id: msg._id,
                content: msg.content,
                sender: msg.sender,
                timestamp: new Date(msg.timestamp),
                feedback: msg.feedback || null,
                conversationId: msg.conversationId,
              })
            );
            setMessages(formattedMessages);
          } else {
            // Si no hay mensajes, mostrar mensaje de bienvenida
            setMessages([
              {
                id: '1',
                content:
                  '¡Hola! Soy SupportFlow, tu asistente de soporte técnico. ¿En qué puedo ayudarte hoy?',
                sender: 'bot',
                timestamp: new Date(),
              },
            ]);
          }
        } catch (error) {
          console.error('Error al cargar conversación:', error);
          // En caso de error, mostrar mensaje de bienvenida
          setMessages([
            {
              id: '1',
              content:
                '¡Hola! Soy SupportFlow, tu asistente de soporte técnico. ¿En qué puedo ayudarte hoy?',
              sender: 'bot',
              timestamp: new Date(),
            },
          ]);
        }
      };
      loadConversation();
    } else {
      // Si no hay conversationId, resetear a mensaje de bienvenida
      setMessages([
        {
          id: '1',
          content:
            '¡Hola! Soy SupportFlow, tu asistente de soporte técnico. ¿En qué puedo ayudarte hoy?',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading || sendingRef.current) return;

      // Marcar envío en curso para evitar llamadas duplicadas
      sendingRef.current = true;

      // Agregar mensaje del usuario
      const userMessage: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

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
        // Preparar historial de conversación (incluyendo el mensaje del usuario recién agregado)
        const conversationHistory = [...messages, userMessage]
          .filter(msg => !msg.isLoading)
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          }));

        // Enviar mensaje a la API
        const response = await sendMessageToApi(content, conversationHistory);

        // Guardar mensaje del usuario en MongoDB si hay conversationId (solo una vez)
        if (conversationId) {
          try {
            const savedMessage = await saveMessage(
              conversationId,
              content,
              'user'
            );
            if (savedMessage && savedMessage._id) {
              // Actualizar el mensaje con el ID de MongoDB
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === userMessage.id
                    ? { ...msg, _id: savedMessage._id }
                    : msg
                )
              );
              // Actualizar el historial de conversaciones para reflejar el nuevo mensaje
              loadConversations();
            }
          } catch (error) {
            console.error('Error al guardar mensaje del usuario:', error);
          }
        }

        // Remover mensaje de carga y agregar respuesta
        const botMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          content: response.message,
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          return [...filtered, botMessage];
        });

        // Guardar mensaje del bot en MongoDB si hay conversationId
        if (conversationId) {
          try {
            const savedMessage = await saveMessage(
              conversationId,
              response.message,
              'bot'
            );
            if (savedMessage && savedMessage._id) {
              // Actualizar el mensaje con el ID de MongoDB
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === botMessage.id
                    ? { ...msg, _id: savedMessage._id }
                    : msg
                )
              );
              // Actualizar el historial de conversaciones para reflejar el nuevo mensaje
              loadConversations();
            }
          } catch (error) {
            console.error('Error al guardar mensaje del bot:', error);
          }
        }
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
    [messages, isLoading, conversationId, loadConversations]
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
