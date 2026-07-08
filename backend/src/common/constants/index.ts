export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ADVERTISER = 'ADVERTISER',
  PUBLISHER = 'PUBLISHER',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export enum CampaignType {
  DISPLAY = 'DISPLAY',
  VIDEO = 'VIDEO',
  NATIVE = 'NATIVE',
  SOCIAL = 'SOCIAL',
  SEARCH = 'SEARCH',
  PROGRAMMATIC = 'PROGRAMMATIC',
}

export enum AdType {
  BANNER = 'BANNER',
  VIDEO = 'VIDEO',
  POPUP = 'POPUP',
  INTERSTITIAL = 'INTERSTITIAL',
  REWARD = 'REWARD',
  NATIVE = 'NATIVE',
  RESPONSIVE = 'RESPONSIVE',
  AUTO = 'AUTO',
}

export enum AdStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  MIDTRANS = 'MIDTRANS',
  PAYPAL = 'PAYPAL',
  QRIS = 'QRIS',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  CAMPAIGN = 'CAMPAIGN',
  PAYMENT = 'PAYMENT',
  ANALYTICS = 'ANALYTICS',
  SECURITY = 'SECURITY',
  BILLING = 'BILLING',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUSPEND = 'SUSPEND',
  BAN = 'BAN',
  EXPORT = 'EXPORT',
}

export const SKIP_AUTH_KEY = 'skipAuth';
export const SKIP_EMAIL_VERIFICATION_KEY = 'skipEmailVerification';
export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';
export const PUBLIC_KEY = 'isPublic';

export const PAGINATION_DEFAULT_PAGE = 1;
export const PAGINATION_DEFAULT_LIMIT = 10;
export const PAGINATION_MAX_LIMIT = 100;

export const CACHE_TTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  DAY: 86400,
};

export const BCRYPT_SALT_ROUNDS = 12;

export const JWT_ACCESS_EXPIRY = '15m';
export const JWT_REFRESH_EXPIRY = '7d';

export const AD_SPHERE = 'AdSphere';
