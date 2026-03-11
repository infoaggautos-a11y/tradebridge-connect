import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, Shield, Wallet, Loader2, FileText, RefreshCw } from 'lucide-react';

export default function FinanceDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [escrows, setEscrows] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [payRes, payoutRes, escrowRes, revRes] = await Promise.all([
        supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('payouts').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('escrow_deals').select('*').order('created_at', { ascending: false }),
        supabase.from('platform_revenue').select('*').order('created_at', { ascending: false }).limit(50),
      ]);
      setPayments(payRes.data || []);
      setPayouts(payoutRes.data || []);
      setEscrows(escrowRes.data || []);
      setRevenue(revRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalPayments = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalEscrow = escrows.filter(e => e.status === 'funded').reduce((s, e) => s + (e.amount || 0), 0);
  const totalRevenue = revenue.reduce((s, r) => s + (r.amount || 0), 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').length;

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString()}`;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Finance Dashboard</h1><p className="text-muted-foreground">Financial overview</p></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
                  <div className="text-2xl font-bold">{fmt(totalPayments / 100)}</div>
                  <div className="text-xs text-muted-foreground">Total Payments</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Shield className="h-5 w-5 text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold">{fmt(totalEscrow)}</div>
                  <div className="text-xs text-muted-foreground">Escrow Held</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <DollarSign className="h-5 w-5 text-[hsl(var(--gold))] mb-2" />
                  <div className="text-2xl font-bold">{fmt(totalRevenue / 100)}</div>
                  <div className="text-xs text-muted-foreground">Platform Revenue</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <Wallet className="h-5 w-5 text-purple-500 mb-2" />
                  <div className="text-2xl font-bold">{pendingPayouts}</div>
                  <div className="text-xs text-muted-foreground">Pending Payouts</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="payments" className="space-y-4">
              <TabsList>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
                <TabsTrigger value="escrow">Escrow</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>

              <TabsContent value="payments">
                <Card>
                  <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
                  <CardContent>
                    {payments.length === 0 ? <p className="text-center text-muted-foreground py-8">No payments recorded yet.</p> : (
                      <Table>
                        <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Type</TableHead><TableHead>Provider</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {payments.map(p => (
                            <TableRow key={p.id}>
                              <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                              <TableCell className="capitalize">{p.type}</TableCell>
                              <TableCell className="capitalize">{p.provider}</TableCell>
                              <TableCell className="font-medium">{fmt(p.amount / 100)}</TableCell>
                              <TableCell><Badge className={p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{p.status}</Badge></TableCell>
                              <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payouts">
                <Card>
                  <CardHeader><CardTitle>Payout Management</CardTitle></CardHeader>
                  <CardContent>
                    {payouts.length === 0 ? <p className="text-center text-muted-foreground py-8">No payouts yet.</p> : (
                      <Table>
                        <TableHeader><TableRow><TableHead>Reference</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {payouts.map(p => (
                            <TableRow key={p.id}>
                              <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                              <TableCell className="font-medium">{fmt(p.amount / 100)}</TableCell>
                              <TableCell><Badge className={p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{p.status}</Badge></TableCell>
                              <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="escrow">
                <Card>
                  <CardHeader><CardTitle>Escrow Deals</CardTitle></CardHeader>
                  <CardContent>
                    {escrows.length === 0 ? <p className="text-center text-muted-foreground py-8">No escrow deals yet.</p> : (
                      <Table>
                        <TableHeader><TableRow><TableHead>Deal Room</TableHead><TableHead>Amount</TableHead><TableHead>Commission</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {escrows.map(e => (
                            <TableRow key={e.id}>
                              <TableCell className="font-mono text-xs">{e.deal_room_id}</TableCell>
                              <TableCell className="font-medium">{fmt(e.amount)}</TableCell>
                              <TableCell>{fmt(e.commission_amount || 0)} ({e.commission_rate}%)</TableCell>
                              <TableCell><Badge className={e.status === 'released' ? 'bg-green-100 text-green-700' : e.status === 'disputed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{e.status}</Badge></TableCell>
                              <TableCell className="text-sm">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue">
                <Card>
                  <CardHeader><CardTitle>Platform Revenue</CardTitle></CardHeader>
                  <CardContent>
                    {revenue.length === 0 ? <p className="text-center text-muted-foreground py-8">No revenue recorded yet.</p> : (
                      <Table>
                        <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Amount</TableHead><TableHead>Reference</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {revenue.map(r => (
                            <TableRow key={r.id}>
                              <TableCell className="capitalize">{r.source}</TableCell>
                              <TableCell className="font-medium">{fmt(r.amount / 100)}</TableCell>
                              <TableCell className="font-mono text-xs">{r.reference || '-'}</TableCell>
                              <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
