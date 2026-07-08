import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
};

export const MAX_FILE_SIZES: Record<string, number> = {
  image: 5 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  document: 10 * 1024 * 1024,
};

export function generateFilename(originalName: string): string {
  const extension = extname(originalName);
  const uuid = uuidv4();
  return `${uuid}${extension}`;
}

export function ensureDirectoryExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

export function getUploadPath(subdirectory: string = ''): string {
  const basePath = join(process.cwd(), 'uploads');
  const fullPath = subdirectory ? join(basePath, subdirectory) : basePath;
  ensureDirectoryExists(fullPath);
  return fullPath;
}

export function getFileType(mimetype: string): string {
  for (const [type, mimes] of Object.entries(MIME_TYPES)) {
    if (mimes.includes(mimetype)) {
      return type;
    }
  }
  return 'other';
}

export function validateFileType(
  mimetype: string,
  allowedTypes: string[],
): boolean {
  for (const allowedType of allowedTypes) {
    const mimes = MIME_TYPES[allowedType];
    if (mimes && mimes.includes(mimetype)) {
      return true;
    }
    if (mimetype === allowedType) {
      return true;
    }
  }
  return false;
}

export function validateFileSize(
  size: number,
  maxSize: number = 5 * 1024 * 1024,
): boolean {
  return size <= maxSize;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

export function getFileUrl(
  filename: string,
  subdirectory: string = '',
): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const path = subdirectory ? `uploads/${subdirectory}/${filename}` : `uploads/${filename}`;
  return `${baseUrl}/${path}`;
}
