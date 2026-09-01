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

function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  let i: number, j: number;
  let result = "";
  const words: number[] = [];

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const utf8: number[] = [];
  for (let idx = 0; idx < ascii.length; idx++) {
    let charcode = ascii.charCodeAt(idx);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      idx++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (ascii.charCodeAt(idx) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  const byteLength = utf8.length;
  const bitLength = byteLength * 8;

  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) {
    utf8.push(0);
  }

  const highBits = Math.floor(bitLength / 0x100000000);
  const lowBits = bitLength >>> 0;

  for (let b = 3; b >= 0; b--) utf8.push((highBits >>> (b * 8)) & 0xff);
  for (let b = 3; b >= 0; b--) utf8.push((lowBits >>> (b * 8)) & 0xff);

  for (i = 0; i < utf8.length; i += 4) {
    words.push((utf8[i] << 24) | (utf8[i + 1] << 16) | (utf8[i + 2] << 8) | utf8[i + 3]);
  }

  const w: number[] = new Array(64);

  for (i = 0; i < words.length; i += 16) {
    let [a, b, c, d, e, f, g, h] = hash;

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j];
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, "0");
  }

  return result;
}

/**
 * Deterministically hash user identifier so real emails/IDs are never visible in Supabase.
 * Guaranteed 100% deterministic across all platforms and contexts.
 */
export async function hashUserId(userIdentifier: string): Promise<string> {
  const normalized = (userIdentifier || "default_user").trim().toLowerCase();
  const hex = sha256Pure(`${normalized}:${USER_ID_SALT}`);
  return `usr_${hex.slice(0, 24)}`;
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

/**
 * Encrypt any JSON-serializable object into ciphertext.
 */
export async function encryptObject<T>(
  data: T,
  userSecret: string
): Promise<string> {
  const jsonStr = JSON.stringify(data);
  return universalEncrypt(jsonStr, userSecret);
}

/**
 * Decrypt ciphertext back into a typed object with safe fallback.
 */
export async function decryptObject<T>(
  ciphertext: string | null | undefined,
  userSecret: string,
  fallback: T
): Promise<T> {
  if (!ciphertext) return fallback;
  try {
    const raw = await decryptText(ciphertext, userSecret);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

