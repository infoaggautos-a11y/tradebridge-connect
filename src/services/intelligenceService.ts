import { TradeMetric, TradeFlow, CountryIntelligence, SectorReport, IntelligenceAlert } from '@/types/intelligence';

export const tradeMetrics: TradeMetric[] = [
  { id: 'm1', label: 'Total Trade Volume', value: 12450000, previousValue: 11200000, change: 11.2, changeType: 'increase', period: 'This Month' },
  { id: 'm2', label: 'Active Deals', value: 156, previousValue: 142, change: 9.9, changeType: 'increase', period: 'This Month' },
  { id: 'm3', label: 'Match Success Rate', value: 68, previousValue: 62, change: 9.7, changeType: 'increase', period: 'This Quarter' },
  { id: 'm4', label: 'Avg Deal Value', value: 45200, previousValue: 48500, change: -6.8, changeType: 'decrease', period: 'This Month' },
  { id: 'm5', label: 'Escrow Volume', value: 8200000, previousValue: 7500000, change: 9.3, changeType: 'increase', period: 'This Month' },
  { id: 'm6', label: 'Commission Revenue', value: 284000, previousValue: 256000, change: 10.9, changeType: 'increase', period: 'This Month' },
];

export const tradeFlows: TradeFlow[] = [
  { id: 'f1', from: 'Nigeria', to: 'Italy', value: 4200000, volume: 85, sector: 'Agriculture', status: 'growing' },
  { id: 'f2', from: 'Italy', to: 'Nigeria', value: 3800000, volume: 72, sector: 'Manufacturing', status: 'growing' },
  { id: 'f3', from: 'Nigeria', to: 'Germany', value: 2100000, volume: 45, sector: 'Agriculture', status: 'stable' },
  { id: 'f4', from: 'Italy', to: 'Ghana', value: 890000, volume: 28, sector: 'Textiles', status: 'growing' },
  { id: 'f5', from: 'Nigeria', to: 'France', value: 750000, volume: 22, sector: 'Oil & Gas', status: 'declining' },
  { id: 'f6', from: 'Ghana', to: 'Italy', value: 680000, volume: 18, sector: 'Agriculture', status: 'growing' },
  { id: 'f7', from: 'Kenya', to: 'Italy', value: 520000, volume: 15, sector: 'Agriculture', status: 'stable' },
  { id: 'f8', from: 'South Africa', to: 'Italy', value: 450000, volume: 12, sector: 'Mining', status: 'growing' },
];

export const countryIntelligence: CountryIntelligence[] = [
  {
    country: 'Nigeria',
    totalExports: 8500000,
    totalImports: 4200000,
    topSectors: ['Agriculture', 'Oil & Gas', 'Textiles'],
    tradePartners: [{ country: 'Italy', value: 4200000 }, { country: 'Germany', value: 2100000 }, { country: 'France', value: 750000 }],
    growthRate: 12.5,
    riskScore: 45,
  },
  {
    country: 'Italy',
    totalExports: 6800000,
    totalImports: 5200000,
    topSectors: ['Manufacturing', 'Textiles', 'Machinery'],
    tradePartners: [{ country: 'Nigeria', value: 3800000 }, { country: 'Ghana', value: 890000 }, { country: 'Kenya', value: 520000 }],
    growthRate: 8.3,
    riskScore: 25,
  },
  {
    country: 'Ghana',
    totalExports: 1800000,
    totalImports: 2200000,
    topSectors: ['Agriculture', 'Textiles', 'Mining'],
    tradePartners: [{ country: 'Italy', value: 680000 }, { country: 'Nigeria', value: 420000 }, { country: 'UK', value: 380000 }],
    growthRate: 15.2,
    riskScore: 35,
  },
  {
    country: 'Kenya',
    totalExports: 1200000,
    totalImports: 1500000,
    topSectors: ['Agriculture', 'Technology', 'Services'],
    tradePartners: [{ country: 'Italy', value: 520000 }, { country: 'Germany', value: 380000 }, { country: 'UK', value: 290000 }],
    growthRate: 11.8,
    riskScore: 30,
  },
];

export const sectorReports: SectorReport[] = [
  {
    sector: 'Agriculture & Food',
    globalDemand: 92,
    regionalDemand: 88,
    priceTrend: 'up',
    topExporters: 45,
    topImporters: 32,
    opportunities: ['Premium cocoa demand in EU', 'Organic certification premium', 'Processing facility partnerships'],
    threats: ['Climate change impact', 'EU regulatory changes', 'Currency volatility'],
  },
  {
    sector: 'Textiles & Fashion',
    globalDemand: 65,
    regionalDemand: 72,
    priceTrend: 'stable',
    topExporters: 28,
    topImporters: 41,
    opportunities: ['Italian fashion brand sourcing', 'Sustainable materials demand', 'Regional trade agreements'],
    threats: ['Fast fashion competition', 'Synthetic alternatives', 'Supply chain disruption'],
  },
  {
    sector: 'Manufacturing',
    globalDemand: 78,
    regionalDemand: 82,
    priceTrend: 'up',
    topExporters: 35,
    topImporters: 38,
    opportunities: ['Industrial machinery demand', 'Local assembly partnerships', 'Technology transfer'],
    threats: ['Raw material costs', 'Energy prices', 'Skilled labor shortage'],
  },
  {
    sector: 'Oil & Gas',
    globalDemand: 85,
    regionalDemand: 45,
    priceTrend: 'down',
    topExporters: 15,
    topImporters: 22,
    opportunities: ['Refinery partnerships', 'LNG export potential', 'Service contracts'],
    threats: ['Price volatility', 'ESG pressure', 'Renewable energy competition'],
  },
  {
    sector: 'Technology',
    globalDemand: 95,
    regionalDemand: 78,
    priceTrend: 'up',
    topExporters: 52,
    topImporters: 18,
    opportunities: ['IT outsourcing demand', 'Digital transformation consulting', 'SaaS market expansion'],
    threats: ['Cybersecurity concerns', 'Talent migration', 'Regulatory compliance'],
  },
];

export const intelligenceAlerts: IntelligenceAlert[] = [
  {
    id: 'a1',
    type: 'policy_change',
    title: 'EU New Customs Documentation Requirements',
    description: 'Effective March 2026, all agricultural imports to the EU require enhanced phytosanitary certificates with digital verification.',
    severity: 'high',
    relatedCountries: ['Italy', 'Germany', 'France'],
    relatedSectors: ['Agriculture & Food'],
    createdAt: new Date('2026-02-25'),
    expiresAt: new Date('2026-03-31'),
  },
  {
    id: 'a2',
    type: 'trade_opportunity',
    title: 'Italian Automotive Sector Seeking African Parts',
    description: 'Italian automotive manufacturers are diversifying supply chains and actively seeking African suppliers for components.',
    severity: 'medium',
    relatedCountries: ['Italy'],
    relatedSectors: ['Manufacturing'],
    createdAt: new Date('2026-02-24'),
  },
  {
    id: 'a3',
    type: 'risk_warning',
    title: 'NGN/EUR Exchange Rate Volatility',
    description: 'Naira has experienced 15% volatility against Euro in Q1 2026. Consider hedging strategies for deals above $25,000.',
    severity: 'critical',
    relatedCountries: ['Nigeria'],
    relatedSectors: [],
    createdAt: new Date('2026-02-23'),
  },
  {
    id: 'a4',
    type: 'market_shift',
    title: 'Cocoa Price Surge Expected',
    description: 'West African cocoa production concerns driving global prices. Expect 10-15% price increases through Q2 2026.',
    severity: 'high',
    relatedCountries: ['Nigeria', 'Ghana'],
    relatedSectors: ['Agriculture & Food'],
    createdAt: new Date('2026-02-22'),
  },
];

export function getMonthlyTradeData() {
  return [
    { month: 'Aug', exports: 3.2, imports: 2.8 },
    { month: 'Sep', exports: 3.5, imports: 3.1 },
    { month: 'Oct', exports: 4.1, imports: 3.4 },
    { month: 'Nov', exports: 3.8, imports: 3.6 },
    { month: 'Dec', exports: 4.5, imports: 3.9 },
    { month: 'Jan', exports: 4.8, imports: 4.2 },
    { month: 'Feb', exports: 5.2, imports: 4.5 },
  ];
}

export function getSectorDistribution() {
  return [
    { sector: 'Agriculture', value: 42, color: '#22c55e' },
    { sector: 'Manufacturing', value: 24, color: '#3b82f6' },
    { sector: 'Textiles', value: 15, color: '#8b5cf6' },
    { sector: 'Technology', value: 10, color: '#f59e0b' },
    { sector: 'Other', value: 9, color: '#6b7280' },
  ];
}
