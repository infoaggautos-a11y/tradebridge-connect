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

const mockPayments: Payment[] = [];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_001',
    userId: 'user_001',
    type: 'card',
    provider: 'stripe',
    isDefault: true,
    isVerified: true,
    cardLast4: '4242',
    cardBrand: 'visa',
    expiryMonth: 12,
    expiryYear: 2027,
    cardHolderName: 'John Doe',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'pm_002',
    userId: 'user_001',
    type: 'bank_transfer',
    provider: 'paystack',
    isDefault: true,
    isVerified: true,
    bankName: 'First Bank of Nigeria',
    accountNumber: '1234567890',
    accountHolderName: 'DIL Business Services Ltd',
    routingNumber: '011151515',
    createdAt: '2026-01-15T00:00:00Z',
  },
];

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
  private stripe: any = null;
  private paystack: any = null;

  initialize(config: PaymentGatewayConfig): void {
    this.config = config;
    if (typeof window !== 'undefined') {
      this.loadStripe();
    }
  }

  private async loadStripe(): Promise<void> {
    if (typeof window === 'undefined' || !this.config) return;
    
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      this.stripe = await loadStripe(this.config.stripe.publishableKey);
    } catch (error) {
      console.error('Failed to load Stripe:', error);
    }
  }

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    const { amount, currency, userId, metadata } = params;
    
    const intentId = generateId();
    const reference = generateReference();
    
    let clientSecret: string;
    
    if (params.provider === 'stripe') {
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
    if (!this.config) {
      return `stripe_pi_mock_${reference}`;
    }
    
    try {
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          reference,
          metadata,
        }),
      });
      
      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('Stripe createPaymentIntent error:', error);
      return `stripe_pi_mock_${reference}`;
    }
  }

  private async createPaystackPaymentIntent(
    amount: number,
    currency: string,
    reference: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    if (!this.config) {
      return `paystack_ps_mock_${reference}`;
    }
    
    try {
      const response = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency,
          reference,
          metadata,
        }),
      });
      
      const data = await response.json();
      return data.data.accessCode;
    } catch (error) {
      console.error('Paystack initialize error:', error);
      return `paystack_ps_mock_${reference}`;
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

  private async confirmStripePayment(paymentIntentId: string, paymentMethodId: string): Promise<boolean> {
    if (!this.stripe) {
      return true;
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(paymentIntentId, {
        payment_method: paymentMethodId,
      });
      
      return !error && paymentIntent?.status === 'succeeded';
    } catch (error) {
      console.error('Stripe confirmPayment error:', error);
      return false;
    }
  }

  private async verifyPaystackPayment(reference: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/paystack/verify/${reference}`);
      const data = await response.json();
      return data.data?.status === 'success';
    } catch (error) {
      console.error('Paystack verifyPayment error:', error);
      return true;
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
      expiryYear: details.expiryYear,
      cardHolderName: details.cardHolderName,
      createdAt: new Date().toISOString(),
    };

    let verified = false;
    
    if (details.provider === 'stripe') {
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
    try {
      const response = await fetch('/api/payments/stripe/verify-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: details.cardNumber,
          expiryMonth: details.expiryMonth,
          expiryYear: details.expiryYear,
        }),
      });
      
      const data = await response.json();
      return data.valid;
    } catch {
      return true;
    }
  }

  private async verifyPaystackCard(details: CardDetails): Promise<boolean> {
    try {
      const response = await fetch('/api/payments/paystack/check-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: details.cardNumber,
          expiryMonth: details.expiryMonth,
          expiryYear: details.expiryYear,
        }),
      });
      
      const data = await response.json();
      return data.valid;
    } catch {
      return true;
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
      const response = await fetch('/api/payments/paystack/resolve-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: details.accountNumber,
          bankCode: details.routingNumber,
        }),
      });
      
      const data = await response.json();
      return data.valid;
    } catch {
      return true;
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
      return this.processPaystackWebhook(payload, signature);
    }
    
    return { success: false };
  }

  private async processStripeWebhook(payload: any, signature: string): Promise<{ success: boolean; event?: string }> {
    const eventType = payload.type;
    
    switch (eventType) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(payload.data.object.metadata.reference);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(payload.data.object.metadata.reference);
        break;
      case 'charge.refunded':
        await this.handleRefundSuccess(payload.data.object.metadata.reference);
        break;
    }

    return { success: true, event: eventType };
  }

  private async processPaystackWebhook(payload: any, signature: string): Promise<{ success: boolean; event?: string }> {
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
}

export const paymentService = new PaymentService();
