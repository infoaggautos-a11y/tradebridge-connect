export type PayoutStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

export type PayoutDestinationType = 'bank_account' | 'mobile_money' | 'card';

export interface PayoutDestination {
  type: PayoutDestinationType;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  bankCode?: string;
  mobileNumber?: string;
  mobileProvider?: string;
}

export interface Payout {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  destination: PayoutDestination;
  reference: string;
  provider: 'stripe' | 'paystack' | 'wise';
  providerReference?: string;
  fees: number;
  netAmount: number;
  initiatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  failureReason?: string;
  retryCount?: number;
  lastAttemptAt?: string;
  createdAt: string;
}

export interface CreatePayoutParams {
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  destination: PayoutDestination;
  reference?: string;
}

export interface PayoutSchedule {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextPayoutDate: string;
  destination: PayoutDestination;
  isActive: boolean;
  createdAt: string;
}

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
  reversed: 'Reversed',
};

export const getStatusColor = (status: PayoutStatus): string => {
  switch (status) {
    case 'pending': return 'text-yellow-600';
    case 'processing': return 'text-blue-600';
    case 'completed': return 'text-green-600';
    case 'failed': return 'text-red-600';
    case 'cancelled': return 'text-gray-600';
    case 'reversed': return 'text-orange-600';
  }
};
