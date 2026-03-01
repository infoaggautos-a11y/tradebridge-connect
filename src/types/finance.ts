export interface FinanceRevenue {
  date: string;
  subscriptions: number;
  commissions: number;
  events: number;
  advertising: number;
  total: number;
}

export interface FinancePayout {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  initiatedAt: string;
  completedAt?: string;
  failureReason?: string;
  retryCount: number;
}

export interface FinanceEscrowLiability {
  dealId: string;
  dealTitle: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  fundedAt: string;
  status: 'funded' | 'released' | 'refunded' | 'frozen';
}

export interface FinanceFXExposure {
  currency: string;
  amount: number;
  percentage: number;
}

export interface FinanceCommission {
  id: string;
  dealId: string;
  dealNumber: string;
  buyerId: string;
  sellerId: string;
  grossAmount: number;
  currency: string;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  createdAt: string;
}

export interface FinanceProjection {
  period: string;
  subscriptions: number;
  commissions: number;
  events: number;
  total: number;
  growthRate: number;
}

export interface FinanceKPIs {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
  escrowLiability: number;
  activeDeals: number;
}

export const mockFinanceData: FinanceKPIs = {
  todayRevenue: 245000,
  weekRevenue: 1820000,
  monthRevenue: 8400000,
  yearRevenue: 45600000,
  totalPayouts: 12500000,
  pendingPayouts: 850000,
  escrowLiability: 3200000,
  activeDeals: 47,
};

export const mockRevenueData: FinanceRevenue[] = [
  { date: '2026-02-22', subscriptions: 45000, commissions: 32000, events: 12000, advertising: 5000, total: 94000 },
  { date: '2026-02-23', subscriptions: 48000, commissions: 28000, events: 0, advertising: 3000, total: 79000 },
  { date: '2026-02-24', subscriptions: 52000, commissions: 45000, events: 25000, advertising: 8000, total: 130000 },
  { date: '2026-02-25', subscriptions: 49000, commissions: 38000, events: 8000, advertising: 4000, total: 99000 },
  { date: '2026-02-26', subscriptions: 55000, commissions: 52000, events: 15000, advertising: 6000, total: 128000 },
  { date: '2026-02-27', subscriptions: 58000, commissions: 48000, events: 0, advertising: 5000, total: 111000 },
  { date: '2026-02-28', subscriptions: 62000, commissions: 55000, events: 30000, advertising: 7000, total: 154000 },
];

export const mockPayouts: FinancePayout[] = [
  { id: 'pout_001', businessId: 'b1', businessName: 'Lagos Agro Exports Ltd', amount: 14125, currency: 'USD', bankName: 'First Bank of Nigeria', accountNumber: '****4521', status: 'completed', initiatedAt: '2026-02-20T10:00:00Z', completedAt: '2026-02-21T14:30:00Z', retryCount: 0 },
  { id: 'pout_002', businessId: 'b2', businessName: 'Napoli Trade Solutions', amount: 28500, currency: 'EUR', bankName: 'Intesa Sanpaolo', accountNumber: '****8832', status: 'processing', initiatedAt: '2026-02-26T08:00:00Z', retryCount: 0 },
  { id: 'pout_003', businessId: 'b5', businessName: 'Milano Fashion House', amount: 9500, currency: 'EUR', bankName: 'UniCredit', accountNumber: '****1199', status: 'pending', initiatedAt: '2026-02-27T15:00:00Z', retryCount: 0 },
  { id: 'pout_004', businessId: 'b8', businessName: 'Roma Pharma International', amount: 45000, currency: 'USD', bankName: 'BNL', accountNumber: '****7744', status: 'failed', initiatedAt: '2026-02-25T09:00:00Z', failureReason: 'Invalid account number', retryCount: 2 },
  { id: 'pout_005', businessId: 'b3', businessName: 'Accra Textiles Co.', amount: 7200, currency: 'USD', bankName: 'Ecobank', accountNumber: '****3366', status: 'pending', initiatedAt: '2026-02-28T11:00:00Z', retryCount: 0 },
];

export const mockEscrowLiabilities: FinanceEscrowLiability[] = [
  { dealId: 'deal_001', dealTitle: 'Premium Olive Oil Supply', buyerId: 'b1', sellerId: 'b2', amount: 35000, currency: 'USD', fundedAt: '2026-02-12T10:00:00Z', status: 'funded' },
  { dealId: 'deal_002', dealTitle: 'Leather Goods Partnership', buyerId: 'b5', sellerId: 'b9', amount: 15000, currency: 'EUR', fundedAt: '2026-02-16T10:00:00Z', status: 'funded' },
  { dealId: 'deal_003', dealTitle: 'Oil Equipment Services', buyerId: 'b8', sellerId: 'b6', amount: 75000, currency: 'USD', fundedAt: '2026-01-10T10:00:00Z', status: 'frozen' },
  { dealId: 'deal_005', dealTitle: 'Textile Export Order', buyerId: 'b11', sellerId: 'b14', amount: 22000, currency: 'USD', fundedAt: '2026-02-25T14:00:00Z', status: 'funded' },
];

export const mockFXExposure: FinanceFXExposure[] = [
  { currency: 'USD', amount: 1850000, percentage: 58 },
  { currency: 'EUR', amount: 920000, percentage: 29 },
  { currency: 'NGN', amount: 425000000, percentage: 13 },
];

export const mockCommissions: FinanceCommission[] = [
  { id: 'comm_001', dealId: 'deal_001', dealNumber: 'DIL-2026-001', buyerId: 'b1', sellerId: 'b2', grossAmount: 35000, currency: 'USD', commissionRate: 0.025, commissionAmount: 875, netAmount: 34125, createdAt: '2026-02-12T10:05:00Z' },
  { id: 'comm_002', dealId: 'deal_002', dealNumber: 'DIL-2026-002', buyerId: 'b5', sellerId: 'b9', grossAmount: 15000, currency: 'EUR', commissionRate: 0.02, commissionAmount: 300, netAmount: 14700, createdAt: '2026-02-16T10:03:00Z' },
  { id: 'comm_003', dealId: 'deal_004', dealNumber: 'DIL-2026-004', buyerId: 'b3', sellerId: 'b10', grossAmount: 12000, currency: 'USD', commissionRate: 0.025, commissionAmount: 300, netAmount: 11700, createdAt: '2025-11-20T14:00:00Z' },
];

export const mockProjections: FinanceProjection[] = [
  { period: 'March 2026', subscriptions: 180000, commissions: 220000, events: 150000, total: 550000, growthRate: 8.5 },
  { period: 'April 2026', subscriptions: 195000, commissions: 250000, events: 180000, total: 625000, growthRate: 13.6 },
  { period: 'May 2026', subscriptions: 210000, commissions: 280000, events: 200000, total: 690000, growthRate: 10.4 },
  { period: 'Q2 2026', subscriptions: 585000, commissions: 750000, events: 530000, total: 1865000, growthRate: 10.8 },
];
