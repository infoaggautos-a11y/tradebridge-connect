import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { membershipPlans } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowUp, ArrowDown, CreditCard, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_URL, STRIPE_PUBLISHABLE_KEY, getAccessHeaders } from '@/config/api';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const PLAN_PRICES: Record<string, { monthly: { priceId: string }; annual: { priceId: string } }> = {
  starter: { monthly: { priceId: 'price_pro_monthly' }, annual: { priceId: 'price_pro_annual' } },
  growth: { monthly: { priceId: 'price_business_monthly' }, annual: { priceId: 'price_business_annual' } },
  enterprise: { monthly: { priceId: 'price_enterprise_custom' }, annual: { priceId: 'price_enterprise_custom' } },
};

function CheckoutForm({
  plan,
  amount,
  onSuccess,
  onCancel,
}: {
  plan: typeof membershipPlans[0];
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/subscription?success=true',
      },
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={!stripe || processing} className="flex-1">
          {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Pay ${amount}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPlan = membershipPlans.find(p => p.tier === user?.membershipTier) || membershipPlans[0];
  const currentIdx = membershipPlans.findIndex(p => p.tier === currentPlan.tier);
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof membershipPlans[0] | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const getPlanAmount = (plan: typeof membershipPlans[0]) =>
    billingCycle === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice;

  const mockBilling = [
    { date: '2026-02-01', amount: getPlanAmount(currentPlan), status: 'Paid' },
    { date: '2026-01-01', amount: getPlanAmount(currentPlan), status: 'Paid' },
    { date: '2025-12-01', amount: getPlanAmount(currentPlan), status: 'Paid' },
  ];

  const handleSubscribe = async (plan: typeof membershipPlans[0]) => {
    if (plan.tier === 'free') {
      toast({ title: 'Free Plan', description: 'You are already on the free plan.' });
      return;
    }
    if (plan.tier === 'enterprise') {
      navigate('/contact-us');
      return;
    }

    const amount = getPlanAmount(plan);

    setSelectedPlan(plan);
    setSelectedAmount(amount);
    setLoadingPlan(plan.tier);

    try {
      const response = await fetch(`${API_URL}/api/subscriptions/stripe/create-subscription`, {
        method: 'POST',
        headers: getAccessHeaders({
          userId: user?.id || 'user_001',
          membershipTier: user?.membershipTier || 'free',
        }),
        body: JSON.stringify({
          userId: user?.id || 'user_001',
          planId: plan.tier,
          billingCycle,
          priceId: PLAN_PRICES[plan.tier]?.[billingCycle]?.priceId || `price_${plan.tier}_${billingCycle}`,
          amount: amount * 100,
        }),
      });

      const data = await response.json();

      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPaymentModal(true);
      } else if (data.success) {
        toast({ title: 'Success!', description: `You are now subscribed to ${plan.name}!` });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to create subscription', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({ title: 'Connection Error', description: 'Could not connect to payment server', variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast({ 
      title: 'Payment Successful!', 
      description: `Welcome to ${selectedPlan?.name}! Your subscription is now active.` 
    });
    setSelectedPlan(null);
    setClientSecret(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({ title: 'Payment Successful!', description: 'Your subscription is now active.' });
      window.history.replaceState({}, '', '/subscription');
    }
    const upgradeFeature = params.get('upgrade');
    if (upgradeFeature) {
      toast({
        title: 'Upgrade Required',
        description: 'Your current plan does not include that feature. Upgrade to continue.',
      });
    }
  }, [toast]);

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Subscription Management</h1>

        <Card>
          <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{currentPlan.name}</div>
              <div className="text-muted-foreground">
                {currentPlan.tier === 'free' ? 'Free forever' : `$${getPlanAmount(currentPlan)}/month`}
              </div>
            </div>
            <Badge className="bg-gold/20 text-gold-dark">{currentPlan.name}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose the plan that best fits your business needs. Annual billing saves 20%.</CardDescription>
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
              {membershipPlans.map((plan, i) => (
                <div key={plan.tier} className={`p-4 rounded-lg border ${plan.tier === currentPlan.tier ? 'border-gold bg-gold/5' : ''}`}>
                  <div className="font-semibold mb-1">{plan.name}</div>
                  <div className="text-xs text-muted-foreground mb-1">{plan.subtitle}</div>
                  <div className="text-lg font-bold mb-1">
                    {plan.tier === 'free' ? 'Free' : plan.tier === 'enterprise' ? 'Custom' : `$${getPlanAmount(plan)}/mo`}
                  </div>
                  {plan.tier !== 'free' && plan.tier !== 'enterprise' && billingCycle === 'annual' && (
                    <div className="text-xs text-muted-foreground mb-1">Billed as ${plan.annualPrice}/year - cancel anytime</div>
                  )}
                  {plan.tier !== 'free' && plan.tier !== 'enterprise' && plan.ngnMonthlyPrice && (
                    <div className="text-xs text-muted-foreground mb-3">
                      NGN: {billingCycle === 'annual' ? `N${plan.ngnAnnualPrice?.toLocaleString()}/year` : `N${plan.ngnMonthlyPrice.toLocaleString()}/month`}
                    </div>
                  )}
                  {plan.trialAvailable && <div className="text-xs text-green-600 mb-2">14-day free trial. No credit card required.</div>}
                  {plan.tier === currentPlan.tier ? (
                    <Badge variant="outline">Current</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      disabled={loadingPlan === plan.tier}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {loadingPlan === plan.tier ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : plan.tier === 'enterprise' ? (
                        'Contact Sales'
                      ) : plan.tier === 'starter' || plan.tier === 'growth' ? (
                        'Start 14-Day Trial'
                      ) : i > currentIdx ? (
                        <><ArrowUp className="h-3 w-3 mr-1" />Upgrade</>
                      ) : (
                        <><ArrowDown className="h-3 w-3 mr-1" />Downgrade</>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Billing History</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {mockBilling.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell>{new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                    <TableCell>${b.amount}</TableCell>
                    <TableCell><Badge variant="outline" className="text-green-600">{b.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader><CardTitle className="text-blue-800">Payment Methods</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <CreditCard className="h-4 w-4" />
                <span>Visa ****4242</span>
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50">Default</Badge>
            </div>
            <p className="text-xs text-blue-600 mt-2">Secure payment powered by Stripe</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Pay ${selectedAmount}/month with your card
            </DialogDescription>
          </DialogHeader>
          {clientSecret && selectedPlan ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                plan={selectedPlan} 
                amount={selectedAmount}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentModal(false)}
              />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MemberLayout>
  );
}
