import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { invoiceService, CreateInvoiceParams } from '@/services/invoiceService';
import { invoiceService as svc } from '@/services/invoiceService';
import { Invoice, InvoiceLineItem, CURRENCIES, DEFAULT_INVOICE_TERMS } from '@/types/invoice';
import { businesses } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Plus, Trash2, Save, Send, ArrowLeft, 
  Building2, DollarSign, Calendar, AlignLeft, Copy
} from 'lucide-react';

interface LineItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export default function InvoiceFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isEditing = Boolean(id);
  const businessId = user?.businessId || 'b2';
  const myBusiness = businesses.find(b => b.id === businessId);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    type: 'standalone' | 'deal_milestone' | 'deal_full';
    buyerId: string;
    buyerName: string;
    buyerEmail: string;
    buyerAddress: string;
    currency: string;
    dueDate: string;
    lineItems: LineItemForm[];
    notes: string;
    terms: string;
  }>({
    type: 'standalone',
    buyerId: '',
    buyerName: '',
    buyerEmail: '',
    buyerAddress: '',
    currency: 'USD',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }],
    notes: '',
    terms: DEFAULT_INVOICE_TERMS,
  });

  useEffect(() => {
    if (isEditing && id) {
      const invoice = invoiceService['invoices'].find(i => i.id === id);
      if (invoice) {
        setFormData({
          type: invoice.type,
          buyerId: invoice.buyerId,
          buyerName: invoice.buyerName,
          buyerEmail: invoice.buyerEmail || '',
          buyerAddress: invoice.buyerAddress || '',
          currency: invoice.currency,
          dueDate: invoice.dueDate,
          lineItems: invoice.lineItems.map(li => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            taxRate: li.taxRate || 0,
          })),
          notes: invoice.notes || '',
          terms: invoice.terms || DEFAULT_INVOICE_TERMS,
        });
      }
    }
  }, [id, isEditing]);

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index),
      }));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.lineItems.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const taxTotal = formData.lineItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (item.taxRate ? itemTotal * (item.taxRate / 100) : 0);
    }, 0);
    const total = subtotal + taxTotal;
    return { subtotal, taxTotal, total };
  };

  const { subtotal, taxTotal, total } = calculateTotals();

  const handleBuyerSelect = (buyerId: string) => {
    const buyer = businesses.find(b => b.id === buyerId);
    if (buyer) {
      setFormData(prev => ({
        ...prev,
        buyerId,
        buyerName: buyer.name,
        buyerEmail: buyer.contactEmail,
      }));
    }
  };

  const handleSubmit = async (sendImmediately: boolean = false) => {
    if (!formData.buyerName) {
      toast({ title: 'Error', description: 'Please select a buyer', variant: 'destructive' });
      return;
    }
    
    if (formData.lineItems.every(li => !li.description)) {
      toast({ title: 'Error', description: 'Please add at least one line item', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const params: CreateInvoiceParams = {
        type: formData.type,
        sellerId: businessId,
        sellerName: myBusiness?.name || 'Unknown Business',
        sellerEmail: myBusiness?.contactEmail,
        buyerId: formData.buyerId || 'unknown',
        buyerName: formData.buyerName,
        buyerEmail: formData.buyerEmail,
        buyerAddress: formData.buyerAddress,
        currency: formData.currency,
        dueDate: formData.dueDate,
        lineItems: formData.lineItems.filter(li => li.description),
        notes: formData.notes,
        terms: formData.terms,
      };

      if (isEditing && id) {
        await invoiceService.updateInvoice(id, {
          buyerId: params.buyerId,
          buyerName: params.buyerName,
          buyerEmail: params.buyerEmail,
          buyerAddress: params.buyerAddress,
          currency: params.currency,
          dueDate: params.dueDate,
          lineItems: params.lineItems as any,
          notes: params.notes,
          terms: params.terms,
        });
      } else {
        const invoice = await invoiceService.createInvoice(params);
        if (sendImmediately) {
          await invoiceService.sendInvoice(invoice.id);
        }
      }

      toast({ 
        title: sendImmediately ? 'Invoice sent' : 'Invoice saved', 
        description: sendImmediately ? 'Invoice has been sent to the buyer' : 'Invoice has been saved as draft' 
      });
      navigate('/invoices');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save invoice', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyInvoiceNumber = () => {
    const num = invoiceService.getNextInvoiceNumber();
    navigator.clipboard.writeText(num);
    toast({ title: 'Copied', description: `Invoice number ${num} copied to clipboard` });
  };

  const otherBusinesses = businesses.filter(b => b.id !== businessId);

  return (
    <MemberLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {isEditing ? 'Edit Invoice' : 'New Invoice'}
            </h1>
            <p className="text-muted-foreground">Create and manage your invoices</p>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={copyInvoiceNumber}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Number
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buyer Information</CardTitle>
                <CardDescription>Select or enter buyer details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Buyer</Label>
                  <Select onValueChange={handleBuyerSelect} value={formData.buyerId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a business..." />
                    </SelectTrigger>
                    <SelectContent>
                      {otherBusinesses.map(b => (
                        <SelectItem key={b.id} value={b.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            {b.name}
                            <Badge variant="outline" className="ml-2">{b.country}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Buyer Name</Label>
                    <Input 
                      value={formData.buyerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={formData.buyerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, buyerEmail: e.target.value }))}
                      placeholder="billing@company.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Address</Label>
                  <Textarea 
                    value={formData.buyerAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyerAddress: e.target.value }))}
                    placeholder="Business address"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Line Items
                  <Button size="sm" variant="outline" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </CardTitle>
                <CardDescription>Add products or services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-center p-3 font-medium w-24">Qty</th>
                        <th className="text-right p-3 font-medium w-32">Unit Price</th>
                        <th className="text-center p-3 font-medium w-24">Tax %</th>
                        <th className="text-right p-3 font-medium w-28">Total</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.lineItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <Input 
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              placeholder="Product or service description"
                            />
                          </td>
                          <td className="p-2">
                            <Input 
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                              className="text-center"
                            />
                          </td>
                          <td className="p-2">
                            <Input 
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                              className="text-right"
                            />
                          </td>
                          <td className="p-2">
                            <Input 
                              type="number"
                              min={0}
                              max={100}
                              value={item.taxRate}
                              onChange={(e) => updateLineItem(index, 'taxRate', Number(e.target.value))}
                              className="text-center"
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            {svc.formatCurrency(item.quantity * item.unitPrice * (1 + item.taxRate / 100), formData.currency)}
                          </td>
                          <td className="p-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeLineItem(index)}
                              disabled={formData.lineItems.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{svc.formatCurrency(subtotal, formData.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{svc.formatCurrency(taxTotal, formData.currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>{svc.formatCurrency(total, formData.currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standalone">Standalone Invoice</SelectItem>
                        <SelectItem value="deal_full">Full Deal Invoice</SelectItem>
                        <SelectItem value="deal_milestone">Milestone Invoice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Due Date</Label>
                  <Input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for the buyer"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea 
                    value={formData.terms}
                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{myBusiness?.name || 'Your Business'}</p>
                    <p className="text-sm text-muted-foreground">{myBusiness?.country}</p>
                    <p className="text-sm text-muted-foreground">{myBusiness?.contactEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex-1 justify-center">
                    {formData.type === 'standalone' ? 'Standalone' : formData.type === 'deal_full' ? 'Deal' : 'Milestone'}
                  </Badge>
                  <Badge variant="outline" className="flex-1 justify-center">
                    {formData.currency}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{formData.lineItems.filter(li => li.description).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{svc.formatCurrency(subtotal, formData.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{svc.formatCurrency(taxTotal, formData.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>{svc.formatCurrency(total, formData.currency)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button 
                    variant="default"
                    className="w-full" 
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Save & Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
