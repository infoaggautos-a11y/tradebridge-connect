export type InvoiceStatus = 
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'void';

export type InvoiceType = 'standalone' | 'deal_milestone' | 'deal_full';

export type PaymentRecord = {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paidAt: string;
  reference?: string;
  method?: 'bank_transfer' | 'card' | 'mobile_money' | 'escrow';
};

export type InvoiceLineItem = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  
  sellerId: string;
  sellerName: string;
  sellerAddress?: string;
  sellerEmail?: string;
  
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerAddress?: string;
  
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  currency: string;
  
  dealId?: string;
  dealTitle?: string;
  dealMilestoneId?: string;
  milestoneTitle?: string;
  
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  
  notes?: string;
  terms?: string;
  
  events: InvoiceEvent[];
  
  createdAt: string;
  updatedAt: string;
};

export type InvoiceEvent = {
  id: string;
  type: 'created' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'reminder' | 'cancelled' | 'void' | 'updated';
  description: string;
  createdAt: string;
  createdBy?: string;
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  partial: 'Partial Payment',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  void: 'Void',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-indigo-100 text-indigo-700',
  partial: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  void: 'bg-gray-100 text-gray-400',
};

export const CURRENCIES = ['USD', 'EUR', 'NGN'] as const;
export type SupportedCurrency = typeof CURRENCIES[number];

export const DEFAULT_INVOICE_TERMS = 'Payment is due within the specified period. Late payments may incur additional fees.';

export const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2026-001',
    type: 'deal_milestone',
    status: 'paid',
    sellerId: 'b2',
    sellerName: 'Napoli Trade Solutions',
    sellerEmail: 'billing@napolitrade.it',
    buyerId: 'b1',
    buyerName: 'Lagos Agro Exports Ltd',
    buyerEmail: 'accounts@lagosagro.ng',
    lineItems: [
      { id: 'li1', description: 'Premium Olive Oil - Batch 1', quantity: 500, unitPrice: 20 },
      { id: 'li2', description: 'Export Documentation', quantity: 1, unitPrice: 500, taxRate: 7.5 },
    ],
    subtotal: 10500,
    taxTotal: 37.5,
    discountTotal: 0,
    total: 10537.5,
    paidAmount: 10537.5,
    balanceDue: 0,
    currency: 'USD',
    dealId: 'deal_001',
    dealTitle: 'Premium Olive Oil Supply',
    dealMilestoneId: 'ms_001',
    milestoneTitle: 'Initial Shipment',
    issueDate: '2026-02-15',
    dueDate: '2026-03-01',
    paidAt: '2026-02-28',
    events: [
      { id: 'e1', type: 'created', description: 'Invoice created', createdAt: '2026-02-15T10:00:00Z' },
      { id: 'e2', type: 'sent', description: 'Invoice sent to buyer', createdAt: '2026-02-15T10:05:00Z' },
      { id: 'e3', type: 'paid', description: 'Payment received in full', createdAt: '2026-02-28T14:30:00Z' },
    ],
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-28T14:30:00Z',
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2026-002',
    type: 'deal_full',
    status: 'sent',
    sellerId: 'b5',
    sellerName: 'Milano Fashion House',
    sellerEmail: 'finance@milanofashion.it',
    buyerId: 'b9',
    buyerName: 'Paris Boutique Group',
    buyerEmail: 'ap@parisboutique.fr',
    lineItems: [
      { id: 'li1', description: 'Leather Handbags - Collection A', quantity: 100, unitPrice: 85 },
      { id: 'li2', description: 'Custom Branding Service', quantity: 1, unitPrice: 1500 },
    ],
    subtotal: 10000,
    taxTotal: 0,
    discountTotal: 500,
    total: 9500,
    paidAmount: 0,
    balanceDue: 9500,
    currency: 'EUR',
    dealId: 'deal_002',
    dealTitle: 'Leather Goods Partnership',
    issueDate: '2026-03-01',
    dueDate: '2026-03-15',
    events: [
      { id: 'e1', type: 'created', description: 'Invoice created', createdAt: '2026-03-01T09:00:00Z' },
      { id: 'e2', type: 'sent', description: 'Invoice sent to buyer', createdAt: '2026-03-01T09:15:00Z' },
    ],
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-01T09:15:00Z',
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2026-003',
    type: 'standalone',
    status: 'overdue',
    sellerId: 'b6',
    sellerName: 'Rome Consulting Group',
    sellerEmail: 'invoices@romeconsulting.it',
    buyerId: 'b8',
    buyerName: 'Roma Pharma International',
    buyerEmail: 'procurement@romapharma.it',
    lineItems: [
      { id: 'li1', description: 'Market Entry Strategy Consulting', quantity: 1, unitPrice: 8500, taxRate: 22 },
    ],
    subtotal: 8500,
    taxTotal: 1870,
    discountTotal: 0,
    total: 10370,
    paidAmount: 0,
    balanceDue: 10370,
    currency: 'EUR',
    issueDate: '2026-02-10',
    dueDate: '2026-02-25',
    notes: 'Includes market research report and implementation roadmap.',
    terms: 'Net 15. Late payment subject to 1.5% monthly interest.',
    events: [
      { id: 'e1', type: 'created', description: 'Invoice created', createdAt: '2026-02-10T11:00:00Z' },
      { id: 'e2', type: 'sent', description: 'Invoice sent', createdAt: '2026-02-10T11:30:00Z' },
      { id: 'e3', type: 'viewed', description: 'Invoice viewed by buyer', createdAt: '2026-02-12T08:00:00Z' },
      { id: 'e4', type: 'overdue', description: 'Payment overdue', createdAt: '2026-02-26T00:00:00Z' },
      { id: 'e5', type: 'reminder', description: 'Reminder sent (Day 3)', createdAt: '2026-02-28T09:00:00Z' },
    ],
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-28T09:00:00Z',
  },
  {
    id: 'inv_004',
    invoiceNumber: 'INV-2026-004',
    type: 'deal_milestone',
    status: 'partial',
    sellerId: 'b3',
    sellerName: 'Accra Textiles Co.',
    sellerEmail: 'billing@accratex.gh',
    buyerId: 'b11',
    buyerName: 'London Fashion Imports',
    buyerEmail: 'finance@londonfashion.co.uk',
    lineItems: [
      { id: 'li1', description: 'Ankara Fabric - Premium Collection', quantity: 200, unitPrice: 45 },
      { id: 'li2', description: 'Quality Certification', quantity: 1, unitPrice: 300 },
    ],
    subtotal: 9300,
    taxTotal: 0,
    discountTotal: 0,
    total: 9300,
    paidAmount: 5000,
    balanceDue: 4300,
    currency: 'USD',
    dealId: 'deal_005',
    dealTitle: 'Textile Export Order',
    dealMilestoneId: 'ms_005',
    milestoneTitle: 'Second Shipment',
    issueDate: '2026-02-20',
    dueDate: '2026-03-06',
    events: [
      { id: 'e1', type: 'created', description: 'Invoice created', createdAt: '2026-02-20T14:00:00Z' },
      { id: 'e2', type: 'sent', description: 'Invoice sent', createdAt: '2026-02-20T14:10:00Z' },
      { id: 'e3', type: 'partial', description: 'Partial payment received: $5,000', createdAt: '2026-02-25T10:00:00Z' },
    ],
    createdAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-02-25T10:00:00Z',
  },
  {
    id: 'inv_005',
    invoiceNumber: 'INV-2026-005',
    type: 'standalone',
    status: 'draft',
    sellerId: 'b2',
    sellerName: 'Napoli Trade Solutions',
    sellerEmail: 'billing@napolitrade.it',
    buyerId: 'b1',
    buyerName: 'Lagos Agro Exports Ltd',
    buyerEmail: 'accounts@lagosagro.ng',
    lineItems: [
      { id: 'li1', description: 'Consultation Services - Q1 2026', quantity: 10, unitPrice: 200 },
    ],
    subtotal: 2000,
    taxTotal: 150,
    discountTotal: 0,
    total: 2150,
    paidAmount: 0,
    balanceDue: 2150,
    currency: 'USD',
    issueDate: '2026-03-15',
    dueDate: '2026-03-30',
    notes: 'Includes strategy review and quarterly planning session.',
    terms: 'Net 15',
    events: [
      { id: 'e1', type: 'created', description: 'Invoice created', createdAt: '2026-03-15T09:00:00Z' },
    ],
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-15T09:00:00Z',
  },
];
