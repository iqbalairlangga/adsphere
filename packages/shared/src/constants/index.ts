export const AD_TYPES = ['BANNER', 'VIDEO', 'POPUP', 'INTERSTITIAL', 'REWARD', 'NATIVE', 'RESPONSIVE', 'AUTO'] as const;
export const CAMPAIGN_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'SOCIAL', 'SEARCH', 'PROGRAMMATIC'] as const;
export const CAMPAIGN_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'REJECTED'] as const;
export const USER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADVERTISER', 'PUBLISHER'] as const;
export const PAYMENT_PROVIDERS = ['STRIPE', 'MIDTRANS', 'PAYPAL', 'QRIS', 'BANK_TRANSFER'] as const;

export const AD_DIMENSIONS = {
  BANNER: ['728x90', '468x60', '320x50'],
  SKYSCRAPER: ['160x600', '120x600'],
  RECTANGLE: ['300x250', '336x280'],
  LEADERBOARD: ['728x90', '970x90'],
  MOBILE: ['320x50', '300x50', '320x100'],
} as const;

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'IDR'] as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'An unexpected error occurred',
} as const;
