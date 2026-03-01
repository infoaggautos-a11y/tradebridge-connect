import { MembershipTier } from '@/data/mockData';

export type PlanFeature = 'deal_room' | 'ai_advisor' | 'trade_intelligence';

const TIER_RANK: Record<MembershipTier, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  enterprise: 3,
};

const FEATURE_MIN_TIER: Record<PlanFeature, MembershipTier> = {
  deal_room: 'starter',
  ai_advisor: 'growth',
  trade_intelligence: 'starter',
};

export const PLAN_DISPLAY_NAMES: Record<MembershipTier, string> = {
  free: 'Explorer',
  starter: 'Pro',
  growth: 'Business',
  enterprise: 'Enterprise',
};

export const ESCROW_MONTHLY_LIMIT: Record<MembershipTier, number> = {
  free: 0,
  starter: 2,
  growth: -1,
  enterprise: -1,
};

export const INTELLIGENCE_LEVEL: Record<MembershipTier, 'none' | 'basic' | 'full' | 'custom'> = {
  free: 'none',
  starter: 'basic',
  growth: 'full',
  enterprise: 'custom',
};

export function hasPlanAccess(userTier: MembershipTier | undefined, requiredTier: MembershipTier): boolean {
  const tier = userTier || 'free';
  return TIER_RANK[tier] >= TIER_RANK[requiredTier];
}

export function canAccessFeature(userTier: MembershipTier | undefined, feature: PlanFeature | string): boolean {
  const requiredTier = getFeatureRequiredTier(feature);
  return hasPlanAccess(userTier, requiredTier);
}

export function getFeatureRequiredTier(feature: PlanFeature | string): MembershipTier {
  return FEATURE_MIN_TIER[feature as PlanFeature] || 'enterprise';
}
