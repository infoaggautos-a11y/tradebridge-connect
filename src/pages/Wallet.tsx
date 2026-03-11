import { useState, useEffect } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet, ArrowUpRight, ArrowDownRight, Clock, Shield, DollarSign, Loader2, TrendingUp, RefreshCw, Download,
} from 'lucide-react';

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositDialog, setShowDepositDialog] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      const [walletRes, txRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', user.id).single(),
        supabase.from('wallet_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
      if (walletRes.data) setWallet(walletRes.data);
      // Filter transactions to only user's wallet
      if (walletRes.data && txRes.data) {
        setTransactions(txRes.data.filter((tx: any) => tx.wallet_id === walletRes.data.id));
      }
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

  const formatCurrency = (amount: number) => `$${Math.abs(amount).toLocaleString()}`;

  const getTransactionIcon = (type: string) => {
    if (['deposit', 'escrow_release', 'refund'].includes(type)) return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    return <ArrowUpRight className="h-4 w-4 text-red-500" />;
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Wallet</h1><p className="text-muted-foreground">Manage your funds and transactions</p></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(wallet?.available_balance ?? 0)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(wallet?.balance ?? 0)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{formatCurrency(wallet?.pending_balance ?? 0)}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Currency</p>
                      <p className="text-2xl font-bold">{wallet?.currency || 'USD'}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1" onClick={() => setShowDepositDialog(true)}>
                <ArrowDownRight className="h-4 w-4 mr-2" />Deposit Funds
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Balance After</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.type)}
                              <span className="font-medium capitalize">{tx.type.replace(/_/g, ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{tx.description || '-'}</TableCell>
                          <TableCell>
                            <span className={tx.amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {tx.amount > 0 ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{formatCurrency(tx.balance_after)}</TableCell>
                          <TableCell className="text-sm">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deposit Funds</DialogTitle>
                  <DialogDescription>Transfer funds to your DIL wallet</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Bank Transfer Details (EUR/USD)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-blue-600">Bank Name:</span><span className="font-medium">Revolut Bank UAB</span></div>
                      <div className="flex justify-between"><span className="text-blue-600">Account Name:</span><span className="font-medium">Interconsult DI Okorokwo Nkiruka</span></div>
                      <div className="flex justify-between"><span className="text-blue-600">IBAN:</span><span className="font-medium">LT39 3250 0376 9399 5279</span></div>
                      <div className="flex justify-between"><span className="text-blue-600">SWIFT (EUR):</span><span className="font-medium">REVOLT21</span></div>
                      <div className="flex justify-between"><span className="text-blue-600">SWIFT (USD):</span><span className="font-medium">CHASDEFX</span></div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Include your email ({user?.email}) as reference. Your wallet will be credited upon confirmation.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDepositDialog(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </MemberLayout>
  );
}
