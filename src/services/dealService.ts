import {
  Deal,
  DealStatus,
  DealType,
  DealMilestone,
  Escrow,
  EscrowStatus,
  EscrowTransaction,
  Wallet,
  WalletTransaction,
  PaymentMethod,
  COMMISSION_RATES,
  DealFilters,
} from '@/types/deal';

const generateId = () => `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateDealNumber = () => `DIL-${Date.now().toString(36).toUpperCase()}`;

const mockDeals: Deal[] = [
  {
    id: 'deal_001',
    dealNumber: 'DIL-2026-001',
    buyerId: 'b1',
    sellerId: 'b2',
    title: 'Premium Olive Oil Supply Agreement',
    description: 'Monthly supply of 50MT premium olive oil for the Nigerian market',
    type: 'goods',
    status: 'in_progress',
    totalAmount: 50000,
    currency: 'USD',
    terms: 'Payment via escrow. Delivery within 30 days of order confirmation. Quality inspection required before release.',
    milestones: [
      {
        id: 'mile_001',
        dealId: 'deal_001',
        order: 1,
        title: 'Initial Deposit',
        description: '30% deposit to begin production',
        amount: 15000,
        currency: 'USD',
        status: 'accepted',
        deliveredAt: '2026-01-20T10:00:00Z',
        acceptedAt: '2026-01-22T14:00:00Z',
      },
      {
        id: 'mile_002',
        dealId: 'deal_001',
        order: 2,
        title: 'Shipment Notification',
        description: 'Bill of lading and quality certificates',
        amount: 0,
        currency: 'USD',
        status: 'delivered',
        deliveredAt: '2026-02-10T09:00:00Z',
      },
      {
        id: 'mile_003',
        dealId: 'deal_001',
        order: 3,
        title: 'Final Payment & Release',
        description: 'Balance payment upon satisfactory quality inspection',
        amount: 35000,
        currency: 'USD',
        status: 'funded',
      },
    ],
    documents: ['contract_v1.pdf', 'quality_specs.pdf'],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'deal_002',
    dealNumber: 'DIL-2026-002',
    buyerId: 'b5',
    sellerId: 'b9',
    title: 'Leather Goods Production Partnership',
    description: 'Quarterly supply of leather bags and accessories for Italian retail',
    type: 'goods',
    status: 'escrow_funded',
    totalAmount: 30000,
    currency: 'EUR',
    terms: 'Quarterly orders. 50% advance, 50% on delivery.',
    milestones: [
      {
        id: 'mile_004',
        dealId: 'deal_002',
        order: 1,
        title: 'First Order Advance',
        description: '50% advance for first quarterly order',
        amount: 15000,
        currency: 'EUR',
        status: 'accepted',
      },
    ],
    documents: ['partnership_agreement.pdf'],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'deal_003',
    dealNumber: 'DIL-2026-003',
    buyerId: 'b8',
    sellerId: 'b6',
    title: 'Oil Equipment Technical Services',
    description: 'Technical consulting and equipment supply for oilfield services',
    type: 'services',
    status: 'disputed',
    totalAmount: 150000,
    currency: 'USD',
    terms: 'Milestone-based payments as per service agreement.',
    milestones: [
      {
        id: 'mile_005',
        dealId: 'deal_003',
        order: 1,
        title: 'Phase 1 - Assessment',
        description: 'Initial site assessment and report',
        amount: 25000,
        currency: 'USD',
        status: 'accepted',
      },
      {
        id: 'mile_006',
        dealId: 'deal_003',
        order: 2,
        title: 'Phase 2 - Implementation',
        description: 'Equipment supply and installation',
        amount: 75000,
        currency: 'USD',
        status: 'disputed',
      },
      {
        id: 'mile_007',
        dealId: 'deal_003',
        order: 3,
        title: 'Phase 3 - Training',
        description: 'Staff training and handover',
        amount: 50000,
        currency: 'USD',
        status: 'pending',
      },
    ],
    documents: ['service_contract.pdf', 'sow.pdf'],
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'deal_004',
    dealNumber: 'DIL-2026-004',
    buyerId: 'b3',
    sellerId: 'b10',
    title: 'Textile Shipment to Ghana',
    description: 'Export of African print fabric to Ghanaian distributor',
    type: 'goods',
    status: 'completed',
    totalAmount: 12000,
    currency: 'USD',
    terms: 'FOB Lagos. Payment in advance via escrow.',
    milestones: [
      {
        id: 'mile_008',
        dealId: 'deal_004',
        order: 1,
        title: 'Full Payment',
        description: 'Full payment for order',
        amount: 12000,
        currency: 'USD',
        status: 'accepted',
        deliveredAt: '2025-11-15T10:00:00Z',
        acceptedAt: '2025-11-20T14:00:00Z',
      },
    ],
    documents: ['invoice.pdf', 'packing_list.pdf'],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-20T14:00:00Z',
    completedAt: '2025-11-20T14:00:00Z',
  },
];

const mockEscrows: Escrow[] = [
  {
    id: 'escrow_001',
    escrowNumber: 'ESC-2026-001',
    dealId: 'deal_001',
    buyerId: 'b1',
    sellerId: 'b2',
    amount: 35000,
    currency: 'USD',
    status: 'funded',
    fundedAt: '2026-02-12T10:00:00Z',
    transactions: [
      {
        id: 'tx_001',
        escrowId: 'escrow_001',
        type: 'deposit',
        amount: 35000,
        currency: 'USD',
        description: 'Escrow deposit for milestone 3',
        status: 'completed',
        createdAt: '2026-02-12T10:00:00Z',
        completedAt: '2026-02-12T10:05:00Z',
      },
    ],
    commission: 875,
    commissionRate: 0.025,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-12T10:05:00Z',
  },
  {
    id: 'escrow_002',
    escrowNumber: 'ESC-2026-002',
    dealId: 'deal_002',
    buyerId: 'b5',
    sellerId: 'b9',
    amount: 15000,
    currency: 'EUR',
    status: 'funded',
    fundedAt: '2026-02-16T10:00:00Z',
    transactions: [
      {
        id: 'tx_002',
        escrowId: 'escrow_002',
        type: 'deposit',
        amount: 15000,
        currency: 'EUR',
        description: 'Escrow deposit for first order',
        status: 'completed',
        createdAt: '2026-02-16T10:00:00Z',
        completedAt: '2026-02-16T10:03:00Z',
      },
    ],
    commission: 300,
    commissionRate: 0.02,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-16T10:03:00Z',
  },
  {
    id: 'escrow_003',
    escrowNumber: 'ESC-2026-003',
    dealId: 'deal_003',
    buyerId: 'b8',
    sellerId: 'b6',
    amount: 75000,
    currency: 'USD',
    status: 'frozen',
    fundedAt: '2026-01-10T10:00:00Z',
    transactions: [
      {
        id: 'tx_003',
        escrowId: 'escrow_003',
        type: 'deposit',
        amount: 75000,
        currency: 'USD',
        description: 'Escrow deposit for phase 2',
        status: 'completed',
        createdAt: '2026-01-10T10:00:00Z',
        completedAt: '2026-01-10T10:05:00Z',
      },
    ],
    commission: 1500,
    commissionRate: 0.02,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
  },
];

const mockWallets: Wallet[] = [
  {
    id: 'wallet_b1',
    businessId: 'b1',
    currency: 'USD',
    balance: 45000,
    pendingBalance: 35000,
    availableBalance: 10000,
    status: 'active',
    transactions: [
      {
        id: 'wt_001',
        walletId: 'wallet_b1',
        type: 'escrow_funding',
        amount: -35000,
        currency: 'USD',
        balanceAfter: 10000,
        description: 'Funds moved to escrow',
        reference: 'escrow_001',
        status: 'completed',
        createdAt: '2026-02-12T10:00:00Z',
        completedAt: '2026-02-12T10:05:00Z',
      },
    ],
    lastUpdated: '2026-02-12T10:05:00Z',
  },
  {
    id: 'wallet_b2',
    businessId: 'b2',
    currency: 'USD',
    balance: 15000,
    pendingBalance: 0,
    availableBalance: 15000,
    status: 'active',
    transactions: [
      {
        id: 'wt_002',
        walletId: 'wallet_b2',
        type: 'escrow_release',
        amount: 14125,
        currency: 'USD',
        balanceAfter: 15000,
        description: 'Escrow release for milestone 1',
        reference: 'escrow_001',
        status: 'completed',
        createdAt: '2026-01-22T14:00:00Z',
        completedAt: '2026-01-22T14:05:00Z',
      },
    ],
    lastUpdated: '2026-01-22T14:05:00Z',
  },
];

export const dealService = {
  getDeal(id: string): Deal | undefined {
    return mockDeals.find(d => d.id === id);
  },

  getAllDeals(): Deal[] {
    return mockDeals;
  },

  getDealsByBusiness(businessId: string): Deal[] {
    return mockDeals.filter(d => d.buyerId === businessId || d.sellerId === businessId);
  },

  getDealsByStatus(status: DealStatus): Deal[] {
    return mockDeals.filter(d => d.status === status);
  },

  filterDeals(filters: DealFilters): Deal[] {
    return mockDeals.filter(d => {
      if (filters.status && d.status !== filters.status) return false;
      if (filters.type && d.type !== filters.type) return false;
      if (filters.buyerId && d.buyerId !== filters.buyerId) return false;
      if (filters.sellerId && d.sellerId !== filters.sellerId) return false;
      return true;
    });
  },

  createDeal(data: {
    buyerId: string;
    sellerId: string;
    title: string;
    description: string;
    type: DealType;
    totalAmount: number;
    currency: string;
    terms: string;
  }): Deal {
    const newDeal: Deal = {
      id: generateId(),
      dealNumber: generateDealNumber(),
      ...data,
      status: 'draft',
      milestones: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDeals.push(newDeal);
    return newDeal;
  },

  updateDealStatus(dealId: string, status: DealStatus): Deal | null {
    const deal = mockDeals.find(d => d.id === dealId);
    if (!deal) return null;

    deal.status = status;
    deal.updatedAt = new Date().toISOString();
    if (status === 'completed') {
      deal.completedAt = new Date().toISOString();
    }
    return deal;
  },

  addMilestone(dealId: string, milestone: Omit<DealMilestone, 'id' | 'dealId'>): Deal | null {
    const deal = mockDeals.find(d => d.id === dealId);
    if (!deal) return null;

    const newMilestone: DealMilestone = {
      ...milestone,
      id: generateId(),
      dealId,
    };
    deal.milestones.push(newMilestone);
    deal.updatedAt = new Date().toISOString();
    return deal;
  },

  getEscrow(id: string): Escrow | undefined {
    return mockEscrows.find(e => e.id === id);
  },

  getEscrowByDeal(dealId: string): Escrow | undefined {
    return mockEscrows.find(e => e.dealId === dealId);
  },

  getAllEscrows(): Escrow[] {
    return mockEscrows;
  },

  getEscrowStats() {
    const total = mockEscrows.reduce((sum, e) => sum + e.amount, 0);
    const funded = mockEscrows
      .filter(e => e.status === 'funded' || e.status === 'frozen')
      .reduce((sum, e) => sum + e.amount, 0);
    const released = mockEscrows
      .filter(e => e.status === 'released')
      .reduce((sum, e) => sum + e.amount, 0);
    const frozen = mockEscrows
      .filter(e => e.status === 'frozen')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalCommission = mockEscrows.reduce((sum, e) => sum + e.commission, 0);

    return { total, funded, released, frozen, totalCommission };
  },

  createEscrow(dealId: string, amount: number, currency: string): Escrow | null {
    const deal = mockDeals.find(d => d.id === dealId);
    if (!deal) return null;

    const escrow: Escrow = {
      id: generateId(),
      escrowNumber: `ESC-${Date.now().toString(36).toUpperCase()}`,
      dealId,
      buyerId: deal.buyerId,
      sellerId: deal.sellerId,
      amount,
      currency,
      status: 'pending',
      transactions: [],
      commission: amount * COMMISSION_RATES.standard,
      commissionRate: COMMISSION_RATES.standard,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockEscrows.push(escrow);
    return escrow;
  },

  fundEscrow(escrowId: string): Escrow | null {
    const escrow = mockEscrows.find(e => e.id === escrowId);
    if (!escrow) return null;

    escrow.status = 'funded';
    escrow.fundedAt = new Date().toISOString();
    escrow.transactions.push({
      id: generateId(),
      escrowId,
      type: 'deposit',
      amount: escrow.amount,
      currency: escrow.currency,
      description: 'Escrow deposit',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    escrow.updatedAt = new Date().toISOString();

    const deal = mockDeals.find(d => d.id === escrow.dealId);
    if (deal) {
      deal.status = 'escrow_funded';
    }

    return escrow;
  },

  releaseEscrow(escrowId: string, amount?: number): Escrow | null {
    const escrow = mockEscrows.find(e => e.id === escrowId);
    if (!escrow) return null;

    const releaseAmount = amount || escrow.amount - escrow.commission;
    const sellerAmount = releaseAmount - escrow.commission;

    escrow.status = amount && amount < escrow.amount ? 'partially_released' : 'released';
    escrow.releasedAt = new Date().toISOString();

    escrow.transactions.push({
      id: generateId(),
      escrowId,
      type: 'release',
      amount: sellerAmount,
      currency: escrow.currency,
      description: 'Release to seller',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    escrow.transactions.push({
      id: generateId(),
      escrowId,
      type: 'commission',
      amount: escrow.commission,
      currency: escrow.currency,
      description: 'DIL Commission',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    escrow.updatedAt = new Date().toISOString();

    const deal = mockDeals.find(d => d.id === escrow.dealId);
    if (deal && escrow.status === 'released') {
      deal.status = 'completed';
      deal.completedAt = new Date().toISOString();
    }

    return escrow;
  },

  refundEscrow(escrowId: string): Escrow | null {
    const escrow = mockEscrows.find(e => e.id === escrowId);
    if (!escrow) return null;

    escrow.status = 'refunded';
    escrow.releasedAt = new Date().toISOString();

    escrow.transactions.push({
      id: generateId(),
      escrowId,
      type: 'refund',
      amount: escrow.amount,
      currency: escrow.currency,
      description: 'Refund to buyer',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    escrow.updatedAt = new Date().toISOString();

    const deal = mockDeals.find(d => d.id === escrow.dealId);
    if (deal) {
      deal.status = 'cancelled';
    }

    return escrow;
  },

  freezeEscrow(escrowId: string): Escrow | null {
    const escrow = mockEscrows.find(e => e.id === escrowId);
    if (!escrow) return null;

    escrow.status = 'frozen';
    escrow.updatedAt = new Date().toISOString();

    const deal = mockDeals.find(d => d.id === escrow.dealId);
    if (deal) {
      deal.status = 'disputed';
    }

    return escrow;
  },

  getWallet(businessId: string): Wallet | undefined {
    return mockWallets.find(w => w.businessId === businessId);
  },

  getAllWallets(): Wallet[] {
    return mockWallets;
  },

  getPlatformRevenue() {
    const commissions = mockEscrows.reduce((sum, e) => {
      const tx = e.transactions.find(t => t.type === 'commission');
      return sum + (tx?.amount || 0);
    }, 0);
    return commissions;
  },
};
