import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechSynthesisOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

interface UseSpeechSynthesisState {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
}

export const useSpeechSynthesis = (options: SpeechSynthesisOptions = {}) => {
  const {
    language = 'es-ES',
    pitch = 1,
    rate = 1,
    volume = 1,
    voice: preferredVoice = null,
  } = options;

  const [state, setState] = useState<UseSpeechSynthesisState>({
    isSpeaking: false,
    isPaused: false,
    isSupported: false,
    voices: [],
    currentVoice: null,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupportedRef = useRef(false);

  // Verificar soporte y cargar voces
  useEffect(() => {
    if ('speechSynthesis' in window) {
      isSupportedRef.current = true;
      setState(prev => ({ ...prev, isSupported: true }));

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setState(prev => ({
          ...prev,
          voices,
          currentVoice:
            preferredVoice ||
            voices.find(v => v.lang.startsWith(language.split('-')[0])) ||
            voices.find(v => v.lang === language) ||
            voices[0] ||
            null,
        }));
      };

      // Cargar voces (pueden tardar en cargar)
      loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      isSupportedRef.current = false;
      setState(prev => ({
        ...prev,
        isSupported: false,
      }));
    }
  }, [language, preferredVoice]);

  const speak = useCallback(
    (text: string, customOptions?: Partial<SpeechSynthesisOptions>) => {
      if (!isSupportedRef.current || !text.trim()) {
        return;
      }

      // Cancelar cualquier síntesis en curso
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const opts = { ...options, ...customOptions };

      utterance.lang = opts.language || language;
      utterance.pitch = opts.pitch ?? pitch;
      utterance.rate = opts.rate ?? rate;
      utterance.volume = opts.volume ?? volume;
      utterance.voice = opts.voice || state.currentVoice;

      utterance.onstart = () => {
        setState(prev => ({
          ...prev,
          isSpeaking: true,
          isPaused: false,
        }));
      };

      utterance.onend = () => {
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
        }));
        utteranceRef.current = null;
      };

      utterance.onerror = event => {
        console.error('Error en síntesis de voz:', event);
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
        }));
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setState(prev => ({ ...prev, isPaused: true }));
      };

      utterance.onresume = () => {
        setState(prev => ({ ...prev, isPaused: false }));
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [language, pitch, rate, volume, state.currentVoice, options]
  );

  const pause = useCallback(() => {
    if (isSupportedRef.current && state.isSpeaking && !state.isPaused) {
      speechSynthesis.pause();
    }
  }, [state.isSpeaking, state.isPaused]);

  const resume = useCallback(() => {
    if (isSupportedRef.current && state.isPaused) {
      speechSynthesis.resume();
    }
  }, [state.isPaused]);

  const stop = useCallback(() => {
    if (isSupportedRef.current) {
      speechSynthesis.cancel();
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
      }));
      utteranceRef.current = null;
    }
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (isSupportedRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
  };
};
