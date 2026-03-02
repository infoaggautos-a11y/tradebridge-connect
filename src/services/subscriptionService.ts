import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionTier,
  BillingInterval,
  CreateSubscriptionParams,
  CancelSubscriptionParams,
  UpdateSubscriptionParams,
} from '@/types/subscription';
import { paymentService } from './paymentService';
import { notificationService } from './notificationService';

const generateId = () => `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for exploring the platform',
    tier: 'free',
    price: 0,
    currency: 'USD',
    billingInterval: 'month',
    features: [
      'Access to deal room',
      'Browse trade opportunities',
      '3 deals per month',
      'Basic messaging',
      'Email support',
    ],
    limits: {
      dealsPerMonth: 3,
      teamMembers: 1,
      storage: '1GB',
      apiCalls: 100,
    },
    isPopular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small businesses starting with trade',
    tier: 'starter',
    price: 16,
    currency: 'USD',
    billingInterval: 'month',
    features: [
      'Everything in Free',
      '10 deals per month',
      'Priority deal matching',
      'Basic KYC verification',
      'Escrow support',
      'Email & chat support',
    ],
    limits: {
      dealsPerMonth: 10,
      teamMembers: 3,
      storage: '10GB',
      apiCalls: 1000,
    },
    isPopular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing businesses with active trade',
    tier: 'growth',
    price: 149,
    currency: 'USD',
    billingInterval: 'month',
    features: [
      'Everything in Starter',
      'Unlimited deals',
      'Advanced KYC/AML',
      'Milestone-based escrow',
      'Priority support',
      'Analytics dashboard',
      'API access',
    ],
    limits: {
      dealsPerMonth: -1,
      teamMembers: 10,
      storage: '100GB',
      apiCalls: 10000,
    },
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    tier: 'enterprise',
    price: 499,
    currency: 'USD',
    billingInterval: 'month',
    features: [
      'Everything in Growth',
      'Dedicated account manager',
      'Custom escrow terms',
      'Trade finance bridge',
      'White-label options',
      'SLA guarantees',
      '24/7 phone support',
      'Custom integrations',
    ],
    limits: {
      dealsPerMonth: -1,
      teamMembers: -1,
      storage: '1TB',
      apiCalls: -1,
    },
    isPopular: false,
  },
];

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_001',
    userId: 'user_001',
    planId: 'growth',
    status: 'active',
    currentPeriodStart: '2026-01-01T00:00:00Z',
    currentPeriodEnd: '2026-02-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    canceledAt: undefined,
    paymentMethodId: 'pm_001',
    provider: 'stripe',
    providerSubscriptionId: 'sub_stripe_123',
    currency: 'USD',
    amount: 149,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

class SubscriptionService {
  private stripe: any = null;
  private paystack: any = null;
  private cronJobEnabled = false;

  initialize(providers: { stripe?: any; paystack?: any }): void {
    this.stripe = providers.stripe;
    this.paystack = providers.paystack;
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
    const { userId, planId, paymentMethodId, provider } = params;
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    if (plan.price === 0) {
      return this.createFreeSubscription(userId, planId);
    }

    let providerSubscriptionId: string;
    
    if (provider === 'stripe') {
      providerSubscriptionId = await this.createStripeSubscription(userId, plan, paymentMethodId);
    } else if (provider === 'paystack') {
      providerSubscriptionId = await this.createPaystackSubscription(userId, plan, paymentMethodId);
    } else {
      throw new Error('Unsupported provider');
    }

    const subscription: Subscription = {
      id: generateId(),
      userId,
      planId,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: this.calculatePeriodEnd(plan.billingInterval),
      cancelAtPeriodEnd: false,
      paymentMethodId,
      provider,
      providerSubscriptionId,
      currency: plan.currency,
      amount: plan.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSubscriptions.push(subscription);
    return subscription;
  }

  private async createStripeSubscription(
    userId: string,
    plan: SubscriptionPlan,
    paymentMethodId: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/subscriptions/stripe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planId: plan.id,
          priceId: `price_${plan.id}_${plan.billingInterval}`,
          paymentMethodId,
        }),
      });
      
      const data = await response.json();
      return data.subscriptionId;
    } catch (error) {
      console.error('Stripe subscription error:', error);
      return `stripe_sub_${generateId()}`;
    }
  }

  private async createPaystackSubscription(
    userId: string,
    plan: SubscriptionPlan,
    paymentMethodId: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/subscriptions/paystack/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planId: plan.id,
          amount: plan.price * 100,
          paymentMethodId,
        }),
      });
      
      const data = await response.json();
      return data.subscriptionCode;
    } catch (error) {
      console.error('Paystack subscription error:', error);
      return `paystack_sub_${generateId()}`;
    }
  }

  private createFreeSubscription(userId: string, planId: string): Subscription {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)!;
    
    const subscription: Subscription = {
      id: generateId(),
      userId,
      planId,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: undefined,
      cancelAtPeriodEnd: false,
      paymentMethodId: undefined,
      provider: undefined,
      providerSubscriptionId: undefined,
      currency: plan.currency,
      amount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSubscriptions.push(subscription);
    return subscription;
  }

  private calculatePeriodEnd(interval: BillingInterval): string {
    const now = new Date();
    if (interval === 'month') {
      now.setMonth(now.getMonth() + 1);
    } else if (interval === 'year') {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString();
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return mockSubscriptions.find(s => s.id === subscriptionId) || null;
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return mockSubscriptions.find(s => s.userId === userId) || null;
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    return [...mockSubscriptions];
  }

  async updateSubscription(params: UpdateSubscriptionParams): Promise<Subscription> {
    const { subscriptionId, planId, paymentMethodId } = params;
    
    const subscription = mockSubscriptions.find(s => s.id === subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (planId) {
      const newPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!newPlan) {
        throw new Error('Plan not found');
      }

      if (subscription.provider) {
        await this.updateProviderSubscription(subscription, newPlan);
      }

      subscription.planId = planId;
      subscription.amount = newPlan.price;
      subscription.currency = newPlan.currency;
    }

    if (paymentMethodId) {
      subscription.paymentMethodId = paymentMethodId;
    }

    subscription.updatedAt = new Date().toISOString();
    return subscription;
  }

  private async updateProviderSubscription(
    subscription: Subscription,
    newPlan: SubscriptionPlan
  ): Promise<void> {
    if (subscription.provider === 'stripe') {
      await fetch('/api/subscriptions/stripe/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.providerSubscriptionId,
          priceId: `price_${newPlan.id}_${newPlan.billingInterval}`,
        }),
      });
    } else if (subscription.provider === 'paystack') {
      await fetch('/api/subscriptions/paystack/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionCode: subscription.providerSubscriptionId,
          amount: newPlan.price * 100,
        }),
      });
    }
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<Subscription> {
    const { subscriptionId, immediately = false } = params;
    
    const subscription = mockSubscriptions.find(s => s.id === subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.provider && subscription.providerSubscriptionId) {
      await this.cancelProviderSubscription(subscription, immediately);
    }

    if (immediately) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date().toISOString();
      subscription.currentPeriodEnd = new Date().toISOString();
    } else {
      subscription.cancelAtPeriodEnd = true;
    }

    subscription.updatedAt = new Date().toISOString();
    return subscription;
  }

  private async cancelProviderSubscription(
    subscription: Subscription,
    immediately: boolean
  ): Promise<void> {
    if (subscription.provider === 'stripe') {
      await fetch('/api/subscriptions/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.providerSubscriptionId,
          immediately,
        }),
      });
    } else if (subscription.provider === 'paystack') {
      await fetch('/api/subscriptions/paystack/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionCode: subscription.providerSubscriptionId,
        }),
      });
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = mockSubscriptions.find(s => s.id === subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = false;
    } else if (subscription.status === 'canceled') {
      subscription.status = 'active';
      subscription.currentPeriodStart = new Date().toISOString();
      subscription.currentPeriodEnd = this.calculatePeriodEnd('month');
    }

    subscription.updatedAt = new Date().toISOString();
    return subscription;
  }

  async handlePaymentFailure(subscriptionId: string): Promise<void> {
    const subscription = mockSubscriptions.find(s => s.id === subscriptionId);
    if (!subscription) return;

    subscription.status = 'past_due';
    subscription.updatedAt = new Date().toISOString();

    await notificationService.sendPaymentFailedNotification(subscription.userId, subscription);
  }

  async handlePaymentSuccess(subscriptionId: string): Promise<void> {
    const subscription = mockSubscriptions.find(s => s.id === subscriptionId);
    if (!subscription) return;

    const oldPeriodEnd = subscription.currentPeriodEnd;
    subscription.status = 'active';
    subscription.currentPeriodStart = oldPeriodEnd || new Date().toISOString();
    subscription.currentPeriodEnd = this.calculatePeriodEnd('month');
    subscription.updatedAt = new Date().toISOString();
  }

  async processRenewals(): Promise<void> {
    const now = new Date();
    
    for (const subscription of mockSubscriptions) {
      if (subscription.status !== 'active') continue;
      
      const periodEnd = new Date(subscription.currentPeriodEnd);
      if (periodEnd <= now) {
        await this.renewSubscription(subscription);
      }
    }
  }

  private async renewSubscription(subscription: Subscription): Promise<void> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
      if (!plan || plan.price === 0) return;

      const payment = await paymentService.createPaymentIntent({
        amount: subscription.amount,
        currency: subscription.currency,
        userId: subscription.userId,
        provider: subscription.provider!,
        type: 'subscription',
        metadata: {
          subscriptionId: subscription.id,
          action: 'renewal',
        },
      });

      const confirmed = await paymentService.confirmPayment(
        payment.id,
        subscription.paymentMethodId!,
        subscription.provider!
      );

      if (confirmed.status === 'completed') {
        await this.handlePaymentSuccess(subscription.id);
      } else {
        await this.handlePaymentFailure(subscription.id);
      }
    } catch (error) {
      console.error('Renewal error:', error);
      await this.handlePaymentFailure(subscription.id);
    }
  }

  getPlan(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId);
  }

  getPlanByTier(tier: SubscriptionTier): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(p => p.tier === tier);
  }

  getUsageStats(userId: string): {
    dealsUsed: number;
    dealsLimit: number;
    teamMembersUsed: number;
    teamMembersLimit: number;
    storageUsed: string;
    storageLimit: string;
    apiCallsUsed: number;
    apiCallsLimit: number;
  } {
    const subscription = mockSubscriptions.find(s => s.userId === userId);
    if (!subscription) {
      return {
        dealsUsed: 0,
        dealsLimit: 3,
        teamMembersUsed: 1,
        teamMembersLimit: 1,
        storageUsed: '0GB',
        storageLimit: '1GB',
        apiCallsUsed: 0,
        apiCallsLimit: 100,
      };
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
    const limits = plan?.limits;

    return {
      dealsUsed: 5,
      dealsLimit: limits?.dealsPerMonth || 0,
      teamMembersUsed: 2,
      teamMembersLimit: limits?.teamMembers || 1,
      storageUsed: '2.5GB',
      storageLimit: limits?.storage || '1GB',
      apiCallsUsed: 450,
      apiCallsLimit: limits?.apiCalls || 100,
    };
  }

  startAutoRenewal(cronExpression?: string): void {
    if (this.cronJobEnabled) return;
    
    this.cronJobEnabled = true;
    console.log('Auto-renewal cron job enabled');
  }

  stopAutoRenewal(): void {
    this.cronJobEnabled = false;
    console.log('Auto-renewal cron job disabled');
  }
}

export const subscriptionService = new SubscriptionService();
