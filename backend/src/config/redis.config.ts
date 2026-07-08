import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  queueUrl: process.env.REDIS_QUEUE_URL || 'redis://localhost:6379/1',
}));
