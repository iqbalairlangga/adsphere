import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET || 'adsphere-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'adsphere-jwt-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  sessionSecret: process.env.SESSION_SECRET || 'adsphere-session-secret',

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback',
  },

  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    callbackUrl: process.env.DISCORD_CALLBACK_URL || 'http://localhost:4000/api/auth/discord/callback',
  },
}));
