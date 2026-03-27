import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberLayout } from '@/layouts/MemberLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { invoiceService } from '@/services/invoiceService';
import { Invoice, InvoiceStatus, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Plus, Search, Send, Eye, CheckCircle, AlertTriangle, 
  Clock, DollarSign, XCircle, MoreHorizontal, Download, Trash2,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function InvoicesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'member' | 'admin'>('member');
  
  const businessId = user?.businessId || 'b2';
  const allInvoices = invoiceService['invoices'];
  const summary = invoiceService.getSummary();
  const currencyStats = invoiceService.getCurrencyStats();

  const filteredInvoices = allInvoices.filter(inv => {
    const matchesSearch = !search || 
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.sellerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.dealTitle?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    
    if (viewMode === 'member') {
      return matchesSearch && matchesStatus && (inv.sellerId === businessId || inv.buyerId === businessId);
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleSendInvoice = async (id: string) => {
    await invoiceService.sendInvoice(id);
    toast({ title: 'Invoice sent', description: 'The invoice has been sent to the buyer.' });
    window.location.reload();
  };

  const handleMarkPaid = async (id: string) => {
    await invoiceService.recordPayment({ invoiceId: id, amount: 0, method: 'bank_transfer' });
    toast({ title: 'Invoice marked as paid' });
    window.location.reload();
  };

  const handleCancelInvoice = async (id: string) => {
    await invoiceService.cancelInvoice(id);
    toast({ title: 'Invoice cancelled' });
    window.location.reload();
  };

  const handleDeleteInvoice = async (id: string) => {
    const success = await invoiceService.deleteInvoice(id);
    if (success) {
      toast({ title: 'Invoice deleted' });
      window.location.reload();
    } else {
      toast({ title: 'Cannot delete', description: 'Only draft invoices can be deleted.', variant: 'destructive' });
    }
  };

  const StatusBadge = ({ status }: { status: InvoiceStatus }) => (
    <Badge className={INVOICE_STATUS_COLORS[status]}>
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );

  const Layout = viewMode === 'admin' ? AdminLayout : MemberLayout;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Invoices
            </h1>
            <p className="text-muted-foreground">Manage your invoices and billing</p>
          </div>
          <Button onClick={() => navigate('/invoices/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.counts.total}</p>
                  <p className="text-xs text-muted-foreground">Total Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.counts.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.counts.overdue}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {invoiceService.formatCurrency(summary.values.totalOutstanding)}
                  </p>
                  <p className="text-xs text-muted-foreground">Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search invoices..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[250px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={viewMode} onValueChange={(v: 'member' | 'admin') => setViewMode(v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">My Invoices</SelectItem>
                  <SelectItem value="admin">All Invoices</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {viewMode === 'admin' ? 'All Invoices' : 'My Invoices'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                  <p className="text-muted-foreground mb-4">
                    {search ? 'Try adjusting your search' : 'Create your first invoice to get started'}
                  </p>
                  <Button onClick={() => navigate('/invoices/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Deal</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => (
                      <TableRow key={invoice.id} className="cursor-pointer" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.type === 'deal_milestone' ? 'Milestone' : invoice.type === 'deal_full' ? 'Deal' : 'Standalone'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.buyerName}</p>
                            <p className="text-xs text-muted-foreground">{invoice.buyerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoiceService.formatCurrency(invoice.total, invoice.currency)}</p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total
                                ? `${invoiceService.formatCurrency(invoice.paidAmount, invoice.currency)} paid`
                                : invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell><StatusBadge status={invoice.status} /></TableCell>
                        <TableCell>
                          <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {invoice.dealTitle ? (
                            <span className="text-sm">{invoice.dealTitle}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}`); }}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={async (e) => { 
                                e.stopPropagation(); 
                                const { generateBrandedPDF } = await import('@/services/invoicePDF');
                                generateBrandedPDF(invoice);
                              }}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSendInvoice(invoice.id); }}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Invoice
                                </DropdownMenuItem>
                              )}
                              {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkPaid(invoice.id); }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                              {invoice.status === 'draft' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteInvoice(invoice.id); }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {viewMode === 'admin' && (
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(currencyStats).map(([currency, stats]) => (
              <Card key={currency}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{currency} Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Invoiced</span>
                    <span className="font-medium">{invoiceService.formatCurrency(stats.total, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-medium text-green-600">{invoiceService.formatCurrency(stats.paid, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Outstanding</span>
                    <span className="font-medium text-yellow-600">{invoiceService.formatCurrency(stats.outstanding, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Count</span>
                    <span>{stats.count} invoices</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
