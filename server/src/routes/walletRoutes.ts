import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../services/logger.js';

const router = Router();

const wallets: Map<string, any> = new Map();
const transactions: Map<string, any[]> = new Map();

router.post('/create',
  body('userId').isString(),
  body('businessId').isString(),
  body('currency').isString(),
  body('type').optional().isString(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { userId, businessId, currency, type = 'main' } = req.body;
      
      const walletId = `wallet_${Date.now()}`;
      const wallet = {
        id: walletId,
        userId,
        businessId,
        currency,
        type,
        balance: 0,
        pendingBalance: 0,
        availableBalance: 0,
        frozenBalance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      wallets.set(walletId, wallet);
      transactions.set(walletId, []);

      logger.info('Wallet created', { walletId, userId });
      
      res.json({ success: true, wallet });
    } catch (error: any) {
      logger.error('Create wallet error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get('/:walletId', async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;
    const wallet = wallets.get(walletId);
    
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }
    
    res.json({ success: true, wallet });
  } catch (error: any) {
    logger.error('Get wallet error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:walletId/deposit',
  body('amount').isInt({ min: 1 }),
  body('reference').isString(),
  async (req: Request, res: Response) => {
    try {
      const { walletId } = req.params;
      const { amount, reference } = req.body;
      
      const wallet = wallets.get(walletId);
      if (!wallet) {
        return res.status(404).json({ success: false, error: 'Wallet not found' });
      }

      const newBalance = wallet.balance + amount;
      wallet.balance = newBalance;
      wallet.availableBalance = newBalance - wallet.pendingBalance - wallet.frozenBalance;
      wallet.updatedAt = new Date().toISOString();

      const transaction = {
        id: `txn_${Date.now()}`,
        walletId,
        type: 'deposit',
        amount,
        balanceAfter: newBalance,
        reference,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      const walletTransactions = transactions.get(walletId) || [];
      walletTransactions.unshift(transaction);
      transactions.set(walletId, walletTransactions);

      logger.info('Wallet deposit', { walletId, amount, reference });

      res.json({ success: true, transaction, wallet });
    } catch (error: any) {
      logger.error('Wallet deposit error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post('/:walletId/withdraw',
  body('amount').isInt({ min: 1 }),
  body('reference').isString(),
  async (req: Request, res: Response) => {
    try {
      const { walletId } = req.params;
      const { amount, reference } = req.body;
      
      const wallet = wallets.get(walletId);
      if (!wallet) {
        return res.status(404).json({ success: false, error: 'Wallet not found' });
      }

      if (wallet.availableBalance < amount) {
        return res.status(400).json({ success: false, error: 'Insufficient funds' });
      }

      const newBalance = wallet.balance - amount;
      wallet.balance = newBalance;
      wallet.availableBalance = newBalance - wallet.pendingBalance - wallet.frozenBalance;
      wallet.updatedAt = new Date().toISOString();

      const transaction = {
        id: `txn_${Date.now()}`,
        walletId,
        type: 'withdrawal',
        amount: -amount,
        balanceAfter: newBalance,
        reference,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      const walletTransactions = transactions.get(walletId) || [];
      walletTransactions.unshift(transaction);
      transactions.set(walletId, walletTransactions);

      logger.info('Wallet withdrawal', { walletId, amount, reference });

      res.json({ success: true, transaction, wallet });
    } catch (error: any) {
      logger.error('Wallet withdrawal error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get('/:walletId/transactions', async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;
    const { limit = 50 } = req.query;
    
    const walletTransactions = transactions.get(walletId) || [];
    const limitedTransactions = walletTransactions.slice(0, Number(limit));
    
    res.json({ success: true, transactions: limitedTransactions });
  } catch (error: any) {
    logger.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const userWallets = Array.from(wallets.values()).filter(w => w.userId === userId);
    
    res.json({ success: true, wallets: userWallets });
  } catch (error: any) {
    logger.error('Get user wallets error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
