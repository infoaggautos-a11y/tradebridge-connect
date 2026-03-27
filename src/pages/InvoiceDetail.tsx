import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MemberLayout } from '@/layouts/MemberLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { invoiceService } from '@/services/invoiceService';
import { Invoice, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Send, Download, Edit, ArrowLeft, CheckCircle, 
  Clock, AlertTriangle, Building2, Calendar, DollarSign,
  Mail, Eye, XCircle, RefreshCw, Trash2, CreditCard, History
} from 'lucide-react';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const businessId = user?.businessId || 'b2';
  const isSeller = invoice?.sellerId === businessId;
  const isBuyer = invoice?.buyerId === businessId;
  const canEdit = invoice?.status === 'draft';
  const canSend = invoice?.status === 'draft';
  const canMarkPaid = ['sent', 'viewed', 'overdue'].includes(invoice?.status || '');
  const canVoid = ['draft', 'sent', 'viewed', 'partial'].includes(invoice?.status || '');

  useEffect(() => {
    if (id) {
      const found = invoiceService['invoices'].find(i => i.id === id);
      setInvoice(found || null);
      if (found) {
        setPaymentAmount(found.balanceDue.toString());
      }
      setLoading(false);
    }
  }, [id]);

  const handleSend = async () => {
    if (!invoice) return;
    await invoiceService.sendInvoice(invoice.id);
    toast({ title: 'Invoice sent', description: 'The invoice has been sent to the buyer.' });
    window.location.reload();
  };

  const handleSendReminder = async () => {
    if (!invoice) return;
    await invoiceService.sendReminder(invoice.id);
    toast({ title: 'Reminder sent', description: 'A payment reminder has been sent to the buyer.' });
    window.location.reload();
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;
    const amount = parseFloat(paymentAmount) || invoice.balanceDue;
    await invoiceService.recordPayment({ 
      invoiceId: invoice.id, 
      amount,
      method: 'bank_transfer'
    });
    toast({ title: 'Payment recorded', description: `Payment of ${invoiceService.formatCurrency(amount, invoice.currency)} has been recorded.` });
    setShowPaymentDialog(false);
    window.location.reload();
  };

  const handleVoid = async () => {
    if (!invoice) return;
    await invoiceService.voidInvoice(invoice.id);
    toast({ title: 'Invoice voided', description: 'The invoice has been voided.' });
    setShowVoidDialog(false);
    window.location.reload();
  };

  const handleCancel = async () => {
    if (!invoice) return;
    await invoiceService.cancelInvoice(invoice.id);
    toast({ title: 'Invoice cancelled' });
    window.location.reload();
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MemberLayout>
    );
  }

  if (!invoice) {
    return (
      <MemberLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-4">The invoice you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </MemberLayout>
    );
  }

  const daysUntilDue = Math.ceil((new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = invoice.status === 'overdue' || (daysUntilDue < 0 && invoice.status !== 'paid');

  return (
    <MemberLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                {invoice.invoiceNumber}
                <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                  {INVOICE_STATUS_LABELS[invoice.status]}
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                {invoice.type === 'deal_milestone' ? 'Deal Milestone Invoice' : 
                 invoice.type === 'deal_full' ? 'Deal Invoice' : 'Standalone Invoice'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Button variant="outline" asChild>
                <Link to={`/invoices/${invoice.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={async () => {
              const { generateBrandedPDF } = await import('@/services/invoicePDF');
              generateBrandedPDF(invoice);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {canSend && (
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            )}
            {isSeller && ['sent', 'viewed', 'overdue'].includes(invoice.status) && (
              <Button variant="outline" onClick={handleSendReminder}>
                <Mail className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
            )}
            {isBuyer && canMarkPaid && (
              <Button onClick={() => setShowPaymentDialog(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
            {isSeller && invoice.status === 'overdue' && (
              <Button variant="outline" onClick={handleSendReminder}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold">{invoice.sellerName}</h2>
                    {invoice.sellerEmail && (
                      <p className="text-muted-foreground">{invoice.sellerEmail}</p>
                    )}
                    {invoice.sellerAddress && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.sellerAddress}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Invoice #</p>
                    <p className="font-mono font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground mt-2">Issue Date</p>
                    <p>{new Date(invoice.issueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bill To</p>
                    <h3 className="font-semibold">{invoice.buyerName}</h3>
                    {invoice.buyerEmail && (
                      <p className="text-sm text-muted-foreground">{invoice.buyerEmail}</p>
                    )}
                    {invoice.buyerAddress && (
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.buyerAddress}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                    {isOverdue && invoice.status !== 'paid' && (
                      <p className="text-sm text-red-600 font-medium">
                        {Math.abs(daysUntilDue)} days overdue
                      </p>
                    )}
                    {daysUntilDue >= 0 && invoice.status !== 'paid' && (
                      <p className="text-sm text-muted-foreground">
                        Due in {daysUntilDue} days
                      </p>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-center p-3 font-medium">Qty</th>
                        <th className="text-right p-3 font-medium">Unit Price</th>
                        <th className="text-right p-3 font-medium">Tax</th>
                        <th className="text-right p-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">{invoiceService.formatCurrency(item.unitPrice, invoice.currency)}</td>
                          <td className="p-3 text-right">{item.taxRate ? `${item.taxRate}%` : '—'}</td>
                          <td className="p-3 text-right font-medium">
                            {invoiceService.formatCurrency(item.quantity * item.unitPrice * (1 + (item.taxRate || 0) / 100), invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{invoiceService.formatCurrency(invoice.subtotal, invoice.currency)}</span>
                    </div>
                    {invoice.taxTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{invoiceService.formatCurrency(invoice.taxTotal, invoice.currency)}</span>
                      </div>
                    )}
                    {invoice.discountTotal > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{invoiceService.formatCurrency(invoice.discountTotal, invoice.currency)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{invoiceService.formatCurrency(invoice.total, invoice.currency)}</span>
                    </div>
                    {invoice.paidAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid</span>
                        <span>-{invoiceService.formatCurrency(invoice.paidAmount, invoice.currency)}</span>
                      </div>
                    )}
                    {invoice.balanceDue > 0 && (
                      <div className="flex justify-between font-bold text-xl border-t pt-2">
                        <span>Balance Due</span>
                        <span className={invoice.status === 'overdue' ? 'text-red-600' : ''}>
                          {invoiceService.formatCurrency(invoice.balanceDue, invoice.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {(invoice.notes || invoice.terms) && (
                  <div className="mt-8 pt-6 border-t space-y-4">
                    {invoice.notes && (
                      <div>
                        <h4 className="font-medium mb-1">Notes</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
                      </div>
                    )}
                    {invoice.terms && (
                      <div>
                        <h4 className="font-medium mb-1">Terms & Conditions</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.terms}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="activity">
              <TabsList>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Invoice Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {invoice.events.map((event, index) => (
                        <div key={event.id} className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-full">
                            {event.type === 'created' && <FileText className="h-4 w-4" />}
                            {event.type === 'sent' && <Send className="h-4 w-4" />}
                            {event.type === 'viewed' && <Eye className="h-4 w-4" />}
                            {event.type === 'paid' && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {event.type === 'partial' && <CreditCard className="h-4 w-4 text-yellow-600" />}
                            {event.type === 'overdue' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                            {event.type === 'reminder' && <Mail className="h-4 w-4" />}
                            {event.type === 'updated' && <Edit className="h-4 w-4" />}
                            {event.type === 'cancelled' && <XCircle className="h-4 w-4" />}
                            {event.type === 'void' && <XCircle className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{event.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invoice.paidAmount === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No payments recorded yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <p className="font-medium text-green-800">Payment Received</p>
                            <p className="text-sm text-green-600">
                              {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <p className="text-xl font-bold text-green-800">
                            {invoiceService.formatCurrency(invoice.paidAmount, invoice.currency)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {invoice.dealTitle && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Deal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{invoice.dealTitle}</p>
                    {invoice.milestoneTitle && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Milestone: {invoice.milestoneTitle}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                      <Link to={`/deals`}>View Deal</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{invoiceService.formatCurrency(invoice.total, invoice.currency)}</p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Paid</p>
                    <p className="font-medium text-green-600">{invoiceService.formatCurrency(invoice.paidAmount, invoice.currency)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance</p>
                    <p className={`font-medium ${invoice.balanceDue > 0 ? 'text-yellow-600' : ''}`}>
                      {invoiceService.formatCurrency(invoice.balanceDue, invoice.currency)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Currency</span>
                    <span>{invoice.currency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {canVoid && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setShowVoidDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Void Invoice
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Payment Amount</Label>
                <Input 
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={invoice.balanceDue.toString()}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Balance due: {invoiceService.formatCurrency(invoice.balanceDue, invoice.currency)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
              <Button onClick={handleMarkPaid}>Record Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Void Invoice</DialogTitle>
            </DialogHeader>
            <p className="py-4">
              Are you sure you want to void this invoice? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVoidDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleVoid}>Void Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MemberLayout>
  );
}
