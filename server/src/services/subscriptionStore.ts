import { Pool } from 'pg';
import Stripe from 'stripe';
import { MembershipTier } from '../middleware/planAccess.js';
import { PLAN_MAP, PlanTier, resolveTierFromStripe } from '../config/plans.js';

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : null;

let schemaReady = false;

export async function ensureSubscriptionSchema(): Promise<void> {
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
      tier TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'active',
      customer_id TEXT,
      stripe_price_id TEXT,
      stripe_product_id TEXT,
      billing_cycle TEXT,
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

  await pool.query(`ALTER TABLE app_subscriptions ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'free';`);
  await pool.query(`ALTER TABLE app_subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;`);
  await pool.query(`ALTER TABLE app_subscriptions ADD COLUMN IF NOT EXISTS stripe_product_id TEXT;`);
  await pool.query(`ALTER TABLE app_subscriptions ADD COLUMN IF NOT EXISTS billing_cycle TEXT;`);

  schemaReady = true;
}

export function getSubscriptionPool(): Pool | null {
  return pool;
}

export async function getUserTier(userId: string): Promise<MembershipTier | null> {
  if (!pool) return null;
  await ensureSubscriptionSchema();
  const result = await pool.query(`SELECT membership_tier FROM app_users WHERE user_id = $1 LIMIT 1`, [userId]);
  return (result.rows[0]?.membership_tier as MembershipTier) || null;
}

export async function upsertUserTier(userId: string, tier: string, stripeCustomerId?: string): Promise<void> {
  if (!pool) return;
  await ensureSubscriptionSchema();

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

export async function getStripeCustomerIdForUser(userId: string): Promise<string | null> {
  if (!pool) return null;
  await ensureSubscriptionSchema();
  const result = await pool.query(`SELECT stripe_customer_id FROM app_users WHERE user_id = $1 LIMIT 1`, [userId]);
  return result.rows[0]?.stripe_customer_id || null;
}

export async function setUserStripeCustomerId(userId: string, customerId: string): Promise<void> {
  await upsertUserTier(userId, 'free', customerId);
}

export async function getUserByStripeCustomerId(customerId: string): Promise<{ userId: string; membershipTier: MembershipTier } | null> {
  if (!pool) return null;
  await ensureSubscriptionSchema();
  const result = await pool.query(
    `SELECT user_id, membership_tier FROM app_users WHERE stripe_customer_id = $1 LIMIT 1`,
    [customerId]
  );

  if (!result.rows[0]) return null;

  return {
    userId: result.rows[0].user_id,
    membershipTier: result.rows[0].membership_tier as MembershipTier,
  };
}

export async function getActiveUserSubscription(userId: string): Promise<any | null> {
  if (!pool) return null;
  await ensureSubscriptionSchema();

  const result = await pool.query(
    `
      SELECT *
      FROM app_subscriptions
      WHERE user_id = $1
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

export async function getSubscriptionById(subscriptionId: string): Promise<any | null> {
  if (!pool) return null;
  await ensureSubscriptionSchema();

  const result = await pool.query(`SELECT * FROM app_subscriptions WHERE id = $1 LIMIT 1`, [subscriptionId]);
  return result.rows[0] || null;
}

export async function saveSubscriptionRecord(data: {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  tier: MembershipTier | PlanTier | 'enterprise' | 'free';
  status: string;
  customerId?: string;
  stripePriceId?: string;
  stripeProductId?: string;
  billingCycle?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  if (!pool) return;
  await ensureSubscriptionSchema();

  await pool.query(
    `
      INSERT INTO app_subscriptions (
        id,
        user_id,
        plan_id,
        plan_name,
        tier,
        status,
        customer_id,
        stripe_price_id,
        stripe_product_id,
        billing_cycle,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
      ON CONFLICT (id) DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        plan_name = EXCLUDED.plan_name,
        tier = EXCLUDED.tier,
        status = EXCLUDED.status,
        customer_id = COALESCE(EXCLUDED.customer_id, app_subscriptions.customer_id),
        stripe_price_id = COALESCE(EXCLUDED.stripe_price_id, app_subscriptions.stripe_price_id),
        stripe_product_id = COALESCE(EXCLUDED.stripe_product_id, app_subscriptions.stripe_product_id),
        billing_cycle = COALESCE(EXCLUDED.billing_cycle, app_subscriptions.billing_cycle),
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at_period_end = COALESCE(EXCLUDED.cancel_at_period_end, app_subscriptions.cancel_at_period_end),
        updated_at = NOW()
    `,
    [
      data.id,
      data.userId,
      data.planId,
      data.planName,
      data.tier,
      data.status,
      data.customerId || null,
      data.stripePriceId || null,
      data.stripeProductId || null,
      data.billingCycle || null,
      data.currentPeriodStart || null,
      data.currentPeriodEnd || null,
      data.cancelAtPeriodEnd ?? false,
    ]
  );
}

function getBillingCycle(interval: Stripe.Price.Recurring.Interval | null | undefined): string | undefined {
  if (interval === 'year') return 'annual';
  if (interval === 'month') return 'monthly';
  return undefined;
}

export async function persistStripeSubscription(
  subscription: Stripe.Subscription,
  fallbackUserId?: string
): Promise<{ userId: string | null; tier: MembershipTier }> {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  const price = subscription.items.data[0]?.price;
  const priceId = price?.id || null;
  const productId = typeof price?.product === 'string' ? price.product : null;

  const metadataUserId = subscription.metadata?.userId;
  let userId = metadataUserId || fallbackUserId || null;

  if (!userId && customerId) {
    const userFromCustomer = await getUserByStripeCustomerId(customerId);
    userId = userFromCustomer?.userId || null;
  }

  const planTier = resolveTierFromStripe(priceId, productId);
  const mapped = planTier ? PLAN_MAP[planTier] : null;
  const paidTier = (mapped?.tier as MembershipTier) || 'free';
  const tier = subscription.status === 'active' || subscription.status === 'trialing' ? paidTier : 'free';

  if (userId) {
    const planId = mapped?.tier || planTier || 'free';
    const planName = mapped?.name || 'Free';

    await saveSubscriptionRecord({
      id: subscription.id,
      userId,
      planId,
      planName,
      tier,
      status: subscription.status,
      customerId: customerId || undefined,
      stripePriceId: priceId || undefined,
      stripeProductId: productId || undefined,
      billingCycle: getBillingCycle(price?.recurring?.interval),
      currentPeriodStart: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : undefined,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    await upsertUserTier(userId, tier, customerId || undefined);
  }

  return { userId, tier };
}
