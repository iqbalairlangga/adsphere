import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export function encrypt(text: string, secretKey: string): string {
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string, secretKey: string): string {
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateApiKey(): { key: string; prefix: string; hashedKey: string } {
  const prefix = `asp_${crypto.randomBytes(4).toString('hex')}`;
  const key = crypto.randomBytes(32).toString('hex');
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

  return { key: `${prefix}_${key}`, prefix, hashedKey };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
