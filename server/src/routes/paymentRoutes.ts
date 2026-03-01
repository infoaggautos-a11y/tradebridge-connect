import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { body, validationResult } from 'express-validator';
import { createPaymentIntent, verifyPayment, createRefund } from '../services/stripeService.js';
import { logger } from '../services/logger.js';

const router = Router();

const SUBSCRIPTION_PRICES: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_starter_monthly',
  growth: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID || 'price_growth_monthly',
  enterprise: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
};

const PLAN_MAP: Record<string, { name: string; tier: string }> = {
  starter: { name: 'Starter', tier: 'starter' },
  growth: { name: 'Growth', tier: 'growth' },
  enterprise: { name: 'Enterprise', tier: 'enterprise' },
};

const subscriptions: Map<string, any> = new Map();
const users: Map<string, any> = new Map();

router.post('/stripe/create-subscription',
  body('userId').isString(),
  body('planId').isString(),
  body('priceId').optional().isString(),
  body('amount').optional().isInt(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { userId, planId, priceId, amount } = req.body;
      
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2023-10-16',
      });

      const customerEmail = `user_${userId}@diltradebridge.com`;
      
      let customer: Stripe.Customer;
      try {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { userId, planId },
        });
      } catch (err) {
        logger.error('Customer creation error:', err);
        throw new Error('Failed to create customer');
      }

      const priceIdToUse = priceId || SUBSCRIPTION_PRICES[planId] || `price_${planId}_monthly`;

      let subscriptionPriceId = priceIdToUse;
      
      try {
        await stripe.prices.retrieve(priceIdToUse);
      } catch {
        const newPrice = await stripe.prices.create({
          unit_amount: amount || 4900,
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: { name: `DIL ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan` },
        });
        subscriptionPriceId = newPrice.id;
      }

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: subscriptionPriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: { userId, planId },
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

      const planInfo = PLAN_MAP[planId] || { name: planId, tier: planId };
      
      subscriptions.set(subscription.id, {
        id: subscription.id,
        userId,
        planId,
        planName: planInfo.name,
        status: 'active',
        customerId: customer.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      users.set(userId, {
        ...users.get(userId),
        membershipTier: planInfo.tier,
        stripeCustomerId: customer.id,
      });

      logger.info('Subscription created', { subscriptionId: subscription.id, userId, planId });

      res.json({
        success: true,
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret || null,
        customerId: customer.id,
        tier: planInfo.tier,
      });
    } catch (error: any) {
      logger.error('Create subscription error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post('/stripe/create-intent',
  body('amount').isInt({ min: 100 }),
  body('currency').isString(),
  body('reference').isString(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { amount, currency, reference, metadata } = req.body;
      
      const paymentIntent = await createPaymentIntent({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        reference,
        metadata,
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      });
    } catch (error: any) {
      logger.error('Stripe create intent error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.post('/stripe/confirm-intent',
  body('paymentIntentId').isString(),
  body('paymentMethodId').isString(),
  async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;
      
      const result = await verifyPayment(paymentIntentId, paymentMethodId);
      
      res.json({ success: true, result });
    } catch (error: any) {
      logger.error('Stripe confirm intent error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post('/stripe/refund',
  body('paymentIntentId').isString(),
  body('amount').optional().isInt({ min: 1 }),
  async (req: Request, res: Response) => {
    try {
      const { paymentIntentId, amount, reason } = req.body;
      
      const refund = await createRefund(paymentIntentId, amount, reason);
      
      res.json({ success: true, refund });
    } catch (error: any) {
      logger.error('Stripe refund error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post('/stripe/verify-card',
  body('cardNumber').isString(),
  body('expiryMonth').isInt({ min: 1, max: 12 }),
  body('expiryYear').isInt({ min: 2024 }),
  async (req: Request, res: Response) => {
    try {
      const { cardNumber, expiryMonth, expiryYear } = req.body;
      
      const result = await verifyCard(cardNumber, expiryMonth, expiryYear);
      
      res.json({ success: true, valid: result });
    } catch (error: any) {
      logger.error('Stripe card verify error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

async function verifyCard(cardNumber: string, expiryMonth: number, expiryYear: number): Promise<boolean> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
  });

  try {
    const token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: expiryMonth,
        exp_year: expiryYear,
        cvc: '123',
      } as any,
    } as any);
    return !!token.id;
  } catch {
    return false;
  }
}

router.post('/paystack/initialize',
  body('amount').isInt({ min: 100 }),
  body('currency').isString(),
  body('reference').isString(),
  async (req: Request, res: Response) => {
    try {
      const { amount, currency, reference, email, metadata } = req.body;
      
      const initialized = await initializePaystackPayment({
        amount: Math.round(amount),
        currency,
        reference,
        email: email || 'customer@email.com',
        metadata,
      });

      res.json({
        success: true,
        data: initialized.data,
      });
    } catch (error: any) {
      logger.error('Paystack initialize error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get('/paystack/verify/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    
    const result = await verifyPaystackPayment(reference);
    
    res.json(result);
  } catch (error: any) {
    logger.error('Paystack verify error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/paystack/check-card',
  body('cardNumber').isString(),
  body('expiryMonth').isInt({ min: 1, max: 12 }),
  body('expiryYear').isInt({ min: 2024 }),
  async (req: Request, res: Response) => {
    try {
      const { cardNumber, expiryMonth, expiryYear } = req.body;
      
      const result = await checkPaystackCard(cardNumber, expiryMonth, expiryYear);
      
      res.json({ success: true, valid: result });
    } catch (error: any) {
      logger.error('Paystack check card error:', error);
      res.json({ success: true, valid: true });
    }
  }
);

router.post('/paystack/resolve-account',
  body('accountNumber').isString(),
  body('bankCode').isString(),
  async (req: Request, res: Response) => {
    try {
      const { accountNumber, bankCode } = req.body;
      
      const result = await resolveBankAccount(accountNumber, bankCode);
      
      res.json({ success: true, valid: !!result.data, data: result.data });
    } catch (error: any) {
      logger.error('Paystack resolve account error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

async function initializePaystackPayment(params: {
  amount: number;
  currency: string;
  reference: string;
  email: string;
  metadata?: any;
}): Promise<any> {
  const axios = require('axios');
  
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: params.amount,
        currency: params.currency,
        reference: params.reference,
        email: params.email,
        metadata: params.metadata,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    logger.error('Paystack API error:', error.response?.data || error.message);
    return {
      status: false,
      message: error.response?.data?.message || 'Payment initialization failed',
    };
  }
}

async function verifyPaystackPayment(reference: string): Promise<any> {
  const axios = require('axios');
  
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    logger.error('Paystack verify error:', error.response?.data || error.message);
    return { status: false, message: 'Verification failed' };
  }
}

async function checkPaystackCard(cardNumber: string, expiryMonth: number, expiryYear: number): Promise<boolean> {
  const axios = require('axios');
  
  try {
    const response = await axios.post(
      'https://api.paystack.co/charge',
      {
        email: 'customer@email.com',
        amount: 10000,
        card: {
          cvv: '123',
          number: cardNumber,
          expiry_month: expiryMonth,
          expiry_year: expiryYear,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.status;
  } catch {
    return true;
  }
}

async function resolveBankAccount(accountNumber: string, bankCode: string): Promise<any> {
  const axios = require('axios');
  
  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    logger.error('Paystack resolve error:', error.response?.data || error.message);
    return { status: false };
  }
}

export default router;
