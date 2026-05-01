/**
 * Digital ID Encryption Utility
 *
 * Uses Web Crypto API with exact parameters:
 * - Key derivation: PBKDF2-SHA256, 100,000 iterations
 * - Encryption: AES-GCM, 256-bit key
 * - IV: 12 random bytes per encryption
 * - Salt: 16 random bytes, stored with ciphertext
 *
 * NEVER stores PIN or derived key in any form.
 */

export interface EncryptedData {
  salt: string;      // base64
  iv: string;        // base64  
  ciphertext: string; // base64
}

const ITERATIONS = 100000;
const SALT_LENGTH = 16;    // bytes
const IV_LENGTH = 12;      // bytes (recommended for GCM)
const KEY_BITS = 256;

/**
 * Derive a CryptoKey from a PIN using PBKDF2
 */
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    pinBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_BITS },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate random bytes
 */
function randomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
}

/**
 * Convert ArrayBuffer to base64
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 to ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt plaintext object with PIN-derived key
 * Returns { salt, iv, ciphertext } (all base64)
 */
export async function encryptData(pin: string, data: any): Promise<EncryptedData> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(pin, salt);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    plaintext
  );

  return {
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ciphertextBuffer)
  };
}

/**
 * Encrypt with an already-derived CryptoKey (used for re-encryption after PIN entry)
 * Uses a fresh IV each time; salt is preserved from original encryption
 */
export async function encryptWithKey(key: CryptoKey, data: any, existingSalt?: string): Promise<EncryptedData> {
  const iv = randomBytes(IV_LENGTH);
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    plaintext
  );

  return {
    salt: existingSalt || bufferToBase64(randomBytes(SALT_LENGTH).buffer),
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ciphertextBuffer)
  };
}

/**
 * Decrypt ciphertext object with PIN
 * Throws if PIN is wrong or data corrupted
 */
export async function decryptData(pin: string, encrypted: EncryptedData): Promise<any> {
  const salt = new Uint8Array(base64ToBuffer(encrypted.salt));
  const iv = new Uint8Array(base64ToBuffer(encrypted.iv));
  const ciphertext = base64ToBuffer(encrypted.ciphertext);

  const key = await deriveKey(pin, salt);

  try {
    const plaintextBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    const plaintext = decoder.decode(plaintextBuffer);
    return JSON.parse(plaintext);
  } catch (err) {
    throw new Error('Decryption failed — incorrect PIN or corrupted data');
  }
}

/**
 * Check if digital ID is currently encrypted (has salt/iv/ciphertext structure)
 */
export function isEncrypted(data: any): data is EncryptedData {
  return (
    data &&
    typeof data === 'object' &&
    'salt' in data &&
    'iv' in data &&
    'ciphertext' in data
  );
}
