import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { financeService } from '@/services/financeService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Wallet,
  Shield,
  PiggyBank,
  Globe,
  FileText,
  BarChart3,
} from 'lucide-react';

export default function FinanceDashboard() {
  const { toast } = useToast();
  const kpis = financeService.getKPIs();
  const revenueData = financeService.getRevenueData();
  const payouts = financeService.getPayouts();
  const escrowLiabilities = financeService.getEscrowLiabilities();
  const fxExposure = financeService.getFXExposure();
  const commissions = financeService.getCommissions();
  const projections = financeService.getProjections();

  const [retryingPayout, setRetryingPayout] = useState<string | null>(null);

  const handleRetryPayout = (payoutId: string) => {
    setRetryingPayout(payoutId);
    setTimeout(() => {
      financeService.retryPayout(payoutId);
      setRetryingPayout(null);
      toast({
        title: "Payout Retried",
        description: "The payout has been resubmitted for processing.",
      });
    }, 1500);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'NGN') return `₦${amount.toLocaleString()}`;
    return `$${amount.toLocaleString()}`;
  };

  const getPayoutStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processing': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalRevenue = revenueData.reduce((sum, r) => sum + r.total, 0);
  const avgDaily = totalRevenue / revenueData.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Finance Dashboard</h1>
            <p className="text-muted-foreground">Financial overview and money management</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <DollarSign className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.todayRevenue)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Month to Date</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.monthRevenue)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-1">+8.5% vs last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Escrow Liability</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.escrowLiability)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{kpis.activeDeals} active deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payouts</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpis.pendingPayouts)}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{financeService.getPendingPayouts().length} pending</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Revenue Overview</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="escrow">Escrow Liability</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="fx">FX Exposure</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
          </TabsList>

          {/* Revenue Overview */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
                    <CardDescription>Daily revenue breakdown by stream</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueData.map((day, i) => (
                        <div key={day.date} className="flex items-center gap-4">
                          <div className="w-20 text-sm text-muted-foreground">
                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="flex-1">
                            <Progress 
                              value={(day.total / 200000) * 100} 
                              className="h-6"
                            />
                          </div>
                          <div className="w-24 text-right font-medium">{formatCurrency(day.total)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="text-muted-foreground">Average Daily</span>
                      <span className="font-bold">{formatCurrency(avgDaily)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Stream</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {financeService.getRevenueByStream().map(stream => (
                        <div key={stream.stream}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{stream.stream}</span>
                            <span className="font-medium">{stream.percentage}%</span>
                          </div>
                          <Progress value={stream.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Year to Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(kpis.yearRevenue)}</div>
                    <p className="text-sm text-green-600 mt-1">+24% vs last year</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Payouts */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Payout Management</CardTitle>
                  <CardDescription>Track and manage seller payouts</CardDescription>
                </div>
                <Badge variant="outline">
                  {financeService.getFailedPayouts().length} Failed
                </Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Initiated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map(payout => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">{payout.businessName}</TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(payout.amount, payout.currency)}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{payout.bankName}</div>
                            <div className="text-xs text-muted-foreground">{payout.accountNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPayoutStatusIcon(payout.status)}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPayoutStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </div>
                          {payout.failureReason && (
                            <p className="text-xs text-red-500 mt-1">{payout.failureReason}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(payout.initiatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {payout.status === 'failed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRetryPayout(payout.id)}
                              disabled={retryingPayout === payout.id}
                            >
                              {retryingPayout === payout.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-1" />
                              )}
                              Retry
                            </Button>
                          )}
                          {payout.status === 'pending' && (
                            <Button variant="outline" size="sm">
                              Process Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escrow Liability */}
          <TabsContent value="escrow">
            <Card>
              <CardHeader>
                <CardTitle>Escrow Liability</CardTitle>
                <CardDescription>Funds held in escrow across all active deals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-yellow-700">Total Escrow</div>
                    <div className="text-2xl font-bold">{formatCurrency(financeService.getTotalEscrowLiability())}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-700">Active (Funded)</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(escrowLiabilities.filter(e => e.status === 'funded').reduce((s, e) => s + e.amount, 0))}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-red-700">Frozen (Disputed)</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(escrowLiabilities.filter(e => e.status === 'frozen').reduce((s, e) => s + e.amount, 0))}
                    </div>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Parties</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Funded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escrowLiabilities.map(escrow => (
                      <TableRow key={escrow.dealId}>
                        <TableCell className="font-medium">{escrow.dealTitle}</TableCell>
                        <TableCell className="text-sm">
                          Buyer: {escrow.buyerId} → Seller: {escrow.sellerId}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(escrow.amount, escrow.currency)}</TableCell>
                        <TableCell>
                          <Badge className={escrow.status === 'frozen' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                            {escrow.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(escrow.fundedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions */}
          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Commission Ledger</CardTitle>
                <CardDescription>All commissions earned from escrow releases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-gold/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Commission Earned</div>
                  <div className="text-2xl font-bold text-gold-dark">{formatCurrency(financeService.getTotalCommission())}</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Gross Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map(comm => (
                      <TableRow key={comm.id}>
                        <TableCell className="font-medium">{comm.dealNumber}</TableCell>
                        <TableCell>{formatCurrency(comm.grossAmount, comm.currency)}</TableCell>
                        <TableCell>{(comm.commissionRate * 100).toFixed(1)}%</TableCell>
                        <TableCell className="font-medium text-gold-dark">
                          {formatCurrency(comm.commissionAmount, comm.currency)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FX Exposure */}
          <TabsContent value="fx">
            <Card>
              <CardHeader>
                <CardTitle>FX Exposure</CardTitle>
                <CardDescription>Currency breakdown of platform funds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {fxExposure.map(fx => (
                    <div key={fx.currency} className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Globe className="h-6 w-6 text-gray-600" />
                        </div>
                        <Badge variant="outline">{fx.currency}</Badge>
                      </div>
                      <div className="text-3xl font-bold mb-2">
                        {fx.currency === 'NGN' ? `₦${(fx.amount / 1000000).toFixed(0)}M` : `$${(fx.amount / 1000000).toFixed(1)}M`}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={fx.percentage} className="flex-1" />
                        <span className="text-sm font-medium">{fx.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">FX Risk Note</h4>
                  <p className="text-sm text-blue-700">
                    Consider hedging strategies for NGN exposure. Current volatility may impact payout calculations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projections */}
          <TabsContent value="projections">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Projections</CardTitle>
                <CardDescription>Based on 90-day trend extrapolation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {projections.map(proj => (
                    <div key={proj.period} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{proj.period}</span>
                        {proj.growthRate > 0 ? (
                          <Badge className="bg-green-100 text-green-700">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +{proj.growthRate}%
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            {proj.growthRate}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold">{formatCurrency(proj.total)}</div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Subscriptions</span>
                          <span>{formatCurrency(proj.subscriptions)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Commissions</span>
                          <span>{formatCurrency(proj.commissions)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Events</span>
                          <span>{formatCurrency(proj.events)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
