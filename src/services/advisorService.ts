import { AdvisorMessage, AdvisorQueryType, TradeInsight, MarketData, DealAnalysis, AdvisorContext } from '@/types/advisor';
import { businesses, events } from '@/data/mockData';

const MOCK_INSIGHTS: TradeInsight[] = [
  {
    id: 'ins1',
    type: 'opportunity',
    title: 'Rising Demand for Nigerian Cocoa in Italy',
    description: 'Italian chocolate manufacturers are seeking alternative cocoa suppliers due to supply constraints from traditional sources. Nigerian cocoa exporters with EU certifications are well-positioned.',
    severity: 'high',
    sector: 'Agriculture & Food',
    region: 'Nigeria-Italy',
    actionableSteps: [
      'Ensure ISO 22000 certification is current',
      'Prepare EU export documentation',
      'Target Italian chocolate manufacturers directly'
    ],
    createdAt: new Date('2026-02-25')
  },
  {
    id: 'ins2',
    type: 'market_trend',
    title: 'EUR/NGN Exchange Rate Volatility',
    description: 'The Naira has experienced 12% volatility against the Euro in Q1 2026. Consider locking exchange rates for deals exceeding $50,000.',
    severity: 'medium',
    region: 'Cross-border',
    createdAt: new Date('2026-02-24')
  },
  {
    id: 'ins3',
    type: 'risk',
    title: 'New EU Customs Documentation Requirements',
    description: 'Effective March 2026, all agricultural imports to the EU require enhanced phytosanitary certificates. Ensure your documentation is updated.',
    severity: 'high',
    sector: 'Agriculture & Food',
    region: 'EU',
    actionableSteps: [
      'Contact your local phytosanitary authority',
      'Update export documentation templates',
      'Allow 2-3 weeks for new certificate processing'
    ],
    createdAt: new Date('2026-02-23')
  },
  {
    id: 'ins4',
    type: 'recommendation',
    title: 'Textile Sector Match Alert',
    description: '3 Italian buyers in the Textiles & Fashion sector are actively seeking African suppliers. Your sector alignment score with these buyers is above 85%.',
    severity: 'low',
    sector: 'Textiles & Fashion',
    region: 'Nigeria-Italy',
    createdAt: new Date('2026-02-22')
  }
];

const COMMODITY_PRICES: MarketData[] = [
  { commodity: 'Cocoa (per MT)', currentPrice: 4850, priceChange: 3.2, trend: 'up', region: 'Global', source: 'ICE Futures', lastUpdated: new Date('2026-02-27') },
  { commodity: 'Crude Oil (per BBL)', currentPrice: 78.5, priceChange: -1.8, trend: 'down', region: 'Global', source: 'NYMEX', lastUpdated: new Date('2026-02-27') },
  { commodity: 'Cashew Nuts (per MT)', currentPrice: 3200, priceChange: 0.5, trend: 'stable', region: 'West Africa', source: 'Global Trade', lastUpdated: new Date('2026-02-26') },
  { commodity: 'Sesame Seeds (per MT)', currentPrice: 1850, priceChange: 2.1, trend: 'up', region: 'Nigeria', source: 'Commodity Online', lastUpdated: new Date('2026-02-26') },
  { commodity: 'Gold (per OZ)', currentPrice: 2945, priceChange: 1.2, trend: 'up', region: 'Global', source: 'COMEX', lastUpdated: new Date('2026-02-27') },
  { commodity: 'Coffee Arabica (per LB)', currentPrice: 4.25, priceChange: -0.8, trend: 'down', region: 'Global', source: 'ICE Futures', lastUpdated: new Date('2026-02-27') },
];

export async function sendMessageToAdvisor(
  message: string,
  context: AdvisorContext,
  history: AdvisorMessage[]
): Promise<AdvisorMessage> {
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
  
  const response = generateResponse(message, context);
  
  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: response,
    queryType: classifyQuery(message),
    timestamp: new Date(),
    sources: ['DIL Platform Data', 'Market Intelligence']
  };
}

function classifyQuery(query: string): AdvisorQueryType {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('match') || lowerQuery.includes('find') || lowerQuery.includes('buyer') || lowerQuery.includes('seller')) {
    return 'match_recommendation';
  }
  if (lowerQuery.includes('market') || lowerQuery.includes('price') || lowerQuery.includes('trend') || lowerQuery.includes('demand')) {
    return 'market_intelligence';
  }
  if (lowerQuery.includes('deal') || lowerQuery.includes('escrow') || lowerQuery.includes('contract') || lowerQuery.includes('payment')) {
    return 'deal_analysis';
  }
  if (lowerQuery.includes('how') || lowerQuery.includes('what') || lowerQuery.includes('explain')) {
    return 'trade_guidance';
  }
  return 'general';
}

function generateResponse(query: string, context: AdvisorContext): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('match') || lowerQuery.includes('find') || lowerQuery.includes('buyer')) {
    return `Based on your profile and target markets, I've identified 3 high-potential trade partners for you:

**1. Roma Pharma International (Italy)**
- Match Score: 91%
- Sector: Healthcare & Pharma
- Why: They supply generic medicines to African markets and are seeking Nigerian distribution partners

**2. Milano Fashion House (Italy)**
- Match Score: 87%
- Sector: Textiles & Fashion
- Why: Actively seeking leather suppliers for their luxury product line

**3. Napoli Trade Solutions (Italy)**
- Match Score: 82%
- Sector: Manufacturing, Agriculture & Food
- Why: Looking for Nigerian agricultural commodities for European distribution

Would you like me to prepare introduction requests for any of these?`;
  }
  
  if (lowerQuery.includes('market') || lowerQuery.includes('price') || lowerQuery.includes('trend')) {
    return `Here's the latest market intelligence relevant to your sector:

**Commodity Prices (Global)**
- Cocoa: $4,850/MT (+3.2%) 📈
- Crude Oil: $78.50/BBL (-1.8%) 📉
- Cashew Nuts: $3,200/MT (stable) ➡️
- Sesame Seeds: $1,850/MT (+2.1%) 📈

**Key Trends:**
1. Cocoa prices rising due to supply concerns in West Africa
2. Italian demand for Nigerian agricultural products up 15% YoY
3. New EU documentation requirements for agricultural imports effective March 2026

Would you like detailed analysis on any specific commodity?`;
  }
  
  if (lowerQuery.includes('escrow') || lowerQuery.includes('payment') || lowerQuery.includes('deal')) {
    return `Here's guidance on structuring your trade deal safely:

**Escrow Best Practices:**
1. **Milestone-based releases** - Break payments into stages (e.g., 30% on signing, 40% on shipment, 30% on delivery)
2. **Verify documentation** - Always confirm Bill of Lading and quality certificates before releasing final payment
3. **Clear terms** - Define exact quality standards, inspection criteria, and dispute resolution process in writing

**Commission Structure:**
- Deals under $10,000: 5%
- Deals $10,000 - $50,000: 3.5%
- Deals over $50,000: 2%

**Recommended Timeline:**
- Contract signing → Buyer deposits to escrow → Seller ships goods → Buyer inspects → Release funds (minus commission)

Would you like me to analyze a specific deal you're working on?`;
  }
  
  if (lowerQuery.includes('document') || lowerQuery.includes('export') || lowerQuery.includes('require')) {
    return `For Nigeria-Italy trade, here are the essential documents you'll need:

**Export from Nigeria:**
- Bill of Lading (original + 2 copies)
- Commercial Invoice (certified by Nigerian Customs)
- Packing List
- Phytosanitary Certificate (for agricultural products)
- Certificate of Origin (from Nigeria Export Promotion Council)
- SON Conformity Certificate (for regulated products)

**Import to Italy:**
- Import License (for certain product categories)
- EU Health Certificate (for food/agriculture)
- Customs Declaration
- VAT Registration

**Pro Tips:**
- Start documentation process 2-3 weeks before shipment
- Use a licensed customs agent in both countries
- Keep digital copies of all documents

Would you like a detailed checklist for your specific product category?`;
  }
  
  return `I'm your DIL Trade Advisor, here to help you navigate cross-border trade between Nigeria, Italy, and other markets.

**I can help you with:**

1. **Finding Trade Partners** - "Find me buyers for cocoa in Italy"
2. **Market Intelligence** - "What's the current price of sesame seeds?"
3. **Deal Guidance** - "How does escrow work?"
4. **Documentation** - "What documents do I need for exporting?"
5. **Trade Insights** - "What are the latest opportunities in my sector?"

What would you like to explore today?`;
}

export async function getTradeInsights(context: AdvisorContext): Promise<TradeInsight[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_INSIGHTS;
}

export async function getMarketData(commodity?: string): Promise<MarketData[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  if (commodity) {
    return COMMODITY_PRICES.filter(c => 
      c.commodity.toLowerCase().includes(commodity.toLowerCase())
    );
  }
  return COMMODITY_PRICES;
}

export async function analyzeDeal(
  dealId: string,
  buyerName: string,
  sellerName: string,
  dealValue: number
): Promise<DealAnalysis> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const buyer = businesses.find(b => b.name === buyerName);
  const seller = businesses.find(b => b.name === sellerName);
  
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 25;
  
  if (!buyer || buyer.verificationLevel !== 'premium') {
    riskFactors.push('Buyer verification level below premium');
    riskScore += 15;
  }
  
  if (!seller || seller.verificationLevel !== 'premium') {
    riskFactors.push('Seller verification level below premium');
    riskScore += 15;
  }
  
  if (dealValue > 50000 && buyer && buyer.tradeReadinessScore < 80) {
    riskFactors.push('Deal value exceeds recommended limit for buyer profile');
    riskScore += 20;
  }
  
  if (riskScore < 40) {
    recommendations.push('Deal appears low-risk based on available data');
    recommendations.push('Standard escrow terms recommended');
  } else if (riskScore < 70) {
    recommendations.push('Consider milestone-based escrow for added security');
    recommendations.push('Request additional documentation from both parties');
  } else {
    recommendations.push('Recommend enhanced due diligence before proceeding');
    recommendations.push('Consider lower initial deal value or escrow holdback');
  }
  
  return {
    dealId,
    buyerName,
    sellerName,
    dealValue,
    riskScore: Math.min(riskScore, 100),
    riskFactors,
    recommendations,
    marketComparison: 85
  };
}

export function getQuickReplies(): string[] {
  return [
    'Find me trade partners in Italy',
    'What are current commodity prices?',
    'How does escrow work?',
    'What documents do I need?',
    'Show me market opportunities',
    'Help me analyze a deal'
  ];
}
