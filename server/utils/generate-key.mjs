import crypto from 'crypto';

/**
 * Script para generar una clave de cifrado segura
 * Uso: node server/utils/generate-key.mjs
 */
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('='.repeat(60));
console.log('CLAVE DE CIFRADO GENERADA');
console.log('='.repeat(60));
console.log();
console.log('Agrega esta clave a tu archivo .env:');
console.log();
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log();
console.log('IMPORTANTE:');
console.log('- Guarda esta clave de forma segura');
console.log('- No la compartas ni la subas a repositorios públicos');
console.log('- Si pierdes esta clave, no podrás descifrar los datos existentes');
console.log('- La clave debe tener exactamente 64 caracteres hexadecimales (32 bytes)');
console.log('='.repeat(60));

