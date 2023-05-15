import { createCipheriv, createDecipheriv } from 'node:crypto';
import { key } from './key';

export function encrypt(buf: Buffer): Buffer {
  const cipher = createCipheriv('aes-128-ecb', key, null);
  cipher.setAutoPadding(false);
  const result = cipher.update(buf);
  return Buffer.concat([result, cipher.final()]);
}

export function decrypt(buf: Buffer): Buffer {
  const decipher = createDecipheriv('aes-128-ecb', key, null);
  decipher.setAutoPadding(false);
  const result = decipher.update(buf);
  return Buffer.concat([result, decipher.final()]);
}
