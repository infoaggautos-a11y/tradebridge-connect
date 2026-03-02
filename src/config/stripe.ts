// Stripe product and price IDs - production values
export const STRIPE_TIERS = {
  starter: {
    product_id: 'prod_U49k5o50AtZql7',
    price_id: 'price_1T61RDEPAQKb2xdhewPJIIYX',
    name: 'Pro',
    monthlyPrice: 49,
  },
  growth: {
    product_id: 'prod_U4YjlS1UbBEeVV',
    price_id: 'price_1T6PcGEPAQKb2xdhR1RUYwWY',
    name: 'Business',
    monthlyPrice: 149,
  },
} as const;

export type StripeTier = keyof typeof STRIPE_TIERS;

export function getTierByProductId(productId: string): StripeTier | null {
  for (const [tier, config] of Object.entries(STRIPE_TIERS)) {
    if (config.product_id === productId) return tier as StripeTier;
  }
  return null;
}
