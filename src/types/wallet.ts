export type WalletType = 'main' | 'escrow' | 'reserve';
export type WalletStatus = 'active' | 'suspended' | 'frozen' | 'closed';
export type WalletTransactionType = 
  | 'deposit'
  | 'withdrawal'
  | 'escrow_funding'
  | 'escrow_release'
  | 'refund'
  | 'fee'
  | 'commission'
  | 'transfer';

export interface Wallet {
  id: string;
  userId: string;
  businessId: string;
  currency: string;
  type: WalletType;
  balance: number;
  pendingBalance: number;
  availableBalance: number;
  frozenBalance: number;
  status: WalletStatus;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  lastUpdated: string;
  createdAt: string;
  transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  currency: string;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  description?: string;
  escrowId?: string;
  dealId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateWalletParams {
  userId: string;
  businessId: string;
  currency: string;
  type?: WalletType;
  bankDetails?: {
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankCode: string;
  };
}

export interface FundWalletParams {
  walletId: string;
  amount: number;
  currency: string;
  source: {
    type: 'payment' | 'escrow_release' | 'refund' | 'transfer';
    paymentIntentId?: string;
    paymentMethodId?: string;
    provider?: 'stripe' | 'paystack' | 'paypal';
  };
  reference?: string;
}

export interface WithdrawalParams {
  walletId: string;
  amount: number;
  currency: string;
  destination: {
    type: 'bank_account';
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  };
  reference?: string;
}

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  main: 'Main Wallet',
  escrow: 'Escrow Wallet',
  reserve: 'Reserve Wallet',
};

export const WALLET_STATUS_LABELS: Record<WalletStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  frozen: 'Frozen',
  closed: 'Closed',
};

export const TRANSACTION_TYPE_LABELS: Record<WalletTransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  escrow_funding: 'Escrow Funding',
  escrow_release: 'Escrow Release',
  refund: 'Refund',
  fee: 'Fee',
  commission: 'Commission',
  transfer: 'Transfer',
};
