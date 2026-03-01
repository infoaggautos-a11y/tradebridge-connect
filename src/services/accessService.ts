import { MembershipTier } from '@/data/mockData';
import { API_URL, getAccessHeaders } from '@/config/api';
import { getFeatureRequiredTier, hasPlanAccess } from '@/lib/planAccess';

export interface AccessContext {
  userId?: string;
  membershipTier?: MembershipTier;
}

export interface FeatureAccessResult {
  allowed: boolean;
  currentTier: MembershipTier;
  requiredTier: MembershipTier;
}

export interface EscrowUsageResult {
  allowed: boolean;
  currentTier: MembershipTier;
  used: number;
  limit: number;
}

const normalizeTier = (tier?: string): MembershipTier => {
  if (tier === 'starter' || tier === 'growth' || tier === 'enterprise') return tier;
  return 'free';
};

export async function checkFeatureAccess(feature: string, context?: AccessContext): Promise<FeatureAccessResult> {
  const currentTier = normalizeTier(context?.membershipTier);
  const fallbackRequiredTier = getFeatureRequiredTier(feature);

  try {
    const url = new URL(`${API_URL}/api/subscriptions/access/${feature}`);
    if (context?.userId) url.searchParams.set('userId', context.userId);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAccessHeaders({
        userId: context?.userId,
        membershipTier: currentTier,
      }),
    });

    if (!response.ok) {
      throw new Error(`Access check failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      allowed: !!data.allowed,
      currentTier: normalizeTier(data.currentTier),
      requiredTier: normalizeTier(data.requiredTier),
    };
  } catch {
    // Safe fallback to local rules if backend is unavailable.
    return {
      allowed: hasPlanAccess(currentTier, fallbackRequiredTier),
      currentTier,
      requiredTier: fallbackRequiredTier,
    };
  }
}

export async function getEscrowUsage(context?: AccessContext): Promise<EscrowUsageResult> {
  const currentTier = normalizeTier(context?.membershipTier);
  const fallbackLimit = currentTier === 'starter' ? 2 : currentTier === 'free' ? 0 : -1;

  if (!context?.userId) {
    return { allowed: fallbackLimit === -1 || 0 < fallbackLimit, currentTier, used: 0, limit: fallbackLimit };
  }

  try {
    const url = new URL(`${API_URL}/api/subscriptions/usage/escrow`);
    url.searchParams.set('userId', context.userId);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getAccessHeaders({
        userId: context.userId,
        membershipTier: currentTier,
      }),
    });
    if (!response.ok) {
      throw new Error(`Escrow usage check failed with status ${response.status}`);
    }
    const data = await response.json();
    return {
      allowed: !!data.allowed,
      currentTier: normalizeTier(data.currentTier),
      used: Number(data.used || 0),
      limit: Number(data.limit ?? fallbackLimit),
    };
  } catch {
    return { allowed: fallbackLimit === -1 || 0 < fallbackLimit, currentTier, used: 0, limit: fallbackLimit };
  }
}

export async function consumeEscrowUsage(context?: AccessContext): Promise<EscrowUsageResult> {
  const currentTier = normalizeTier(context?.membershipTier);
  const fallbackLimit = currentTier === 'starter' ? 2 : currentTier === 'free' ? 0 : -1;

  if (!context?.userId) {
    return { allowed: false, currentTier, used: 0, limit: fallbackLimit };
  }

  try {
    const response = await fetch(`${API_URL}/api/subscriptions/usage/escrow/consume`, {
      method: 'POST',
      headers: getAccessHeaders({
        userId: context.userId,
        membershipTier: currentTier,
      }),
      body: JSON.stringify({ userId: context.userId }),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        allowed: false,
        currentTier: normalizeTier(data.currentTier),
        used: Number(data.used || 0),
        limit: Number(data.limit ?? fallbackLimit),
      };
    }
    return {
      allowed: !!data.allowed,
      currentTier: normalizeTier(data.currentTier),
      used: Number(data.used || 0),
      limit: Number(data.limit ?? fallbackLimit),
    };
  } catch {
    return { allowed: false, currentTier, used: 0, limit: fallbackLimit };
  }
}
