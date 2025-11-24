/**
 * Encryption Infrastructure - AES-256-CBC Implementation
 *
 * Provides secure encryption/decryption for API keys and key masking for display.
 * Uses Node.js crypto module with random IV generation for each encryption.
 *
 * Security:
 * - AES-256-CBC encryption algorithm
 * - Random IV (Initialization Vector) for each encryption
 * - Key must be 32 bytes (64 hex characters)
 * - IV prepended to ciphertext for decryption
 *
 * Format: hex(IV):hex(ciphertext)
 */

import crypto from "crypto";
import { MASK_PREFIX_LENGTH, MASK_SUFFIX_LENGTH, MASK_MIN_LENGTH } from "./constants";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size in bytes

/**
 * Get encryption key from environment variable
 * @throws Error if API_KEY_ENCRYPTION_KEY not configured or invalid format
 */
function getEncryptionKey(): Buffer {
  const key = process.env.API_KEY_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("Encryption key not configured");
  }

  // ✅ Validate key format and length (64 hex chars = 32 bytes for AES-256)
  if (!/^[a-f0-9]{64}$/i.test(key)) {
    throw new Error(
      "Encryption key must be exactly 64 hex characters (32 bytes for AES-256). Generate with: openssl rand -hex 32",
    );
  }

  // Convert hex string to buffer
  const buffer = Buffer.from(key, "hex");

  // ✅ Double-check buffer length (safety check)
  if (buffer.length !== 32) {
    throw new Error("Encryption key must be 32 bytes for AES-256");
  }

  return buffer;
}

/**
 * Encrypt an API key using AES-256-CBC encryption
 *
 * Security features:
 * - Random IV generation using crypto.randomBytes (CSPRNG)
 * - Each encryption produces different ciphertext (prevents pattern detection)
 * - IV prepended to ciphertext for decryption
 *
 * @param apiKey - The plain API key to encrypt
 * @returns Encrypted string in hex format: hex(IV):hex(ciphertext)
 * @throws Error if API_KEY_ENCRYPTION_KEY env var not set
 * @throws Error if apiKey is empty
 *
 * @example
 * const encrypted = encryptApiKey('sk-test-1234567890');
 * // Returns: "a1b2c3d4...f0e1:d2c3b4a5...e1f0" (hex IV:ciphertext)
 */
export function encryptApiKey(apiKey: string): string {
  // Validate input
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("API key cannot be empty");
  }

  const key = getEncryptionKey();

  // Generate random IV for this encryption (provides semantic security)
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher with algorithm, key, and IV
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the API key
  let encrypted = cipher.update(apiKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return in hex format: iv:ciphertext
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt an encrypted API key
 *
 * Extracts IV from prepended data and uses it with the encryption key
 * to decrypt the ciphertext back to the original API key.
 *
 * @param encryptedData - Encrypted string in hex format (IV:ciphertext)
 * @returns Decrypted API key (plain text)
 * @throws Error if API_KEY_ENCRYPTION_KEY env var not set
 * @throws Error if encryptedData has invalid format
 *
 * @example
 * const decrypted = decryptApiKey('a1b2...f0:d2c3...e1');
 * // Returns: "sk-test-1234567890"
 */
export function decryptApiKey(encryptedData: string): string {
  const key = getEncryptionKey();

  // Split IV and ciphertext (format: iv:ciphertext in hex)
  const parts = encryptedData.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const encrypted = parts[1];

  // Create decipher with same algorithm, key, and extracted IV
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  // Decrypt the ciphertext
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Mask an API key for display (privacy)
 *
 * Shows only the prefix and suffix of the key to protect sensitive data
 * while still allowing visual identification of which key is being referenced.
 *
 * @param apiKey - The plain API key to mask
 * @returns Masked string
 *
 * @example
 * maskApiKey('sk-test-1234567890')
 * // Returns: "sk-t...7890" (first 4 + last 4)
 *
 * maskApiKey('short')
 * // Returns: "***" (< 8 chars)
 *
 * maskApiKey('')
 * // Returns: ""
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length === 0) return "";

  // For very short keys (< MASK_MIN_LENGTH chars), return ***
  if (apiKey.length <= MASK_MIN_LENGTH) {
    return "***";
  }

  // For keys MASK_MIN_LENGTH chars or longer, show first and last characters
  return apiKey.slice(0, MASK_PREFIX_LENGTH) + "..." + apiKey.slice(-MASK_SUFFIX_LENGTH);
}
