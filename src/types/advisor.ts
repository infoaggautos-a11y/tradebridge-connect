export type AdvisorQueryType = 'match_recommendation' | 'market_intelligence' | 'trade_guidance' | 'deal_analysis' | 'general';

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  queryType?: AdvisorQueryType;
  timestamp: Date;
  sources?: string[];
}

export interface TradeInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'recommendation' | 'market_trend';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  sector?: string;
  region?: string;
  actionableSteps?: string[];
  createdAt: Date;
}

export interface MarketData {
  commodity: string;
  currentPrice: number;
  priceChange: number;
  trend: 'up' | 'down' | 'stable';
  region: string;
  source: string;
  lastUpdated: Date;
}

export interface DealAnalysis {
  dealId: string;
  buyerName: string;
  sellerName: string;
  dealValue: number;
  riskScore: number;
  riskFactors: string[];
  recommendations: string[];
  marketComparison: number;
}

export interface AdvisorContext {
  businessId?: string;
  currentSector?: string;
  targetMarkets?: string[];
  activeDeals?: number;
  membershipTier?: string;
}
