import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MembershipTier } from '@/data/mockData';
import { hasPlanAccess } from '@/lib/planAccess';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface PlanProtectedRouteProps {
  children: ReactNode;
  requiredTier: MembershipTier;
  feature: string;
}

export function PlanProtectedRoute({ children, requiredTier, feature }: PlanProtectedRouteProps) {
  const { user } = useAuth();
  const access = useFeatureAccess(feature);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (access.loading) {
    return <div className="p-6 text-sm text-muted-foreground">Checking access...</div>;
  }

  if (!access.allowed || !hasPlanAccess(user.membershipTier, requiredTier)) {
    return <Navigate to={`/subscription?upgrade=${feature}`} replace />;
  }

  return <>{children}</>;
}
