export type TradeReadinessCategory = 'emerging' | 'established' | 'trusted' | 'elite';

export interface TradeReadinessScore {
  businessId: string;
  totalScore: number;
  category: TradeReadinessCategory;
  breakdown: {
    kyc: { score: number; maxScore: number; factors: string[] };
    profile: { score: number; maxScore: number; factors: string[] };
    deals: { score: number; maxScore: number; factors: string[] };
    reliability: { score: number; maxScore: number; factors: string[] };
    activity: { score: number; maxScore: number; factors: string[] };
    rating: { score: number; maxScore: number; factors: string[] };
  };
  lastCalculatedAt: string;
}

const mockScores: Record<string, TradeReadinessScore> = {
  'b1': {
    businessId: 'b1',
    totalScore: 88,
    category: 'trusted',
    breakdown: {
      kyc: { score: 25, maxScore: 25, factors: ['Trade Ready verified'] },
      profile: { score: 18, maxScore: 20, factors: ['Logo uploaded', 'Full description', 'Products listed'] },
      deals: { score: 18, maxScore: 20, factors: ['5 completed deals', '2 active deals'] },
      reliability: { score: 12, maxScore: 15, factors: ['No failed payments'] },
      activity: { score: 8, maxScore: 10, factors: ['Active this week'] },
      rating: { score: 7, maxScore: 10, factors: ['4.5/5 average rating'] },
    },
    lastCalculatedAt: '2026-02-28T10:00:00Z',
  },
  'b2': {
    businessId: 'b2',
    totalScore: 72,
    category: 'established',
    breakdown: {
      kyc: { score: 20, maxScore: 25, factors: ['Verified member'] },
      profile: { score: 15, maxScore: 20, factors: ['Logo uploaded', 'Partial description'] },
      deals: { score: 12, maxScore: 20, factors: ['2 completed deals'] },
      reliability: { score: 15, maxScore: 15, factors: ['No failed payments', 'No disputes'] },
      activity: { score: 5, maxScore: 10, factors: ['Logged in 3 days ago'] },
      rating: { score: 5, maxScore: 10, factors: ['New - no ratings yet'] },
    },
    lastCalculatedAt: '2026-02-28T10:00:00Z',
  },
  'b5': {
    businessId: 'b5',
    totalScore: 95,
    category: 'elite',
    breakdown: {
      kyc: { score: 25, maxScore: 25, factors: ['Trade Ready verified'] },
      profile: { score: 20, maxScore: 20, factors: ['Complete profile', 'All certifications'] },
      deals: { score: 20, maxScore: 20, factors: ['15 completed deals', '3 active'] },
      reliability: { score: 15, maxScore: 15, factors: ['Perfect payment history'] },
      activity: { score: 10, maxScore: 10, factors: ['Daily active'] },
      rating: { score: 5, maxScore: 10, factors: ['4.8/5 average'] },
    },
    lastCalculatedAt: '2026-02-28T10:00:00Z',
  },
  'b7': {
    businessId: 'b7',
    totalScore: 45,
    category: 'emerging',
    breakdown: {
      kyc: { score: 10, maxScore: 25, factors: ['Basic member'] },
      profile: { score: 10, maxScore: 20, factors: ['Partial profile'] },
      deals: { score: 0, maxScore: 20, factors: ['No deals yet'] },
      reliability: { score: 15, maxScore: 15, factors: ['New account'] },
      activity: { score: 5, maxScore: 10, factors: ['Logged in 5 days ago'] },
      rating: { score: 5, maxScore: 10, factors: ['New - no ratings'] },
    },
    lastCalculatedAt: '2026-02-28T10:00:00Z',
  },
};

export const tradeReadinessService = {
  getScore(businessId: string): TradeReadinessScore | undefined {
    return mockScores[businessId];
  },

  getAllScores(): TradeReadinessScore[] {
    return Object.values(mockScores);
  },

  calculateScore(businessId: string): TradeReadinessScore {
    // This would calculate from actual data in production
    return mockScores[businessId] || {
      businessId,
      totalScore: 0,
      category: 'emerging',
      breakdown: {
        kyc: { score: 0, maxScore: 25, factors: [] },
        profile: { score: 0, maxScore: 20, factors: [] },
        deals: { score: 0, maxScore: 20, factors: [] },
        reliability: { score: 0, maxScore: 15, factors: [] },
        activity: { score: 0, maxScore: 10, factors: [] },
        rating: { score: 0, maxScore: 10, factors: [] },
      },
      lastCalculatedAt: new Date().toISOString(),
    };
  },

  getCategoryLabel(category: TradeReadinessCategory): string {
    const labels: Record<TradeReadinessCategory, string> = {
      emerging: 'Emerging',
      established: 'Established',
      trusted: 'Trusted',
      elite: 'Elite',
    };
    return labels[category];
  },

  getCategoryColor(category: TradeReadinessCategory): string {
    const colors: Record<TradeReadinessCategory, string> = {
      emerging: 'bg-gray-100 text-gray-700',
      established: 'bg-blue-100 text-blue-700',
      trusted: 'bg-green-100 text-green-700',
      elite: 'bg-gold/20 text-gold-dark',
    };
    return colors[category];
  },

  getRecommendations(businessId: string): string[] {
    const score = mockScores[businessId];
    if (!score) return [];
    
    const recommendations: string[] = [];
    
    if (score.breakdown.kyc.score < score.breakdown.kyc.maxScore) {
      recommendations.push('Complete your KYC verification to unlock escrow features');
    }
    if (score.breakdown.profile.score < score.breakdown.profile.maxScore) {
      recommendations.push('Add more details to your business profile');
    }
    if (score.breakdown.deals.score < score.breakdown.deals.maxScore) {
      recommendations.push('Close your first deal to boost credibility');
    }
    if (score.breakdown.activity.score < score.breakdown.activity.maxScore) {
      recommendations.push('Stay active on the platform to increase visibility');
    }
    
    return recommendations;
  },
};
