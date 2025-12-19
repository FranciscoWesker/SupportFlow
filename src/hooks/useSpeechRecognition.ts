import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
}

interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

// Extender Window para incluir SpeechRecognition
interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
  webkitSpeechRecognition?: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
}

export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {}
) => {
  const {
    language = 'es-ES',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    isSupported: false,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupportedRef = useRef(false);

  // Verificar soporte del navegador
  useEffect(() => {
    const windowWithSpeech = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognitionConstructor =
      windowWithSpeech.SpeechRecognition ||
      windowWithSpeech.webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      isSupportedRef.current = true;
      setState(prev => ({ ...prev, isSupported: true }));

      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setState(prev => ({
          ...prev,
          transcript: fullTranscript.trim(),
        }));

        if (onResult) {
          onResult(fullTranscript.trim(), finalTranscript.length > 0);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = 'Error en el reconocimiento de voz';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No se detectó voz. Intenta de nuevo.';
            break;
          case 'audio-capture':
            errorMessage = 'No se pudo acceder al micrófono.';
            break;
          case 'not-allowed':
            errorMessage = 'Permiso de micrófono denegado.';
            break;
          case 'network':
            errorMessage = 'Error de red. Verifica tu conexión.';
            break;
          case 'aborted':
            errorMessage = 'Reconocimiento de voz cancelado.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }

        setState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage,
        }));

        if (onError) {
          onError(new Error(errorMessage));
        }
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
    } else {
      isSupportedRef.current = false;
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Tu navegador no soporta reconocimiento de voz',
      }));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, interimResults, onResult, onError]);

  const startListening = useCallback(() => {
    if (!isSupportedRef.current || !recognitionRef.current) {
      setState(prev => ({
        ...prev,
        error: 'Reconocimiento de voz no disponible',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, transcript: '', error: null }));
      recognitionRef.current.start();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al iniciar reconocimiento';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  const reset = useCallback(() => {
    stopListening();
    setState(prev => ({
      ...prev,
      transcript: '',
      error: null,
    }));
  }, [stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    reset,
  };
};
