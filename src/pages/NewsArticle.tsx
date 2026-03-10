import { useParams, useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';

const articles: Record<string, {
  title: string;
  date: string;
  category: string;
  image: string;
  content: string[];
  gallery?: string[];
}> = {
  'attigliano-pact': {
    title: 'DIL CEO Drives Historic Nigeria-Italy Economic Pact in Attigliano',
    date: 'December 1, 2025',
    category: 'Business',
    image: '/images/news/attigliano-pact.jpg',
    content: [
      'The Comune di Attigliano has solidified a significant commitment to international cooperation by signing a Declaration of Intent with the Associazione "Italian Nigerian Business".',
      'The agreement was driven by Amb. Hon. (Mrs.) Okorokwo Nikiruka, CEO of Dauno Integrated Ltd, who has been instrumental in fostering Nigeria-Italy bilateral trade relations.',
      'This historic pact establishes a framework for economic collaboration, cultural exchange, and business development between Italian and Nigerian enterprises.',
      'The signing ceremony was attended by local government officials, business leaders, and diplomatic representatives from both nations, marking a milestone in the growing economic partnership between Nigeria and Italy.',
      'Under this agreement, both parties will work together to promote trade opportunities, facilitate business matchmaking, and support SMEs in accessing international markets.',
    ],
    gallery: ['/images/news/attigliano-pact.jpg', '/images/news/conference-group.jpg'],
  },
  'innovation-science-technology': {
    title: 'Nigeria and Italy Strengthen Ties in Innovation, Science & Technology',
    date: 'March 16, 2025',
    category: 'Business',
    image: '/images/news/business-development.jpg',
    content: [
      'The Honourable Minister of Innovation, Science, and Technology, Chief Uche Nnaji, met with His Excellency, Lacopo Foti, the Acting Ambassador of Italy to Nigeria.',
      'The meeting focused on collaborative opportunities in technology transfer, innovation partnerships, and scientific research between the two nations.',
      'Both parties discussed the potential for Italian technology companies to partner with Nigerian startups and SMEs, creating a pipeline for innovation and economic growth.',
      'The discussions also covered the establishment of joint innovation hubs and technology parks that would serve as incubators for Nigeria-Italy collaborative projects.',
    ],
    gallery: ['/images/news/business-development.jpg', '/images/news/trade-promotions.jpg'],
  },
  'reggio-calabria-mission': {
    title: 'Business Mission to Confindustria Reggio Calabria, Italy',
    date: 'July 31, 2023',
    category: 'Trade Mission',
    image: '/images/news/reggio-calabria.jpg',
    content: [
      'Theme: "Trade, Investment and Strategic Partnership Opportunities" — A landmark business mission fostering Nigeria-Italy bilateral trade.',
      'The delegation, organized by Dauno Integrated Ltd, brought together Nigerian exporters and Italian buyers for direct B2B meetings and partnership discussions.',
      'Confindustria Reggio Calabria hosted the event, providing a platform for businesses from both countries to explore joint ventures, supply chain partnerships, and investment opportunities.',
      'The mission included presentations on market opportunities, sector-specific workshops, and networking sessions that resulted in several memoranda of understanding.',
      'Participants had the opportunity to visit local Italian enterprises, agricultural facilities, and manufacturing plants to understand the Italian business ecosystem firsthand.',
    ],
    gallery: ['/images/news/reggio-calabria.jpg', '/images/news/conference-group.jpg', '/images/news/trade-meetings.jpg'],
  },
  'agricultural-promotion-treviso': {
    title: 'Nigeria-Italy Agricultural Promotion Programme at Treviso Chamber of Commerce',
    date: 'November 15, 2019',
    category: 'Agriculture',
    image: '/images/news/agricultural-programme.jpg',
    content: [
      'The Nigeria-Italy Agricultural Promotion Programme was held at the prestigious Treviso Chamber of Commerce, bringing together agricultural producers, buyers, and trade facilitators.',
      'Nigerian delegation members showcased a range of agricultural products including cashew nuts, sesame seeds, cocoa, shea butter, and processed food items to Italian buyers and distributors.',
      'The programme featured keynote presentations on Nigeria\'s agricultural export potential, quality standards compliance, and market access strategies for the European market.',
      'Representatives from the Nigerian Embassy in Italy and the Treviso Chamber of Commerce highlighted the importance of agricultural trade in strengthening bilateral relations.',
      'Several partnership agreements were initiated during the programme, opening new channels for Nigerian agricultural exports to the Veneto region and beyond.',
    ],
    gallery: ['/images/news/agricultural-programme.jpg', '/images/news/treviso-delegation.jpg'],
  },
  'treviso-province-visit': {
    title: 'Nigerian Delegation Visits the President of Treviso Province',
    date: 'October 2019',
    category: 'Delegation',
    image: '/images/news/treviso-delegation.jpg',
    content: [
      'A high-level Nigerian delegation led by DIL visited the President of Treviso Province to explore trade and investment opportunities in the Veneto region of Italy.',
      'The visit was part of a broader trade mission aimed at connecting Nigerian businesses with Italian counterparts in key sectors including agriculture, manufacturing, and technology.',
      'The President of Treviso Province expressed enthusiasm for deepening economic ties with Nigeria, highlighting the region\'s strengths in agriculture, wine production, and manufacturing.',
      'Discussions covered potential areas of collaboration including agribusiness partnerships, technical training programmes, and joint investment initiatives.',
    ],
    gallery: ['/images/news/treviso-delegation.jpg', '/images/news/trade-meetings.jpg'],
  },
  'trade-promotions-b2b': {
    title: 'International Trade Promotions & B2B Exhibition Mission',
    date: 'April 25, 2023',
    category: 'Trade Promotion',
    image: '/images/news/trade-promotions.jpg',
    content: [
      'DIL organized a comprehensive Italy-Nigeria B2B Exhibition Mission focused on internationalization and trade promotion between the two countries.',
      'The event brought together Italian and Nigerian entrepreneurs for structured business meetings, product presentations, and partnership negotiations.',
      'Key sectors covered included agribusiness, manufacturing, textiles, technology, and services, reflecting the diverse economic interests of participants from both countries.',
      'The mission included workshops on export procedures, quality certifications, and market entry strategies for businesses looking to expand into new markets.',
    ],
    gallery: ['/images/news/trade-promotions.jpg', '/images/news/conference-group.jpg'],
  },
  'trade-meetings-delegations': {
    title: 'Trade Meetings & Delegations Programme',
    date: 'March 2023',
    category: 'Delegation',
    image: '/images/news/trade-meetings.jpg',
    content: [
      'Dauno Integrated Ltd organized a series of high-level trade meetings and delegation programmes connecting Nigerian producers with Italian industrial partners.',
      'The meetings were held across multiple Italian cities, providing Nigerian delegates with exposure to different regional business ecosystems.',
      'Presentations covered opportunities in agriculture, manufacturing, logistics, and professional services, with a focus on establishing sustainable trading partnerships.',
      'The programme facilitated direct interactions between Nigerian export-ready businesses and Italian importers, resulting in new trade agreements and business relationships.',
    ],
    gallery: ['/images/news/trade-meetings.jpg', '/images/news/hero-summit.jpg'],
  },
};

export default function NewsArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = slug ? articles[slug] : null;

  if (!article) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => navigate('/news')}>Back to News</Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative h-[400px]">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy))]/90 via-[hsl(var(--navy))]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Badge className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] mb-3">{article.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 max-w-3xl">{article.title}</h1>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Calendar className="h-4 w-4" /> {article.date}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" className="mb-8 text-muted-foreground" onClick={() => navigate('/news')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to News
            </Button>

            <div className="prose prose-lg max-w-none">
              {article.content.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4">{p}</p>
              ))}
            </div>

            {/* Gallery */}
            {article.gallery && article.gallery.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-foreground mb-4">Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.gallery.map((img, i) => (
                    <img key={i} src={img} alt={`Gallery ${i + 1}`} className="rounded-lg w-full h-64 object-cover" />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t flex justify-between items-center">
              <Button variant="outline" onClick={() => navigate('/news')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> More Articles
              </Button>
              <Button variant="ghost" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
