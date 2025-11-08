import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, MessageSquare } from 'lucide-react';
import type { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, title: string) => void;
}

export const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onEdit,
}: ConversationItemProps) => {
  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      onDelete(conversation._id);
    }
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      const newTitle = window.prompt('Nuevo título:', conversation.title);
      if (newTitle && newTitle.trim()) {
        onEdit(conversation._id, newTitle.trim());
      }
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(conversation._id)}
      className={`
        relative p-3 rounded-lg cursor-pointer transition-colors
        ${isActive
          ? 'bg-primary-500 text-white'
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
          </div>
          <div className={`text-xs ${isActive ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {formatDate(conversation.lastMessageAt)}
          </div>
          {conversation.messageCount > 0 && (
            <div className={`text-xs mt-1 ${isActive ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
              {conversation.messageCount} mensaje{conversation.messageCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity group">
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEdit}
              className={`p-1 rounded ${isActive ? 'hover:bg-primary-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              aria-label="Editar conversación"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className={`p-1 rounded ${isActive ? 'hover:bg-primary-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            aria-label="Eliminar conversación"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

