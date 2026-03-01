import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const db = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null;

let initialized = false;

async function ensureSchema() {
  if (!db || initialized) return;

  await db.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      membership_tier TEXT NOT NULL DEFAULT 'free',
      stripe_customer_id TEXT,
      paystack_customer_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS app_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      stripe_subscription_id TEXT,
      paystack_sub_code TEXT,
      current_period_start TIMESTAMPTZ,
      current_period_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS app_payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_payment_id TEXT,
      paystack_ref TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  initialized = true;
}

const makeId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default db;

export async function findOrCreateUser(email: string, name?: string) {
  if (!db) return null;
  await ensureSchema();

  const existing = await db.query(`SELECT * FROM app_users WHERE email = $1 LIMIT 1`, [email]);
  if (existing.rows[0]) return existing.rows[0];

  const id = makeId('usr');
  const created = await db.query(
    `INSERT INTO app_users (id, email, name) VALUES ($1,$2,$3) RETURNING *`,
    [id, email, name || email.split('@')[0]]
  );
  return created.rows[0];
}

export async function updateUserTier(userId: string, tier: string) {
  if (!db) return null;
  await ensureSchema();
  const result = await db.query(
    `UPDATE app_users SET membership_tier = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [userId, tier]
  );
  return result.rows[0] || null;
}

export async function createOrUpdateSubscription(data: {
  userId: string;
  planId: string;
  planName: string;
  stripeSubscriptionId?: string;
  paystackSubCode?: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}) {
  if (!db) return null;
  await ensureSchema();

  const existing = await db.query(
    `
      SELECT * FROM app_subscriptions
      WHERE user_id = $1 AND plan_id = $2 AND status = ANY($3::text[])
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [data.userId, data.planId, ['active', 'trialing', 'past_due']]
  );

  if (existing.rows[0]) {
    const updated = await db.query(
      `
        UPDATE app_subscriptions
        SET status = $2,
            current_period_start = $3,
            current_period_end = $4,
            stripe_subscription_id = COALESCE($5, stripe_subscription_id),
            paystack_sub_code = COALESCE($6, paystack_sub_code),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        existing.rows[0].id,
        data.status,
        data.currentPeriodStart || null,
        data.currentPeriodEnd || null,
        data.stripeSubscriptionId || null,
        data.paystackSubCode || null,
      ]
    );
    return updated.rows[0];
  }

  const created = await db.query(
    `
      INSERT INTO app_subscriptions (
        id, user_id, plan_id, plan_name, stripe_subscription_id, paystack_sub_code, status,
        current_period_start, current_period_end
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `,
    [
      makeId('sub'),
      data.userId,
      data.planId,
      data.planName,
      data.stripeSubscriptionId || null,
      data.paystackSubCode || null,
      data.status,
      data.currentPeriodStart || null,
      data.currentPeriodEnd || null,
    ]
  );
  return created.rows[0];
}

export async function createPayment(data: {
  userId: string;
  amount: number;
  currency: string;
  type: string;
  provider: string;
  reference: string;
  status: string;
  stripePaymentId?: string;
  paystackRef?: string;
  metadata?: any;
}) {
  if (!db) return null;
  await ensureSchema();

  const created = await db.query(
    `
      INSERT INTO app_payments (
        id, user_id, amount, currency, type, provider, reference, status,
        stripe_payment_id, paystack_ref, metadata
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `,
    [
      makeId('pay'),
      data.userId,
      data.amount,
      data.currency,
      data.type,
      data.provider,
      data.reference,
      data.status,
      data.stripePaymentId || null,
      data.paystackRef || null,
      data.metadata || null,
    ]
  );
  return created.rows[0];
}

export async function updatePaymentStatus(reference: string, status: string) {
  if (!db) return { rowCount: 0 };
  await ensureSchema();
  const result = await db.query(
    `UPDATE app_payments SET status = $2, updated_at = NOW() WHERE reference = $1`,
    [reference, status]
  );
  return result;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  if (!db) return null;
  await ensureSchema();
  const result = await db.query(
    `SELECT * FROM app_subscriptions WHERE stripe_subscription_id = $1 LIMIT 1`,
    [stripeSubscriptionId]
  );
  return result.rows[0] || null;
}

export async function getSubscriptionByUserId(userId: string) {
  if (!db) return null;
  await ensureSchema();
  const result = await db.query(
    `
      SELECT * FROM app_subscriptions
      WHERE user_id = $1 AND status = ANY($2::text[])
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId, ['active', 'trialing', 'past_due']]
  );
  return result.rows[0] || null;
}

export const PLAN_MAP: Record<string, { name: string; tier: string }> = {
  starter: { name: 'Starter', tier: 'starter' },
  growth: { name: 'Growth', tier: 'growth' },
  enterprise: { name: 'Enterprise', tier: 'enterprise' },
};

export async function checkDatabaseHealth(): Promise<{
  status: 'ok' | 'degraded';
  configured: boolean;
  latencyMs: number | null;
  error?: string;
}> {
  if (!db) {
    return {
      status: 'degraded',
      configured: false,
      latencyMs: null,
      error: 'DATABASE_URL not set',
    };
  }

  const start = Date.now();
  try {
    await db.query('SELECT 1');
    return {
      status: 'ok',
      configured: true,
      latencyMs: Date.now() - start,
    };
  } catch (error: any) {
    return {
      status: 'degraded',
      configured: true,
      latencyMs: Date.now() - start,
      error: error?.message || 'Database query failed',
    };
  }
}
