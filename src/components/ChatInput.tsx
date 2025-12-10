import { useState, KeyboardEvent, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import type { Message } from '@/types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  quotedMessage?: Message | null;
  onClearQuote?: () => void;
}

export const ChatInput = ({
  onSendMessage,
  isLoading,
  quotedMessage,
  onClearQuote,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (quotedMessage) {
      const quoteText = `> ${quotedMessage.sender === 'user' ? 'Usuario' : 'Bot'}: ${quotedMessage.content}\n\n`;
      setMessage(prev => quoteText + prev);
    }
  }, [quotedMessage]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      if (onClearQuote) {
        onClearQuote();
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onSubmit={handleSubmit}
      className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="max-w-7xl mx-auto">
        <AnimatePresence>
          {quotedMessage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-primary-500 relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {quotedMessage.sender === 'user' ? 'Usuario' : 'Bot'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {quotedMessage.content}
                  </p>
                </div>
                {onClearQuote && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={onClearQuote}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                    aria-label="Quitar cita"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí... (Enter para enviar, Shift+Enter para nueva línea)"
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {message.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                {message.length} caracteres
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim() || isLoading}
            className="flex-shrink-0 w-12 h-12 bg-primary-500 text-white rounded-lg flex items-center justify-center hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Enviar mensaje"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
};
