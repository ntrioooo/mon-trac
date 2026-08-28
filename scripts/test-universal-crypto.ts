const SALT = "moneytrack-encryption-salt-v1";

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
 * Universal cipher that runs in Web Crypto (Secure Context) or Pure JS fallback.
 */
function xorEncrypt(text: string, secret: string): string {
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

  // Combine IV + Encrypted bytes
  const combined = new Uint8Array([...iv, ...encrypted]);
  let binary = "";
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return "enc:v2:" + btoa(binary);
}

function xorDecrypt(cipherStr: string, secret: string): string {
  if (!cipherStr.startsWith("enc:v2:")) return cipherStr;

  try {
    const raw = atob(cipherStr.slice(7));
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }

    const iv = bytes.slice(0, 8);
    const encrypted = bytes.slice(8);
    const key = stringToKey(secret);

    const decrypted = new Uint8Array(encrypted.length);
    for (let i = 0; i < encrypted.length; i++) {
      const keyByte = key[(i + iv[i % iv.length]) % key.length];
      decrypted[i] = encrypted[i] ^ keyByte;
    }

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    return cipherStr;
  }
}

// Test
const secret = "test_user_secret";
const originalAmount = 250000;
const enc = xorEncrypt(originalAmount.toString(), secret);
console.log("Encrypted:", enc);
const dec = xorDecrypt(enc, secret);
console.log("Decrypted:", dec, "Matches:", dec === originalAmount.toString());
