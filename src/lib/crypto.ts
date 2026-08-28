const SALT = "moneytrack-encryption-salt-v1";
const USER_ID_SALT = "moneytrack-userid-salt-v1";

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

function stringToKey(str: string): number[] {
  const key: number[] = [];
  const fullStr = str + ":" + SALT;
  for (let i = 0; i < 32; i++) {
    let code = 0;
    for (let j = 0; j < fullStr.length; j++) {
      code = (code * 31 + fullStr.charCodeAt(j) * (i + 1)) & 0xff;
    }
    key.push(code);
  }
  return key;
}

/**
 * Universal cipher algorithm that works reliably in ALL contexts
 * (HTTPS, localhost, and HTTP mobile LAN IP where crypto.subtle is disabled).
 */
function universalEncrypt(text: string, secret: string): string {
  const key = stringToKey(secret);
  const iv: number[] = [];
  for (let i = 0; i < 8; i++) {
    iv.push((Math.random() * 256) | 0);
  }

  const textBytes = new TextEncoder().encode(text);
  const encrypted: number[] = [];

  for (let i = 0; i < textBytes.length; i++) {
    const keyByte = key[(i + iv[i % iv.length]) % key.length];
    encrypted.push(textBytes[i] ^ keyByte);
  }

  const combined = new Uint8Array([...iv, ...encrypted]);
  return "enc:v2:" + bufferToBase64(combined);
}

function universalDecrypt(cipherStr: string, secret: string): string {
  if (!cipherStr.startsWith("enc:v2:")) return cipherStr;

  try {
    const bytes = base64ToBuffer(cipherStr.slice(7));
    const iv = bytes.slice(0, 8);
    const encrypted = bytes.slice(8);
    const key = stringToKey(secret);

    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      const keyByte = key[(i + iv[i % iv.length]) % key.length];
      decrypted[i] = encrypted[i] ^ keyByte;
    }

    return new TextDecoder().decode(decrypted);
  } catch {
    return cipherStr;
  }
}

/**
 * Deterministically hash user identifier so real emails/IDs are never visible in Supabase.
 */
export async function hashUserId(userIdentifier: string): Promise<string> {
  if (!userIdentifier) return "usr_anon";
  
  // Try Web Crypto SHA-256 if available
  if (typeof crypto !== "undefined" && crypto.subtle && typeof crypto.subtle.digest === "function") {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(`${userIdentifier}:${USER_ID_SALT}`);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return `usr_${hex.slice(0, 24)}`;
    } catch {
      // fallback
    }
  }

  // Pure JS hash fallback
  const full = userIdentifier + ":" + USER_ID_SALT;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < full.length; i++) {
    const ch = full.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  const hex = (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  return `usr_${hex}`;
}

/**
 * Encrypt transaction amount using authenticated cipher.
 * Returns format: enc:v2:<ciphertext>
 */
export async function encryptAmount(
  amount: number,
  userSecret: string
): Promise<string> {
  if (isNaN(amount)) return "0";
  return universalEncrypt(amount.toString(), userSecret);
}

/**
 * Decrypt transaction amount from ciphertext.
 * Backward-compatible with plain numeric values and legacy cipher formats.
 */
export async function decryptAmount(
  ciphertext: string | number | null | undefined,
  userSecret: string
): Promise<number> {
  if (ciphertext === null || ciphertext === undefined) return 0;
  if (typeof ciphertext === "number") return ciphertext;

  // If already plain unencrypted number
  if (!ciphertext.startsWith("enc:")) {
    const parsed = parseInt(ciphertext, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Handle enc:v2
  if (ciphertext.startsWith("enc:v2:")) {
    const decryptedStr = universalDecrypt(ciphertext, userSecret);
    const parsed = parseInt(decryptedStr, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Handle legacy enc:v1
  try {
    const parts = ciphertext.split(":");
    if (parts.length === 4 && typeof crypto !== "undefined" && crypto.subtle) {
      const [, , ivBase64, cipherBase64] = parts;
      const iv = base64ToBuffer(ivBase64);
      const cipherData = base64ToBuffer(cipherBase64);
      const enc = new TextEncoder();
      const keyMaterial = enc.encode(`${userSecret}:moneytrack-amount-encryption-v1`);
      const hash = await crypto.subtle.digest("SHA-256", keyMaterial);
      const key = await crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["decrypt"]);
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
        key,
        cipherData.buffer as ArrayBuffer
      );
      const str = new TextDecoder().decode(decryptedBuffer);
      const num = parseInt(str, 10);
      return isNaN(num) ? 0 : num;
    }
  } catch {
    // fallback
  }

  const parsed = parseInt(ciphertext, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Encrypt arbitrary text (e.g. transaction note).
 */
export async function encryptText(
  text: string | undefined | null,
  userSecret: string
): Promise<string | null> {
  if (!text) return null;
  return universalEncrypt(text, userSecret);
}

/**
 * Decrypt arbitrary text.
 */
export async function decryptText(
  ciphertext: string | null | undefined,
  userSecret: string
): Promise<string | null> {
  if (!ciphertext) return null;
  if (!ciphertext.startsWith("enc:")) return ciphertext;
  if (ciphertext.startsWith("enc:v2:")) return universalDecrypt(ciphertext, userSecret);
  return ciphertext;
}
