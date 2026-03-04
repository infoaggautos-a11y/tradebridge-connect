export type NewsArticle = {
  id: string;
  slug: string;
  legacyPath: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  featured: boolean;
  location?: string;
  highlights: string[];
  body: string[];
};

export const newsArticles: NewsArticle[] = [
  {
    id: 'n1',
    slug: 'nigeria-italy-economic-pact-attigliano',
    legacyPath:
      '/dauno-integrated-ltd-ceo-amb-hon-mrs-okorokwo-nikiruka-drives-historic-nigeria-italy-economic-pact-in-attigliano-abuja-attigliano-november-14-2025/',
    title: 'Dauno Integrated Ltd CEO Drives Historic Nigeria-Italy Economic Pact in Attigliano',
    excerpt:
      'The Comune di Attigliano signed a Declaration of Intent with the Associazione "Italian Nigerian Business", strengthening institutional cooperation and trade diplomacy.',
    image: '/images/news/attigliano-pact.jpg',
    date: 'December 1, 2025',
    category: 'Business',
    featured: true,
    location: 'Attigliano, Italy',
    highlights: [
      'Declaration of Intent signed for Nigeria-Italy cooperation.',
      'Public-private collaboration framework for bilateral opportunities.',
      'Cross-border trade facilitation and delegation exchange planned.',
    ],
    body: [
      'Dauno Integrated Ltd supported a high-level engagement in Attigliano focused on long-term economic cooperation between Nigerian and Italian stakeholders.',
      'The signing ceremony formalized intent around investment promotion, institutional linkages, and structured private sector participation.',
      'This milestone aligns with DIL’s strategy to expand practical trade corridors through policy dialogue, enterprise matchmaking, and targeted business missions.',
    ],
  },
  {
    id: 'n2',
    slug: 'nigeria-italy-innovation-science-technology-ties',
    legacyPath: '/elementor-676/',
    title: 'Nigeria and Italy Strengthen Ties in Innovation, Science, and Technology',
    excerpt:
      'Senior officials met to deepen bilateral cooperation in technology transfer, innovation ecosystems, and research-enabled industrial growth.',
    image: '/images/gallery/minister-meeting.jpg',
    date: 'March 16, 2025',
    category: 'Innovation',
    featured: true,
    location: 'Abuja, Nigeria',
    highlights: [
      'Government-level dialogue on innovation collaboration.',
      'Focus on technology transfer and capacity building.',
      'Support for startup ecosystems and industrial modernization.',
    ],
    body: [
      'The engagement emphasized practical outcomes across innovation policy, knowledge exchange, and sector-focused partnerships between Nigerian and Italian institutions.',
      'Participants explored pathways for expanding scientific cooperation and improving commercialization opportunities for emerging technologies.',
      'DIL continues to support this direction by connecting innovation-led businesses with market access, partnerships, and implementation support.',
    ],
  },
  {
    id: 'n3',
    slug: 'business-mission-confindustria-reggio-calabria',
    legacyPath: '/business-mission-to-confindrustria-reggio-calabria-italy/',
    title: 'Business Mission to Confindustria Reggio Calabria, Italy',
    excerpt:
      'A landmark mission convened enterprises around trade, investment, and strategic partnership opportunities between Nigeria and Italy.',
    image: '/images/news/reggio-calabria.jpg',
    date: 'July 31, 2023',
    category: 'Trade Mission',
    featured: false,
    location: 'Reggio Calabria, Italy',
    highlights: [
      'B2B engagements with Italian industry stakeholders.',
      'Bilateral discussions on market entry and sourcing partnerships.',
      'Pipeline creation for future investment and export activity.',
    ],
    body: [
      'The mission delivered focused sessions on investment readiness, value-chain collaboration, and actionable pathways for SMEs seeking international expansion.',
      'Nigerian and Italian participants evaluated sector opportunities and built direct institutional and business relationships.',
      'The outcomes reinforced DIL’s role in translating diplomatic and commercial interest into measurable trade opportunities.',
    ],
  },
  {
    id: 'n4',
    slug: 'treviso-agricultural-promotion-programme',
    legacyPath: '/treviso-agricultural-promotion-programme/',
    title: 'Nigeria-Italy Agricultural Promotion Programme at Treviso Chamber of Commerce',
    excerpt:
      'The programme convened policymakers and private sector participants around agricultural trade, quality standards, and cross-border cooperation.',
    image: '/images/gallery/keynote-treviso.jpg',
    date: 'November 15, 2019',
    category: 'Agriculture',
    featured: false,
    location: 'Treviso, Italy',
    highlights: [
      'Agricultural value-chain engagement and standards alignment.',
      'Delegation meetings with public and private sector actors.',
      'Stronger pathways for agri-export collaboration.',
    ],
    body: [
      'The initiative brought strategic visibility to agricultural trade opportunities and helped frame practical collaboration priorities across both markets.',
      'Stakeholders identified quality requirements, compliance expectations, and potential sourcing channels for long-term partnerships.',
      'The programme set the stage for deeper sector-specific trade facilitation by DIL and partner institutions.',
    ],
  },
  {
    id: 'n5',
    slug: 'nigerian-delegation-visit-treviso-province',
    legacyPath: '/nigerian-delegation-visits-president-treviso-province/',
    title: 'Nigerian Delegation Visits the President of Treviso Province',
    excerpt:
      'A high-level delegation engagement explored regional investment opportunities and enterprise collaboration in Northern Italy.',
    image: '/images/gallery/treviso-visit.jpg',
    date: 'October 2019',
    category: 'Delegation',
    featured: false,
    location: 'Treviso, Italy',
    highlights: [
      'High-level regional engagement in Veneto.',
      'Business and institutional dialogue on trade development.',
      'Foundation for sustained bilateral delegation activities.',
    ],
    body: [
      'The delegation engagement opened targeted discussions on investment opportunities, supply-chain cooperation, and structured business exchange.',
      'Meetings centered on practical channels for collaboration between Nigerian enterprises and Italian regional stakeholders.',
      'The visit strengthened momentum for recurring mission formats coordinated through DIL’s network.',
    ],
  },
];

export const newsBySlug = new Map(newsArticles.map((article) => [article.slug, article]));
export const newsByLegacyPath = new Map(newsArticles.map((article) => [article.legacyPath, article]));
