export type BillingCycle = 'monthly' | 'annual';
export type StripeTier = 'starter' | 'growth';

export const STRIPE_TIERS: Record<
  StripeTier,
  {
    product_id: string;
    name: string;
    monthlyPrice: number;
    annualMonthlyPrice: number;
    annualPrice: number;
    monthlyPriceId: string;
    annualPriceId: string;
  }
> = {
  starter: {
    product_id: import.meta.env.VITE_STRIPE_STARTER_PRODUCT_ID || 'prod_U4cYy6J41GDHGw',
    name: 'Pro',
    monthlyPrice: 16,
    annualMonthlyPrice: 13,
    annualPrice: 156,
    monthlyPriceId: import.meta.env.VITE_STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_1T6TJpEPAQKb2xdh60Q4Juwp',
    annualPriceId: import.meta.env.VITE_STRIPE_STARTER_ANNUAL_PRICE_ID || 'price_1T6TJqEPAQKb2xdhETUXy6Sy',
  },
  growth: {
    product_id: import.meta.env.VITE_STRIPE_GROWTH_PRODUCT_ID || 'prod_U4cYGtrCr3CGsu',
    name: 'Business',
    monthlyPrice: 24,
    annualMonthlyPrice: 19,
    annualPrice: 228,
    monthlyPriceId: import.meta.env.VITE_STRIPE_GROWTH_MONTHLY_PRICE_ID || 'price_1T6TJrEPAQKb2xdh3LmM48gg',
    annualPriceId: import.meta.env.VITE_STRIPE_GROWTH_ANNUAL_PRICE_ID || 'price_1T6TJrEPAQKb2xdhBB3j1taO',
  },
};

export function getPriceIdForTier(tier: StripeTier, billingCycle: BillingCycle): string {
  const config = STRIPE_TIERS[tier];
  return billingCycle === 'annual' ? config.annualPriceId : config.monthlyPriceId;
}

export function getTierByProductId(productId: string): StripeTier | null {
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config.product_id && config.product_id === productId) return tier as StripeTier;
  }
  return null;
}
