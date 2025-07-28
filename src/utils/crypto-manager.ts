type EncryptionMode = "encrypted" | "raw";

export const VERIFICATION_TEXT = "Domo, Domino DESU.";
const PBKDF2_ITERATIONS = 200_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Creates a salt for key derivation.
 * @returns A Uint8Array representing the salt.
 */
export async function createSalt(): Promise<Uint8Array> {
  return window.crypto.getRandomValues(new Uint8Array(16));
}

export class CryptoManager {
  private readonly _encryptionMode: EncryptionMode;
  private readonly _key?: CryptoKey;

  /**
   * The constructor is private. Use the static `create` method to instantiate.
   * @param encryptionMode The mode of encryption.
   * @param key The derived CryptoKey for operations.
   */
  private constructor(encryptionMode: EncryptionMode, key?: CryptoKey) {
    this._encryptionMode = encryptionMode;
    this._key = key;
  }

  /**
   * Asynchronously creates and initializes a CryptoManager instance.
   * It derives the encryption key from the provided password and salt.
   * The password is used immediately for key derivation and is not stored.
   *
   * @param encryptionMode The mode of encryption, "encrypted" or "raw".
   * @param password The user's password. Required if mode is "encrypted".
   * @param salt The salt for key derivation. Required if mode is "encrypted".
   * @param encryptedVerificationText An encrypted text used to verify the key.
   * @returns A promise that resolves to a fully initialized CryptoManager instance.
   */
  public static async create(
    encryptionMode: EncryptionMode,
    password?: string,
    salt?: Uint8Array<ArrayBufferLike>,
    encryptedVerificationText?: string,
  ): Promise<CryptoManager> {
    if (encryptionMode === "raw") {
      return new CryptoManager("raw");
    }

    if (!password || !salt) {
      throw new Error("Password and salt are required for 'encrypted' mode.");
    }

    // Derive the key from the password and salt
    const passwordBuffer = encoder.encode(password);
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );

    const ret = new CryptoManager("encrypted", derivedKey);

    if (encryptedVerificationText) {
      // Verify the key by decrypting a known text
      const decryptedText = await ret.decrypt(encryptedVerificationText);
      if (decryptedText !== VERIFICATION_TEXT) {
        throw new Error("Decryption verification failed. Invalid key.");
      }
    }

    return ret;
  }

  /**
   * Encrypts a text string using the configured mode and key.
   * @param text The plain text to encrypt.
   * @returns The encrypted string, or the original text if mode is "raw".
   */
  public async encrypt(text: string): Promise<string> {
    if (!text || this._encryptionMode === "raw") {
      return text;
    }

    if (!this._key) {
      // This case should not be reachable if using the `create` factory
      throw new Error(
        "CryptoManager is in an invalid state: key is missing for encryption.",
      );
    }

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = encoder.encode(text);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      this._key,
      encodedText,
    );
    const ivBase64 = arrayBufferToBase64(iv);
    const encryptedBase64 = arrayBufferToBase64(encryptedBuffer);
    return `${ivBase64}:${encryptedBase64}`;
  }

  /**
   * Decrypts an encrypted text string.
   * @param encryptedText The encrypted text to decrypt (format "iv:data").
   * @returns The decrypted plain text.
   */
  public async decrypt(encryptedText: string): Promise<string> {
    if (!encryptedText || this._encryptionMode === "raw") {
      return encryptedText;
    }

    if (!this._key) {
      // This case should not be reachable if using the `create` factory
      throw new Error(
        "CryptoManager is in an invalid state: key is missing for decryption.",
      );
    }

    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted data format.");
    }
    const [ivBase64, encryptedBase64] = parts;

    try {
      const iv = base64ToArrayBuffer(ivBase64);
      const encryptedBuffer = base64ToArrayBuffer(encryptedBase64);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        this._key,
        encryptedBuffer,
      );
      return decoder.decode(decryptedBuffer);
    } catch (e) {
      console.error("Decryption failed. Invalid key or corrupted data.", e);
      throw new Error("Decryption failed. Invalid key or corrupted data.");
    }
  }
}
