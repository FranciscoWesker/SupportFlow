import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.mjs';

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Nueva conversación',
  },
  userId: {
    type: String,
    default: null, // Para futura autenticación
    index: true,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Middleware para cifrar título antes de guardar
conversationSchema.pre('save', function(next) {
  if (this.isModified('title') && this.title) {
    // Solo cifrar si el título no está ya cifrado
    // Verificar si el título parece estar cifrado (base64 válido y longitud mínima)
    const minEncryptedLength = 32; // IV (16) + TAG (16) = mínimo 32 bytes en base64
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(this.title);
    const isLikelyEncrypted = isBase64 && this.title.length >= minEncryptedLength;
    
    // Si no parece estar cifrado, cifrarlo
    if (!isLikelyEncrypted) {
      this.title = encrypt(this.title);
    }
  }
  next();
});

// Método para obtener título descifrado
conversationSchema.methods.getDecryptedTitle = function() {
  return decrypt(this.title);
};

// Método estático para descifrar múltiples conversaciones
conversationSchema.statics.decryptConversations = function(conversations) {
  return conversations.map(conv => {
    const convObj = conv.toObject ? conv.toObject() : conv;
    return {
      ...convObj,
      title: decrypt(convObj.title),
    };
  });
};

// Índices para búsqueda eficiente
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;

