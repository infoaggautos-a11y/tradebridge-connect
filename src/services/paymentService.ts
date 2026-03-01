import Stripe from 'stripe';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentProvider,
  PaymentIntent,
  CreatePaymentParams,
  CardDetails,
  BankAccountDetails,
} from '@/types/payment';

const generateId = () => `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateReference = () => `DIL-${Date.now().toString(36).toUpperCase()}`;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
}) : null;

const mockPayments: Payment[] = [];
const mockPaymentMethods: PaymentMethod[] = [];

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface PaymentGatewayConfig {
  stripe: StripeConfig;
  paystack: PaystackConfig;
  environment: 'sandbox' | 'production';
}

class PaymentService {
  private config: PaymentGatewayConfig | null = null;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
  }

  getStripePublishableKey(): string {
    return this.config?.stripe.publishableKey || '';
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    const { amount, currency, userId, metadata } = params;
    const intentId = generateId();
    const reference = generateReference();
    
    let clientSecret: string;

    if (params.provider === 'stripe' && stripe) {
      clientSecret = await this.createStripePaymentIntent(amount, currency, reference, metadata);
    } else if (params.provider === 'paystack') {
      clientSecret = await this.createPaystackPaymentIntent(amount, currency, reference, metadata);
    } else {
      throw new Error('Unsupported payment provider');
    }

    return {
      id: intentId,
      clientSecret,
      amount,
      currency,
      status: 'pending',
      reference,
      metadata,
    };
  }

  private async createStripePaymentIntent(
    amount: number,
    currency: string,
    reference: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    if (!stripe) {
      console.warn('Stripe not configured, using mock');
      return `stripe_pi_mock_${reference}`;
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: {
          ...metadata,
          reference,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent.client_secret!;
    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      throw error;
    }
  }

  private async createPaystackPaymentIntent(
    amount: number,
    currency: string,
    reference: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          reference,
          metadata,
        }),
      });
      
      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message);
      }
      return data.data.access_code;
    } catch (error) {
      console.error('Paystack initialize error:', error);
      throw error;
    }
  }

  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string,
    provider: PaymentProvider
  ): Promise<Payment> {
    const payment: Payment = {
      id: generateId(),
      paymentIntentId,
      paymentMethodId,
      userId: 'current_user',
      amount: 0,
      currency: 'USD',
      provider,
      type: 'wallet_topup',
      status: 'processing',
      reference: generateReference(),
      description: 'Payment confirmed',
      createdAt: new Date().toISOString(),
      metadata: {},
    };

    let success = false;
    
    if (provider === 'stripe') {
      success = await this.confirmStripePayment(paymentIntentId, paymentMethodId);
    } else if (provider === 'paystack') {
      success = await this.verifyPaystackPayment(paymentIntentId);
    }

    payment.status = success ? 'completed' : 'failed';
    payment.completedAt = success ? new Date().toISOString() : undefined;

    mockPayments.push(payment);
    return payment;
  }

  private async confirmStripePayment(paymentIntentId: string, _paymentMethodId: string): Promise<boolean> {
    if (!stripe) {
      return true;
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('Stripe confirmPayment error:', error);
      return false;
    }
  }

  private async verifyPaystackPayment(reference: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });
      const data = await response.json();
      return data.data?.status === 'success';
    } catch (error) {
      console.error('Paystack verifyPayment error:', error);
      return false;
    }
  }

  async createCardPaymentMethod(details: CardDetails): Promise<PaymentMethod> {
    const paymentMethod: PaymentMethod = {
      id: generateId(),
      userId: details.userId,
      type: 'card',
      provider: details.provider,
      isDefault: false,
      isVerified: false,
      cardLast4: details.cardNumber.slice(-4),
      cardBrand: this.detectCardBrand(details.cardNumber),
      expiryMonth: details.expiryMonth,
      expiryYear: details.expiryYear.toString(),
      cardHolderName: details.cardHolderName,
      createdAt: new Date().toISOString(),
    };

    let verified = false;
    
    if (details.provider === 'stripe' && stripe) {
      verified = await this.verifyStripeCard(details);
    } else if (details.provider === 'paystack') {
      verified = await this.verifyPaystackCard(details);
    }

    paymentMethod.isVerified = verified;
    mockPaymentMethods.push(paymentMethod);
    
    return paymentMethod;
  }

  private detectCardBrand(cardNumber: string): string {
    const firstDigit = cardNumber[0];
    const firstTwo = cardNumber.slice(0, 2);
    
    if (firstDigit === '4') return 'visa';
    if (['51', '52', '53', '54', '55'].includes(firstTwo)) return 'mastercard';
    if (['34', '37'].includes(firstTwo)) return 'amex';
    if (firstTwo === '60' || firstTwo === '65') return 'discover';
    return 'unknown';
  }

  private async verifyStripeCard(details: CardDetails): Promise<boolean> {
    if (!stripe) return true;
    
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: details.cardNumber,
          exp_month: details.expiryMonth,
          exp_year: details.expiryYear,
          cvc: details.cvv,
        },
      });
      return !!paymentMethod.id;
    } catch {
      return false;
    }
  }

  private async verifyPaystackCard(details: CardDetails): Promise<boolean> {
    try {
      const response = await fetch('https://api.paystack.co/sdk/tokenization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAYSTACK_PUBLIC_KEY}`,
        },
        body: JSON.stringify({
          card: {
            number: details.cardNumber,
            cvv: details.cvv,
            expiry_month: details.expiryMonth,
            expiry_year: details.expiryYear,
          },
        }),
      });
      const data = await response.json();
      return data.status;
    } catch {
      return false;
    }
  }

  async createBankAccountPaymentMethod(details: BankAccountDetails): Promise<PaymentMethod> {
    const paymentMethod: PaymentMethod = {
      id: generateId(),
      userId: details.userId,
      type: 'bank_transfer',
      provider: details.provider,
      isDefault: false,
      isVerified: false,
      bankName: details.bankName,
      accountNumber: details.accountNumber,
      accountHolderName: details.accountHolderName,
      routingNumber: details.routingNumber,
      createdAt: new Date().toISOString(),
    };

    let verified = false;
    
    if (details.provider === 'paystack') {
      verified = await this.verifyPaystackBankAccount(details);
    }

    paymentMethod.isVerified = verified;
    mockPaymentMethods.push(paymentMethod);
    
    return paymentMethod;
  }

  private async verifyPaystackBankAccount(details: BankAccountDetails): Promise<boolean> {
    try {
      const response = await fetch('https://api.paystack.co/bank/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          account_number: details.accountNumber,
          bank_code: details.routingNumber,
        }),
      });
      const data = await response.json();
      return data.status && data.data?.account_name;
    } catch {
      return false;
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return mockPaymentMethods.filter(pm => pm.userId === userId);
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    return mockPayments.find(p => p.id === paymentId) || null;
  }

  async getPaymentByReference(reference: string): Promise<Payment | null> {
    return mockPayments.find(p => p.reference === reference) || null;
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    const payment = mockPayments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (stripe && payment.provider === 'stripe') {
      await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
    }

    payment.status = 'refunded';
    payment.refundedAt = new Date().toISOString();
    if (amount) {
      payment.refundAmount = amount;
    }

    return payment;
  }

  async processWebhook(
    provider: PaymentProvider,
    payload: any,
    signature: string
  ): Promise<{ success: boolean; event?: string }> {
    if (provider === 'stripe') {
      return this.processStripeWebhook(payload, signature);
    } else if (provider === 'paystack') {
      return this.processPaystackWebhook(payload);
    }
    
    return { success: false };
  }

  private async processStripeWebhook(payload: any, _signature: string): Promise<{ success: boolean; event?: string }> {
    if (!stripe) {
      return { success: false };
    }

    try {
      const event = payload;
      const eventType = event.type;
      
      switch (eventType) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object.metadata.reference);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object.metadata.reference);
          break;
        case 'charge.refunded':
          await this.handleRefundSuccess(event.data.object.metadata.reference);
          break;
      }

      return { success: true, event: eventType };
    } catch (error) {
      console.error('Stripe webhook error:', error);
      return { success: false };
    }
  }

  private async processPaystackWebhook(payload: any): Promise<{ success: boolean; event?: string }> {
    const event = payload.event;
    
    switch (event) {
      case 'charge.success':
        await this.handlePaymentSuccess(payload.data.reference);
        break;
      case 'charge.failed':
        await this.handlePaymentFailure(payload.data.reference);
        break;
      case 'refund.processed':
        await this.handleRefundSuccess(payload.data.reference);
        break;
    }

    return { success: true, event };
  }

  private async handlePaymentSuccess(reference: string): Promise<void> {
    const payment = mockPayments.find(p => p.reference === reference);
    if (payment) {
      payment.status = 'completed';
      payment.completedAt = new Date().toISOString();
    }
  }

  private async handlePaymentFailure(reference: string): Promise<void> {
    const payment = mockPayments.find(p => p.reference === reference);
    if (payment) {
      payment.status = 'failed';
      payment.failureReason = 'Payment failed';
    }
  }

  private async handleRefundSuccess(reference: string): Promise<void> {
    const payment = mockPayments.find(p => p.reference === reference);
    if (payment) {
      payment.status = 'refunded';
      payment.refundedAt = new Date().toISOString();
    }
  }

  async getPaymentHistory(userId: string, limit = 50): Promise<Payment[]> {
    return mockPayments
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createStripeCustomer(email: string, name: string): Promise<string> {
    if (!stripe) {
      return `cus_mock_${Date.now()}`;
    }

    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer.id;
  }

  async attachPaymentMethodToCustomer(customerId: string, paymentMethodId: string): Promise<boolean> {
    if (!stripe) return true;

    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      return true;
    } catch (error) {
      console.error('Attach payment method error:', error);
      return false;
    }
  }

  async createStripeSubscription(
    customerId: string,
    priceId: string
  ): Promise<{ subscriptionId: string; status: string }> {
    if (!stripe) {
      return { subscriptionId: `sub_mock_${Date.now()}`, status: 'active' };
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
    };
  }

  async cancelStripeSubscription(subscriptionId: string): Promise<boolean> {
    if (!stripe) return true;

    try {
      await stripe.subscriptions.cancel(subscriptionId);
      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();
