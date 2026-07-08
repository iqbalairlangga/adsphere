import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'AdSphere',
  url: process.env.APP_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  port: parseInt(process.env.PORT || '4000', 10),
  encryptionKey: process.env.ENCRYPTION_KEY || '',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  logLevel: process.env.LOG_LEVEL || 'debug',
  logFormat: process.env.LOG_FORMAT || 'json',
}));
