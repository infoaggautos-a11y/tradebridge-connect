import { 
  Wallet, 
  WalletTransaction, 
  WalletStatus,
  WalletType,
  CreateWalletParams,
  FundWalletParams,
  WalletTransactionType 
} from '@/types/wallet';
import { paymentService } from './paymentService';
import { notificationService } from './notificationService';
import { API_URL, getAccessHeaders } from '@/config/api';

const generateId = () => `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateTransactionId = () => `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const mockWallets: Wallet[] = [
  {
    id: 'wallet_001',
    userId: 'user_001',
    businessId: 'biz_001',
    currency: 'USD',
    type: 'escrow',
    balance: 15000,
    pendingBalance: 0,
    availableBalance: 15000,
    frozenBalance: 0,
    status: 'active',
    bankName: 'First Bank of Nigeria',
    bankAccountName: 'DIL Trade Bridge Ltd',
    bankAccountNumber: '1234567890',
    bankCode: '011151515',
    lastUpdated: '2026-02-15T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    transactions: [
      {
        id: 'txn_001',
        walletId: 'wallet_001',
        type: 'deposit',
        amount: 15000,
        currency: 'USD',
        balanceAfter: 15000,
        status: 'completed',
        reference: 'DEP-001',
        description: 'Escrow deposit for Deal DIL-2026-001',
        createdAt: '2026-01-20T10:00:00Z',
        completedAt: '2026-01-20T10:00:00Z',
      },
      {
        id: 'txn_002',
        walletId: 'wallet_001',
        type: 'escrow_funding',
        amount: -15000,
        currency: 'USD',
        balanceAfter: 0,
        status: 'completed',
        reference: 'ESC-001',
        description: 'Funds moved to escrow for Deal DIL-2026-001',
        createdAt: '2026-01-22T14:00:00Z',
        completedAt: '2026-01-22T14:00:00Z',
      },
    ],
  },
  {
    id: 'wallet_002',
    userId: 'user_001',
    businessId: 'biz_001',
    currency: 'USD',
    type: 'main',
    balance: 2450,
    pendingBalance: 200,
    availableBalance: 2250,
    frozenBalance: 0,
    status: 'active',
    bankName: 'First Bank of Nigeria',
    bankAccountName: 'DIL Trade Bridge Ltd',
    bankAccountNumber: '1234567890',
    bankCode: '011151515',
    lastUpdated: '2026-02-15T10:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    transactions: [
      {
        id: 'txn_003',
        walletId: 'wallet_002',
        type: 'deposit',
        amount: 5000,
        currency: 'USD',
        balanceAfter: 5000,
        status: 'completed',
        reference: 'DEP-002',
        description: 'Wallet top-up',
        createdAt: '2026-01-05T10:00:00Z',
        completedAt: '2026-01-05T10:00:00Z',
      },
      {
        id: 'txn_004',
        walletId: 'wallet_002',
        type: 'withdrawal',
        amount: -2550,
        currency: 'USD',
        balanceAfter: 2450,
        status: 'completed',
        reference: 'WTH-001',
        description: 'Withdrawal to bank account',
        createdAt: '2026-02-01T10:00:00Z',
        completedAt: '2026-02-02T10:00:00Z',
      },
    ],
  },
];

class WalletService {
  async createWallet(params: CreateWalletParams): Promise<Wallet> {
    const { userId, businessId, currency, type = 'main', bankDetails } = params;

    const wallet: Wallet = {
      id: generateId(),
      userId,
      businessId,
      currency,
      type,
      balance: 0,
      pendingBalance: 0,
      availableBalance: 0,
      frozenBalance: 0,
      status: 'active',
      ...bankDetails,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      transactions: [],
    };

    mockWallets.push(wallet);
    return wallet;
  }

  async getWallet(walletId: string): Promise<Wallet | null> {
    return mockWallets.find(w => w.id === walletId) || null;
  }

  async getUserWallet(userId: string, type?: WalletType): Promise<Wallet | null> {
    const wallet = mockWallets.find(w => 
      w.userId === userId && (type ? w.type === type : true)
    );
    return wallet || null;
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return mockWallets.filter(w => w.userId === userId);
  }

  async getBusinessWallets(businessId: string): Promise<Wallet[]> {
    return mockWallets.filter(w => w.businessId === businessId);
  }

  async fundWallet(params: FundWalletParams): Promise<WalletTransaction> {
    const { walletId, amount, currency, source, reference } = params;

    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.status !== 'active') {
      throw new Error('Wallet is not active');
    }

    if (source.type === 'payment') {
      const payment = await paymentService.confirmPayment(
        source.paymentIntentId,
        source.paymentMethodId,
        source.provider
      );

      if (payment.status !== 'completed') {
        throw new Error('Payment failed');
      }
    }

    const balanceAfter = wallet.balance + amount;
    
    const transaction: WalletTransaction = {
      id: generateTransactionId(),
      walletId,
      type: 'deposit',
      amount,
      currency,
      balanceAfter,
      status: 'completed',
      reference: reference || `DEP-${Date.now()}`,
      description: `Wallet top-up via ${source.type}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    wallet.balance = balanceAfter;
    wallet.availableBalance = balanceAfter - wallet.pendingBalance - wallet.frozenBalance;
    wallet.lastUpdated = new Date().toISOString();
    wallet.transactions.unshift(transaction);

    await notificationService.sendPaymentReceivedNotification(
      wallet.userId,
      amount,
      currency,
      transaction.reference
    );

    return transaction;
  }

  async withdrawFromWallet(params: {
    walletId: string;
    amount: number;
    currency: string;
    membershipTier?: 'free' | 'starter' | 'growth' | 'enterprise';
    destination: {
      type: 'bank_account';
      bankName: string;
      accountNumber: string;
      accountName: string;
      bankCode: string;
    };
    reference?: string;
  }): Promise<WalletTransaction> {
    const { walletId, amount, currency, destination, reference } = params;

    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.availableBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const pendingTransaction: WalletTransaction = {
      id: generateTransactionId(),
      walletId,
      type: 'withdrawal',
      amount: -amount,
      currency,
      balanceAfter: wallet.balance - amount,
      status: 'pending',
      reference: reference || `WTH-${Date.now()}`,
      description: `Withdrawal to ${destination.bankName} (${destination.accountNumber})`,
      createdAt: new Date().toISOString(),
    };

    wallet.balance -= amount;
    wallet.pendingBalance += amount;
    wallet.lastUpdated = new Date().toISOString();
    wallet.transactions.unshift(pendingTransaction);

    const payoutResult = await this.processPayout({
      walletId,
      userId: wallet.userId,
      amount,
      currency,
      membershipTier: params.membershipTier,
      destination,
      transactionId: pendingTransaction.id,
    });

    if (payoutResult.success) {
      pendingTransaction.status = 'completed';
      pendingTransaction.completedAt = new Date().toISOString();
      wallet.pendingBalance -= amount;
      
      await notificationService.sendPayoutCompletedNotification(
        wallet.userId,
        amount,
        currency,
        pendingTransaction.reference
      );
    } else {
      pendingTransaction.status = 'failed';
      pendingTransaction.description = `Withdrawal failed: ${payoutResult.reason}`;
      wallet.pendingBalance -= amount;
      wallet.balance += amount;

      await notificationService.sendNotification({
        userId: wallet.userId,
        type: 'payout_failed',
        title: 'Payout Failed',
        message: `Your withdrawal of ${currency} ${amount} failed. Reason: ${payoutResult.reason}`,
      });
    }

    return pendingTransaction;
  }

  private async processPayout(params: {
    walletId: string;
    userId: string;
    amount: number;
    currency: string;
    membershipTier?: 'free' | 'starter' | 'growth' | 'enterprise';
    destination: {
      type: 'bank_account';
      bankName: string;
      accountNumber: string;
      accountName: string;
      bankCode: string;
    };
    transactionId: string;
  }): Promise<{ success: boolean; reason?: string; providerReference?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/payouts/payout/create`, {
        method: 'POST',
        headers: getAccessHeaders({
          userId: params.userId,
          membershipTier: params.membershipTier || 'free',
        }),
        body: JSON.stringify({
          userId: params.userId,
          walletId: params.walletId,
          amount: params.amount,
          currency: params.currency,
          bankAccountId: params.destination.accountNumber,
          transactionId: params.transactionId,
        }),
      });

      const data = await response.json();
      return {
        success: data.success,
        reason: data.reason,
        providerReference: data.providerReference,
      };
    } catch (error) {
      console.error('Payout processing error:', error);
      return { success: true, providerReference: `mock_${Date.now()}` };
    }
  }

  async transferToEscrow(params: {
    walletId: string;
    amount: number;
    currency: string;
    escrowId: string;
    dealId: string;
  }): Promise<WalletTransaction> {
    const { walletId, amount, currency, escrowId, dealId } = params;

    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.availableBalance < amount) {
      throw new Error('Insufficient funds');
    }

    const transaction: WalletTransaction = {
      id: generateTransactionId(),
      walletId,
      type: 'escrow_funding',
      amount: -amount,
      currency,
      balanceAfter: wallet.balance - amount,
      status: 'completed',
      reference: `ESC-${escrowId}`,
      description: `Funds transferred to escrow for deal ${dealId}`,
      escrowId,
      dealId,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    wallet.balance -= amount;
    wallet.availableBalance -= amount;
    wallet.lastUpdated = new Date().toISOString();
    wallet.transactions.unshift(transaction);

    return transaction;
  }

  async receiveFromEscrow(params: {
    walletId: string;
    amount: number;
    currency: string;
    escrowId: string;
    dealId: string;
    commissionDeducted: number;
  }): Promise<WalletTransaction> {
    const { walletId, amount, currency, escrowId, dealId, commissionDeducted } = params;

    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const netAmount = amount - commissionDeducted;
    const balanceAfter = wallet.balance + netAmount;

    const transaction: WalletTransaction = {
      id: generateTransactionId(),
      walletId,
      type: 'escrow_release',
      amount: netAmount,
      currency,
      balanceAfter,
      status: 'completed',
      reference: `REL-${escrowId}`,
      description: `Funds released from escrow for deal ${dealId}. Commission: ${commissionDeducted}`,
      escrowId,
      dealId,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    wallet.balance = balanceAfter;
    wallet.availableBalance = balanceAfter - wallet.pendingBalance - wallet.frozenBalance;
    wallet.lastUpdated = new Date().toISOString();
    wallet.transactions.unshift(transaction);

    await notificationService.sendEscrowReleasedNotification(
      wallet.userId,
      amount,
      currency,
      commissionDeducted,
      dealId
    );

    return transaction;
  }

  async freezeFunds(walletId: string, amount: number, reason: string): Promise<void> {
    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.availableBalance < amount) {
      throw new Error('Insufficient available funds to freeze');
    }

    wallet.availableBalance -= amount;
    wallet.frozenBalance += amount;
    wallet.lastUpdated = new Date().toISOString();
  }

  async unfreezeFunds(walletId: string, amount: number): Promise<void> {
    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (wallet.frozenBalance < amount) {
      throw new Error('Amount exceeds frozen balance');
    }

    wallet.frozenBalance -= amount;
    wallet.availableBalance += amount;
    wallet.lastUpdated = new Date().toISOString();
  }

  async suspendWallet(walletId: string): Promise<Wallet> {
    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    wallet.status = 'suspended';
    wallet.lastUpdated = new Date().toISOString();
    return wallet;
  }

  async reactivateWallet(walletId: string): Promise<Wallet> {
    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    wallet.status = 'active';
    wallet.lastUpdated = new Date().toISOString();
    return wallet;
  }

  async getTransactionHistory(
    walletId: string,
    options?: {
      type?: WalletTransactionType;
      status?: 'pending' | 'completed' | 'failed';
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<WalletTransaction[]> {
    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      return [];
    }

    let transactions = [...wallet.transactions];

    if (options?.type) {
      transactions = transactions.filter(t => t.type === options.type);
    }
    if (options?.status) {
      transactions = transactions.filter(t => t.status === options.status);
    }
    if (options?.startDate) {
      transactions = transactions.filter(t => t.createdAt >= options.startDate!);
    }
    if (options?.endDate) {
      transactions = transactions.filter(t => t.createdAt <= options.endDate!);
    }

    return transactions.slice(0, options?.limit || 50);
  }

  async getWalletBalance(walletId: string): Promise<{
    balance: number;
    availableBalance: number;
    pendingBalance: number;
    frozenBalance: number;
  } | null> {
    const wallet = mockWallets.find(w => w.id === walletId);
    if (!wallet) {
      return null;
    }

    return {
      balance: wallet.balance,
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      frozenBalance: wallet.frozenBalance,
    };
  }

  getTotalPlatformFunds(): {
    totalEscrow: number;
    totalMain: number;
    totalPending: number;
    totalFrozen: number;
  } {
    const escrowWallets = mockWallets.filter(w => w.type === 'escrow');
    const mainWallets = mockWallets.filter(w => w.type === 'main');

    return {
      totalEscrow: escrowWallets.reduce((sum, w) => sum + w.balance, 0),
      totalMain: mainWallets.reduce((sum, w) => sum + w.balance, 0),
      totalPending: mockWallets.reduce((sum, w) => sum + w.pendingBalance, 0),
      totalFrozen: mockWallets.reduce((sum, w) => sum + w.frozenBalance, 0),
    };
  }
}

export const walletService = new WalletService();
