import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ExportDialog } from './ExportDialog';
import { Trash2, Download } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';

interface ChatProps {
  conversationId?: string | null;
}

export const Chat = ({ conversationId }: ChatProps) => {
  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    conversationId,
  });
  const { currentConversation } = useConversations();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end gap-2 mb-4"
            >
              {conversationId && currentConversation && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsExportDialogOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearMessages}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpiar chat</span>
              </motion.button>
            </motion.div>
          )}
          {messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              onFeedbackChange={() => {
                // El feedback ya se guarda en MongoDB a través del servicio MessageFeedback
              }}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      {conversationId && currentConversation && (
        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          conversationId={conversationId}
          conversationTitle={currentConversation.title}
        />
      )}
    </div>
  );
};
