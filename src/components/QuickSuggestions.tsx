import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight } from 'lucide-react';

interface QuickSuggestionsProps {
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
}

const SUGGESTIONS = [
  '¿Cómo puedo restablecer mi contraseña?',
  '¿Cómo actualizo mi información de perfil?',
  '¿Qué hacer si no puedo iniciar sesión?',
  '¿Cómo contacto con el soporte técnico?',
  '¿Cómo cambio la configuración de mi cuenta?',
  '¿Dónde puedo encontrar la documentación?',
  '¿Cómo reporto un problema o error?',
  '¿Cuáles son los requisitos del sistema?',
];

export const QuickSuggestions = ({
  onSelect,
  isLoading = false,
}: QuickSuggestionsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary-500" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Preguntas sugeridas
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SUGGESTIONS.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !isLoading && onSelect(suggestion)}
            disabled={isLoading}
            className="group relative flex items-center justify-between p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Seleccionar sugerencia: ${suggestion}`}
          >
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors pr-8">
              {suggestion}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors absolute right-4 opacity-0 group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
