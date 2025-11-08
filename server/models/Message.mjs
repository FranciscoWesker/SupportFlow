import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption.mjs';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'bot'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  feedback: {
    type: String,
    enum: ['up', 'down', null],
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Middleware para cifrar contenido antes de guardar
messageSchema.pre('save', function(next) {
  if (this.isModified('content') && this.content) {
    // Solo cifrar si el contenido no está ya cifrado
    // Verificar si el contenido parece estar cifrado (base64 válido y longitud mínima)
    const minEncryptedLength = 32; // IV (16) + TAG (16) = mínimo 32 bytes en base64
    const isBase64 = /^[A-Za-z0-9+/=]+$/.test(this.content);
    const isLikelyEncrypted = isBase64 && this.content.length >= minEncryptedLength;
    
    // Si no parece estar cifrado, cifrarlo
    if (!isLikelyEncrypted) {
      this.content = encrypt(this.content);
    }
  }
  next();
});

// Método para obtener contenido descifrado
messageSchema.methods.getDecryptedContent = function() {
  return decrypt(this.content);
};

// Método estático para descifrar múltiples mensajes
messageSchema.statics.decryptMessages = function(messages) {
  return messages.map(msg => {
    const msgObj = msg.toObject ? msg.toObject() : msg;
    return {
      ...msgObj,
      content: decrypt(msgObj.content),
    };
  });
};

// Índices para búsqueda eficiente
messageSchema.index({ conversationId: 1, timestamp: -1 });
messageSchema.index({ conversationId: 1, feedback: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;

