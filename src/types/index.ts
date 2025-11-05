export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatContext {
  messages: Message[];
  addMessage: (content: string, sender: 'user' | 'bot') => void;
  clearMessages: () => void;
}

export interface ApiConfig {
  googleGeminiApiKey?: string;
  huggingfaceApiKey?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

