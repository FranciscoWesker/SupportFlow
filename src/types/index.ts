export interface Message {
  id: string;
  _id?: string; // ID de MongoDB
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date | string;
  isLoading?: boolean;
  feedback?: 'up' | 'down' | null;
  conversationId?: string;
}

export interface Conversation {
  _id: string;
  title: string;
  messageCount: number;
  lastMessageAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
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

export interface ConversationResponse {
  success: boolean;
  conversation?: Conversation;
  conversations?: Conversation[];
  error?: string;
}

export interface MessageResponse {
  success: boolean;
  message?: Message;
  messages?: Message[];
  error?: string;
}

export interface SearchResponse {
  success: boolean;
  conversations?: Conversation[];
  count?: number;
  error?: string;
}
