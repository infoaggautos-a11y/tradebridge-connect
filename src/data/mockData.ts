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
  subtitle: string;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualPrice: number;
  ngnMonthlyPrice?: number;
  ngnAnnualPrice?: number;
  price: number;
  period: string;
  annualPeriodLabel?: string;
  monthlyPeriodLabel?: string;
  trialAvailable?: boolean;
  commissionRate: number;
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
  'Super Market',
  'Technology',
  'Construction Materials',
  'Minerals & Mining',
  'Healthcare & Pharma',
  'Logistics & Shipping',
  'Financial Services',
  'Herbs & Spices',
  'Cosmetics & Beauty',
  'Food Processing',
  'Plastics & Rubber',
  'Environmental Services',
];

export const COUNTRIES = [
  'Nigeria', 'Italy', 'Kenya', 'South Africa',
  'United Kingdom', 'Germany', 'France', 'United States', 'China',
  'Guinea-Bissau',
];

// ===== BUSINESSES =====
export const businesses: Business[] = [
  // === REAL NIGERIAN AGRO-EXPORTERS (from CSV) ===
  {
    id: 'b1', name: 'Farmers Home Foundation', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Sesame Seeds', 'Cashew Nuts', 'Shea Butter', 'Hibiscus Flower'], exportCapacity: '100 MT/month',
    certifications: ['NAFDAC', 'CAC'], minOrderQty: '10 MT', preferredMarkets: ['Italy', 'Germany', 'France'],
    verificationLevel: 'verified', tradeReadinessScore: 72, profileCompleteness: 80,
    description: 'An Abuja-based NGO promoting smallholder farmers by aggregating and exporting premium Nigerian agricultural commodities to European and Asian markets.',
    yearEstablished: 2016, employees: '25-50', contactEmail: 'farmershomefoundation@gmail.com',
  },
  {
    id: 'b2', name: 'Zazzau Prime Limited', country: 'Nigeria', sectors: ['Minerals & Mining'],
    products: ['Lithium Ore', 'Tantalite', 'Tin Ore', 'Columbite'], exportCapacity: '200 MT/month',
    certifications: ['Mining License', 'CAC'], minOrderQty: '20 MT', preferredMarkets: ['China', 'Germany', 'United Kingdom'],
    verificationLevel: 'verified', tradeReadinessScore: 68, profileCompleteness: 75,
    description: 'Kaduna-based solid minerals mining and export company with mining operations in Kogi State, specializing in strategic minerals for the global tech industry.',
    yearEstablished: 2018, employees: '50-100', contactEmail: 'zazzauprime@gmail.com',
  },
  {
    id: 'b3', name: 'DanGaske Group', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Groundnuts', 'Ginger', 'Sorghum', 'Millet'], exportCapacity: '80 MT/month',
    certifications: ['CAC'], minOrderQty: '5 MT', preferredMarkets: ['Italy', 'United Kingdom', 'France'],
    verificationLevel: 'basic', tradeReadinessScore: 58, profileCompleteness: 65,
    description: 'A Zaria-based agricultural trading enterprise sourcing grains and spices directly from northern Nigerian farmers for international export.',
    yearEstablished: 2015, employees: '10-25', contactEmail: 'Muhammedsalisu7@gmail.com',
  },
  {
    id: 'b4', name: 'African Women in Herbs, Spices & Natural Products', country: 'Nigeria', sectors: ['Herbs & Spices', 'Agriculture & Food'],
    products: ['Dried Ginger', 'Turmeric', 'Moringa Powder', 'Hibiscus Petals'], exportCapacity: '50 MT/month',
    certifications: ['NAFDAC', 'Organic Certified'], minOrderQty: '2 MT', preferredMarkets: ['Italy', 'Germany', 'United States'],
    verificationLevel: 'verified', tradeReadinessScore: 76, profileCompleteness: 82,
    description: 'Ibadan-based women-led NGO aggregating herbs, spices, and natural products from over 500 women farmers across southwestern Nigeria for export to EU markets.',
    yearEstablished: 2014, employees: '25-50', contactEmail: 'africaherbsandspices@gmail.com',
  },
  {
    id: 'b5', name: 'Inna Agro Commodities Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Sesame Seeds', 'Soyabeans', 'Groundnuts', 'Dried Hibiscus'], exportCapacity: '300 MT/month',
    certifications: ['NAFDAC', 'SON', 'CAC'], minOrderQty: '20 MT', preferredMarkets: ['Italy', 'China', 'United Kingdom'],
    verificationLevel: 'premium', tradeReadinessScore: 82, profileCompleteness: 88,
    description: 'Kano-based agro-commodity export company with own farmland in Dawakin Tufa, offering vertically integrated production from farm to port for premium agricultural exports.',
    yearEstablished: 2017, employees: '50-100', contactEmail: 'dikkoa42@gmail.com',
  },
  {
    id: 'b6', name: 'Dauno Integrated Ltd', country: 'Nigeria', sectors: ['Agriculture & Food', 'Logistics & Shipping'],
    products: ['Trade Facilitation', 'Agro-Logistics', 'Export Documentation', 'Commodity Sourcing'], exportCapacity: 'Project-based',
    certifications: ['CAC'], minOrderQty: 'N/A', preferredMarkets: ['Italy', 'South Africa'],
    verificationLevel: 'verified', tradeReadinessScore: 70, profileCompleteness: 78,
    description: 'Asokoro-based integrated services company providing end-to-end trade facilitation, logistics coordination, and export support for Nigerian businesses entering international markets.',
    yearEstablished: 2019, employees: '10-25', contactEmail: 'daunointegrated@gmail.com',
  },
  {
    id: 'b7', name: 'USBAB Multichoice Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Sesame Seeds', 'Gum Arabic', 'Hibiscus Flower', 'Tiger Nuts'], exportCapacity: '150 MT/month',
    certifications: ['NAFDAC', 'CAC'], minOrderQty: '10 MT', preferredMarkets: ['Italy', 'Germany', 'China'],
    verificationLevel: 'verified', tradeReadinessScore: 74, profileCompleteness: 80,
    description: 'Kaduna-headquartered agro-export firm with warehouse operations near Dawanau Market, Kano — one of the largest grain markets in West Africa.',
    yearEstablished: 2016, employees: '25-50', contactEmail: 'usmanbabaahmad21@gmail.com',
  },
  {
    id: 'b8', name: 'Korov Green Nigeria Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Sesame Seeds', 'Cashew Nuts', 'Cocoa Beans', 'Palm Kernel'], exportCapacity: '200 MT/month',
    certifications: ['NAFDAC', 'CAC', 'NEPC'], minOrderQty: '15 MT', preferredMarkets: ['Italy', 'France', 'United Kingdom'],
    verificationLevel: 'premium', tradeReadinessScore: 80, profileCompleteness: 85,
    description: 'Abuja-based agricultural export company with farming operations in Keana LGA, Nasarawa State, offering farm-to-export supply chain for premium Nigerian commodities.',
    yearEstablished: 2018, employees: '25-50', contactEmail: 'abdullahijaafarabba@gmail.com',
  },
  {
    id: 'b9', name: 'FRANJOE Edibles Ltd', country: 'Nigeria', sectors: ['Agriculture & Food', 'Food Processing', 'Super Market'],
    products: ['Processed Garri', 'Dried Vegetables', 'Spice Blends', 'Packaged Snacks'], exportCapacity: '60 MT/month',
    certifications: ['NAFDAC', 'CAC'], minOrderQty: '5 MT', preferredMarkets: ['Italy', 'United Kingdom', 'United States'],
    verificationLevel: 'verified', tradeReadinessScore: 71, profileCompleteness: 78,
    description: 'Lokogoma-based food processing and export company specializing in value-added Nigerian food products for the African diaspora and international gourmet markets.',
    yearEstablished: 2015, employees: '10-25', contactEmail: 'franjoe1311@gmail.com',
  },
  {
    id: 'b10', name: 'Timz & Raez Global Investment Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Soyabeans', 'Maize', 'Ginger', 'Sesame Seeds'], exportCapacity: '120 MT/month',
    certifications: ['CAC', 'NEPC'], minOrderQty: '10 MT', preferredMarkets: ['Italy', 'Germany', 'South Africa'],
    verificationLevel: 'basic', tradeReadinessScore: 64, profileCompleteness: 70,
    description: 'Dawaki-based agro-investment company focused on sourcing and exporting Nigerian grains and oilseeds to European food manufacturers.',
    yearEstablished: 2018, employees: '10-25', contactEmail: 'raetimmz@gmail.com',
  },
  {
    id: 'b11', name: 'Donapat Nigeria Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Cassava Flour', 'Palm Oil', 'Cocoa Butter', 'Shea Nuts'], exportCapacity: '100 MT/month',
    certifications: ['NAFDAC', 'SON', 'CAC'], minOrderQty: '8 MT', preferredMarkets: ['Italy', 'France', 'Germany'],
    verificationLevel: 'verified', tradeReadinessScore: 73, profileCompleteness: 79,
    description: 'Wuse-based agricultural export company with processing facilities in Gwagwalada, specializing in processed cassava products and tropical oils for EU food industries.',
    yearEstablished: 2012, employees: '25-50', contactEmail: 'Patychekwus@gmail.com',
  },
  {
    id: 'b12', name: 'Optimal Crystal Agro Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Soyabeans', 'Benniseed', 'Rice', 'Groundnuts'], exportCapacity: '150 MT/month',
    certifications: ['NAFDAC', 'CAC'], minOrderQty: '10 MT', preferredMarkets: ['Italy', 'China', 'United Kingdom'],
    verificationLevel: 'premium', tradeReadinessScore: 78, profileCompleteness: 84,
    description: 'Makurdi-based agro-export company operating from the heart of Nigeria\'s food basket, Benue State, with direct farm sourcing and quality control systems.',
    yearEstablished: 2017, employees: '25-50', contactEmail: 'rosekwaghzan@gmail.com',
  },
  {
    id: 'b13', name: 'Goma Premium Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Ginger', 'Sesame Seeds', 'Hibiscus', 'Moringa Leaves'], exportCapacity: '100 MT/month',
    certifications: ['CAC', 'NEPC'], minOrderQty: '5 MT', preferredMarkets: ['Italy', 'Germany', 'France'],
    verificationLevel: 'basic', tradeReadinessScore: 60, profileCompleteness: 68,
    description: 'Kaduna-based agricultural commodity trading firm with operations in Jere, focusing on high-demand Nigerian export crops for European spice and health food markets.',
    yearEstablished: 2020, employees: '10-25', contactEmail: 'sadiqshehu64@gmail.com',
  },
  {
    id: 'b14', name: 'Quebec Food Processing Industrial Parks Ltd', country: 'Nigeria', sectors: ['Food Processing', 'Agriculture & Food'],
    products: ['Processed Cashew', 'Dried Fruits', 'Food-Grade Oils', 'Packaged Spices'], exportCapacity: '80 MT/month',
    certifications: ['NAFDAC', 'SON', 'CAC'], minOrderQty: '5 MT', preferredMarkets: ['Italy', 'United States', 'United Kingdom'],
    verificationLevel: 'premium', tradeReadinessScore: 83, profileCompleteness: 90,
    description: 'Asokoro-based food processing company building Nigeria\'s first dedicated agro-industrial park for value-added processing of cashews, fruits, and spices for global export.',
    yearEstablished: 2016, employees: '50-100', contactEmail: 'info.quebecfoods@quebecgroups.com',
  },
  {
    id: 'b15', name: 'Exotic Foods & Cosmetics Centre', country: 'Italy', sectors: ['Agriculture & Food', 'Cosmetics & Beauty'],
    products: ['African Superfoods', 'Natural Cosmetics', 'Shea Butter Products', 'Organic Spices'], exportCapacity: '30 MT/month',
    certifications: ['EU Organic', 'ISO 22000'], minOrderQty: '1 MT', preferredMarkets: ['Italy', 'Germany', 'France'],
    verificationLevel: 'verified', tradeReadinessScore: 77, profileCompleteness: 82,
    description: 'Padova-based enterprise bridging Nigerian agro-products into European retail, specializing in African superfoods and natural cosmetic ingredients for the Italian market.',
    yearEstablished: 2010, employees: '10-25', contactEmail: 'Exoticfoodsitaly@gmail.com',
  },
  {
    id: 'b16', name: 'Chanja Datti Ltd', country: 'Nigeria', sectors: ['Plastics & Rubber', 'Environmental Services'],
    products: ['Recycled Plastics', 'Waste Management Solutions', 'Recycled Rubber', 'Eco-Packaging'], exportCapacity: '50 MT/month',
    certifications: ['ISO 14001', 'CAC'], minOrderQty: '5 MT', preferredMarkets: ['Italy', 'Germany', 'United Kingdom'],
    verificationLevel: 'verified', tradeReadinessScore: 75, profileCompleteness: 83,
    description: 'Durumi-based circular economy company turning Nigeria\'s plastic waste into export-grade recycled materials, with processing facilities in Giri, Abuja.',
    yearEstablished: 2015, employees: '25-50', contactEmail: 'Funtob@chanjadatti.com',
  },
  {
    id: 'b17', name: 'Alinhams International', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Groundnuts', 'Sesame Seeds', 'Dried Ginger', 'Sorghum'], exportCapacity: '250 MT/month',
    certifications: ['NAFDAC', 'CAC', 'NEPC'], minOrderQty: '20 MT', preferredMarkets: ['Italy', 'China', 'United States'],
    verificationLevel: 'premium', tradeReadinessScore: 81, profileCompleteness: 86,
    description: 'Kano-based commodity export powerhouse located on Zaria Road, with deep sourcing networks across northern Nigeria and established shipping routes to Asia and Europe.',
    yearEstablished: 2014, employees: '50-100', contactEmail: 'keskayeumar470@gmail.com',
  },
  {
    id: 'b18', name: 'Unique Shis Green Products Ltd', country: 'Nigeria', sectors: ['Agriculture & Food', 'Food Processing'],
    products: ['Organic Moringa', 'Dried Okra', 'Locust Beans', 'Ogbono Seeds'], exportCapacity: '40 MT/month',
    certifications: ['NAFDAC', 'Organic Certified'], minOrderQty: '2 MT', preferredMarkets: ['Italy', 'United Kingdom', 'United States'],
    verificationLevel: 'verified', tradeReadinessScore: 69, profileCompleteness: 76,
    description: 'Gwarinpa-based green food company specializing in organic Nigerian food ingredients, serving the growing European demand for plant-based African superfoods.',
    yearEstablished: 2016, employees: '10-25', contactEmail: 'uniqueshisfoods@gmail.com',
  },
  {
    id: 'b19', name: 'Mitchelson Nigeria Limited', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Palm Oil', 'Cassava Chips', 'Cocoa Beans', 'Kola Nuts'], exportCapacity: '100 MT/month',
    certifications: ['NAFDAC', 'SON'], minOrderQty: '10 MT', preferredMarkets: ['Italy', 'France', 'Germany'],
    verificationLevel: 'verified', tradeReadinessScore: 72, profileCompleteness: 78,
    description: 'Umuahia-based agro-export company with deep roots in southeastern Nigeria\'s agricultural heartland, exporting palm products and cocoa to European processors.',
    yearEstablished: 2008, employees: '25-50', contactEmail: 'mitchelsonnigerialimited@gmail.com',
  },
  {
    id: 'b20', name: 'Mercy Mission Global Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Groundnuts', 'Cowpeas', 'Millet', 'Sorghum'], exportCapacity: '180 MT/month',
    certifications: ['NAFDAC', 'CAC', 'NEPC'], minOrderQty: '15 MT', preferredMarkets: ['Italy', 'Germany', 'China'],
    verificationLevel: 'premium', tradeReadinessScore: 79, profileCompleteness: 85,
    description: 'Kano-based agro-commodity firm operating along the Hadejia Road corridor, with direct farmer partnerships and quality assurance systems for EU-standard exports.',
    yearEstablished: 2013, employees: '50-100', contactEmail: 'Mercymissionglobal@gmail.com',
  },
  {
    id: 'b21', name: 'Agro Women Synergy International', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Cashew Nuts', 'Shea Butter', 'Hibiscus', 'Dried Vegetables'], exportCapacity: '60 MT/month',
    certifications: ['Fair Trade', 'CAC'], minOrderQty: '5 MT', preferredMarkets: ['Italy', 'United Kingdom', 'Germany'],
    verificationLevel: 'verified', tradeReadinessScore: 74, profileCompleteness: 80,
    description: 'Lagos-based women-led NGO empowering female farmers across Nigeria by aggregating their produce for export, connecting rural communities to global trade opportunities.',
    yearEstablished: 2017, employees: '25-50', contactEmail: 'anitaecogreen@gmail.com',
  },
  {
    id: 'b22', name: 'Rosebud Business Associates Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Palm Kernel Oil', 'Rubber', 'Cocoa', 'Cassava Starch'], exportCapacity: '120 MT/month',
    certifications: ['NAFDAC', 'CAC', 'NEPC'], minOrderQty: '10 MT', preferredMarkets: ['Italy', 'China', 'Germany'],
    verificationLevel: 'verified', tradeReadinessScore: 73, profileCompleteness: 79,
    description: 'Mabushi-based export company with sourcing operations in Delta State, connecting Nigerian agricultural producers to international commodity markets.',
    yearEstablished: 2010, employees: '25-50', contactEmail: 'rosebudbusinessassocltd@gmail.com',
  },
  {
    id: 'b23', name: 'Halamin Herbal Products Limited', country: 'Nigeria', sectors: ['Healthcare & Pharma', 'Herbs & Spices'],
    products: ['Herbal Supplements', 'Medicinal Plants', 'Essential Oils', 'Natural Remedies'], exportCapacity: '20 MT/month',
    certifications: ['NAFDAC', 'CAC'], minOrderQty: '1 MT', preferredMarkets: ['Italy', 'Germany', 'United States'],
    verificationLevel: 'basic', tradeReadinessScore: 62, profileCompleteness: 70,
    description: 'Abuja-based herbal pharmaceutical company developing standardized African medicinal products for the growing global natural health and wellness market.',
    yearEstablished: 2019, employees: '10-25', contactEmail: 'johnidokoc@gmail.com',
  },
  {
    id: 'b24', name: 'Mbana House of Styles', country: 'Nigeria', sectors: ['Textiles & Fashion'],
    products: ['African Print Clothing', 'Ankara Fabric', 'Traditional Attire', 'Fashion Accessories'], exportCapacity: '5,000 units/month',
    certifications: ['CAC'], minOrderQty: '200 units', preferredMarkets: ['Italy', 'United Kingdom', 'United States'],
    verificationLevel: 'basic', tradeReadinessScore: 59, profileCompleteness: 65,
    description: 'Life Camp-based fashion house creating contemporary African designs using traditional Nigerian textiles, targeting the European and American fashion retail market.',
    yearEstablished: 2015, employees: '10-25', contactEmail: 'mbanaakpan@yahoo.com',
  },
  {
    id: 'b25', name: 'Kuchies Concept Ltd', country: 'Nigeria', sectors: ['Textiles & Fashion'],
    products: ['Adire Fabric', 'Aso-Oke', 'Ready-to-Wear', 'Textile Accessories'], exportCapacity: '3,000 units/month',
    certifications: ['CAC'], minOrderQty: '100 units', preferredMarkets: ['Italy', 'France', 'United Kingdom'],
    verificationLevel: 'verified', tradeReadinessScore: 66, profileCompleteness: 72,
    description: 'Garki-based Nigerian textile company reviving traditional Yoruba and Igbo weaving techniques with modern fashion sensibilities for the global luxury textile market.',
    yearEstablished: 2018, employees: '10-25', contactEmail: 'stellaofordu22@gmail.com',
  },
  {
    id: 'b26', name: 'Bureau Veritas Nigeria Ltd', country: 'Nigeria', sectors: ['Agriculture & Food', 'Logistics & Shipping'],
    products: ['Quality Inspection', 'Certification Services', 'Supply Chain Audits', 'Lab Testing'], exportCapacity: 'N/A',
    certifications: ['ISO 17025', 'ISO 9001', 'UKAS'], minOrderQty: 'N/A', preferredMarkets: ['Italy', 'France', 'Germany'],
    verificationLevel: 'premium', tradeReadinessScore: 92, profileCompleteness: 96,
    description: 'Ikoyi-based global testing and certification company providing quality assurance, inspection, and certification for Nigerian exporters seeking EU market access.',
    yearEstablished: 2005, employees: '100-250', contactEmail: 'Lawal.mohammed@bureauveritas.com',
  },
  {
    id: 'b27', name: 'AWIMSME Global Resources Limited', country: 'Nigeria', sectors: ['Food Processing', 'Agriculture & Food'],
    products: ['Processed Foods', 'Packaged Spices', 'Dried Fruits', 'Snack Foods'], exportCapacity: '40 MT/month',
    certifications: ['NAFDAC', 'CAC'], minOrderQty: '3 MT', preferredMarkets: ['Italy', 'United Kingdom', 'South Africa'],
    verificationLevel: 'verified', tradeReadinessScore: 70, profileCompleteness: 77,
    description: 'Wuse-based food processing enterprise with production facilities at the Technology Incubation Centre in Jos, turning raw Nigerian produce into export-ready packaged goods.',
    yearEstablished: 2016, employees: '25-50', contactEmail: 'vincass2005@yahoo.com',
  },
  {
    id: 'b28', name: 'Belzainco Global Links Nigeria Ltd', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Cotton', 'Gum Arabic', 'Hides & Skin', 'Sesame Seeds'], exportCapacity: '200 MT/month',
    certifications: ['NAFDAC', 'NEPC', 'CAC'], minOrderQty: '15 MT', preferredMarkets: ['Italy', 'China', 'Germany'],
    verificationLevel: 'verified', tradeReadinessScore: 75, profileCompleteness: 81,
    description: 'Zamfara-based commodity export company with extensive sourcing networks across northwestern Nigeria, specializing in cotton and natural gums for international textile and food industries.',
    yearEstablished: 2011, employees: '25-50', contactEmail: 'belzainco.info@yahoo.com',
  },
  {
    id: 'b29', name: 'EdenGrow Ventures', country: 'Nigeria', sectors: ['Agriculture & Food'],
    products: ['Organic Vegetables', 'Dried Herbs', 'Fruit Concentrates', 'Honey'], exportCapacity: '30 MT/month',
    certifications: ['Organic Certified', 'CAC'], minOrderQty: '2 MT', preferredMarkets: ['Italy', 'Germany', 'United States'],
    verificationLevel: 'basic', tradeReadinessScore: 63, profileCompleteness: 69,
    description: 'Jikwoyi-based organic farming enterprise producing chemical-free Nigerian fruits, vegetables, and honey for health-conscious European consumers.',
    yearEstablished: 2020, employees: '10-25', contactEmail: 'debolus29@gmail.com',
  },
  {
    id: 'b30', name: 'PiMason Tech', country: 'Italy', sectors: ['Technology'],
    products: ['Agri-Tech Solutions', 'Supply Chain Software', 'IoT Sensors', 'Data Analytics'], exportCapacity: 'Unlimited (Digital)',
    certifications: ['ISO 27001'], minOrderQty: 'N/A', preferredMarkets: ['Nigeria', 'Kenya'],
    verificationLevel: 'basic', tradeReadinessScore: 65, profileCompleteness: 70,
    description: 'Castelfranco Veneto-based Italian IT company developing agricultural technology and supply chain digitization tools for Africa-Europe trade corridors.',
    yearEstablished: 2019, employees: '10-25', contactEmail: 'Paolomason@gmail.com',
  },
  // === EXISTING EUROPEAN / OTHER AFRICAN PARTNERS ===
  {
    id: 'b31', name: 'Napoli Trade Solutions', country: 'Italy', sectors: ['Manufacturing', 'Agriculture & Food'],
    products: ['Olive Oil', 'Pasta Processing Equipment', 'Food Packaging'], exportCapacity: '200 MT/month',
    certifications: ['ISO 9001', 'EU Organic'], minOrderQty: '5 MT', preferredMarkets: ['Nigeria', 'Kenya'],
    verificationLevel: 'verified', tradeReadinessScore: 82, profileCompleteness: 88,
    description: 'Italian food processing and equipment manufacturer looking to expand into West African markets.',
    yearEstablished: 2012, employees: '100-250', contactEmail: 'trade@napolitrade.it',
  },
  {
    id: 'b32', name: 'Milano Fashion House', country: 'Italy', sectors: ['Textiles & Fashion'],
    products: ['Luxury Leather Goods', 'Designer Shoes', 'Accessories'], exportCapacity: '5,000 units/month',
    certifications: ['Made in Italy', 'ISO 9001'], minOrderQty: '100 units', preferredMarkets: ['Nigeria', 'South Africa', 'Kenya'],
    verificationLevel: 'premium', tradeReadinessScore: 91, profileCompleteness: 97,
    description: 'High-end Italian fashion brand seeking African retail and distribution partners.',
    yearEstablished: 1998, employees: '100-250', contactEmail: 'partners@milanofh.it',
  },
  {
    id: 'b33', name: 'Roma Pharma International', country: 'Italy', sectors: ['Healthcare & Pharma'],
    products: ['Generic Medicines', 'Medical Equipment', 'Diagnostic Kits'], exportCapacity: '100,000 units/month',
    certifications: ['EU GMP', 'WHO Prequalification'], minOrderQty: '1,000 units', preferredMarkets: ['Nigeria', 'Kenya'],
    verificationLevel: 'premium', tradeReadinessScore: 93, profileCompleteness: 99,
    description: 'Italian pharmaceutical company expanding into African healthcare markets.',
    yearEstablished: 1995, employees: '500+', contactEmail: 'africa@romapharma.it',
  },
  {
    id: 'b34', name: 'Torino Logistics SpA', country: 'Italy', sectors: ['Logistics & Shipping'],
    products: ['Freight Forwarding', 'Customs Clearance', 'Warehousing'], exportCapacity: 'N/A',
    certifications: ['AEO Certified', 'ISO 28000'], minOrderQty: 'N/A', preferredMarkets: ['Nigeria', 'South Africa'],
    verificationLevel: 'premium', tradeReadinessScore: 85, profileCompleteness: 90,
    description: 'Italian logistics company specializing in Africa-Europe trade corridors.',
    yearEstablished: 2001, employees: '100-250', contactEmail: 'africa@torinologistics.it',
  },
  {
    id: 'b35', name: 'Nairobi Fresh Produce', country: 'Kenya', sectors: ['Agriculture & Food'],
    products: ['Fresh Flowers', 'Avocados', 'Green Beans'], exportCapacity: '300 MT/month',
    certifications: ['GlobalGAP', 'Fair Trade'], minOrderQty: '10 MT', preferredMarkets: ['Italy', 'Germany', 'France'],
    verificationLevel: 'verified', tradeReadinessScore: 77, profileCompleteness: 83,
    description: 'Kenyan horticultural exporter with cold chain logistics to European markets.',
    yearEstablished: 2011, employees: '100-250', contactEmail: 'sales@nairobifresh.ke',
  },
  // (Ghana entry removed)
  {
    id: 'b37', name: 'Johannesburg Mining Corp', country: 'South Africa', sectors: ['Minerals & Mining'],
    products: ['Gold', 'Platinum', 'Chrome Ore'], exportCapacity: '500 MT/month',
    certifications: ['ISO 14001', 'Responsible Mining'], minOrderQty: '50 MT', preferredMarkets: ['Italy', 'China', 'United Kingdom'],
    verificationLevel: 'premium', tradeReadinessScore: 86, profileCompleteness: 91,
    description: 'South African mining company with ethically sourced mineral exports.',
    yearEstablished: 2003, employees: '500+', contactEmail: 'trade@jhbmining.za',
  },
  {
    id: 'b38', name: 'Florence Ceramics International', country: 'Italy', sectors: ['Manufacturing', 'Construction Materials'],
    products: ['Porcelain Tiles', 'Sanitary Ware', 'Decorative Ceramics'], exportCapacity: '50,000 sqm/month',
    certifications: ['CE Mark', 'ISO 9001'], minOrderQty: '500 sqm', preferredMarkets: ['Nigeria', 'Kenya'],
    verificationLevel: 'verified', tradeReadinessScore: 80, profileCompleteness: 85,
    description: 'Italian ceramics manufacturer expanding into African construction market.',
    yearEstablished: 2007, employees: '100-250', contactEmail: 'export@florenceceramics.it',
  },
];

// ===== EVENTS =====
export const events: TradeEvent[] = [
  // ===== UPCOMING =====
  {
    id: 'e1', title: 'Expo Tokyo 2026', type: 'conference',
    description: 'Major international exhibition for agriculture, trade and innovation. DIL is mobilising a Nigerian delegation to showcase agro-products and innovation to Asian and global buyers.',
    date: '2026-10-07', endDate: '2026-10-09', location: 'Makuhari Messe, Tokyo, Japan',
    agenda: [
      { time: '09:00', title: 'Delegation Arrival & Briefing' },
      { time: '11:00', title: 'Pavilion Opening & Country Showcase' },
      { time: '14:00', title: 'B2B Matchmaking with Asian Buyers' },
      { time: '16:00', title: 'Innovation & AgriTech Roundtable' },
    ],
    speakers: [
      { name: 'DIL Trade Mission Lead', role: 'Head of Delegation', company: 'Dauno Integrated Ltd' },
    ],
    sponsors: ['Nigerian Export Promotion Council', 'Confindustria'],
    ticketTiers: [
      { tier: 'standard', price: 1800, label: 'Delegate', perks: ['Pavilion access', 'B2B sessions', 'Group transport'] },
      { tier: 'vip', price: 3500, label: 'VIP Delegate', perks: ['All delegate perks', 'Premium hotel', 'Private meetings'] },
    ],
    registrations: 38, capacity: 80, isPast: false,
  },
  {
    id: 'e2', title: 'Italy Study Tour — Innovation & Cultural Exposure', type: 'delegation',
    description: 'Curated study tour across Italian innovation hubs and cultural institutions. Designed for executives, founders and policy makers seeking exposure to Italian business models and craftsmanship.',
    date: '2026-08-27', endDate: '2026-08-29', location: 'Italy (multi-city)',
    agenda: [
      { time: '09:00', title: 'Innovation District Visit' },
      { time: '13:00', title: 'Cultural Exchange Lunch' },
      { time: '15:00', title: 'Industry Roundtable & Site Tour' },
    ],
    speakers: [
      { name: 'Italian Industry Hosts', role: 'Various', company: 'Confindustria network' },
    ],
    sponsors: ['Dauno Integrated Ltd', 'Confindustria'],
    ticketTiers: [
      { tier: 'standard', price: 1200, label: 'Participant', perks: ['Tour access', 'Group transport', 'Lunches'] },
      { tier: 'vip', price: 2500, label: 'Premium Participant', perks: ['All perks', 'Private guide', 'Premium accommodation'] },
    ],
    registrations: 22, capacity: 40, isPast: false,
  },
  {
    id: 'e3', title: 'Italy B2B Trade Event — July', type: 'trade-mission',
    description: 'B2B networking and trade event in Italy connecting Nigerian SMEs with Italian buyers and industrial partners.',
    date: '2026-07-18', endDate: '2026-07-19', location: 'Italy',
    agenda: [
      { time: '09:00', title: 'Welcome & Country Briefing' },
      { time: '11:00', title: 'Structured B2B Meetings' },
      { time: '15:00', title: 'Sector Panels & Networking' },
    ],
    speakers: [
      { name: 'DIL B2B Coordinator', role: 'Lead', company: 'Dauno Integrated Ltd' },
    ],
    sponsors: ['Confindustria', 'Italian Embassy, Abuja'],
    ticketTiers: [
      { tier: 'standard', price: 800, label: 'Delegate', perks: ['B2B meetings', 'Lunch', 'Materials'] },
      { tier: 'vip', price: 1800, label: 'VIP Delegate', perks: ['Priority matching', 'Networking dinner'] },
    ],
    registrations: 31, capacity: 70, isPast: false,
  },
  {
    id: 'e4', title: 'Italy B2B Trade Event — Early July', type: 'trade-mission',
    description: 'First-week-of-July business-to-business trade event in Italy. Targeted matchmaking between Nigerian exporters and Italian SMEs.',
    date: '2026-07-02', endDate: '2026-07-04', location: 'Italy',
    agenda: [
      { time: '09:00', title: 'Opening & Briefing' },
      { time: '11:00', title: 'B2B Sessions' },
      { time: '14:00', title: 'Sector Roundtables' },
    ],
    speakers: [
      { name: 'DIL Trade Lead', role: 'Coordinator', company: 'Dauno Integrated Ltd' },
    ],
    sponsors: ['Confindustria'],
    ticketTiers: [
      { tier: 'standard', price: 800, label: 'Delegate', perks: ['B2B meetings', 'Lunch'] },
    ],
    registrations: 18, capacity: 60, isPast: false,
  },

  // ===== PAST =====
  {
    id: 'e5', title: 'Nigeria-Italy Investment Submission Mission', type: 'trade-mission',
    description: 'High-level investment submission mission connecting Nigerian government and private-sector stakeholders with Italian investors.',
    date: '2019-09-15', endDate: '2019-09-20', location: 'Italy',
    agenda: [],
    speakers: [],
    sponsors: ['Dauno Integrated Ltd'],
    ticketTiers: [],
    registrations: 120, capacity: 120, isPast: true,
  },
  {
    id: 'e6', title: 'Nigeria-Italy Agricultural Promotion Programme', type: 'trade-mission',
    description: 'Agricultural promotion programme showcasing Nigerian agro-products and exploring partnership pathways into the Italian market.',
    date: '2019-06-10', endDate: '2019-06-14', location: 'Italy',
    agenda: [],
    speakers: [],
    sponsors: ['Nigerian Export Promotion Council'],
    ticketTiers: [],
    registrations: 95, capacity: 100, isPast: true,
  },
  {
    id: 'e7', title: 'Trade & Investment Programme — Rome', type: 'trade-mission',
    description: 'Trade and investment programme delegation in Rome focused on bilateral cooperation, production and investment opportunities.',
    date: '2022-05-12', endDate: '2022-05-15', location: 'Rome, Italy',
    agenda: [], speakers: [], sponsors: ['Dauno Integrated Ltd'], ticketTiers: [],
    registrations: 70, capacity: 80, isPast: true,
  },
  {
    id: 'e8', title: 'Nigerian Trade Delegation to Italy', type: 'delegation',
    description: 'International trade delegation visiting Italian institutions, chambers and industrial partners.',
    date: '2022-07-19', endDate: '2022-07-22', location: 'Italy',
    agenda: [], speakers: [], sponsors: ['Dauno Integrated Ltd'], ticketTiers: [],
    registrations: 60, capacity: 60, isPast: true,
  },
  {
    id: 'e9', title: 'Business Mission to Confindustria Reggio Calabria', type: 'trade-mission',
    description: 'Theme: Trade, Investment and Strategic Partnership Opportunities. A landmark business mission fostering Nigeria–Italy bilateral trade.',
    date: '2023-07-31', endDate: '2023-08-02', location: 'Reggio Calabria, Italy',
    agenda: [], speakers: [], sponsors: ['Confindustria Reggio Calabria'], ticketTiers: [],
    registrations: 55, capacity: 60, isPast: true,
  },
  {
    id: 'e10', title: '100 Years of Confindustria — Celebration', type: 'conference',
    description: 'Centenary celebration of Confindustria. Networking and industry-relations event hosting Nigerian and Italian business leaders.',
    date: '2024-05-04', endDate: '2024-05-04', location: 'Italy',
    agenda: [], speakers: [], sponsors: ['Confindustria'], ticketTiers: [],
    registrations: 200, capacity: 200, isPast: true,
  },
];

// ===== MEMBERSHIP PLANS =====
export const membershipPlans: MembershipPlan[] = [
  {
    tier: 'free',
    name: 'Explorer',
    subtitle: 'Just exploring international trade',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    annualPrice: 0,
    price: 0,
    period: 'forever',
    annualPeriodLabel: 'Free forever',
    monthlyPeriodLabel: 'Free forever',
    commissionRate: 5,
    features: [
      'Directory Profile',
      '3 match views per month',
      'Email support',
    ],
  },
  {
    tier: 'starter',
    name: 'Pro',
    subtitle: 'Actively seeking trade partners',
    monthlyPrice: 16,
    annualMonthlyPrice: 13,
    annualPrice: 156,
    ngnMonthlyPrice: 20000,
    ngnAnnualPrice: 156000,
    price: 13,
    period: '/month',
    annualPeriodLabel: '/month billed annually',
    monthlyPeriodLabel: '/month billed monthly',
    trialAvailable: true,
    commissionRate: 4,
    features: [
      'Directory Profile',
      'Unlimited match views',
      'Deal room access',
      '2 escrow transactions per month',
      'Basic trade intelligence',
      '10% event discount',
      'Email support',
    ],
  },
  {
    tier: 'growth',
    name: 'Business',
    subtitle: 'Running multiple deals at once',
    monthlyPrice: 24,
    annualMonthlyPrice: 19,
    annualPrice: 228,
    ngnMonthlyPrice: 28000,
    ngnAnnualPrice: 216000,
    price: 19,
    period: '/month',
    annualPeriodLabel: '/month billed annually',
    monthlyPeriodLabel: '/month billed monthly',
    trialAvailable: true,
    commissionRate: 3,
    highlighted: true,
    features: [
      'Directory Profile',
      'Unlimited match views',
      'Deal room access',
      'Unlimited escrow transactions',
      'AI Trade Advisor',
      'Full trade intelligence',
      '25% event discount',
      'Priority support',
    ],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Government agencies, chambers, and large corporations',
    monthlyPrice: 0,
    annualMonthlyPrice: 0,
    annualPrice: 0,
    price: 0,
    period: 'custom',
    annualPeriodLabel: 'Custom pricing',
    monthlyPeriodLabel: 'Custom pricing',
    commissionRate: 2,
    features: [
      'Directory Profile',
      'Unlimited match views',
      'Deal room access',
      'Unlimited escrow transactions',
      'AI Trade Advisor',
      'Custom trade intelligence',
      'Free event access',
      'Dedicated support',
      'API access',
      'Dedicated account manager',
    ],
  },
];

// ===== ACTIVITY LOG =====
export const activityLog: ActivityLogEntry[] = [
  { id: 'a1', action: 'New business registered: Inna Agro Commodities Ltd', user: 'System', timestamp: '2026-02-26T10:30:00Z', type: 'business' },
  { id: 'a2', action: 'Business verified: Korov Green Nigeria Ltd', user: 'Admin', timestamp: '2026-02-26T09:15:00Z', type: 'business' },
  { id: 'a3', action: 'Match request: Alinhams Intl → Napoli Trade', user: 'Alinhams International', timestamp: '2026-02-25T16:45:00Z', type: 'match' },
  { id: 'a4', action: 'Event registration: Nigeria-Italy Summit (+5)', user: 'System', timestamp: '2026-02-25T14:20:00Z', type: 'event' },
  { id: 'a5', action: 'Subscription upgrade: Growth plan', user: 'Accra Textiles Co.', timestamp: '2026-02-25T11:00:00Z', type: 'subscription' },
  { id: 'a6', action: 'New business registered: Quebec Food Processing', user: 'System', timestamp: '2026-02-24T17:30:00Z', type: 'business' },
  { id: 'a7', action: 'Match accepted: Milano Fashion ↔ Kuchies Concept', user: 'Milano Fashion House', timestamp: '2026-02-24T15:10:00Z', type: 'match' },
  { id: 'a8', action: 'Event created: West Africa AgriTech Workshop', user: 'Admin', timestamp: '2026-02-24T10:00:00Z', type: 'event' },
  { id: 'a9', action: 'Business rejected: Suspicious Trading LLC', user: 'Admin', timestamp: '2026-02-23T14:30:00Z', type: 'business' },
  { id: 'a10', action: 'Subscription renewed: Enterprise plan', user: 'Roma Pharma International', timestamp: '2026-02-23T09:00:00Z', type: 'subscription' },
];

// ===== MATCH RESULTS (pre-computed for demo) =====
export const sampleMatches: MatchResult[] = [
  { id: 'm1', businessId: 'b31', matchScore: 87, sectorScore: 95, countryScore: 85, capacityScore: 80, verificationScore: 75, status: 'pending' },
  { id: 'm2', businessId: 'b5', matchScore: 72, sectorScore: 60, countryScore: 90, capacityScore: 70, verificationScore: 85, status: 'pending' },
  { id: 'm3', businessId: 'b8', matchScore: 65, sectorScore: 40, countryScore: 85, capacityScore: 75, verificationScore: 90, status: 'accepted' },
  { id: 'm4', businessId: 'b17', matchScore: 58, sectorScore: 30, countryScore: 90, capacityScore: 60, verificationScore: 85, status: 'pending' },
  { id: 'm5', businessId: 'b14', matchScore: 53, sectorScore: 50, countryScore: 70, capacityScore: 45, verificationScore: 70, status: 'declined' },
  { id: 'm6', businessId: 'b35', matchScore: 81, sectorScore: 90, countryScore: 75, capacityScore: 80, verificationScore: 75, status: 'pending' },
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
