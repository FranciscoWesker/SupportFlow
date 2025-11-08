import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/types';
import { User, Bot, Copy, Check } from 'lucide-react';
import { MessageFeedback } from './MessageFeedback';

interface MessageBubbleProps {
  message: Message;
  onFeedbackChange?: (messageId: string, feedback: 'up' | 'down' | null) => void;
}

export const MessageBubble = ({ message, onFeedbackChange }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(message.feedback || null);
  const isUser = message.sender === 'user';

  const handleFeedbackChange = (newFeedback: 'up' | 'down' | null) => {
    setFeedback(newFeedback);
    if (onFeedbackChange && message._id) {
      onFeedbackChange(message._id, newFeedback);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  if (message.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start space-x-3 mb-4"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex space-x-2">
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            SupportFlow está escribiendo...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-3 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-primary-500'
            : 'bg-gradient-to-br from-primary-500 to-primary-600'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      <div
        className={`group relative flex-1 rounded-lg p-4 max-w-[80%] sm:max-w-[70%] ${
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p
            className={`text-xs ${
              isUser ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {typeof message.timestamp === 'string'
              ? new Date(message.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : message.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
          </p>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded ${
              isUser
                ? 'hover:bg-primary-600 text-primary-100'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            aria-label="Copiar mensaje"
            title="Copiar mensaje"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </motion.button>
        </div>
        {/* Feedback solo para mensajes del bot */}
        {!isUser && message._id && (
          <MessageFeedback
            messageId={message._id}
            currentFeedback={feedback}
            onFeedbackChange={handleFeedbackChange}
          />
        )}
      </div>
    </motion.div>
  );
};
