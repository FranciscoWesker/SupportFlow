import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { updateMessageFeedback } from '@/services/conversation.service';

interface MessageFeedbackProps {
  messageId?: string;
  currentFeedback?: 'up' | 'down' | null;
  onFeedbackChange?: (feedback: 'up' | 'down' | null) => void;
}

export const MessageFeedback = ({
  messageId,
  currentFeedback,
  onFeedbackChange,
}: MessageFeedbackProps) => {
  const handleFeedback = async (feedback: 'up' | 'down') => {
    if (!messageId) return;

    const newFeedback = currentFeedback === feedback ? null : feedback;

    try {
      await updateMessageFeedback(messageId, newFeedback);
      if (onFeedbackChange) {
        onFeedbackChange(newFeedback);
      }
    } catch (error) {
      console.error('Error al actualizar feedback:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleFeedback('up')}
        className={`p-1.5 rounded transition-colors ${
          currentFeedback === 'up'
            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Me gusta"
        title="Me gusta"
      >
        <ThumbsUp className="w-4 h-4" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleFeedback('down')}
        className={`p-1.5 rounded transition-colors ${
          currentFeedback === 'down'
            ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="No me gusta"
        title="No me gusta"
      >
        <ThumbsDown className="w-4 h-4" />
      </motion.button>
    </div>
  );
};
