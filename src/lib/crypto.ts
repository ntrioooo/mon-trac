const SALT = "moneytrack-amount-encryption-v1";
const USER_ID_SALT = "moneytrack-userid-hash-v1";

function bufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getKey(userSecret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = enc.encode(`${userSecret}:${SALT}`);
  const hash = await crypto.subtle.digest("SHA-256", keyMaterial);
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Deterministically hash user ID / email so real emails/IDs are never exposed in Supabase.
 */
export async function hashUserId(userIdentifier: string): Promise<string> {
  if (!userIdentifier) return "anon_user";
  const enc = new TextEncoder();
  const data = enc.encode(`${userIdentifier}:${USER_ID_SALT}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `usr_${hex.slice(0, 24)}`;
}

/**
 * Encrypt transaction amount using AES-GCM 256-bit.
 * Format: enc:v1:<iv_base64>:<ciphertext_base64>
 */
export async function encryptAmount(
  amount: number,
  userSecret: string
): Promise<string> {
  if (isNaN(amount)) return "0";

  try {
    const enc = new TextEncoder();
    const key = await getKey(userSecret);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = enc.encode(amount.toString());

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      data
    );

    const ivBase64 = bufferToBase64(iv);
    const cipherBase64 = bufferToBase64(new Uint8Array(encryptedBuffer));

    return `enc:v1:${ivBase64}:${cipherBase64}`;
  } catch (err) {
    console.error("Failed to encrypt amount:", err);
    return amount.toString();
  }
}

/**
 * Decrypt transaction amount from ciphertext.
 * Backward-compatible with plain numeric values.
 */
export async function decryptAmount(
  ciphertext: string | number | null | undefined,
  userSecret: string
): Promise<number> {
  if (ciphertext === null || ciphertext === undefined) return 0;
  if (typeof ciphertext === "number") return ciphertext;

  // Handle plain unencrypted numeric strings
  if (!ciphertext.startsWith("enc:v1:")) {
    const parsed = parseInt(ciphertext, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  try {
    const parts = ciphertext.split(":");
    if (parts.length !== 4) return 0;

    const [, , ivBase64, cipherBase64] = parts;
    const iv = base64ToBuffer(ivBase64);
    const cipherData = base64ToBuffer(cipherBase64);
    const key = await getKey(userSecret);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      cipherData.buffer as ArrayBuffer
    );

    const dec = new TextDecoder();
    const str = dec.decode(decryptedBuffer);
    const num = parseInt(str, 10);
    return isNaN(num) ? 0 : num;
  } catch (err) {
    console.error("Failed to decrypt amount:", err);
    return 0;
  }
}

/**
 * Encrypt arbitrary text (e.g. transaction note).
 */
export async function encryptText(
  text: string | undefined | null,
  userSecret: string
): Promise<string | null> {
  if (!text) return null;

  try {
    const enc = new TextEncoder();
    const key = await getKey(userSecret);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = enc.encode(text);

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      data
    );

    const ivBase64 = bufferToBase64(iv);
    const cipherBase64 = bufferToBase64(new Uint8Array(encryptedBuffer));

    return `enc:v1:${ivBase64}:${cipherBase64}`;
  } catch {
    return text;
  }
}

/**
 * Decrypt arbitrary text.
 */
export async function decryptText(
  ciphertext: string | null | undefined,
  userSecret: string
): Promise<string | null> {
  if (!ciphertext) return null;
  if (!ciphertext.startsWith("enc:v1:")) return ciphertext;

  try {
    const parts = ciphertext.split(":");
    if (parts.length !== 4) return ciphertext;

    const [, , ivBase64, cipherBase64] = parts;
    const iv = base64ToBuffer(ivBase64);
    const cipherData = base64ToBuffer(cipherBase64);
    const key = await getKey(userSecret);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      cipherData.buffer as ArrayBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    return ciphertext;
  }
}
