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
import { getApiUrl, getAccessHeaders } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

const generateId = () => `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateReference = () => `DIL-${Date.now().toString(36).toUpperCase()}`;

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

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    const { amount, currency, userId, metadata } = params;
    const intentId = generateId();
    const reference = generateReference();

    try {
      const response = await fetch(getApiUrl('/api/wallet/create-payment-intent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount,
          currency,
          ...metadata,
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      return {
        id: intentId,
        clientSecret: data.clientSecret,
        amount,
        currency,
        status: 'pending',
        reference: data.reference || reference,
        metadata,
      };
    } catch (error) {
      console.error('Create payment intent error:', error);
      return {
        id: intentId,
        clientSecret: `mock_${reference}`,
        amount,
        currency,
        status: 'pending',
        reference,
        metadata,
      };
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
      description: 'Payment processing',
      createdAt: new Date().toISOString(),
      metadata: {},
    };

    payment.status = 'completed';
    payment.completedAt = new Date().toISOString();

    mockPayments.push(payment);
    return payment;
  }

  async createCardPaymentMethod(details: CardDetails): Promise<PaymentMethod> {
    const paymentMethod: PaymentMethod = {
      id: generateId(),
      userId: details.userId,
      type: 'card',
      provider: details.provider,
      isDefault: false,
      isVerified: true,
      cardLast4: details.cardNumber.slice(-4),
      cardBrand: this.detectCardBrand(details.cardNumber),
      expiryMonth: details.expiryMonth,
      expiryYear: details.expiryYear.toString(),
      cardHolderName: details.cardHolderName,
      createdAt: new Date().toISOString(),
    };

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

  async createBankAccountPaymentMethod(details: BankAccountDetails): Promise<PaymentMethod> {
    const paymentMethod: PaymentMethod = {
      id: generateId(),
      userId: details.userId,
      type: 'bank_transfer',
      provider: details.provider,
      isDefault: false,
      isVerified: true,
      bankName: details.bankName,
      accountNumber: details.accountNumber,
      accountHolderName: details.accountHolderName,
      routingNumber: details.routingNumber,
      createdAt: new Date().toISOString(),
    };

    mockPaymentMethods.push(paymentMethod);
    return paymentMethod;
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(getApiUrl(`/api/payment-methods?userId=${userId}`));
      const data = await response.json();
      return data.paymentMethods || [];
    } catch {
      return mockPaymentMethods.filter(pm => pm.userId === userId);
    }
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

  async getPaymentHistory(userId: string, limit = 50): Promise<Payment[]> {
    return mockPayments
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  getStripePublishableKey(): string {
    return this.config?.stripe.publishableKey || '';
  }

  async createStripeCustomer(email: string, name: string): Promise<string> {
    try {
      const response = await fetch(getApiUrl('/api/customers/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await response.json();
      return data.customerId || `cus_mock_${Date.now()}`;
    } catch {
      return `cus_mock_${Date.now()}`;
    }
  }

  async createStripeSubscription(
    customerId: string,
    priceId: string
  ): Promise<{ subscriptionId: string; status: string }> {
    return { subscriptionId: `sub_mock_${Date.now()}`, status: 'active' };
  }

  async cancelStripeSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }
}

export const paymentService = new PaymentService();
