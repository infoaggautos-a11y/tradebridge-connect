import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubRow {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: string | null;
  created_at: string | null;
  current_period_end: string | null;
  profiles?: { name: string | null; email: string } | null;
}

interface PaymentVerification {
  id: string;
  user_id: string;
  amount: number;
  currency: string | null;
  reference: string;
  status: string | null;
  type: string;
  provider: string;
  metadata: any;
  created_at: string | null;
  profiles?: { name: string | null; email: string } | null;
}

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'subscriptions' | 'verifications'>('subscriptions');
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [loadingVerifications, setLoadingVerifications] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchSubs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('subscriptions')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false });
    setSubs((data as any) || []);
    setLoading(false);
  };

  const fetchVerifications = async () => {
    setLoadingVerifications(true);
    const { data } = await supabase
      .from('payments')
      .select('*, profiles!inner(name, email)')
      .eq('type', 'subscription')
      .order('created_at', { ascending: false });
    setVerifications((data as any) || []);
    setLoadingVerifications(false);
  };

  useEffect(() => {
    fetchSubs();
    fetchVerifications();
  }, []);

  const handleVerify = async (payment: PaymentVerification, newStatus: 'verified' | 'rejected') => {
    setVerifyingId(payment.id);
    try {
      const { error: payError } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', payment.id);
      if (payError) throw payError;

      if (newStatus === 'verified') {
        const plan = payment.metadata?.plan || 'starter';
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ membership_tier: plan })
          .eq('id', payment.user_id);
        if (profileError) throw profileError;

        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: payment.user_id,
            plan_id: plan,
            plan_name: plan === 'starter' ? 'starter' : 'growth',
            status: 'active',
          }, { onConflict: 'user_id' });
        if (subError) throw subError;
      }

      toast({
        title: newStatus === 'verified' ? 'Verified' : 'Rejected',
        description: `Payment ${newStatus} successfully.`,
      });
      fetchVerifications();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setVerifyingId(null);
    }
  };

  const active = subs.filter(s => s.status === 'active' && s.plan_id !== 'free').length;
  const paid = subs.filter(s => s.plan_id !== 'free').length;
  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <Button variant="outline" size="sm" onClick={() => { fetchSubs(); fetchVerifications(); }} disabled={loading || loadingVerifications}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading || loadingVerifications ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{subs.length}</div><div className="text-xs text-muted-foreground">Total Users</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{active}</div><div className="text-xs text-muted-foreground">Active Paid</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{paid}</div><div className="text-xs text-muted-foreground">Total Paid</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold text-yellow-600">{pendingCount}</div><div className="text-xs text-muted-foreground">Pending Verifications</div></CardContent></Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            className={`px-4 py-2 text-sm font-medium transition ${tab === 'subscriptions' ? 'border-b-2 border-gold text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setTab('subscriptions')}
          >
            Subscriptions
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition ${tab === 'verifications' ? 'border-b-2 border-gold text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setTab('verifications')}
          >
            Payment Verifications {pendingCount > 0 && <span className="ml-1 text-yellow-600">({pendingCount})</span>}
          </button>
        </div>

        {tab === 'subscriptions' ? (
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period End</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subs.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{(sub as any).profiles?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{(sub as any).profiles?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{sub.plan_name}</Badge></TableCell>
                        <TableCell>
                          <Badge className={sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '-'}</TableCell>
                        <TableCell className="text-sm">{sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              {loadingVerifications ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : verifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">No payment verifications found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verifications.map(p => {
                      const v = p as any;
                      const statusBadge = v.status === 'verified'
                        ? 'bg-green-100 text-green-700'
                        : v.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700';
                      return (
                        <TableRow key={v.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{v.profiles?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">{v.profiles?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">{v.metadata?.plan || '-'}</TableCell>
                          <TableCell>${v.amount}</TableCell>
                          <TableCell className="font-mono text-xs max-w-[120px] truncate">{v.reference}</TableCell>
                          <TableCell className="text-sm">{new Date(v.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={statusBadge}>{v.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {v.status === 'pending' && (
                              <div className="flex gap-1 justify-end">
                                <Button
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700 h-8 px-2"
                                  onClick={() => handleVerify(v, 'verified')}
                                  disabled={verifyingId === v.id}
                                >
                                  {verifyingId === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleVerify(v, 'rejected')}
                                  disabled={verifyingId === v.id}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
