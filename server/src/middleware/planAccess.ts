import { Request, Response, NextFunction } from 'express';

export type MembershipTier = 'free' | 'starter' | 'growth' | 'enterprise';

const TIER_RANK: Record<MembershipTier, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  enterprise: 3,
};

const FEATURE_MIN_TIER: Record<string, MembershipTier> = {
  'deal-room': 'starter',
  'trade-intelligence': 'starter',
  'ai-advisor': 'growth',
  'escrow-transactions': 'starter',
};

function normalizeTier(raw: unknown): MembershipTier {
  if (raw === 'starter' || raw === 'growth' || raw === 'enterprise') return raw;
  return 'free';
}

export function getRequestTier(req: Request): MembershipTier {
  const headerTier = req.headers['x-membership-tier'];
  const bodyTier = (req.body as any)?.membershipTier;
  const queryTier = (req.query as any)?.membershipTier;
  const tier = Array.isArray(headerTier) ? headerTier[0] : headerTier || bodyTier || queryTier;
  return normalizeTier(tier);
}

export function hasTierAccess(currentTier: MembershipTier, requiredTier: MembershipTier): boolean {
  return TIER_RANK[currentTier] >= TIER_RANK[requiredTier];
}

export function requirePlan(requiredTier: MembershipTier) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tier = getRequestTier(req);
    if (!hasTierAccess(tier, requiredTier)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient plan access',
        currentTier: tier,
        requiredTier,
      });
    }
    next();
  };
}

export function getFeatureRequiredTier(feature: string): MembershipTier {
  return FEATURE_MIN_TIER[feature] || 'enterprise';
}

export function canAccessFeature(tier: MembershipTier, feature: string): boolean {
  const requiredTier = getFeatureRequiredTier(feature);
  return hasTierAccess(tier, requiredTier);
}

