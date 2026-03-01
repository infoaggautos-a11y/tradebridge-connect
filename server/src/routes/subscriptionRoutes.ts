import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import { logger } from '../services/logger.js';
import { canAccessFeature, getFeatureRequiredTier, getRequestTier, MembershipTier } from '../middleware/planAccess.js';
import { Pool } from 'pg';

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

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;
let schemaReady = false;

async function ensureSchema() {
  if (!pool || schemaReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      user_id TEXT PRIMARY KEY,
      membership_tier TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      customer_id TEXT,
      current_period_start TIMESTAMPTZ,
      current_period_end TIMESTAMPTZ,
      cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_escrow_usage (
      user_id TEXT NOT NULL,
      usage_month TEXT NOT NULL,
      used_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, usage_month)
    );
  `);

  schemaReady = true;
}

const ESCROW_LIMIT_BY_TIER: Record<MembershipTier, number> = {
  free: 0,
  starter: 2,
  growth: -1,
  enterprise: -1,
};

const getUsageKey = (userId: string, date = new Date()): string => {
  const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return `${userId}:${month}`;
};

const getUsageMonth = (date = new Date()): string =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

async function upsertUserTier(userId: string, tier: string, stripeCustomerId?: string) {
  if (!pool) return;
  await ensureSchema();
  await pool.query(
    `
      INSERT INTO app_users (user_id, membership_tier, stripe_customer_id, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        membership_tier = EXCLUDED.membership_tier,
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, app_users.stripe_customer_id),
        updated_at = NOW()
    `,
    [userId, tier, stripeCustomerId || null]
  );
}

async function saveSubscriptionRecord(data: {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: string;
  customerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}) {
  if (!pool) return;
  await ensureSchema();
  await pool.query(
    `
      INSERT INTO app_subscriptions (
        id, user_id, plan_id, plan_name, status, customer_id, current_period_start, current_period_end, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        updated_at = NOW()
    `,
    [
      data.id,
      data.userId,
      data.planId,
      data.planName,
      data.status,
      data.customerId || null,
      data.currentPeriodStart || null,
      data.currentPeriodEnd || null,
    ]
  );
}

async function getUserTier(userId: string): Promise<MembershipTier | null> {
  if (!pool) return null;
  await ensureSchema();
  const result = await pool.query(`SELECT membership_tier FROM app_users WHERE user_id = $1 LIMIT 1`, [userId]);
  return (result.rows[0]?.membership_tier as MembershipTier) || null;
}

async function getActiveUserSubscription(userId: string): Promise<any | null> {
  if (!pool) return null;
  await ensureSchema();
  const result = await pool.query(
    `
      SELECT * FROM app_subscriptions
      WHERE user_id = $1 AND status = 'active'
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [userId]
  );
  return result.rows[0] || null;
}

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

      await saveSubscriptionRecord({
        id: subscription.id,
        userId,
        planId,
        planName: planInfo.name,
        status: 'active',
        customerId: customer.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await upsertUserTier(userId, planInfo.tier, customer.id);

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

      if (pool) {
        await ensureSchema();
        await pool.query(
          `
            UPDATE app_subscriptions
            SET status = $2, cancel_at_period_end = $3, updated_at = NOW()
            WHERE id = $1
          `,
          [subscriptionId, immediately ? 'canceled' : 'active', !immediately]
        );
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
    const userTier = await getUserTier(userId);
    
    if (!userTier) {
      return res.json({ 
        success: true, 
        subscription: null,
        tier: 'free'
      });
    }

    const userSub = await getActiveUserSubscription(userId);

    res.json({
      success: true,
      subscription: userSub || null,
      tier: userTier || 'free',
    });
  } catch (error: any) {
    logger.error('Get user subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/access/:feature', async (req: Request, res: Response) => {
  try {
    const { feature } = req.params;
    const userId = req.query.userId as string | undefined;

    let tier: MembershipTier = getRequestTier(req);
    if (userId) {
      const dbTier = await getUserTier(userId);
      if (dbTier) {
        tier = dbTier;
      }
    }

    const requiredTier = getFeatureRequiredTier(feature);
    const allowed = canAccessFeature(tier, feature);

    res.json({
      success: true,
      feature,
      allowed,
      currentTier: tier,
      requiredTier,
    });
  } catch (error: any) {
    logger.error('Feature access check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/usage/escrow', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    let tier: MembershipTier = getRequestTier(req);
    const dbTier = await getUserTier(userId);
    if (dbTier) {
      tier = dbTier;
    }

    let used = 0;
    if (pool) {
      await ensureSchema();
      const usageMonth = getUsageMonth();
      const usageRes = await pool.query(
        `SELECT used_count FROM app_escrow_usage WHERE user_id = $1 AND usage_month = $2 LIMIT 1`,
        [userId, usageMonth]
      );
      used = Number(usageRes.rows[0]?.used_count || 0);
    }
    const limit = ESCROW_LIMIT_BY_TIER[tier];
    const allowed = limit === -1 || used < limit;

    res.json({
      success: true,
      userId,
      currentTier: tier,
      used,
      limit,
      allowed,
    });
  } catch (error: any) {
    logger.error('Escrow usage check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/usage/escrow/consume',
  body('userId').isString(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { userId } = req.body;
      let tier: MembershipTier = getRequestTier(req);
      const dbTier = await getUserTier(userId);
      if (dbTier) {
        tier = dbTier;
      }

      const usageMonth = getUsageMonth();
      let used = 0;
      if (pool) {
        await ensureSchema();
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const currentRes = await client.query(
            `SELECT used_count FROM app_escrow_usage WHERE user_id = $1 AND usage_month = $2 FOR UPDATE`,
            [userId, usageMonth]
          );
          used = Number(currentRes.rows[0]?.used_count || 0);

          const limit = ESCROW_LIMIT_BY_TIER[tier];
          if (limit !== -1 && used >= limit) {
            await client.query('ROLLBACK');
            return res.status(403).json({
              success: false,
              error: 'Escrow monthly limit reached for current plan',
              userId,
              currentTier: tier,
              used,
              limit,
              allowed: false,
            });
          }

          const nextUsed = used + 1;
          await client.query(
            `
              INSERT INTO app_escrow_usage (user_id, usage_month, used_count, updated_at)
              VALUES ($1,$2,$3,NOW())
              ON CONFLICT (user_id, usage_month)
              DO UPDATE SET used_count = EXCLUDED.used_count, updated_at = NOW()
            `,
            [userId, usageMonth, nextUsed]
          );
          await client.query('COMMIT');

          return res.json({
            success: true,
            userId,
            currentTier: tier,
            used: nextUsed,
            limit,
            allowed: limit === -1 || nextUsed < limit,
          });
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      }

      const usageKey = getUsageKey(userId);
      const usedMap = 0;
      const limit = ESCROW_LIMIT_BY_TIER[tier];

      if (limit !== -1 && usedMap >= limit) {
        return res.status(403).json({
          success: false,
          error: 'Escrow monthly limit reached for current plan',
          userId,
          currentTier: tier,
          used: usedMap,
          limit,
          allowed: false,
        });
      }

      const nextUsed = usedMap + 1;

      res.json({
        success: true,
        userId,
        currentTier: tier,
        used: nextUsed,
        limit,
        allowed: limit === -1 || nextUsed < limit,
      });
    } catch (error: any) {
      logger.error('Escrow usage consume error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
