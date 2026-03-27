export type DealStatus = 
  | 'draft'
  | 'negotiating'
  | 'terms_agreed'
  | 'escrow_funded'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export type DealType = 'goods' | 'services' | 'digital' | 'mixed';

export type MilestoneStatus = 
  | 'pending'
  | 'funded'
  | 'delivered'
  | 'accepted'
  | 'disputed'
  | 'refunded';

export interface DealMilestone {
  id: string;
  dealId: string;
  order: number;
  title: string;
  description: string;
  amount: number;
  currency: string;
  dueDate?: string;
  deliverables?: string[];
  status: MilestoneStatus;
  evidence?: string[];
  deliveredAt?: string;
  acceptedAt?: string;
}

export interface Deal {
  id: string;
  dealNumber: string;
  buyerId: string;
  sellerId: string;
  title: string;
  description: string;
  type: DealType;
  status: DealStatus;
  totalAmount: number;
  currency: string;
  milestones: DealMilestone[];
  terms: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type EscrowStatus = 
  | 'pending'
  | 'funded'
  | 'released'
  | 'refunded'
  | 'partially_released'
  | 'frozen'
  | 'disputed';

export type EscrowTransactionType = 
  | 'deposit'
  | 'release'
  | 'refund'
  | 'commission'
  | 'fee';

export interface EscrowTransaction {
  id: string;
  escrowId: string;
  type: EscrowTransactionType;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface Escrow {
  id: string;
  escrowNumber: string;
  dealId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  fundedAt?: string;
  releasedAt?: string;
  transactions: EscrowTransaction[];
  commission: number;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
}

export type WalletStatus = 'active' | 'suspended' | 'frozen';
export type TransactionType = 
  | 'deposit'
  | 'withdrawal'
  | 'escrow_funding'
  | 'escrow_release'
  | 'commission'
  | 'subscription'
  | 'refund';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  balanceAfter: number;
  description: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface Wallet {
  id: string;
  businessId: string;
  currency: string;
  balance: number;
  pendingBalance: number;
  availableBalance: number;
  status: WalletStatus;
  transactions: WalletTransaction[];
  lastUpdated: string;
}

export type PaymentMethodType = 'bank_transfer' | 'card' | 'mobile_money' | 'escrow';

export interface PaymentMethod {
  id: string;
  businessId: string;
  type: PaymentMethodType;
  name: string;
  isDefault: boolean;
  isVerified: boolean;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  routingNumber?: string;
  cardLast4?: string;
  cardBrand?: string;
  mobileNumber?: string;
  provider?: string;
  createdAt: string;
}

export interface DealFilters {
  status?: DealStatus;
  type?: DealType;
  buyerId?: string;
  sellerId?: string;
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  draft: 'Draft',
  negotiating: 'Negotiating',
  terms_agreed: 'Terms Agreed',
  escrow_funded: 'Escrow Funded',
  in_progress: 'In Progress',
  completed: 'Completed',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
};

export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  pending: 'Pending Funding',
  funded: 'Funded',
  released: 'Released',
  refunded: 'Refunded',
  partially_released: 'Partially Released',
  frozen: 'Frozen',
  disputed: 'Disputed',
};

export const COMMISSION_RATES = {
  standard: 0.025,
  premium: 0.02,
  enterprise: 0.015,
};
