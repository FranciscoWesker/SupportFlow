import mongoose from 'mongoose';
import logger from '../logger.mjs';

let isConnected = false;

/**
 * Conecta a MongoDB con reintentos
 * @returns {Promise<void>}
 */
export async function connectMongoDB() {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supportflow';
  
  try {
    // Configuración para MongoDB Atlas (mongodb+srv://) o MongoDB local
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // Aumentado para Atlas
      socketTimeoutMS: 45000,
    };

    // Si es MongoDB Atlas (mongodb+srv://), agregar opciones adicionales
    if (mongoUri.startsWith('mongodb+srv://')) {
      connectionOptions.retryWrites = true;
      connectionOptions.w = 'majority';
    }

    await mongoose.connect(mongoUri, connectionOptions);

    isConnected = true;
    logger.info({ 
      event: 'mongodb_connected', 
      uri: mongoUri.replace(/\/\/.*@/, '//***@') // Ocultar credenciales en logs
    });

    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      logger.error({ event: 'mongodb_error', error: err.message });
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn({ event: 'mongodb_disconnected' });
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info({ event: 'mongodb_reconnected' });
      isConnected = true;
    });

  } catch (error) {
    logger.error({ 
      event: 'mongodb_connection_failed', 
      error: error.message 
    });
    isConnected = false;
    throw error;
  }
}

/**
 * Desconecta de MongoDB
 * @returns {Promise<void>}
 */
export async function disconnectMongoDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info({ event: 'mongodb_disconnected' });
  } catch (error) {
    logger.error({ 
      event: 'mongodb_disconnect_error', 
      error: error.message 
    });
  }
}

/**
 * Verifica si MongoDB está conectado
 * @returns {boolean}
 */
export function isMongoDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

