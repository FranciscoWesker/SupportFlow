import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, History } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { useConversations } from '@/hooks/useConversations';
import type { Conversation } from '@/types';

interface ConversationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (id: string | null) => void;
  currentConversationId: string | null;
  isMobile?: boolean;
}

interface SidebarContentProps {
  onClose?: () => void;
  onSelectConversation: (id: string) => void;
  currentConversationId: string | null;
  searchQuery: string;
  onSearch: (query: string) => void;
  onNewConversation: () => void;
  isLoading: boolean;
  isSearching: boolean;
  displayConversations: Conversation[];
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  isMobile?: boolean;
}

const SidebarContent = ({
  onClose,
  onSelectConversation,
  currentConversationId,
  searchQuery,
  onSearch,
  onNewConversation,
  isLoading,
  isSearching,
  displayConversations,
  onDelete,
  onEdit,
  isMobile = false,
}: SidebarContentProps) => {
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Conversaciones
            </h2>
          </div>
          {isMobile && onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="Cerrar historial"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* New Conversation Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewConversation}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Nueva conversación</span>
        </motion.button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {isLoading && !searchQuery.trim() ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Cargando conversaciones...
          </div>
        ) : isSearching ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Buscando...
          </div>
        ) : displayConversations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {searchQuery.trim()
              ? 'No se encontraron conversaciones'
              : 'No hay conversaciones'}
          </div>
        ) : (
          <div className="space-y-2">
            {displayConversations.map(conversation => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isActive={currentConversationId === conversation._id}
                onSelect={onSelectConversation}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export const ConversationHistory = ({
  isOpen,
  onClose,
  onSelectConversation,
  currentConversationId,
  isMobile = false,
}: ConversationHistoryProps) => {
  const {
    conversations,
    isLoading,
    createNewConversation,
    removeConversation,
    updateConversationTitle,
    search,
    loadConversations,
  } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Recargar conversaciones cuando cambia el currentConversationId para actualizar el contexto
  useEffect(() => {
    if (currentConversationId) {
      // Recargar conversaciones para actualizar lastMessageAt y messageCount
      loadConversations();
    }
  }, [currentConversationId, loadConversations]);

  const handleNewConversation = async () => {
    const newConv = await createNewConversation();
    if (newConv) {
      onSelectConversation(newConv._id);
      // Solo cerrar en móvil
      if (isMobile && onClose) {
        onClose();
      }
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      const results = await search(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    // Solo cerrar en móvil
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleDelete = async (id: string) => {
    const success = await removeConversation(id);
    if (success && currentConversationId === id) {
      onSelectConversation(null);
    }
  };

  const handleEdit = async (id: string, title: string) => {
    await updateConversationTitle(id, title);
  };

  const displayConversations = searchQuery.trim()
    ? searchResults
    : conversations;

  const sidebarContent = (
    <SidebarContent
      onClose={onClose}
      onSelectConversation={handleSelect}
      currentConversationId={currentConversationId}
      searchQuery={searchQuery}
      onSearch={handleSearch}
      onNewConversation={handleNewConversation}
      isLoading={isLoading}
      isSearching={isSearching}
      displayConversations={displayConversations}
      onDelete={handleDelete}
      onEdit={handleEdit}
      isMobile={isMobile}
    />
  );

  // En desktop, siempre mostrar (usar clase CSS para responsive)
  if (!isMobile) {
    // Desktop: siempre visible, sin overlay, no se puede cerrar
    return (
      <div className="h-full w-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm">
        {sidebarContent}
      </div>
    );
  }

  // En móvil, usar AnimatePresence
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col"
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
