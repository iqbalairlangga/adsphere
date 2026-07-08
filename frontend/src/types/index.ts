export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'ADVERTISER' | 'PUBLISHER';

export type CampaignStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type AdStatus = 'PENDING' | 'ACTIVE' | 'PAUSED' | 'REJECTED' | 'COMPLETED';

export type AdFormat = 'BANNER' | 'VIDEO' | 'NATIVE' | 'POPUP' | 'INTERSTITIAL';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'CHARGE' | 'REFUND' | 'PAYOUT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  company?: string | null;
  website?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  status: CampaignStatus;
  budget: number;
  dailyBudget?: number | null;
  startDate: string;
  endDate?: string | null;
  targeting?: TargetingConfig | null;
  userId: string;
  user?: User;
  ads?: Ad[];
  createdAt: string;
  updatedAt: string;
  stats?: CampaignStats;
}

export interface CampaignStats {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
}

export interface TargetingConfig {
  countries?: string[];
  devices?: string[];
  platforms?: string[];
  interests?: string[];
  ageRange?: [number, number];
  gender?: string;
}

export interface Ad {
  id: string;
  name: string;
  campaignId: string;
  campaign?: Campaign;
  format: AdFormat;
  status: AdStatus;
  headline?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  destinationUrl: string;
  cta?: string | null;
  dimensions?: string | null;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsMetric {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  rpm?: number;
}

export interface AnalyticsSummary {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalSpend: number;
  averageCtr: number;
  averageCpc: number;
  averageCpm: number;
  previousPeriod?: AnalyticsSummary;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: TransactionType;
  description?: string | null;
  method?: string | null;
  reference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  pendingBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  updatedAt: string;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  domain: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'INACTIVE';
  category?: string | null;
  monthlyTraffic?: number | null;
  verificationCode?: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdUnit {
  id: string;
  name: string;
  websiteId: string;
  website?: Website;
  format: AdFormat;
  dimensions: string;
  status: 'ACTIVE' | 'INACTIVE';
  code?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DateRange {
  from: string;
  to: string;
}
