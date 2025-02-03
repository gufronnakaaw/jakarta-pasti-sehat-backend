import { AES, enc } from 'crypto-js';

export function encryptText(text: string, key: string): string {
  return AES.encrypt(text, key).toString();
}

export function decryptText(encrypted: string, key: string): string {
  return AES.decrypt(encrypted, key).toString(enc.Utf8);
}
