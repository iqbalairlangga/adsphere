import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  async upload(file: Express.Multer.File, folder = 'general'): Promise<string> {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large (max 50MB)');
    }

    const targetDir = path.join(this.uploadDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 8)}-${file.originalname}`;
    const filePath = path.join(targetDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    this.logger.log(`File uploaded: ${fileName}`);
    return `/uploads/${folder}/${fileName}`;
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath.replace('/uploads/', ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
