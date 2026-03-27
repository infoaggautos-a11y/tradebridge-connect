export type IntelligenceMetricType = 'trade_volume' | 'match_rate' | 'escrow_value' | 'revenue' | 'members';

export interface TradeMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
}

export interface TradeFlow {
  id: string;
  from: string;
  to: string;
  value: number;
  volume: number;
  sector: string;
  status: 'growing' | 'stable' | 'declining';
}

export interface CountryIntelligence {
  country: string;
  totalExports: number;
  totalImports: number;
  topSectors: string[];
  tradePartners: { country: string; value: number }[];
  growthRate: number;
  riskScore: number;
}

export interface SectorReport {
  sector: string;
  globalDemand: number;
  regionalDemand: number;
  priceTrend: 'up' | 'down' | 'stable';
  topExporters: number;
  topImporters: number;
  opportunities: string[];
  threats: string[];
}

export interface IntelligenceAlert {
  id: string;
  type: 'trade_opportunity' | 'risk_warning' | 'policy_change' | 'market_shift';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  relatedCountries: string[];
  relatedSectors: string[];
  createdAt: Date;
  expiresAt?: Date;
}
