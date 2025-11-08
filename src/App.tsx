import { useState } from 'react';
import { Header } from '@/components/Header';
import { Chat } from '@/components/Chat';
import { ConversationHistory } from '@/components/ConversationHistory';
import { useConversations } from '@/hooks/useConversations';
import { History } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { currentConversationId, selectConversation } = useConversations();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex relative">
        {/* Botón para abrir historial (móvil) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsHistoryOpen(true)}
          className="fixed bottom-4 left-4 z-30 p-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 lg:hidden"
          aria-label="Abrir historial"
        >
          <History className="w-6 h-6" />
        </motion.button>

        {/* Sidebar de historial (desktop) */}
        <div className="hidden lg:block w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <ConversationHistory
            isOpen={true}
            onClose={() => {}}
            onSelectConversation={selectConversation}
            currentConversationId={currentConversationId}
          />
        </div>

        {/* Chat principal */}
        <div className="flex-1">
          <Chat conversationId={currentConversationId} />
        </div>

        {/* Sidebar de historial (móvil) */}
        <ConversationHistory
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectConversation={selectConversation}
          currentConversationId={currentConversationId}
        />
      </div>
    </div>
  );
}

export default App;
