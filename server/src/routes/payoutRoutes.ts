import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { body, validationResult } from 'express-validator';
import { logger } from '../services/logger.js';
import axios from 'axios';

const router = Router();

const payouts: Map<string, any> = new Map();
const wallets: Map<string, any> = new Map();
const bankAccounts: Map<string, any[]> = new Map();

// Initialize with demo data
const initDemoData = () => {
  // Demo wallet
  wallets.set('wallet_user_001', {
    id: 'wallet_user_001',
    userId: 'user_001',
    type: 'main',
    currency: 'USD',
    balance: 5000,
    pendingBalance: 0,
    availableBalance: 5000,
    frozenBalance: 0,
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  // Demo bank accounts
  bankAccounts.set('user_001', [
    {
      id: 'bank_001',
      bankName: 'First Bank of Nigeria',
      accountNumber: '1234567890',
      accountHolderName: 'Demo Business Ltd',
      bankCode: '011151515',
      isVerified: true,
      isDefault: true,
    },
  ]);
};
initDemoData();

// ============== WALLET ROUTES ==============

router.get('/wallet/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const wallet = wallets.get(`wallet_${userId}`);
    
    if (!wallet) {
      return res.json({ success: true, wallet: null });
    }
    
    res.json({ success: true, wallet });
  } catch (error: any) {
    logger.error('Get wallet error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/wallet/deposit', 
  body('userId').isString(),
  body('amount').isInt({ min: 1 }),
  body('currency').isString().optional(),
  async (req: Request, res: Response) => {
    try {
      const { userId, amount, currency = 'USD', reference } = req.body;
      
      let wallet = wallets.get(`wallet_${userId}`);
      if (!wallet) {
        wallet = {
          id: `wallet_${userId}`,
          userId,
          type: 'main',
          currency,
          balance: 0,
          pendingBalance: 0,
          availableBalance: 0,
          frozenBalance: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
      }

      wallet.balance += amount;
      wallet.availableBalance += amount;
      wallet.updatedAt = new Date().toISOString();

      // Record transaction
      const tx = {
        id: `txn_${Date.now()}`,
        type: 'deposit',
        amount,
        balanceAfter: wallet.balance,
        reference: reference || `DEP-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      wallet.transactions = wallet.transactions || [];
      wallet.transactions.unshift(tx);

      wallets.set(`wallet_${userId}`, wallet);

      logger.info('Wallet deposit', { userId, amount });

      res.json({ success: true, wallet, transaction: tx });
    } catch (error: any) {
      logger.error('Wallet deposit error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post('/wallet/withdraw',
  body('userId').isString(),
  body('amount').isInt({ min: 1 }),
  body('bankAccountId').isString(),
  async (req: Request, res: Response) => {
    try {
      const { userId, amount, bankAccountId, currency = 'USD' } = req.body;
      
      const wallet = wallets.get(`wallet_${userId}`);
      if (!wallet) {
        return res.status(404).json({ success: false, error: 'Wallet not found' });
      }

      if (wallet.availableBalance < amount) {
        return res.status(400).json({ success: false, error: 'Insufficient funds' });
      }

      // Create payout record
      const payoutId = `payout_${Date.now()}`;
      const payout = {
        id: payoutId,
        userId,
        walletId: wallet.id,
        amount,
        currency,
        status: 'pending',
        reference: `Payout-${Date.now()}`,
        bankAccountId,
        fees: currency === 'NGN' ? 10 : Math.round(amount * 0.01),
        createdAt: new Date().toISOString(),
      };

      payouts.set(payoutId, payout);

      // Deduct from wallet
      wallet.balance -= amount;
      wallet.availableBalance -= amount;
      wallet.updatedAt = new Date().toISOString();

      wallets.set(`wallet_${userId}`, wallet);

      logger.info('Withdrawal initiated', { userId, amount, payoutId });

      res.json({ success: true, payout, wallet });
    } catch (error: any) {
      logger.error('Wallet withdrawal error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get('/wallet/:userId/transactions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const wallet = wallets.get(`wallet_${userId}`);
    
    if (!wallet) {
      return res.json({ success: true, transactions: [] });
    }
    
    res.json({ success: true, transactions: wallet.transactions || [] });
  } catch (error: any) {
    logger.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== BANK ACCOUNT ROUTES ==============

router.get('/bank-accounts/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const accounts = bankAccounts.get(userId) || [];
    res.json({ success: true, accounts });
  } catch (error: any) {
    logger.error('Get bank accounts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/bank-accounts',
  body('userId').isString(),
  body('bankName').isString(),
  body('accountNumber').isString(),
  body('accountHolderName').isString(),
  body('bankCode').isString(),
  async (req: Request, res: Response) => {
    try {
      const { userId, bankName, accountNumber, accountHolderName, bankCode, currency = 'NGN' } = req.body;

      // Verify account with Paystack (for NGN)
      let isVerified = false;
      if (currency === 'NGN' && process.env.PAYSTACK_SECRET_KEY) {
        try {
          const response = await axios.get(
            `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
          );
          isVerified = response.data.status;
        } catch (err) {
          logger.warn('Bank account verification failed:', err);
        }
      }

      const account = {
        id: `bank_${Date.now()}`,
        bankName,
        accountNumber,
        accountHolderName,
        bankCode,
        currency,
        isVerified,
        isDefault: false,
        createdAt: new Date().toISOString(),
      };

      const accounts = bankAccounts.get(userId) || [];
      accounts.push(account);
      bankAccounts.set(userId, accounts);

      logger.info('Bank account added', { userId, bankName });

      res.json({ success: true, account });
    } catch (error: any) {
      logger.error('Add bank account error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============== PAYOUT ROUTES ==============

router.post('/payout/create',
  body('userId').isString(),
  body('amount').isInt({ min: 1 }),
  body('currency').isString(),
  body('bankAccountId').isString(),
  async (req: Request, res: Response) => {
    try {
      const { userId, amount, currency, bankAccountId, reference } = req.body;
      
      const wallet = wallets.get(`wallet_${userId}`);
      if (!wallet || wallet.availableBalance < amount) {
        return res.status(400).json({ success: false, error: 'Insufficient funds' });
      }

      const payoutId = `payout_${Date.now()}`;
      const payout = {
        id: payoutId,
        userId,
        walletId: wallet.id,
        amount,
        currency,
        bankAccountId,
        status: 'pending',
        reference: reference || `Payout-${Date.now()}`,
        fees: currency === 'NGN' ? 10 : Math.round(amount * 0.01),
        createdAt: new Date().toISOString(),
      };

      payouts.set(payoutId, payout);

      // Deduct from wallet immediately (simplified)
      wallet.balance -= payout.fees; // Only deduct fees, main amount held as pending
      wallet.pendingBalance += amount;
      wallet.updatedAt = new Date().toISOString();
      wallets.set(`wallet_${userId}`, wallet);

      logger.info('Payout created', { payoutId, userId, amount });

      res.json({ success: true, payout });
    } catch (error: any) {
      logger.error('Create payout error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post('/payout/process',
  body('payoutId').isString(),
  async (req: Request, res: Response) => {
    try {
      const { payoutId } = req.body;
      const payout = payouts.get(payoutId);
      
      if (!payout) {
        return res.status(404).json({ success: false, error: 'Payout not found' });
      }

      if (payout.status !== 'pending') {
        return res.status(400).json({ success: false, error: 'Payout already processed' });
      }

      // Get bank account
      const accounts = bankAccounts.get(payout.userId) || [];
      const bankAccount = accounts.find(a => a.id === payout.bankAccountId);

      if (!bankAccount) {
        return res.status(400).json({ success: false, error: 'Bank account not found' });
      }

      let success = false;
      let providerReference = '';

      if (payout.currency === 'NGN' && process.env.PAYSTACK_SECRET_KEY) {
        // Process with Paystack
        try {
          const response = await axios.post(
            'https://api.paystack.co/transfer',
            {
              source: 'balance',
              amount: payout.amount * 100,
              recipient: {
                type: 'account',
                account_number: bankAccount.accountNumber,
                bank_code: bankAccount.bankCode,
                name: bankAccount.accountHolderName,
              },
              reference: payout.reference,
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          success = response.data.status;
          providerReference = response.data.data?.reference || '';
        } catch (error: any) {
          logger.error('Paystack transfer error:', error.response?.data || error.message);
          success = false;
        }
      } else {
        // For USD, simulate for now (needs Stripe Connect in production)
        logger.info('USD payout - would use Stripe Connect', { payoutId });
        success = true;
        providerReference = `stripe_${Date.now()}`;
      }

      // Update payout status
      payout.status = success ? 'completed' : 'failed';
      payout.provider = payout.currency === 'NGN' ? 'paystack' : 'stripe';
      payout.providerReference = providerReference;
      payout.completedAt = success ? new Date().toISOString() : undefined;
      payouts.set(payoutId, payout);

      // Update wallet
      const wallet = wallets.get(`wallet_${payout.userId}`);
      if (wallet) {
        if (success) {
          wallet.pendingBalance -= payout.amount;
        } else {
          // Refund on failure
          wallet.balance += payout.amount;
          wallet.pendingBalance -= payout.amount;
        }
        wallet.updatedAt = new Date().toISOString();
        wallets.set(`wallet_${payout.userId}`, wallet);
      }

      logger.info('Payout processed', { payoutId, status: payout.status });

      res.json({ success: true, payout });
    } catch (error: any) {
      logger.error('Process payout error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get('/payout/:payoutId', async (req: Request, res: Response) => {
  try {
    const { payoutId } = req.params;
    const payout = payouts.get(payoutId);
    
    if (!payout) {
      return res.status(404).json({ success: false, error: 'Payout not found' });
    }
    
    res.json({ success: true, payout });
  } catch (error: any) {
    logger.error('Get payout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/payout/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userPayouts = Array.from(payouts.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json({ success: true, payouts: userPayouts });
  } catch (error: any) {
    logger.error('Get user payouts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/payout/:payoutId/cancel', async (req: Request, res: Response) => {
  try {
    const { payoutId } = req.params;
    const payout = payouts.get(payoutId);
    
    if (!payout) {
      return res.status(404).json({ success: false, error: 'Payout not found' });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending payouts can be cancelled' });
    }

    payout.status = 'cancelled';
    payout.cancelledAt = new Date().toISOString();
    payouts.set(payoutId, payout);

    // Refund to wallet
    const wallet = wallets.get(`wallet_${payout.userId}`);
    if (wallet) {
      wallet.balance += payout.amount;
      wallet.pendingBalance -= payout.amount;
      wallet.updatedAt = new Date().toISOString();
      wallets.set(`wallet_${payout.userId}`, wallet);
    }

    logger.info('Payout cancelled', { payoutId });

    res.json({ success: true, payout });
  } catch (error: any) {
    logger.error('Cancel payout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============== PLATFORM STATS ==============

router.get('/platform/stats', async (req: Request, res: Response) => {
  try {
    const allPayouts = Array.from(payouts.values());
    const allWallets = Array.from(wallets.values());

    const stats = {
      totalPayouts: allPayouts.length,
      totalPayoutAmount: allPayouts.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0),
      pendingPayouts: allPayouts.filter(p => p.status === 'pending').length,
      totalWalletBalance: allWallets.reduce((sum, w) => sum + w.balance, 0),
    };

    res.json({ success: true, stats });
  } catch (error: any) {
    logger.error('Get platform stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
