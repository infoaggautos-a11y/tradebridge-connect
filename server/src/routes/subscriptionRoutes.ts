import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
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

// In-memory storage for demo (replace with database in production)
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

      // Save to in-memory storage
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

router.post('/stripe/cancel',
  body('subscriptionId').isString(),
  async (req: Request, res: Response) => {
    try {
      const { subscriptionId, immediately } = req.body;
      
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
        apiVersion: '2023-10-16',
      });

      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
      });

      // Update in-memory storage
      const stored = subscriptions.get(subscriptionId);
      if (stored) {
        stored.status = immediately ? 'canceled' : 'active';
        stored.cancelAtPeriodEnd = !immediately;
      }

      logger.info('Subscription cancelled', { subscriptionId, immediately });

      res.json({ success: true, subscription });
    } catch (error: any) {
      logger.error('Cancel subscription error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get('/stripe/status/:subscriptionId', async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.params;
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    res.json({
      success: true,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } catch (error: any) {
    logger.error('Get subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);
    
    if (!user) {
      return res.json({ 
        success: true, 
        subscription: null,
        tier: 'free'
      });
    }

    // Find active subscription for user
    const userSub = Array.from(subscriptions.values()).find(
      s => s.userId === userId && s.status === 'active'
    );

    res.json({
      success: true,
      subscription: userSub || null,
      tier: user.membershipTier || 'free',
    });
  } catch (error: any) {
    logger.error('Get user subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
