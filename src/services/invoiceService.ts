import {
  Invoice,
  InvoiceStatus,
  InvoiceType,
  InvoiceLineItem,
  InvoiceEvent,
  PaymentRecord,
  CURRENCIES,
  DEFAULT_INVOICE_TERMS,
  mockInvoices,
} from '@/types/invoice';
import { Deal, DealMilestone } from '@/types/deal';

const generateId = (prefix: string = 'inv') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export interface CreateInvoiceParams {
  type: InvoiceType;
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  sellerAddress?: string;
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerAddress?: string;
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  currency: string;
  dueDate: string;
  dealId?: string;
  dealTitle?: string;
  dealMilestoneId?: string;
  milestoneTitle?: string;
  notes?: string;
  terms?: string;
}

export interface RecordPaymentParams {
  invoiceId: string;
  amount: number;
  reference?: string;
  method?: 'bank_transfer' | 'card' | 'mobile_money' | 'escrow';
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  type?: InvoiceType;
  sellerId?: string;
  buyerId?: string;
  dealId?: string;
  currency?: string;
  dateFrom?: string;
  dateTo?: string;
}

class InvoiceService {
  private invoices: Invoice[] = [...mockInvoices];

  getNextInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const count = this.invoices.filter(i => i.invoiceNumber.includes(year.toString())).length + 1;
    return `INV-${year}-${String(count).padStart(3, '0')}`;
  }

  calculateTotals(lineItems: Omit<InvoiceLineItem, 'id'>[]) {
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxTotal = lineItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (item.taxRate ? itemTotal * (item.taxRate / 100) : 0);
    }, 0);
    const discountTotal = lineItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    const total = subtotal + taxTotal - discountTotal;
    return { subtotal, taxTotal, discountTotal, total };
  }

  async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
    const totals = this.calculateTotals(params.lineItems);
    const lineItems: InvoiceLineItem[] = params.lineItems.map((item, idx) => ({
      ...item,
      id: `li_${Date.now()}_${idx}`,
    }));

    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber: this.getNextInvoiceNumber(),
      type: params.type,
      status: 'draft',
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      sellerEmail: params.sellerEmail,
      sellerAddress: params.sellerAddress,
      buyerId: params.buyerId,
      buyerName: params.buyerName,
      buyerEmail: params.buyerEmail,
      buyerAddress: params.buyerAddress,
      lineItems,
      ...totals,
      paidAmount: 0,
      balanceDue: totals.total,
      currency: params.currency,
      dealId: params.dealId,
      dealTitle: params.dealTitle,
      dealMilestoneId: params.dealMilestoneId,
      milestoneTitle: params.milestoneTitle,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: params.dueDate,
      notes: params.notes,
      terms: params.terms || DEFAULT_INVOICE_TERMS,
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoice.events.push({
      id: generateId('evt'),
      type: 'created',
      description: 'Invoice created',
      createdAt: new Date().toISOString(),
    });

    this.invoices.unshift(invoice);
    return invoice;
  }

  async createFromDealMilestone(
    deal: Deal,
    milestone: DealMilestone,
    sellerId: string,
    sellerName: string,
    sellerEmail?: string
  ): Promise<Invoice> {
    return this.createInvoice({
      type: 'deal_milestone',
      sellerId,
      sellerName,
      sellerEmail,
      buyerId: deal.buyerId,
      buyerName: deal.sellerId === sellerId ? deal.buyerId : deal.sellerId,
      buyerEmail: undefined,
      currency: deal.currency,
      dueDate: milestone.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [{
        description: milestone.title,
        quantity: 1,
        unitPrice: milestone.amount,
      }],
      dealId: deal.id,
      dealTitle: deal.title,
      dealMilestoneId: milestone.id,
      milestoneTitle: milestone.title,
    });
  }

  async createFromDeal(
    deal: Deal,
    sellerId: string,
    sellerName: string,
    sellerEmail?: string,
    milestonesAsLineItems: boolean = true
  ): Promise<Invoice> {
    if (milestonesAsLineItems && deal.milestones.length > 0) {
      const lineItems = deal.milestones.map(m => ({
        description: `${m.title} (${m.id})`,
        quantity: 1,
        unitPrice: m.amount,
      }));
      return this.createInvoice({
        type: 'deal_full',
        sellerId,
        sellerName,
        sellerEmail,
        buyerId: deal.sellerId === sellerId ? deal.buyerId : deal.sellerId,
        buyerEmail: undefined,
        currency: deal.currency,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lineItems,
        dealId: deal.id,
        dealTitle: deal.title,
      });
    }
    return this.createInvoice({
      type: 'deal_full',
      sellerId,
      sellerName,
      sellerEmail,
      buyerId: deal.sellerId === sellerId ? deal.buyerId : deal.sellerId,
      buyerEmail: undefined,
      currency: deal.currency,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lineItems: [{
        description: deal.title,
        quantity: 1,
        unitPrice: deal.totalAmount,
      }],
      dealId: deal.id,
      dealTitle: deal.title,
    });
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return this.invoices.find(i => i.id === id) || null;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    return this.invoices.find(i => i.invoiceNumber === invoiceNumber) || null;
  }

  async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
    let results = [...this.invoices];
    
    if (filters) {
      if (filters.status) results = results.filter(i => i.status === filters.status);
      if (filters.type) results = results.filter(i => i.type === filters.type);
      if (filters.sellerId) results = results.filter(i => i.sellerId === filters.sellerId);
      if (filters.buyerId) results = results.filter(i => i.buyerId === filters.buyerId);
      if (filters.dealId) results = results.filter(i => i.dealId === filters.dealId);
      if (filters.currency) results = results.filter(i => i.currency === filters.currency);
      if (filters.dateFrom) results = results.filter(i => i.issueDate >= filters.dateFrom!);
      if (filters.dateTo) results = results.filter(i => i.issueDate <= filters.dateTo!);
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getInvoicesBySeller(sellerId: string): Promise<Invoice[]> {
    return this.getInvoices({ sellerId });
  }

  async getInvoicesByBuyer(buyerId: string): Promise<Invoice[]> {
    return this.getInvoices({ buyerId });
  }

  async getInvoicesByDeal(dealId: string): Promise<Invoice[]> {
    return this.getInvoices({ dealId });
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) return null;

    if (updates.lineItems) {
      const totals = this.calculateTotals(updates.lineItems);
      updates = { ...updates, ...totals };
      updates.balanceDue = updates.total! - this.invoices[index].paidAmount;
    }

    this.invoices[index] = {
      ...this.invoices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.addEvent(id, 'updated', 'Invoice updated');
    return this.invoices[index];
  }

  async sendInvoice(id: string): Promise<Invoice | null> {
    const invoice = await this.getInvoice(id);
    if (!invoice || invoice.status === 'void' || invoice.status === 'cancelled') return null;

    invoice.status = invoice.status === 'draft' ? 'sent' : invoice.status;
    invoice.updatedAt = new Date().toISOString();
    
    this.addEvent(id, 'sent', 'Invoice sent to buyer');
    
    // In real implementation, this would trigger email service
    this.sendInvoiceEmail(invoice);
    
    return invoice;
  }

  async recordPayment(params: RecordPaymentParams): Promise<Invoice | null> {
    const invoice = await this.getInvoice(params.invoiceId);
    if (!invoice) return null;

    const newPaidAmount = invoice.paidAmount + params.amount;
    const isFullyPaid = newPaidAmount >= invoice.total;

    invoice.paidAmount = newPaidAmount;
    invoice.balanceDue = Math.max(0, invoice.total - newPaidAmount);
    invoice.status = isFullyPaid ? 'paid' : 'partial';
    invoice.paidAt = isFullyPaid ? new Date().toISOString() : undefined;
    invoice.updatedAt = new Date().toISOString();

    const eventType: InvoiceEvent['type'] = isFullyPaid ? 'paid' : 'partial';
    const description = isFullyPaid 
      ? `Payment received: ${this.formatCurrency(params.amount, invoice.currency)}`
      : `Partial payment received: ${this.formatCurrency(params.amount, invoice.currency)}`;
    
    this.addEvent(params.invoiceId, eventType, description);

    return invoice;
  }

  async markAsViewed(id: string): Promise<Invoice | null> {
    const invoice = await this.getInvoice(id);
    if (!invoice || invoice.status === 'viewed') return invoice;

    invoice.status = 'viewed';
    invoice.updatedAt = new Date().toISOString();
    this.addEvent(id, 'viewed', 'Invoice viewed by buyer');

    return invoice;
  }

  async markAsOverdue(id: string): Promise<Invoice | null> {
    const invoice = await this.getInvoice(id);
    if (!invoice || invoice.status === 'paid' || invoice.status === 'void') return null;

    invoice.status = 'overdue';
    invoice.updatedAt = new Date().toISOString();
    this.addEvent(id, 'overdue', 'Payment overdue');

    return invoice;
  }

  async sendReminder(id: string): Promise<Invoice | null> {
    const invoice = await this.getInvoice(id);
    if (!invoice || invoice.status === 'paid' || invoice.status === 'void') return null;

    this.addEvent(id, 'reminder', 'Payment reminder sent');
    
    // In real implementation, this would trigger email service
    this.sendReminderEmail(invoice);
    
    return invoice;
  }

  async cancelInvoice(id: string): Promise<Invoice | null> {
    const invoice = await this.getInvoice(id);
    if (!invoice || invoice.status === 'paid' || invoice.status === 'void') return null;

    invoice.status = 'cancelled';
    invoice.updatedAt = new Date().toISOString();
    this.addEvent(id, 'cancelled', 'Invoice cancelled');

    return invoice;
  }

  async voidInvoice(id: string): Promise<Invoice | null> {
    const invoice = await this.getInvoice(id);
    if (!invoice || invoice.status === 'paid') return null;

    invoice.status = 'void';
    invoice.updatedAt = new Date().toISOString();
    this.addEvent(id, 'void', 'Invoice voided');

    return invoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    const invoice = this.invoices[index];
    if (invoice.status !== 'draft') return false;

    this.invoices.splice(index, 1);
    return true;
  }

  async checkOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];
    const overdueInvoices: Invoice[] = [];

    for (const invoice of this.invoices) {
      if (
        (invoice.status === 'sent' || invoice.status === 'viewed') &&
        invoice.dueDate < today
      ) {
        await this.markAsOverdue(invoice.id);
        overdueInvoices.push(invoice);
      }
    }

    return overdueInvoices;
  }

  async getOverdueReminders(): Promise<{ invoice: Invoice; daysOverdue: number }[]> {
    const today = new Date();
    const reminders: { invoice: Invoice; daysOverdue: number }[] = [];

    for (const invoice of this.invoices) {
      if (invoice.status === 'overdue') {
        const dueDate = new Date(invoice.dueDate);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue === 3 || daysOverdue === 7 || daysOverdue === 14 || daysOverdue === 30) {
          reminders.push({ invoice, daysOverdue });
        }
      }
    }

    return reminders;
  }

  getSummary() {
    const total = this.invoices.length;
    const paid = this.invoices.filter(i => i.status === 'paid').length;
    const pending = this.invoices.filter(i => ['sent', 'viewed'].includes(i.status)).length;
    const overdue = this.invoices.filter(i => i.status === 'overdue').length;
    const draft = this.invoices.filter(i => i.status === 'draft').length;

    const totalValue = this.invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = this.invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalOutstanding = this.invoices.reduce((sum, i) => sum + i.balanceDue, 0);

    return {
      counts: { total, paid, pending, overdue, draft },
      values: { totalValue, totalPaid, totalOutstanding },
    };
  }

  getCurrencyStats() {
    const stats: Record<string, { total: number; paid: number; outstanding: number; count: number }> = {};
    
    for (const currency of CURRENCIES) {
      const currencyInvoices = this.invoices.filter(i => i.currency === currency);
      stats[currency] = {
        total: currencyInvoices.reduce((sum, i) => sum + i.total, 0),
        paid: currencyInvoices.reduce((sum, i) => sum + i.paidAmount, 0),
        outstanding: currencyInvoices.reduce((sum, i) => sum + i.balanceDue, 0),
        count: currencyInvoices.length,
      };
    }

    return stats;
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString('en-NG')}`;
    }
    if (currency === 'EUR') {
      return `€${amount.toLocaleString('en-DE', { minimumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  private addEvent(invoiceId: string, type: InvoiceEvent['type'], description: string) {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (invoice) {
      invoice.events.push({
        id: generateId('evt'),
        type,
        description,
        createdAt: new Date().toISOString(),
      });
    }
  }

  private async sendInvoiceEmail(invoice: Invoice) {
    console.log(`[Email] Invoice ${invoice.invoiceNumber} sent to ${invoice.buyerEmail || invoice.buyerName}`);
  }

  private async sendReminderEmail(invoice: Invoice) {
    console.log(`[Email] Reminder for invoice ${invoice.invoiceNumber} sent to ${invoice.buyerEmail || invoice.buyerName}`);
  }
}

export const invoiceService = new InvoiceService();
