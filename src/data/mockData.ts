// ===== TYPES =====
export type UserRole = 'member' | 'admin';
export type VerificationLevel = 'basic' | 'verified' | 'premium';
export type TicketTier = 'free' | 'standard' | 'vip';
export type MembershipTier = 'free' | 'starter' | 'growth' | 'enterprise';

export interface Business {
  id: string;
  name: string;
  country: string;
  sectors: string[];
  products: string[];
  exportCapacity: string;
  certifications: string[];
  minOrderQty: string;
  preferredMarkets: string[];
  verificationLevel: VerificationLevel;
  tradeReadinessScore: number;
  profileCompleteness: number;
  description: string;
  yearEstablished: number;
  employees: string;
  contactEmail: string;
  website?: string;
  logo?: string;
}

export interface MatchResult {
  id: string;
  businessId: string;
  matchScore: number;
  sectorScore: number;
  countryScore: number;
  capacityScore: number;
  verificationScore: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface TradeEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  type: 'trade-mission' | 'conference' | 'workshop' | 'delegation';
  agenda: { time: string; title: string; speaker?: string }[];
  speakers: { name: string; role: string; company: string }[];
  sponsors: string[];
  ticketTiers: { tier: TicketTier; price: number; label: string; perks: string[] }[];
  registrations: number;
  capacity: number;
  imageUrl?: string;
  isPast: boolean;
}

export interface MembershipPlan {
  tier: MembershipTier;
  name: string;
  price: number;
  period: string;
  features: string[];
  highlighted?: boolean;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'business' | 'match' | 'event' | 'subscription';
}

// ===== SECTORS & COUNTRIES =====
export const SECTORS = [
  'Agriculture & Food',
  'Manufacturing',
  'Textiles & Fashion',
  'Oil & Gas',
  'Technology',
  'Construction Materials',
  'Minerals & Mining',
  'Healthcare & Pharma',
  'Logistics & Shipping',
  'Financial Services',
];

export const COUNTRIES = [
  'Nigeria', 'Italy', 'Ghana', 'Kenya', 'South Africa',
  'United Kingdom', 'Germany', 'France', 'United States', 'China',
];

// ===== BUSINESSES =====
export const businesses: Business[] = [
  {
    id: 'b1', name: 'Lagos Agro Exports Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Cocoa Beans', 'Cashew Nuts', 'Sesame Seeds'], exportCapacity: '500 MT/month',
    certifications: ['ISO 22000', 'NAFDAC'], minOrderQty: '20 MT', preferredMarkets: ['Italy', 'Germany', 'France'],
    verificationLevel: 'premium', tradeReadinessScore: 88, profileCompleteness: 95,
    description: 'Leading Nigerian agricultural commodity exporter with 15+ years of experience serving European markets.',
    yearEstablished: 2008, employees: '50-100', contactEmail: 'info@lagosagroexports.ng',
    website: 'www.lagosagroexports.ng',
  },
  {
    id: 'b2', name: 'Napoli Trade Solutions', country: 'Italy', sectors: ['Manufacturing', 'Agriculture & Food'],
    products: ['Olive Oil', 'Pasta Processing Equipment', 'Food Packaging'], exportCapacity: '200 MT/month',
    certifications: ['ISO 9001', 'EU Organic'], minOrderQty: '5 MT', preferredMarkets: ['Nigeria', 'Ghana', 'Kenya'],
    verificationLevel: 'verified', tradeReadinessScore: 82, profileCompleteness: 88,
    description: 'Italian food processing and equipment manufacturer looking to expand into West African markets.',
    yearEstablished: 2012, employees: '100-250', contactEmail: 'trade@napolitrade.it',
  },
  {
    id: 'b3', name: 'Accra Textiles Co.', country: 'Ghana', sectors: ['Textiles & Fashion'],
    products: ['Kente Cloth', 'African Print Fabric', 'Ready-to-Wear'], exportCapacity: '10,000 units/month',
    certifications: ['Fair Trade'], minOrderQty: '500 units', preferredMarkets: ['Italy', 'United Kingdom', 'United States'],
    verificationLevel: 'verified', tradeReadinessScore: 71, profileCompleteness: 80,
    description: 'Premium Ghanaian textiles producer combining traditional craftsmanship with modern fashion.',
    yearEstablished: 2015, employees: '25-50', contactEmail: 'sales@accratextiles.gh',
  },
  {
    id: 'b4', name: 'Abuja Construction Materials', country: 'Nigeria', sectors: ['Construction Materials'],
    products: ['Cement', 'Steel Rebar', 'Roofing Sheets'], exportCapacity: '1,000 MT/month',
    certifications: ['SON', 'ISO 14001'], minOrderQty: '50 MT', preferredMarkets: ['Ghana', 'Kenya', 'South Africa'],
    verificationLevel: 'premium', tradeReadinessScore: 79, profileCompleteness: 92,
    description: 'Major Nigerian construction materials supplier with regional distribution network.',
    yearEstablished: 2005, employees: '250-500', contactEmail: 'export@abujacm.ng',
  },
  {
    id: 'b5', name: 'Milano Fashion House', country: 'Italy', sectors: ['Textiles & Fashion'],
    products: ['Luxury Leather Goods', 'Designer Shoes', 'Accessories'], exportCapacity: '5,000 units/month',
    certifications: ['Made in Italy', 'ISO 9001'], minOrderQty: '100 units', preferredMarkets: ['Nigeria', 'South Africa', 'Kenya'],
    verificationLevel: 'premium', tradeReadinessScore: 91, profileCompleteness: 97,
    description: 'High-end Italian fashion brand seeking African retail and distribution partners.',
    yearEstablished: 1998, employees: '100-250', contactEmail: 'partners@milanofh.it',
  },
  {
    id: 'b6', name: 'Niger Delta Oil Services', country: 'Nigeria', sectors: ['Oil & Gas'],
    products: ['Crude Oil Brokerage', 'Oilfield Equipment', 'Technical Services'], exportCapacity: 'Project-based',
    certifications: ['DPR License', 'ISO 45001'], minOrderQty: 'N/A', preferredMarkets: ['Italy', 'United Kingdom', 'China'],
    verificationLevel: 'verified', tradeReadinessScore: 74, profileCompleteness: 78,
    description: 'Oil and gas services company connecting Nigerian producers with international refineries.',
    yearEstablished: 2010, employees: '50-100', contactEmail: 'ops@ndoilservices.ng',
  },
  {
    id: 'b7', name: 'TechBridge Africa', country: 'Nigeria', sectors: ['Technology'],
    products: ['Software Development', 'IT Consulting', 'Cloud Solutions'], exportCapacity: 'Unlimited (Digital)',
    certifications: ['AWS Partner', 'Microsoft Gold'], minOrderQty: 'N/A', preferredMarkets: ['Italy', 'Germany', 'United States'],
    verificationLevel: 'basic', tradeReadinessScore: 65, profileCompleteness: 70,
    description: 'Nigerian tech company offering outsourced development and IT solutions to European businesses.',
    yearEstablished: 2019, employees: '25-50', contactEmail: 'hello@techbridgeafrica.ng',
  },
  {
    id: 'b8', name: 'Roma Pharma International', country: 'Italy', sectors: ['Healthcare & Pharma'],
    products: ['Generic Medicines', 'Medical Equipment', 'Diagnostic Kits'], exportCapacity: '100,000 units/month',
    certifications: ['EU GMP', 'WHO Prequalification'], minOrderQty: '1,000 units', preferredMarkets: ['Nigeria', 'Ghana', 'Kenya'],
    verificationLevel: 'premium', tradeReadinessScore: 93, profileCompleteness: 99,
    description: 'Italian pharmaceutical company expanding into African healthcare markets.',
    yearEstablished: 1995, employees: '500+', contactEmail: 'africa@romapharma.it',
  },
  {
    id: 'b9', name: 'Kano Leather Works', country: 'Nigeria', sectors: ['Textiles & Fashion', 'Manufacturing'],
    products: ['Tanned Leather', 'Leather Bags', 'Leather Shoes'], exportCapacity: '20,000 units/month',
    certifications: ['NESREA'], minOrderQty: '200 units', preferredMarkets: ['Italy', 'France', 'United Kingdom'],
    verificationLevel: 'verified', tradeReadinessScore: 68, profileCompleteness: 75,
    description: 'Traditional Nigerian leather craftsman meeting international quality standards.',
    yearEstablished: 2013, employees: '50-100', contactEmail: 'export@kanoleather.ng',
  },
  {
    id: 'b10', name: 'Torino Logistics SpA', country: 'Italy', sectors: ['Logistics & Shipping'],
    products: ['Freight Forwarding', 'Customs Clearance', 'Warehousing'], exportCapacity: 'N/A',
    certifications: ['AEO Certified', 'ISO 28000'], minOrderQty: 'N/A', preferredMarkets: ['Nigeria', 'Ghana', 'South Africa'],
    verificationLevel: 'premium', tradeReadinessScore: 85, profileCompleteness: 90,
    description: 'Italian logistics company specializing in Africa-Europe trade corridors.',
    yearEstablished: 2001, employees: '100-250', contactEmail: 'africa@torinologistics.it',
  },
  {
    id: 'b11', name: 'Nairobi Fresh Produce', country: 'Kenya', sectors: ['Agriculture & Food'],
    products: ['Fresh Flowers', 'Avocados', 'Green Beans'], exportCapacity: '300 MT/month',
    certifications: ['GlobalGAP', 'Fair Trade'], minOrderQty: '10 MT', preferredMarkets: ['Italy', 'Germany', 'France'],
    verificationLevel: 'verified', tradeReadinessScore: 77, profileCompleteness: 83,
    description: 'Kenyan horticultural exporter with cold chain logistics to European markets.',
    yearEstablished: 2011, employees: '100-250', contactEmail: 'sales@nairobifresh.ke',
  },
  {
    id: 'b12', name: 'Johannesburg Mining Corp', country: 'South Africa', sectors: ['Minerals & Mining'],
    products: ['Gold', 'Platinum', 'Chrome Ore'], exportCapacity: '500 MT/month',
    certifications: ['ISO 14001', 'Responsible Mining'], minOrderQty: '50 MT', preferredMarkets: ['Italy', 'China', 'United Kingdom'],
    verificationLevel: 'premium', tradeReadinessScore: 86, profileCompleteness: 91,
    description: 'South African mining company with ethically sourced mineral exports.',
    yearEstablished: 2003, employees: '500+', contactEmail: 'trade@jhbmining.za',
  },
  {
    id: 'b13', name: 'Onitsha Trading Company', country: 'Nigeria', sectors: ['Manufacturing', 'Financial Services'],
    products: ['Plastic Products', 'Trade Finance Consulting', 'Import/Export Services'], exportCapacity: '100 MT/month',
    certifications: ['CAC', 'SON'], minOrderQty: '10 MT', preferredMarkets: ['Ghana', 'Italy', 'China'],
    verificationLevel: 'basic', tradeReadinessScore: 55, profileCompleteness: 60,
    description: 'Multi-sector Nigerian trading company with import/export expertise.',
    yearEstablished: 2017, employees: '10-25', contactEmail: 'info@onitshatrading.ng',
  },
  {
    id: 'b14', name: 'Florence Ceramics Intl', country: 'Italy', sectors: ['Manufacturing', 'Construction Materials'],
    products: ['Porcelain Tiles', 'Sanitary Ware', 'Decorative Ceramics'], exportCapacity: '50,000 sqm/month',
    certifications: ['CE Mark', 'ISO 9001'], minOrderQty: '500 sqm', preferredMarkets: ['Nigeria', 'Ghana', 'Kenya'],
    verificationLevel: 'verified', tradeReadinessScore: 80, profileCompleteness: 85,
    description: 'Italian ceramics manufacturer expanding into African construction market.',
    yearEstablished: 2007, employees: '100-250', contactEmail: 'export@florenceceramics.it',
  },
  {
    id: 'b15', name: 'Cape Coast Fisheries', country: 'Ghana', sectors: ['Agriculture & Food'],
    products: ['Frozen Fish', 'Shrimp', 'Canned Tuna'], exportCapacity: '200 MT/month',
    certifications: ['HACCP', 'EU Approved'], minOrderQty: '15 MT', preferredMarkets: ['Italy', 'France', 'Nigeria'],
    verificationLevel: 'basic', tradeReadinessScore: 62, profileCompleteness: 68,
    description: 'Ghanaian fishery company with EU-approved processing facilities.',
    yearEstablished: 2014, employees: '50-100', contactEmail: 'export@capecoastfish.gh',
  },
];

// ===== EVENTS =====
export const events: TradeEvent[] = [
  {
    id: 'e1', title: 'Nigeria-Italy Trade Summit 2026', type: 'trade-mission',
    description: 'The premier annual gathering connecting Nigerian and Italian businesses for bilateral trade opportunities. Features keynote speakers, B2B matchmaking sessions, and networking dinners.',
    date: '2026-04-15', endDate: '2026-04-17', location: 'Abuja, Nigeria',
    agenda: [
      { time: '09:00', title: 'Opening Ceremony & Keynotes', speaker: 'Hon. Minister of Trade' },
      { time: '11:00', title: 'B2B Matchmaking Sessions' },
      { time: '14:00', title: 'Sector Focus: Agriculture & Food Processing', speaker: 'Dr. Amara Osei' },
      { time: '16:00', title: 'Panel: Navigating EU-Nigeria Trade Regulations' },
      { time: '19:00', title: 'Networking Dinner' },
    ],
    speakers: [
      { name: 'Dr. Amara Osei', role: 'Director of Trade Policy', company: 'ECOWAS Commission' },
      { name: 'Marco Bianchi', role: 'President', company: 'Italy-Africa Business Council' },
      { name: 'Chief Ade Ogunleye', role: 'CEO', company: 'Nigerian Export Promotion Council' },
    ],
    sponsors: ['Access Bank', 'ENI', 'Nigerian Ports Authority'],
    ticketTiers: [
      { tier: 'free', price: 0, label: 'Observer Pass', perks: ['Access to keynotes', 'Digital program'] },
      { tier: 'standard', price: 500, label: 'Delegate Pass', perks: ['All sessions', 'B2B matchmaking', 'Lunch included', 'Networking dinner'] },
      { tier: 'vip', price: 2000, label: 'VIP Delegate', perks: ['All delegate perks', 'Private meetings', 'Airport transfer', 'Hotel arrangement'] },
    ],
    registrations: 234, capacity: 500, isPast: false,
  },
  {
    id: 'e2', title: 'West Africa AgriTech Workshop', type: 'workshop',
    description: 'Hands-on workshop exploring technology solutions for modernizing agricultural supply chains across West Africa.',
    date: '2026-05-20', endDate: '2026-05-21', location: 'Lagos, Nigeria',
    agenda: [
      { time: '09:00', title: 'Smart Farming Technologies', speaker: 'Prof. Ngozi Eze' },
      { time: '11:00', title: 'Supply Chain Digitization Workshop' },
      { time: '14:00', title: 'Cold Chain Solutions for Export', speaker: 'Roberto Verdi' },
      { time: '16:00', title: 'Funding Opportunities in AgriTech' },
    ],
    speakers: [
      { name: 'Prof. Ngozi Eze', role: 'Head of AgriTech', company: 'University of Nigeria' },
      { name: 'Roberto Verdi', role: 'CTO', company: 'AgriChain Italia' },
    ],
    sponsors: ['World Bank', 'FAO'],
    ticketTiers: [
      { tier: 'free', price: 0, label: 'Virtual Pass', perks: ['Live stream access', 'Digital materials'] },
      { tier: 'standard', price: 200, label: 'In-Person', perks: ['All sessions', 'Workshop materials', 'Certificate'] },
    ],
    registrations: 89, capacity: 150, isPast: false,
  },
  {
    id: 'e3', title: 'Italy Trade Delegation to Ghana', type: 'delegation',
    description: 'A curated delegation of Italian manufacturers visiting Ghanaian producers for direct sourcing partnerships.',
    date: '2026-06-10', endDate: '2026-06-14', location: 'Accra & Kumasi, Ghana',
    agenda: [
      { time: '09:00', title: 'Welcome & Country Briefing' },
      { time: '11:00', title: 'Factory Visits: Textiles & Cocoa' },
      { time: '14:00', title: 'Investment Climate Presentation', speaker: 'Ghana Investment Promotion Centre' },
      { time: '16:00', title: 'One-on-One Business Meetings' },
    ],
    speakers: [
      { name: 'Kwame Asante', role: 'CEO', company: 'Ghana Chamber of Commerce' },
      { name: 'Giulia Romano', role: 'Trade Attaché', company: 'Italian Embassy, Accra' },
    ],
    sponsors: ['Ghana Export Authority', 'Intesa Sanpaolo'],
    ticketTiers: [
      { tier: 'standard', price: 1500, label: 'Delegate', perks: ['All site visits', 'Transport', 'Accommodation', 'B2B meetings'] },
      { tier: 'vip', price: 3000, label: 'Premium Delegate', perks: ['All delegate perks', 'Private car', 'Premium hotel', 'Priority meetings'] },
    ],
    registrations: 42, capacity: 60, isPast: false,
  },
  {
    id: 'e4', title: 'AfCFTA Trade Conference 2025', type: 'conference',
    description: 'Exploring opportunities under the African Continental Free Trade Area for intra-African and Africa-EU commerce.',
    date: '2025-11-08', endDate: '2025-11-10', location: 'Lagos, Nigeria',
    agenda: [
      { time: '09:00', title: 'AfCFTA Implementation Progress', speaker: 'AfCFTA Secretariat' },
      { time: '11:00', title: 'Cross-Border Trade Facilitation' },
      { time: '14:00', title: 'Digital Trade Infrastructure' },
    ],
    speakers: [
      { name: 'Wamkele Mene', role: 'Secretary General', company: 'AfCFTA Secretariat' },
    ],
    sponsors: ['African Development Bank', 'EU Commission'],
    ticketTiers: [
      { tier: 'free', price: 0, label: 'Virtual', perks: ['Live stream'] },
      { tier: 'standard', price: 300, label: 'In-Person', perks: ['All sessions', 'Networking'] },
    ],
    registrations: 412, capacity: 500, isPast: true,
  },
];

// ===== MEMBERSHIP PLANS =====
export const membershipPlans: MembershipPlan[] = [
  {
    tier: 'free', name: 'Free', price: 0, period: 'forever',
    features: ['Directory listing', '3 match views/month', 'Event browsing', 'Basic profile'],
  },
  {
    tier: 'starter', name: 'Starter', price: 49, period: '/month',
    features: ['Unlimited match views', 'Priority directory listing', 'Event registration discounts', 'Basic analytics', 'Email support'],
  },
  {
    tier: 'growth', name: 'Growth', price: 149, period: '/month', highlighted: true,
    features: ['All Starter features', 'Trade analytics preview', 'Featured profile badge', 'Dedicated matching support', 'Priority event access', 'Monthly trade report'],
  },
  {
    tier: 'enterprise', name: 'Enterprise', price: 499, period: '/month',
    features: ['All Growth features', 'Dedicated account manager', 'Homepage featured placement', 'Custom trade reports', 'White-glove matching', 'VIP event access', 'API access'],
  },
];

// ===== ACTIVITY LOG =====
export const activityLog: ActivityLogEntry[] = [
  { id: 'a1', action: 'New business registered: TechBridge Africa', user: 'System', timestamp: '2026-02-26T10:30:00Z', type: 'business' },
  { id: 'a2', action: 'Business verified: Lagos Agro Exports Ltd', user: 'Admin', timestamp: '2026-02-26T09:15:00Z', type: 'business' },
  { id: 'a3', action: 'Match request: Lagos Agro → Napoli Trade', user: 'Lagos Agro Exports', timestamp: '2026-02-25T16:45:00Z', type: 'match' },
  { id: 'a4', action: 'Event registration: Nigeria-Italy Summit (+5)', user: 'System', timestamp: '2026-02-25T14:20:00Z', type: 'event' },
  { id: 'a5', action: 'Subscription upgrade: Growth plan', user: 'Accra Textiles Co.', timestamp: '2026-02-25T11:00:00Z', type: 'subscription' },
  { id: 'a6', action: 'New business registered: Cape Coast Fisheries', user: 'System', timestamp: '2026-02-24T17:30:00Z', type: 'business' },
  { id: 'a7', action: 'Match accepted: Milano Fashion ↔ Kano Leather', user: 'Milano Fashion House', timestamp: '2026-02-24T15:10:00Z', type: 'match' },
  { id: 'a8', action: 'Event created: West Africa AgriTech Workshop', user: 'Admin', timestamp: '2026-02-24T10:00:00Z', type: 'event' },
  { id: 'a9', action: 'Business rejected: Suspicious Trading LLC', user: 'Admin', timestamp: '2026-02-23T14:30:00Z', type: 'business' },
  { id: 'a10', action: 'Subscription renewed: Enterprise plan', user: 'Roma Pharma International', timestamp: '2026-02-23T09:00:00Z', type: 'subscription' },
];

// ===== MATCH RESULTS (pre-computed for demo) =====
export const sampleMatches: MatchResult[] = [
  { id: 'm1', businessId: 'b2', matchScore: 87, sectorScore: 95, countryScore: 85, capacityScore: 80, verificationScore: 75, status: 'pending' },
  { id: 'm2', businessId: 'b5', matchScore: 72, sectorScore: 60, countryScore: 90, capacityScore: 70, verificationScore: 85, status: 'pending' },
  { id: 'm3', businessId: 'b8', matchScore: 65, sectorScore: 40, countryScore: 85, capacityScore: 75, verificationScore: 90, status: 'accepted' },
  { id: 'm4', businessId: 'b10', matchScore: 58, sectorScore: 30, countryScore: 90, capacityScore: 60, verificationScore: 85, status: 'pending' },
  { id: 'm5', businessId: 'b14', matchScore: 53, sectorScore: 50, countryScore: 70, capacityScore: 45, verificationScore: 70, status: 'declined' },
  { id: 'm6', businessId: 'b11', matchScore: 81, sectorScore: 90, countryScore: 75, capacityScore: 80, verificationScore: 75, status: 'pending' },
];

// ===== HELPER FUNCTIONS =====
export function getBusinessById(id: string): Business | undefined {
  return businesses.find(b => b.id === id);
}

export function calculateMatchScore(
  offering: string[], seeking: string[], targetCountries: string[], business: Business
): number {
  const sectorOverlap = business.sectors.filter(s => seeking.includes(s)).length;
  const sectorScore = Math.min((sectorOverlap / Math.max(seeking.length, 1)) * 100, 100);
  const countryMatch = targetCountries.includes(business.country) ? 100 : 0;
  const capacityScore = business.tradeReadinessScore;
  const verificationScore = business.verificationLevel === 'premium' ? 100 : business.verificationLevel === 'verified' ? 70 : 40;
  return Math.round(sectorScore * 0.4 + countryMatch * 0.3 + capacityScore * 0.2 + verificationScore * 0.1);
}
