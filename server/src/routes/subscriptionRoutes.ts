import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Stripe from 'stripe';
import { logger } from '../services/logger.js';
import { canAccessFeature, getFeatureRequiredTier, getRequestTier, MembershipTier } from '../middleware/planAccess.js';
import { PLANS, isPlanTier, isBillingCycle, getPlanPriceConfig } from '../config/plans.js';
import {
  ensureSubscriptionSchema,
  getSubscriptionPool,
  getUserTier,
  getStripeCustomerIdForUser,
  setUserStripeCustomerId,
  getActiveUserSubscription,
} from '../services/subscriptionStore.js';

const router = Router();

const ESCROW_LIMIT_BY_TIER: Record<MembershipTier, number> = {
  free: 0,
  starter: 2,
  growth: -1,
  enterprise: -1,
};

const getUsageMonth = (date = new Date()): string =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

function getStripeClient(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing on backend');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
}

function getFrontendUrl(): string {
  const configured = process.env.FRONTEND_URL?.split(',')[0]?.trim();
  return configured || 'http://localhost:5173';
}

router.get('/plans', async (_req: Request, res: Response) => {
  const plans = Object.values(PLANS).map((plan) => ({
    tier: plan.tier,
    name: plan.name,
    monthly: {
      amount: plan.monthly.amount,
      interval: plan.monthly.interval,
    },
    annual: {
      amount: plan.annual.amount,
      interval: plan.annual.interval,
    },
  }));

  res.json({
    success: true,
    plans,
  });
});

router.post(
  '/stripe/checkout-session',
  body('userId').isString().notEmpty(),
  body('planTier').isString().notEmpty(),
  body('billingCycle').optional().isString(),
  body('email').optional().isEmail(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { userId, planTier, billingCycle = 'annual', email } = req.body as {
        userId: string;
        planTier: string;
        billingCycle?: string;
        email?: string;
      };

      if (!isPlanTier(planTier)) {
        return res.status(400).json({ success: false, error: 'Invalid plan tier. Use starter or growth.' });
      }

      if (!isBillingCycle(billingCycle)) {
        return res.status(400).json({ success: false, error: 'Invalid billing cycle. Use monthly or annual.' });
      }

      const selectedPrice = getPlanPriceConfig(planTier, billingCycle);
      if (!selectedPrice.priceId) {
        return res.status(500).json({
          success: false,
          error: `Stripe price ID missing for ${planTier} ${billingCycle}. Set backend env vars first.`,
        });
      }

      await ensureSubscriptionSchema();
      const stripe = getStripeClient();

      let customerId = await getStripeCustomerIdForUser(userId);
      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
          metadata: { userId },
        });
        customerId = customer.id;
        await setUserStripeCustomerId(userId, customer.id);
      }

      const frontendUrl = getFrontendUrl();
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{ price: selectedPrice.priceId, quantity: 1 }],
        success_url: `${frontendUrl}/subscription?success=true`,
        cancel_url: `${frontendUrl}/subscription?canceled=true`,
        allow_promotion_codes: true,
        client_reference_id: userId,
        subscription_data: {
          trial_period_days: 14,
          metadata: {
            userId,
            planTier,
            billingCycle,
          },
        },
        metadata: {
          userId,
          planTier,
          billingCycle,
        },
      });

      logger.info('Checkout session created', {
        userId,
        planTier,
        billingCycle,
        sessionId: session.id,
      });

      return res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
      });
    } catch (error: any) {
      logger.error('Create checkout session error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.post(
  '/stripe/customer-portal',
  body('userId').isString().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { userId } = req.body as { userId: string };

      await ensureSubscriptionSchema();
      const customerId = await getStripeCustomerIdForUser(userId);
      if (!customerId) {
        return res.status(404).json({ success: false, error: 'No Stripe customer found for this user.' });
      }

      const stripe = getStripeClient();
      const frontendUrl = getFrontendUrl();

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${frontendUrl}/subscription`,
      });

      return res.json({ success: true, url: session.url });
    } catch (error: any) {
      logger.error('Create customer portal session error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    await ensureSubscriptionSchema();
    const userTier = (await getUserTier(userId)) || 'free';
    const subscription = await getActiveUserSubscription(userId);

    const status = subscription?.status;
    const subscribed = status === 'active' || status === 'trialing';

    return res.json({
      success: true,
      tier: userTier,
      subscribed,
      subscription_status: status || null,
      subscription_end: subscription?.current_period_end || null,
      product_id: subscription?.stripe_product_id || null,
      plan_id: subscription?.plan_id || null,
    });
  } catch (error: any) {
    logger.error('Get subscription status error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post(
  '/stripe/cancel',
  body('subscriptionId').isString(),
  async (req: Request, res: Response) => {
    try {
      const { subscriptionId, immediately } = req.body;

      const stripe = getStripeClient();
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
      });

      const pool = getSubscriptionPool();
      if (pool) {
        await ensureSubscriptionSchema();
        await pool.query(
          `
            UPDATE app_subscriptions
            SET status = $2, cancel_at_period_end = $3, updated_at = NOW()
            WHERE id = $1
          `,
          [subscriptionId, immediately ? 'canceled' : subscription.status, !immediately]
        );
      }

      logger.info('Subscription cancellation updated', { subscriptionId, immediately });

      return res.json({ success: true, subscription });
    } catch (error: any) {
      logger.error('Cancel subscription error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

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

    return res.json({
      success: true,
      feature,
      allowed,
      currentTier: tier,
      requiredTier,
    });
  } catch (error: any) {
    logger.error('Feature access check error:', error);
    return res.status(500).json({ success: false, error: error.message });
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

    const pool = getSubscriptionPool();
    let used = 0;
    if (pool) {
      await ensureSubscriptionSchema();
      const usageMonth = getUsageMonth();
      const usageRes = await pool.query(
        `SELECT used_count FROM app_escrow_usage WHERE user_id = $1 AND usage_month = $2 LIMIT 1`,
        [userId, usageMonth]
      );
      used = Number(usageRes.rows[0]?.used_count || 0);
    }

    const limit = ESCROW_LIMIT_BY_TIER[tier];
    const allowed = limit === -1 || used < limit;

    return res.json({
      success: true,
      userId,
      currentTier: tier,
      used,
      limit,
      allowed,
    });
  } catch (error: any) {
    logger.error('Escrow usage check error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post(
  '/usage/escrow/consume',
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

      const pool = getSubscriptionPool();
      if (pool) {
        await ensureSubscriptionSchema();
        const usageMonth = getUsageMonth();
        const client = await pool.connect();

        try {
          await client.query('BEGIN');
          const currentRes = await client.query(
            `SELECT used_count FROM app_escrow_usage WHERE user_id = $1 AND usage_month = $2 FOR UPDATE`,
            [userId, usageMonth]
          );
          const used = Number(currentRes.rows[0]?.used_count || 0);

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

      const limit = ESCROW_LIMIT_BY_TIER[tier];
      if (limit === 0) {
        return res.status(403).json({
          success: false,
          error: 'Escrow monthly limit reached for current plan',
          userId,
          currentTier: tier,
          used: 0,
          limit,
          allowed: false,
        });
      }

      return res.json({
        success: true,
        userId,
        currentTier: tier,
        used: 1,
        limit,
        allowed: limit === -1 || 1 < limit,
      });
    } catch (error: any) {
      logger.error('Escrow usage consume error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
