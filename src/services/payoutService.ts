import { Payout, PayoutStatus, PayoutDestination, CreatePayoutParams } from '@/types/payout';
import { walletService } from './walletService';
import { notificationService } from './notificationService';
import { API_URL, getAccessHeaders } from '@/config/api';

const generateId = () => `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const mockPayouts: Payout[] = [
  {
    id: 'payout_001',
    userId: 'user_001',
    walletId: 'wallet_002',
    amount: 2550,
    currency: 'USD',
    status: 'completed',
    destination: {
      type: 'bank_account',
      bankName: 'First Bank of Nigeria',
      accountNumber: '1234567890',
      accountHolderName: 'DIL Business Ltd',
      bankCode: '011151515',
    },
    reference: 'WTH-001',
    provider: 'paystack',
    providerReference: 'ps_transfer_123',
    fees: 10,
    netAmount: 2540,
    initiatedAt: '2026-02-01T10:00:00Z',
    completedAt: '2026-02-02T10:00:00Z',
    createdAt: '2026-02-01T10:00:00Z',
  },
];

class PayoutService {
  private provider: 'stripe' | 'paystack' | 'wise' | null = null;

  initialize(provider: 'stripe' | 'paystack' | 'wise'): void {
    this.provider = provider;
  }

  async createPayout(params: CreatePayoutParams): Promise<Payout> {
    const { userId, walletId, amount, currency, destination, reference } = params;

    const wallet = await walletService.getWallet(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.availableBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const fees = this.calculateFees(amount, currency, destination.type);
    const netAmount = amount - fees;

    const payout: Payout = {
      id: generateId(),
      userId,
      walletId,
      amount,
      currency,
      status: 'pending',
      destination,
      reference: reference || `Payout-${Date.now()}`,
      provider: this.getProvider(),
      fees,
      netAmount,
      initiatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    mockPayouts.push(payout);

    await notificationService.sendPayoutInitiatedNotification(
      userId,
      amount,
      currency,
      payout.reference
    );

    this.processPayoutAsync(payout.id);

    return payout;
  }

  private calculateFees(amount: number, currency: string, destinationType: string): number {
    if (destinationType === 'bank_account') {
      if (currency === 'NGN') {
        return Math.max(10, amount * 0.01);
      }
      return Math.max(1, amount * 0.005);
    }
    return 0;
  }

  private getProvider(): 'stripe' | 'paystack' | 'wise' {
    return this.provider || 'paystack';
  }

  private async processPayoutAsync(payoutId: string): Promise<void> {
    setTimeout(async () => {
      await this.completePayout(payoutId);
    }, 3000);
  }

  async getPayout(payoutId: string): Promise<Payout | null> {
    return mockPayouts.find(p => p.id === payoutId) || null;
  }

  async getUserPayouts(userId: string): Promise<Payout[]> {
    return mockPayouts
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async cancelPayout(payoutId: string): Promise<Payout> {
    const payout = mockPayouts.find(p => p.id === payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'pending') {
      throw new Error('Only pending payouts can be cancelled');
    }

    payout.status = 'cancelled';
    payout.cancelledAt = new Date().toISOString();

    await walletService.withdrawFromWallet({
      walletId: payout.walletId,
      amount: payout.amount,
      currency: payout.currency,
      destination: payout.destination as any,
    });

    return payout;
  }

  async retryPayout(payoutId: string): Promise<Payout> {
    const payout = mockPayouts.find(p => p.id === payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'failed') {
      throw new Error('Only failed payouts can be retried');
    }

    payout.status = 'pending';
    payout.retryCount = (payout.retryCount || 0) + 1;
    payout.lastAttemptAt = new Date().toISOString();

    this.processPayoutAsync(payout.id);

    return payout;
  }

  private async completePayout(payoutId: string): Promise<void> {
    const payout = mockPayouts.find(p => p.id === payoutId);
    if (!payout) return;

    try {
      const success = await this.processWithProvider(payout);
      
      if (success) {
        payout.status = 'completed';
        payout.completedAt = new Date().toISOString();
        payout.providerReference = `provider_${Date.now()}`;
      } else {
        payout.status = 'failed';
        payout.failureReason = 'Payout processing failed';
        
        await walletService.withdrawFromWallet({
          walletId: payout.walletId,
          amount: payout.amount,
          currency: payout.currency,
          destination: payout.destination as any,
        });
      }
    } catch (error: any) {
      payout.status = 'failed';
      payout.failureReason = error.message;
    }
  }

  private async processWithProvider(payout: Payout): Promise<boolean> {
    if (!this.provider) {
      return true;
    }

    try {
      const response = await fetch(`${API_URL}/api/payouts/payout/process`, {
        method: 'POST',
        headers: getAccessHeaders({ userId: payout.userId }),
        body: JSON.stringify({
          payoutId: payout.id,
          amount: payout.amount,
          currency: payout.currency,
          destination: payout.destination,
        }),
      });

      const data = await response.json();
      return data.success;
    } catch {
      return true;
    }
  }

  async getPayoutStats(userId: string): Promise<{
    totalPayouts: number;
    totalAmount: number;
    successfulPayouts: number;
    failedPayouts: number;
    pendingPayouts: number;
  }> {
    const userPayouts = mockPayouts.filter(p => p.userId === userId);
    
    return {
      totalPayouts: userPayouts.length,
      totalAmount: userPayouts.reduce((sum, p) => sum + p.amount, 0),
      successfulPayouts: userPayouts.filter(p => p.status === 'completed').length,
      failedPayouts: userPayouts.filter(p => p.status === 'failed').length,
      pendingPayouts: userPayouts.filter(p => p.status === 'pending').length,
    };
  }

  async getBankAccounts(userId: string): Promise<{
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isDefault: boolean;
  }[]> {
    return [
      {
        bankName: 'First Bank of Nigeria',
        accountNumber: '1234567890',
        accountHolderName: 'DIL Business Ltd',
        isDefault: true,
      },
    ];
  }

  async addBankAccount(userId: string, account: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    bankCode: string;
  }): Promise<void> {
    console.log('Bank account added:', account);
  }

  getProviderName(): string {
    switch (this.provider) {
      case 'stripe': return 'Stripe';
      case 'paystack': return 'Paystack';
      case 'wise': return 'Wise';
      default: return 'Integrated Provider';
    }
  }

  getEstimatedArrival(currency: string): string {
    if (currency === 'NGN') {
      return '2-3 business days';
    }
    return '3-5 business days';
  }
}

export const payoutService = new PayoutService();
