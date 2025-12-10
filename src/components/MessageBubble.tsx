import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '@/types';
import {
  User,
  Bot,
  Copy,
  Check,
  MoreVertical,
  Edit2,
  Trash2,
  Reply,
  RefreshCw,
  Share2,
  X,
  Save,
} from 'lucide-react';
import { MessageFeedback } from './MessageFeedback';

interface MessageBubbleProps {
  message: Message;
  onFeedbackChange?: (
    messageId: string,
    feedback: 'up' | 'down' | null
  ) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onQuote?: (message: Message) => void;
  onRegenerate?: (messageId: string) => void;
  onShare?: (message: Message) => void;
}

export const MessageBubble = ({
  message,
  onFeedbackChange,
  onEdit,
  onDelete,
  onQuote,
  onRegenerate,
  onShare,
}: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(
    message.feedback || null
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isUser = message.sender === 'user';

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  // Focus en textarea cuando entra en modo edición
  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.setSelectionRange(
        editedContent.length,
        editedContent.length
      );
    }
  }, [isEditing, editedContent.length]);

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
      setIsMenuOpen(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      if (onEdit && message._id) {
        onEdit(message._id, editedContent.trim());
      }
    }
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const handleDelete = () => {
    if (showDeleteConfirm && onDelete && message._id) {
      onDelete(message._id);
      setShowDeleteConfirm(false);
      setIsMenuOpen(false);
    } else {
      setShowDeleteConfirm(true);
      setIsMenuOpen(false);
    }
  };

  const handleQuote = () => {
    if (onQuote) {
      onQuote(message);
    }
    setIsMenuOpen(false);
  };

  const handleRegenerate = () => {
    if (onRegenerate && message._id) {
      onRegenerate(message._id);
    }
    setIsMenuOpen(false);
  };

  const handleShare = async () => {
    if (onShare) {
      setIsSharing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300)); // Pequeña animación
        onShare(message);
      } finally {
        setIsSharing(false);
      }
    }
    setIsMenuOpen(false);
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
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={editTextareaRef}
              value={editedContent}
              onChange={e => setEditedContent(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSaveEdit();
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              className={`w-full resize-none rounded-lg border-2 p-2 text-sm ${
                isUser
                  ? 'bg-primary-400 border-primary-300 text-white placeholder-primary-200'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              rows={Math.min(Math.max(editedContent.split('\n').length, 3), 10)}
            />
            <div className="flex items-center justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancelEdit}
                className={`p-1.5 rounded ${
                  isUser
                    ? 'hover:bg-primary-600 text-primary-100'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                aria-label="Cancelar edición"
                title="Cancelar (Esc)"
              >
                <X className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveEdit}
                disabled={!editedContent.trim() || editedContent === message.content}
                className={`p-1.5 rounded ${
                  isUser
                    ? 'hover:bg-primary-600 text-primary-100 disabled:opacity-50'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50'
                }`}
                aria-label="Guardar cambios"
                title="Guardar (Ctrl+Enter)"
              >
                <Save className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`text-sm prose prose-sm max-w-none break-words ${
                isUser
                  ? 'prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-ul:text-white prose-li:text-white prose-code:text-white prose-a:text-white'
                  : 'prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-900 dark:prose-p:text-gray-100 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-ul:text-gray-900 dark:prose-ul:text-gray-100 prose-li:text-gray-900 dark:prose-li:text-gray-100 prose-code:text-gray-900 dark:prose-code:text-gray-100 dark:prose-invert'
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold mb-1.5 mt-2.5 first:mt-0">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="ml-2 leading-relaxed">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block p-2 rounded bg-gray-200 dark:bg-gray-700 text-sm font-mono overflow-x-auto">
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
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
              <div className="flex items-center gap-1">
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
                <div className="relative" ref={menuRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded ${
                      isUser
                        ? 'hover:bg-primary-600 text-primary-100'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    aria-label="Más opciones"
                    title="Más opciones"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </motion.button>
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute ${
                          isUser ? 'left-0' : 'right-0'
                        } top-full mt-1 z-50 min-w-[180px] rounded-lg shadow-lg border ${
                          isUser
                            ? 'bg-primary-600 border-primary-400'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        } py-1`}
                      >
                        {isUser && onEdit && (
                          <button
                            onClick={handleEdit}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-opacity-80 ${
                              isUser
                                ? 'text-white hover:bg-primary-500'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title="Editar este mensaje"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Editar</span>
                          </button>
                        )}
                        {onQuote && (
                          <button
                            onClick={handleQuote}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-opacity-80 ${
                              isUser
                                ? 'text-white hover:bg-primary-500'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title="Citar este mensaje en tu respuesta"
                          >
                            <Reply className="w-4 h-4" />
                            <span>Citar</span>
                          </button>
                        )}
                        {!isUser && onRegenerate && (
                          <button
                            onClick={handleRegenerate}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-opacity-80 ${
                              isUser
                                ? 'text-white hover:bg-primary-500'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title="Regenerar respuesta del bot"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Regenerar</span>
                          </button>
                        )}
                        {onShare && (
                          <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-opacity-80 disabled:opacity-50 ${
                              isUser
                                ? 'text-white hover:bg-primary-500'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Share2 className={`w-4 h-4 ${isSharing ? 'animate-pulse' : ''}`} />
                            <span>{isSharing ? 'Compartiendo...' : 'Compartir'}</span>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={handleDelete}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-opacity-80 ${
                              isUser
                                ? 'text-white hover:bg-primary-500'
                                : 'text-red-600 dark:text-red-400 hover:bg-red-500 hover:bg-opacity-20'
                            }`}
                            title="Eliminar este mensaje"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {/* Feedback solo para mensajes del bot */}
            {!isUser && message._id && (
              <MessageFeedback
                messageId={message._id}
                currentFeedback={feedback}
                onFeedbackChange={handleFeedbackChange}
              />
            )}
          </>
        )}
        {/* Diálogo de confirmación para eliminar */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ¿Eliminar mensaje?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este mensaje?
                </p>
                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                  >
                    Eliminar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
