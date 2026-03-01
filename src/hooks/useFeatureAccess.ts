import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { checkFeatureAccess, FeatureAccessResult } from '@/services/accessService';

interface UseFeatureAccessState extends FeatureAccessResult {
  loading: boolean;
}

export function useFeatureAccess(feature: string): UseFeatureAccessState {
  const { user } = useAuth();
  const [state, setState] = useState<UseFeatureAccessState>({
    loading: true,
    allowed: false,
    currentTier: user?.membershipTier || 'free',
    requiredTier: 'enterprise',
  });

  useEffect(() => {
    let active = true;

    if (!user) {
      setState({
        loading: false,
        allowed: false,
        currentTier: 'free',
        requiredTier: 'enterprise',
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    checkFeatureAccess(feature, { userId: user.id, membershipTier: user.membershipTier })
      .then((result) => {
        if (!active) return;
        setState({ ...result, loading: false });
      })
      .catch(() => {
        if (!active) return;
        setState((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      active = false;
    };
  }, [feature, user]);

  return state;
}

