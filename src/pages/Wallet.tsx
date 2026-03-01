import { useState } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessById } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  DollarSign,
  CreditCard,
  Building,
  Download,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

const mockTransactions = [
  { id: 'tx_001', type: 'escrow_release', amount: 14125, currency: 'USD', balanceAfter: 25000, description: 'Escrow release - Deal DIL-2026-001', reference: 'escrow_001', counterpartyName: 'Napoli Trade Solutions', status: 'completed', createdAt: '2026-02-22T14:00:00Z' },
  { id: 'tx_002', type: 'escrow_funding', amount: -35000, currency: 'USD', balanceAfter: 10875, description: 'Escrow funding - Deal DIL-2026-001', reference: 'escrow_001', counterpartyName: 'Lagos Agro Exports', status: 'completed', createdAt: '2026-02-12T10:00:00Z' },
  { id: 'tx_003', type: 'subscription', amount: -149, currency: 'USD', balanceAfter: 45875, description: 'Growth Plan - Monthly subscription', status: 'completed', createdAt: '2026-02-01T09:00:00Z' },
  { id: 'tx_004', type: 'deposit', amount: 50000, currency: 'USD', balanceAfter: 46024, description: 'Wallet deposit via bank transfer', status: 'completed', createdAt: '2026-01-28T11:00:00Z' },
  { id: 'tx_005', type: 'refund', amount: 15000, currency: 'USD', balanceAfter: 1524, description: 'Refund - Cancelled deal', status: 'completed', createdAt: '2026-01-20T16:00:00Z' },
  { id: 'tx_006', type: 'commission', amount: -350, currency: 'USD', balanceAfter: 13474, description: 'Platform commission - Deal DIL-2025-045', status: 'completed', createdAt: '2025-12-15T10:00:00Z' },
];

const mockWithdrawals = [
  { id: 'wd_001', amount: 5000, currency: 'USD', bankName: 'First Bank', accountNumber: '****4521', status: 'completed', requestedAt: '2026-02-15T10:00:00Z', processedAt: '2026-02-16T14:00:00Z' },
  { id: 'wd_002', amount: 8000, currency: 'USD', bankName: 'First Bank', accountNumber: '****4521', status: 'pending', requestedAt: '2026-02-28T09:00:00Z' },
];

const balances = {
  available: 10000,
  escrow: 35000,
  pending: 8000,
  lifetime: 85000,
};

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const business = user?.businessId ? getBusinessById(user.businessId) : null;
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return `$${amount.toLocaleString()}`;
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'deposit' || type === 'escrow_release') return <ArrowDownRight className="h-4 w-4 text-green-500" />;
    if (type === 'withdrawal' || type === 'escrow_funding' || type === 'subscription' || type === 'commission') return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    if (type === 'refund') return <RefreshCw className="h-4 w-4 text-blue-500" />;
    return <DollarSign className="h-4 w-4 text-gray-500" />;
  };

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      deposit: 'Deposit',
      withdrawal: 'Withdrawal',
      escrow_funding: 'Escrow Funding',
      escrow_release: 'Escrow Release',
      subscription: 'Subscription',
      commission: 'Commission',
      refund: 'Refund',
    };
    return labels[type] || type;
  };

  const handleWithdraw = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal is being processed. It will arrive in 1-2 business days.",
      });
    }, 1500);
  };

  const handleDeposit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowDepositDialog(false);
      toast({
        title: "Deposit Initiated",
        description: "Please transfer to the account details provided. Your wallet will be credited upon confirmation.",
      });
    }, 1000);
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">Manage your funds and transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(balances.available)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Escrow</p>
                  <p className="text-2xl font-bold">{formatCurrency(balances.escrow)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Locked in deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{formatCurrency(balances.pending)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lifetime Earned</p>
                  <p className="text-2xl font-bold">{formatCurrency(balances.lifetime)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total platform earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button className="flex-1" onClick={() => setShowDepositDialog(true)}>
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Deposit Funds
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawDialog(true)}>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Counterparty</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance After</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(tx.type)}
                            <span className="font-medium">{getTransactionLabel(tx.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{tx.description}</div>
                          <div className="text-xs text-muted-foreground">Ref: {tx.reference}</div>
                        </TableCell>
                        <TableCell className="text-sm">{tx.counterpartyName || '-'}</TableCell>
                        <TableCell>
                          <span className={tx.amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{formatCurrency(tx.balanceAfter)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Your past withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bank</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWithdrawals.map(wd => (
                      <TableRow key={wd.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{wd.bankName}</div>
                              <div className="text-xs text-muted-foreground">{wd.accountNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(wd.amount)}</TableCell>
                        <TableCell>
                          <Badge className={
                            wd.status === 'completed' ? 'bg-green-100 text-green-700' :
                            wd.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            wd.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                          }>
                            {wd.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(wd.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">
                          {wd.processedAt ? new Date(wd.processedAt).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Withdraw Dialog */}
        <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                Withdraw to your registered bank account
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Available Balance</div>
                <div className="text-xl font-bold">{formatCurrency(balances.available)}</div>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Bank Account</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firstbank">First Bank - ****4521</SelectItem>
                    <SelectItem value="gtbank">GTBank - ****8832</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Withdrawals typically take 1-2 business days to process
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
              <Button onClick={handleWithdraw} disabled={isProcessing || !withdrawAmount}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Request Withdrawal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deposit Dialog */}
        <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>
                Transfer funds to your DIL wallet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Bank Transfer Details (EUR/USD)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Bank Name:</span>
                    <span className="font-medium">Revolut Bank UAB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Account Name:</span>
                    <span className="font-medium">Interconsult DI Okorokwo Nkiruka</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">IBAN:</span>
                    <span className="font-medium">LT39 3250 0376 9399 5279</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">SWIFT (EUR):</span>
                    <span className="font-medium">REVOLT21</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">SWIFT (USD):</span>
                    <span className="font-medium">CHASDEFX</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                After making the transfer, enter your transaction reference below for confirmation.
              </p>
              <div className="space-y-2">
                <Label>Transaction Reference</Label>
                <Input placeholder="Enter your bank transfer reference" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDepositDialog(false)}>Cancel</Button>
              <Button onClick={handleDeposit} disabled={isProcessing}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirm Deposit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MemberLayout>
  );
}
