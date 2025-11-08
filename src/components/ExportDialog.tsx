import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Code, FileCode } from 'lucide-react';
import {
  exportToTXT,
  exportToJSON,
  exportToMarkdown,
  downloadFile,
} from '@/services/export.service';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
}

export const ExportDialog = ({
  isOpen,
  onClose,
  conversationId,
  conversationTitle,
}: ExportDialogProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'json' | 'markdown'>(
    'txt'
  );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'txt':
          content = await exportToTXT(conversationId);
          filename = `${conversationTitle.replace(/[^a-z0-9]/gi, '_')}.txt`;
          mimeType = 'text/plain';
          break;
        case 'json':
          content = await exportToJSON(conversationId);
          filename = `${conversationTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
          mimeType = 'application/json';
          break;
        case 'markdown':
          content = await exportToMarkdown(conversationId);
          filename = `${conversationTitle.replace(/[^a-z0-9]/gi, '_')}.md`;
          mimeType = 'text/markdown';
          break;
        default:
          return;
      }

      downloadFile(content, filename, mimeType);
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar la conversación. Por favor, intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Exportar Conversación
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecciona el formato de exportación:
              </p>

              <div className="space-y-2 mb-6">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="format"
                    value="txt"
                    checked={exportFormat === 'txt'}
                    onChange={() => setExportFormat('txt')}
                    className="w-4 h-4 text-primary-500"
                  />
                  <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="flex-1 text-gray-900 dark:text-white">
                    Texto plano (TXT)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={() => setExportFormat('json')}
                    className="w-4 h-4 text-primary-500"
                  />
                  <Code className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="flex-1 text-gray-900 dark:text-white">
                    JSON
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="format"
                    value="markdown"
                    checked={exportFormat === 'markdown'}
                    onChange={() => setExportFormat('markdown')}
                    className="w-4 h-4 text-primary-500"
                  />
                  <FileCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="flex-1 text-gray-900 dark:text-white">
                    Markdown
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Exportando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Exportar</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
