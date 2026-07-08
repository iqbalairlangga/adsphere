import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://adsphere:adsphere@localhost:5432/adsphere',
}));
