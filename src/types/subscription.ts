import { PaymentProvider } from './payment';

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'enterprise';
export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused';
export type BillingInterval = 'month' | 'year';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  billingInterval: BillingInterval;
  features: string[];
  limits: {
    dealsPerMonth: number;
    teamMembers: number;
    storage: string;
    apiCalls: number;
  };
  isPopular: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  paymentMethodId?: string;
  provider?: PaymentProvider;
  providerSubscriptionId?: string;
  currency: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  trialEnd?: string;
}

export interface CreateSubscriptionParams {
  userId: string;
  planId: string;
  paymentMethodId: string;
  provider: PaymentProvider;
  coupon?: string;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  planId?: string;
  paymentMethodId?: string;
}

export interface CancelSubscriptionParams {
  subscriptionId: string;
  immediately?: boolean;
  reason?: string;
}

export interface SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'void';
  paidAt?: string;
  createdAt: string;
  description: string;
  invoiceNumber: string;
  pdfUrl?: string;
}

export const SUBSCRIPTION_TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
};

export const BILLING_INTERVAL_LABELS: Record<BillingInterval, string> = {
  month: 'Monthly',
  year: 'Yearly',
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  canceled: 'Canceled',
  past_due: 'Past Due',
  trialing: 'Trial',
  unpaid: 'Unpaid',
  paused: 'Paused',
};

export const getPlanFeatureLimit = (plan: SubscriptionPlan, feature: keyof SubscriptionPlan['limits']): string | number => {
  const value = plan.limits[feature];
  return value === -1 ? 'Unlimited' : value;
};

export const isPlanLimitReached = (plan: SubscriptionPlan, feature: keyof SubscriptionPlan['limits'], used: number): boolean => {
  const limit = plan.limits[feature];
  if (typeof limit !== 'number') return false;
  if (limit === -1) return false;
  return used >= Number(limit);
};
