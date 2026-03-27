export type PlanTier = 'starter' | 'growth';
export type BillingCycle = 'monthly' | 'annual';

export interface PlanPriceConfig {
  priceId: string;
  amount: number;
  interval: 'month' | 'year';
}

export interface PlanConfig {
  name: string;
  tier: PlanTier;
  monthly: PlanPriceConfig;
  annual: PlanPriceConfig;
  productId?: string;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  starter: {
    name: 'Pro',
    tier: 'starter',
    monthly: {
      priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_1T6TJpEPAQKb2xdh60Q4Juwp',
      amount: 1600,
      interval: 'month',
    },
    annual: {
      priceId: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || 'price_1T6TJqEPAQKb2xdhETUXy6Sy',
      amount: 15600,
      interval: 'year',
    },
    productId: process.env.STRIPE_STARTER_PRODUCT_ID || 'prod_U4cYy6J41GDHGw',
  },
  growth: {
    name: 'Business',
    tier: 'growth',
    monthly: {
      priceId: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID || 'price_1T6TJrEPAQKb2xdh3LmM48gg',
      amount: 2400,
      interval: 'month',
    },
    annual: {
      priceId: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID || 'price_1T6TJrEPAQKb2xdhBB3j1taO',
      amount: 22800,
      interval: 'year',
    },
    productId: process.env.STRIPE_GROWTH_PRODUCT_ID || 'prod_U4cYGtrCr3CGsu',
  },
};

export const PLAN_MAP: Record<string, { name: string; tier: string }> = {
  starter: { name: PLANS.starter.name, tier: 'starter' },
  growth: { name: PLANS.growth.name, tier: 'growth' },
  enterprise: { name: 'Enterprise', tier: 'enterprise' },
};

export function isPlanTier(value: string): value is PlanTier {
  return value === 'starter' || value === 'growth';
}

export function isBillingCycle(value: string): value is BillingCycle {
  return value === 'monthly' || value === 'annual';
}

export function getPlanPriceConfig(planTier: PlanTier, billingCycle: BillingCycle): PlanPriceConfig {
  return billingCycle === 'annual' ? PLANS[planTier].annual : PLANS[planTier].monthly;
}

export function resolveTierFromStripe(priceId?: string | null, productId?: string | null): PlanTier | null {
  for (const [tier, config] of Object.entries(PLANS) as [PlanTier, PlanConfig][]) {
    if (priceId && (config.monthly.priceId === priceId || config.annual.priceId === priceId)) return tier;
    if (productId && config.productId && config.productId === productId) return tier;
  }
  return null;
}

