import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { membershipPlans } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentPlan = membershipPlans.find(p => p.tier === user?.membershipTier) || membershipPlans[0];
  const currentIdx = membershipPlans.findIndex(p => p.tier === currentPlan.tier);

  const mockBilling = [
    { date: '2026-02-01', amount: currentPlan.price, status: 'Paid' },
    { date: '2026-01-01', amount: currentPlan.price, status: 'Paid' },
    { date: '2025-12-01', amount: currentPlan.price, status: 'Paid' },
  ];

  return (
    <MemberLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Subscription Management</h1>

        <Card>
          <CardHeader><CardTitle>Current Plan</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{currentPlan.name}</div>
              <div className="text-muted-foreground">{currentPlan.price === 0 ? 'Free forever' : `$${currentPlan.price}${currentPlan.period}`}</div>
            </div>
            <Badge className="bg-gold/20 text-gold-dark capitalize">{currentPlan.tier}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Available Plans</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {membershipPlans.map((plan, i) => (
                <div key={plan.tier} className={`p-4 rounded-lg border ${plan.tier === currentPlan.tier ? 'border-gold bg-gold/5' : ''}`}>
                  <div className="font-semibold mb-1">{plan.name}</div>
                  <div className="text-lg font-bold mb-3">{plan.price === 0 ? 'Free' : `$${plan.price}/mo`}</div>
                  {plan.tier === currentPlan.tier ? (
                    <Badge variant="outline">Current</Badge>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full" onClick={() => toast({ title: 'Coming Soon', description: 'Payment integration will be available soon.' })}>
                      {i > currentIdx ? <><ArrowUp className="h-3 w-3 mr-1" />Upgrade</> : <><ArrowDown className="h-3 w-3 mr-1" />Downgrade</>}
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
      </div>
    </MemberLayout>
  );
}
