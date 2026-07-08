export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'ADVERTISER' | 'PUBLISHER';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type CampaignStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type CampaignType = 'DISPLAY' | 'VIDEO' | 'NATIVE' | 'SOCIAL' | 'SEARCH' | 'PROGRAMMATIC';
export type AdType = 'BANNER' | 'VIDEO' | 'POPUP' | 'INTERSTITIAL' | 'REWARD' | 'NATIVE' | 'RESPONSIVE' | 'AUTO';
export type AdStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'REJECTED' | 'COMPLETED';
export type PaymentProvider = 'STRIPE' | 'MIDTRANS' | 'PAYPAL' | 'QRIS' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  status: CampaignStatus;
  type: CampaignType;
  budget: number;
  dailyBudget?: number;
  spent: number;
  startDate: string;
  endDate?: string;
  targeting?: any;
  isABTestEnabled: boolean;
  createdAt: string;
}

export interface Advertisement {
  id: string;
  campaignId: string;
  name: string;
  type: AdType;
  title?: string;
  description?: string;
  mediaUrl?: string;
  targetUrl: string;
  status: AdStatus;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  createdAt: string;
}

export interface Analytics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  ctr: number;
  cpm: number;
  cpc: number;
  cpa: number;
  roi: number;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  description?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  currency: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
