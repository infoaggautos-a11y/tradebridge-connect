export type PaymentProvider = 'stripe' | 'paystack' | 'paypal';
export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';
export type PaymentType = 'subscription' | 'escrow' | 'event_ticket' | 'wallet_topup' | 'payout';

export interface Payment {
  id: string;
  paymentIntentId?: string;
  paymentMethodId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  type: PaymentType;
  reference: string;
  description?: string;
  failureReason?: string;
  refundedAt?: string;
  refundAmount?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  reference: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  userId: string;
  provider: PaymentProvider;
  type: PaymentType;
  metadata?: Record<string, any>;
  returnUrl?: string;
}

export interface CardDetails {
  userId: string;
  provider: PaymentProvider;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardHolderName: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface BankAccountDetails {
  userId: string;
  provider: PaymentProvider;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  routingNumber: string;
  bankCode?: string;
  country: string;
  currency: string;
}

export type PaymentMethodType = 'card' | 'bank_transfer' | 'mobile_money' | 'wallet';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  isDefault: boolean;
  isVerified: boolean;
  cardLast4?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: string;
  cardHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  routingNumber?: string;
  mobileNumber?: string;
  mobileProvider?: string;
  createdAt: string;
}

export interface PaymentWebhookEvent {
  id: string;
  type: string;
  provider: PaymentProvider;
  data: any;
  receivedAt: string;
}

export interface RefundParams {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  stripe: 'Credit/Debit Card',
  paystack: 'Bank Transfer',
  paypal: 'PayPal',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

export const CURRENCY_OPTIONS = [
  { value: 'NGN', label: 'Nigerian Naira (NGN)', symbol: '₦', flag: '🇳🇬' },
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$', flag: '🇺🇸' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€', flag: '🇪🇺' },
  { value: 'GBP', label: 'British Pound (GBP)', symbol: '£', flag: '🇬🇧' },
];

export const getCurrencySymbol = (currency: string): string => {
  const option = CURRENCY_OPTIONS.find(c => c.value === currency);
  return option?.symbol || currency;
};

export const formatCurrency = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
