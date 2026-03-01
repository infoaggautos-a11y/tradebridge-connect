import {
  FinanceKPIs,
  FinanceRevenue,
  FinancePayout,
  FinanceEscrowLiability,
  FinanceFXExposure,
  FinanceCommission,
  FinanceProjection,
  mockFinanceData,
  mockRevenueData,
  mockPayouts,
  mockEscrowLiabilities,
  mockFXExposure,
  mockCommissions,
  mockProjections,
} from '@/types/finance';

export const financeService = {
  getKPIs(): FinanceKPIs {
    return mockFinanceData;
  },

  getRevenueData(days: number = 7): FinanceRevenue[] {
    return mockRevenueData.slice(-days);
  },

  getPayouts(): FinancePayout[] {
    return mockPayouts;
  },

  getPayoutById(id: string): FinancePayout | undefined {
    return mockPayouts.find(p => p.id === id);
  },

  getPendingPayouts(): FinancePayout[] {
    return mockPayouts.filter(p => p.status === 'pending');
  },

  getFailedPayouts(): FinancePayout[] {
    return mockPayouts.filter(p => p.status === 'failed');
  },

  retryPayout(id: string): FinancePayout | null {
    const payout = mockPayouts.find(p => p.id === id);
    if (!payout) return null;
    payout.status = 'processing';
    payout.retryCount += 1;
    payout.failureReason = undefined;
    return payout;
  },

  getEscrowLiabilities(): FinanceEscrowLiability[] {
    return mockEscrowLiabilities;
  },

  getTotalEscrowLiability(): number {
    return mockEscrowLiabilities
      .filter(e => e.status === 'funded' || e.status === 'frozen')
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getFXExposure(): FinanceFXExposure[] {
    return mockFXExposure;
  },

  getCommissions(): FinanceCommission[] {
    return mockCommissions;
  },

  getTotalCommission(): number {
    return mockCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  },

  getProjections(): FinanceProjection[] {
    return mockProjections;
  },

  formatCurrency(amount: number, currency: string = 'USD'): string {
    if (currency === 'NGN') {
      return `₦${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  },

  getPayoutsByStatus(): { status: string; count: number; amount: number }[] {
    const statuses = ['pending', 'processing', 'completed', 'failed'] as const;
    return statuses.map(status => ({
      status,
      count: mockPayouts.filter(p => p.status === status).length,
      amount: mockPayouts
        .filter(p => p.status === status)
        .reduce((sum, p) => sum + p.amount, 0),
    }));
  },

  getRevenueByStream(): { stream: string; amount: number; percentage: number }[] {
    const total = mockRevenueData.reduce((sum, r) => sum + r.total, 0);
    const streams = [
      { stream: 'Subscriptions', amount: mockRevenueData.reduce((sum, r) => sum + r.subscriptions, 0) },
      { stream: 'Commissions', amount: mockRevenueData.reduce((sum, r) => sum + r.commissions, 0) },
      { stream: 'Events', amount: mockRevenueData.reduce((sum, r) => sum + r.events, 0) },
      { stream: 'Advertising', amount: mockRevenueData.reduce((sum, r) => sum + r.advertising, 0) },
    ];
    return streams.map(s => ({
      ...s,
      percentage: Math.round((s.amount / total) * 100),
    }));
  },
};
