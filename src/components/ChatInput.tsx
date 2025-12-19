import { useState, KeyboardEvent, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Mic, MicOff } from 'lucide-react';
import type { Message } from '@/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

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

  const {
    isListening,
    transcript,
    isSupported: isSpeechSupported,
    error: speechError,
    startListening,
    stopListening,
    reset: resetSpeech,
  } = useSpeechRecognition({
    language: 'es-ES',
    continuous: false,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setMessage(transcript);
        stopListening();
      } else {
        setMessage(transcript);
      }
    },
    onError: error => {
      console.error('Error en reconocimiento de voz:', error);
    },
  });

  // Actualizar el mensaje cuando cambia el transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setMessage(transcript);
    }
  }, [transcript, isListening]);

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
      resetSpeech();
      if (onClearQuote) {
        onClearQuote();
      }
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setMessage('');
      resetSpeech();
      startListening();
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
              placeholder={
                isListening
                  ? 'Escuchando...'
                  : 'Escribe tu mensaje aquí... (Enter para enviar, Shift+Enter para nueva línea)'
              }
              disabled={isLoading || isListening}
              rows={1}
              className={`w-full resize-none rounded-lg border px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {message.length > 0 && !isListening && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                {message.length} caracteres
              </div>
            )}
            {isListening && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Escuchando...
              </div>
            )}
            {speechError && (
              <div className="absolute -top-8 left-0 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                {speechError}
              </div>
            )}
          </div>
          {isSpeechSupported && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-label={
                isListening ? 'Detener grabación' : 'Iniciar grabación de voz'
              }
              title={
                isListening
                  ? 'Detener grabación'
                  : 'Hablar (requiere permiso de micrófono)'
              }
            >
              {isListening ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!message.trim() || isLoading || isListening}
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
