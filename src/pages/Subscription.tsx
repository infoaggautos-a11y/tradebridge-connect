import { useState, useEffect } from 'react';
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

const stripePromise = loadStripe('pk_test_51T5TpVEPAQKb2xdh9mGnFrkFGBjOEx35NuiHGmtxdWorfG78VQnuI42TpWlVd0Han0WghsDNvbee8si2ytjA3HE700BOjt48PT');

const PLAN_PRICES: Record<string, { priceId: string; amount: number }> = {
  starter: { priceId: 'price_starter', amount: 4900 },
  growth: { priceId: 'price_growth', amount: 14900 },
  enterprise: { priceId: 'price_enterprise', amount: 49900 },
};

function CheckoutForm({ plan, onSuccess, onCancel }: { plan: typeof membershipPlans[0]; onSuccess: () => void; onCancel: () => void }) {
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
          Pay ${plan.price}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentPlan = membershipPlans.find(p => p.tier === user?.membershipTier) || membershipPlans[0];
  const currentIdx = membershipPlans.findIndex(p => p.tier === currentPlan.tier);
  
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof membershipPlans[0] | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const mockBilling = [
    { date: '2026-02-01', amount: currentPlan.price, status: 'Paid' },
    { date: '2026-01-01', amount: currentPlan.price, status: 'Paid' },
    { date: '2025-12-01', amount: currentPlan.price, status: 'Paid' },
  ];

  const handleSubscribe = async (plan: typeof membershipPlans[0]) => {
    if (plan.price === 0) {
      toast({ title: 'Free Plan', description: 'You are already on the free plan.' });
      return;
    }

    setSelectedPlan(plan);
    setLoadingPlan(plan.tier);

    try {
      const response = await fetch('http://localhost:3001/api/payments/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'user_001',
          planId: plan.tier,
          priceId: PLAN_PRICES[plan.tier]?.priceId || `price_${plan.tier}`,
          amount: PLAN_PRICES[plan.tier]?.amount || plan.price * 100,
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
              <div className="text-muted-foreground">{currentPlan.price === 0 ? 'Free forever' : `$${currentPlan.price}/month`}</div>
            </div>
            <Badge className="bg-gold/20 text-gold-dark capitalize">{currentPlan.tier}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>Choose the plan that best fits your business needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {membershipPlans.map((plan, i) => (
                <div key={plan.tier} className={`p-4 rounded-lg border ${plan.tier === currentPlan.tier ? 'border-gold bg-gold/5' : ''}`}>
                  <div className="font-semibold mb-1">{plan.name}</div>
                  <div className="text-lg font-bold mb-3">{plan.price === 0 ? 'Free' : `$${plan.price}/mo`}</div>
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
              Pay ${selectedPlan?.price}/month with your card
            </DialogDescription>
          </DialogHeader>
          {clientSecret && selectedPlan ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                plan={selectedPlan} 
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
