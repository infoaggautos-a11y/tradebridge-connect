import { useState, useEffect } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { membershipPlans } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Clock, XCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BankTransferInfo from '@/components/payments/BankTransferInfo';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 16, annual: 156 },
  growth: { monthly: 24, annual: 228 },
};

export default function SubscriptionPage() {
  const { user, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [transferRef, setTransferRef] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const currentTier = user?.membershipTier || 'free';
  const currentPlan = membershipPlans.find(p => p.tier === currentTier) || membershipPlans[0];

  const price = PLAN_PRICES[selectedPlan];
  const totalAmount = billingCycle === 'annual' ? price.annual : price.monthly;
  const periodLabel = billingCycle === 'annual' ? '/year' : '/month';

  useEffect(() => {
    if (!user?.id) return;
    const fetchPayments = async () => {
      setLoadingPayments(true);
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'subscription')
        .order('created_at', { ascending: false });
      setPayments(data || []);
      setLoadingPayments(false);
    };
    fetchPayments();
  }, [user?.id]);

  const handleSubmitVerification = async () => {
    if (!transferRef.trim()) {
      toast({ title: 'Reference required', description: 'Enter your bank transfer reference.', variant: 'destructive' });
      return;
    }
    if (!user?.id) {
      toast({ title: 'Authentication required', description: 'Please log in first.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('payments').insert({
        user_id: user.id,
        amount: totalAmount,
        currency: 'USD',
        reference: transferRef.trim(),
        status: 'pending',
        type: 'subscription',
        provider: 'bank_transfer',
        metadata: { plan: selectedPlan, billingCycle, planName: selectedPlan },
      });
      if (error) throw error;
      toast({
        title: 'Verification submitted',
        description: 'Your payment details have been submitted for verification. We will confirm shortly.',
      });
      setTransferRef('');
      setTransferDate('');
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'subscription')
        .order('created_at', { ascending: false });
      setPayments(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not submit verification.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

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
                {currentTier === 'free' ? 'Free forever — upgrade to access premium features' : `${currentPlan.name} plan active`}
              </div>
            </div>
            <Badge className="bg-gold/20 text-gold-dark">{currentPlan.name}</Badge>
          </CardContent>
        </Card>

        {/* Choose Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Choose a Plan</CardTitle>
            <CardDescription>Select a plan and pay via bank transfer. We will verify and activate your subscription.</CardDescription>
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
                  Annual — Save ~20%
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {['starter', 'growth'].map(tier => {
                const plan = membershipPlans.find(p => p.tier === tier)!;
                const p = PLAN_PRICES[tier];
                const total = billingCycle === 'annual' ? p.annual : p.monthly;
                const perMonth = billingCycle === 'annual' ? Math.round(p.annual / 12) : p.monthly;
                const isSelected = selectedPlan === tier;
                return (
                  <Card
                    key={tier}
                    className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-gold border-gold' : 'hover:border-gold/50'}`}
                    onClick={() => setSelectedPlan(tier)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {isSelected && <CheckCircle className="h-5 w-5 text-gold" />}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        ${total}<span className="text-sm font-normal text-muted-foreground">{billingCycle === 'annual' ? '/year' : '/month'}</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <div className="text-xs text-muted-foreground mb-2">${perMonth}/mo billed annually</div>
                      )}
                      <ul className="text-xs text-muted-foreground space-y-1 mt-3">
                        {plan.features.slice(0, 5).map((f, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer Details */}
        <BankTransferInfo />

        {/* Payment Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Payment Verification</CardTitle>
            <CardDescription>
              After making the transfer, enter your payment details below so we can verify your subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Amount to Pay</Label>
              <div className="text-xl font-bold text-gold-dark mt-1">${totalAmount}{periodLabel}</div>
              <p className="text-xs text-muted-foreground">For: {membershipPlans.find(p => p.tier === selectedPlan)?.name} plan ({billingCycle})</p>
            </div>
            <div>
              <Label htmlFor="transferRef">Bank Transfer Reference</Label>
              <Input
                id="transferRef"
                placeholder="Enter the reference/transaction ID from your transfer"
                value={transferRef}
                onChange={e => setTransferRef(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="transferDate">Transfer Date (optional)</Label>
              <Input
                id="transferDate"
                type="date"
                value={transferDate}
                onChange={e => setTransferDate(e.target.value)}
              />
            </div>
            <Button
              className="bg-gold text-navy hover:bg-gold-light font-semibold"
              onClick={handleSubmitVerification}
              disabled={submitting || !transferRef.trim()}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit for Verification
            </Button>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your subscription payment submissions and their verification status.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payment submissions yet. Make a transfer and submit the details above.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{p.metadata?.plan || 'Subscription'}</TableCell>
                      <TableCell>${p.amount}</TableCell>
                      <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClass(p.status)}>
                          <span className="flex items-center gap-1">
                            {statusIcon(p.status)}
                            {statusLabel(p.status)}
                          </span>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}
