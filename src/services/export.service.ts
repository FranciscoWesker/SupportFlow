import type { Message } from '@/types';
import { getConversation } from './conversation.service';

/**
 * Exporta una conversación en formato TXT
 */
export const exportToTXT = async (conversationId: string): Promise<string> => {
  const data = await getConversation(conversationId);
  if (!data) {
    throw new Error('Conversación no encontrada');
  }

  const { conversation, messages } = data;
  let content = `Conversación: ${conversation.title}\n`;
  content += `Fecha: ${new Date(conversation.createdAt).toLocaleString('es-ES')}\n`;
  content += `Mensajes: ${conversation.messageCount}\n`;
  content += '='.repeat(50) + '\n\n';

  messages.forEach((message: Message, index: number) => {
    const sender = message.sender === 'user' ? 'Usuario' : 'SupportFlow';
    const timestamp = typeof message.timestamp === 'string'
      ? new Date(message.timestamp).toLocaleString('es-ES')
      : message.timestamp.toLocaleString('es-ES');
    
    content += `[${index + 1}] ${sender} - ${timestamp}\n`;
    content += `${message.content}\n\n`;
  });

  return content;
};

/**
 * Exporta una conversación en formato JSON
 */
export const exportToJSON = async (conversationId: string): Promise<string> => {
  const data = await getConversation(conversationId);
  if (!data) {
    throw new Error('Conversación no encontrada');
  }

  const { conversation, messages } = data;
  const exportData = {
    conversation: {
      id: conversation._id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.messageCount,
    },
    messages: messages.map((message: Message) => ({
      id: message._id || message.id,
      content: message.content,
      sender: message.sender,
      timestamp: message.timestamp,
      feedback: message.feedback || null,
    })),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Exporta una conversación en formato Markdown
 */
export const exportToMarkdown = async (conversationId: string): Promise<string> => {
  const data = await getConversation(conversationId);
  if (!data) {
    throw new Error('Conversación no encontrada');
  }

  const { conversation, messages } = data;
  let content = `# ${conversation.title}\n\n`;
  content += `**Fecha:** ${new Date(conversation.createdAt).toLocaleString('es-ES')}\n`;
  content += `**Mensajes:** ${conversation.messageCount}\n\n`;
  content += '---\n\n';

  messages.forEach((message: Message, index: number) => {
    const sender = message.sender === 'user' ? '**Usuario**' : '**SupportFlow**';
    const timestamp = typeof message.timestamp === 'string'
      ? new Date(message.timestamp).toLocaleString('es-ES')
      : message.timestamp.toLocaleString('es-ES');
    
    content += `## Mensaje ${index + 1}\n\n`;
    content += `${sender} - *${timestamp}*\n\n`;
    content += `${message.content}\n\n`;
    content += '---\n\n';
  });

  return content;
};

/**
 * Descarga un archivo con el contenido proporcionado
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

