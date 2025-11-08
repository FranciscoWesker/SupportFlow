import crypto from 'crypto';

// Obtener clave de cifrado desde variable de entorno
// Debe ser una cadena hexadecimal de 64 caracteres (32 bytes)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : null;

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Cifra un texto usando AES-256-GCM
 * @param {string} text - Texto a cifrar
 * @returns {string} - Texto cifrado en formato base64
 */
export function encrypt(text) {
  if (!ENCRYPTION_KEY) {
    // Si no hay clave, devolver texto sin cifrar (modo desarrollo)
    return text;
  }

  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    // Generar IV aleatorio
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Crear cipher
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    // Cifrar el texto (trabajar con buffers)
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    // Obtener el tag de autenticación
    const tag = cipher.getAuthTag();
    
    // Combinar IV + tag + texto cifrado
    // Formato: [IV (16 bytes)][TAG (16 bytes)][ENCRYPTED DATA (variable)]
    const combined = Buffer.concat([
      iv,
      tag,
      encrypted
    ]);
    
    // Convertir a base64 solo una vez al final
    return combined.toString('base64');
  } catch (error) {
    console.error('Error al cifrar:', error);
    return text; // Fallback: devolver texto sin cifrar
  }
}

/**
 * Descifra un texto cifrado
 * @param {string} encryptedText - Texto cifrado en formato base64
 * @returns {string} - Texto descifrado
 */
export function decrypt(encryptedText) {
  if (!ENCRYPTION_KEY) {
    // Si no hay clave, asumir que el texto no está cifrado
    return encryptedText;
  }

  if (!encryptedText || typeof encryptedText !== 'string') {
    return encryptedText;
  }

  try {
    // Convertir de base64 a buffer
    const combined = Buffer.from(encryptedText, 'base64');
    
    // Verificar que el buffer tenga el tamaño mínimo esperado
    const minSize = IV_LENGTH + TAG_LENGTH;
    if (combined.length < minSize) {
      // Probablemente texto sin cifrar
      return encryptedText;
    }
    
    // Extraer componentes
    const iv = combined.slice(0, IV_LENGTH);
    const tag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);
    
    // Crear decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    
    // Descifrar (trabajar con buffers)
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    // Convertir a string UTF-8
    return decrypted.toString('utf8');
  } catch (error) {
    // Si falla el descifrado, asumir que el texto no estaba cifrado
    // Esto permite migración gradual de datos sin cifrar a cifrados
    console.warn('Error al descifrar (puede ser texto sin cifrar):', error.message);
    return encryptedText;
  }
}

/**
 * Genera una clave de cifrado aleatoria (para uso en setup inicial)
 * @returns {string} - Clave hexadecimal de 64 caracteres
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

