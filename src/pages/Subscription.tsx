import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { membershipPlans } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, CreditCard, Loader2, Settings, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { STRIPE_TIERS, BillingCycle } from '@/config/stripe';
import { getApiUrl } from '@/config/api';

export default function SubscriptionPage() {
  const { user, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');

  const currentTier = user?.membershipTier || 'free';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({ title: 'Payment Successful!', description: 'Your subscription is now active. It may take a moment to update.' });
      window.history.replaceState({}, '', '/subscription');
      refreshSubscription();
    }
    if (params.get('canceled') === 'true') {
      toast({ title: 'Checkout Canceled', description: 'You can subscribe anytime.' });
      window.history.replaceState({}, '', '/subscription');
    }
  }, [toast, refreshSubscription]);

  const handleSubscribe = async (planTier: string) => {
    if (planTier === 'free') return;
    if (planTier === 'enterprise') {
      navigate('/contact');
      return;
    }
    if (!user?.id) {
      toast({ title: 'Authentication required', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }

    const stripeConfig = STRIPE_TIERS[planTier as keyof typeof STRIPE_TIERS];
    if (!stripeConfig) return;

    setLoadingPlan(planTier);
    try {
      const response = await fetch(getApiUrl('/api/subscriptions/stripe/checkout-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          planTier,
          billingCycle,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Could not start checkout');
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({ title: 'Error', description: error.message || 'Could not start checkout', variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.id) {
      toast({ title: 'Authentication required', description: 'Please log in and try again.', variant: 'destructive' });
      return;
    }
    setLoadingPortal(true);
    try {
      const response = await fetch(getApiUrl('/api/subscriptions/stripe/customer-portal'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Could not open subscription management');
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Could not open subscription management', variant: 'destructive' });
    } finally {
      setLoadingPortal(false);
    }
  };

  const currentPlan = membershipPlans.find(p => p.tier === currentTier) || membershipPlans[0];

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Subscription Management</h1>

        {/* Current Plan */}
        <Card>
          <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{currentPlan.name}</div>
              <div className="text-muted-foreground">
                {currentTier === 'free' ? 'Free forever' : user?.subscribed ? `Active until ${new Date(user.subscriptionEnd || '').toLocaleDateString()}` : 'No active subscription'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gold/20 text-gold-dark">{currentPlan.name}</Badge>
              {user?.subscribed && (
                <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={loadingPortal}>
                  {loadingPortal ? <Loader2 className="h-3 w-3 animate-spin" /> : <Settings className="h-3 w-3 mr-1" />}
                  Manage
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose the plan that best fits your business needs. All paid plans include a 14-day free trial.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg border border-border bg-background p-1">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm rounded-md transition ${billingCycle === 'monthly' ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground'}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm rounded-md transition ${billingCycle === 'annual' ? 'bg-gold text-navy font-semibold' : 'text-muted-foreground'}`}
                  onClick={() => setBillingCycle('annual')}
                >
                  Annual - Save 20%
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {membershipPlans.map((plan) => {
                const stripeConfig = STRIPE_TIERS[plan.tier as keyof typeof STRIPE_TIERS];
                const isCurrent = plan.tier === currentTier;
                const cyclePrice = stripeConfig
                  ? (billingCycle === 'annual' ? stripeConfig.annualMonthlyPrice : stripeConfig.monthlyPrice)
                  : null;
                const price = cyclePrice !== null ? `$${cyclePrice}` : plan.tier === 'free' ? 'Free' : 'Custom';

                return (
                  <div key={plan.tier} className={`p-4 rounded-lg border ${isCurrent ? 'border-gold bg-gold/5' : ''} ${plan.highlighted ? 'ring-2 ring-gold' : ''}`}>
                    <div className="font-semibold mb-1">{plan.name}</div>
                    <div className="text-xs text-muted-foreground mb-1">{plan.subtitle}</div>
                    <div className="text-lg font-bold mb-1">{price}{stripeConfig ? '/mo' : ''}</div>
                    {stripeConfig && billingCycle === 'annual' && (
                      <div className="text-[11px] text-muted-foreground mb-1">Billed as ${stripeConfig.annualPrice}/year</div>
                    )}
                    {plan.trialAvailable && <div className="text-xs text-green-600 mb-2">14-day free trial</div>}

                    <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Badge variant="outline">Current Plan</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant={plan.highlighted ? 'default' : 'outline'}
                        className="w-full"
                        disabled={loadingPlan === plan.tier}
                        onClick={() => handleSubscribe(plan.tier)}
                      >
                        {loadingPlan === plan.tier ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : plan.tier === 'enterprise' ? (
                          'Contact Sales'
                        ) : plan.tier === 'free' ? (
                          'Free'
                        ) : (
                          <>
                            <ArrowUp className="h-3 w-3 mr-1" />Start Free Trial
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader><CardTitle className="text-blue-800">Payment & Billing</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <CreditCard className="h-4 w-4" />
              <span>Secure payment powered by Stripe</span>
            </div>
            {user?.subscribed && (
              <p className="text-xs text-blue-600 mt-2">
                Use the "Manage" button above to update payment methods, change plans, or cancel.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}
