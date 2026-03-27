import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';

const articles = [
  {
    id: 'attigliano-pact',
    title: 'DIL CEO Drives Historic Nigeria-Italy Economic Pact in Attigliano',
    excerpt: 'The Comune di Attigliano signed a Declaration of Intent with the Associazione "Italian Nigerian Business", solidifying international cooperation commitments.',
    image: '/images/news/attigliano-pact.jpg',
    date: 'December 1, 2025',
    category: 'Business',
    featured: true,
  },
  {
    id: 'innovation-science-technology',
    title: 'Nigeria and Italy Strengthen Ties in Innovation, Science, and Technology',
    excerpt: 'The Honourable Minister of Innovation, Science, and Technology met with the Acting Ambassador of Italy to Nigeria to discuss collaborative opportunities.',
    image: '/images/news/business-development.jpg',
    date: 'March 16, 2025',
    category: 'Business',
    featured: true,
  },
  {
    id: 'reggio-calabria-mission',
    title: 'Business Mission to Confindustria Reggio Calabria, Italy',
    excerpt: 'Theme: "Trade, Investment and Strategic Partnership Opportunities" — A landmark business mission fostering Nigeria-Italy bilateral trade.',
    image: '/images/news/reggio-calabria.jpg',
    date: 'July 31, 2023',
    category: 'Trade Mission',
    featured: false,
  },
  {
    id: 'trade-promotions-b2b',
    title: 'International Trade Promotions & B2B Exhibition Mission',
    excerpt: 'DIL organized a comprehensive Italy-Nigeria B2B Exhibition Mission focused on internationalization and trade promotion.',
    image: '/images/news/trade-promotions.jpg',
    date: 'April 25, 2023',
    category: 'Trade Promotion',
    featured: false,
  },
  {
    id: 'agricultural-promotion-treviso',
    title: 'Nigeria-Italy Agricultural Promotion Programme at Treviso',
    excerpt: 'Keynote speakers and Nigerian trade delegation at the historic Agricultural Promotion Programme held at the Treviso Chamber of Commerce.',
    image: '/images/news/agricultural-programme.jpg',
    date: 'November 15, 2019',
    category: 'Agriculture',
    featured: false,
  },
  {
    id: 'treviso-province-visit',
    title: 'Nigerian Delegation Visits the President of Treviso Province',
    excerpt: 'A high-level Nigerian delegation led by DIL visited the President of Treviso Province to explore trade and investment opportunities.',
    image: '/images/news/treviso-delegation.jpg',
    date: 'October 2019',
    category: 'Delegation',
    featured: false,
  },
  {
    id: 'trade-meetings-delegations',
    title: 'Trade Meetings & Delegations Programme',
    excerpt: 'DIL organized high-level trade meetings connecting Nigerian producers with Italian industrial partners across multiple cities.',
    image: '/images/news/trade-meetings.jpg',
    date: 'March 2023',
    category: 'Delegation',
    featured: false,
  },
];

export default function NewsEvents() {
  const navigate = useNavigate();
  const featured = articles.filter((a) => a.featured);
  const others = articles.filter((a) => !a.featured);

  return (
    <PublicLayout>
      <section className="bg-[hsl(var(--navy))] py-20">
        <div className="container mx-auto px-4 text-center">
          <Newspaper className="h-12 w-12 text-[hsl(var(--gold))] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Events & News</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">Stay up to date with DIL's latest trade missions, partnerships, and industry developments.</p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <p className="text-[hsl(var(--gold))] font-semibold tracking-wider uppercase text-sm mb-2">Featured</p>
          <h2 className="text-3xl font-bold text-foreground mb-8">Latest Headlines</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {featured.map((article) => (
              <Card key={article.id} className="overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer" onClick={() => navigate(`/news/${article.id}`)}>
                <div className="relative h-64 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))]">{article.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" /> {article.date}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-[hsl(var(--gold))] transition-colors">{article.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{article.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-[hsl(var(--gold))] font-semibold tracking-wider uppercase text-sm mb-2">Archive</p>
          <h2 className="text-2xl font-bold text-foreground mb-6">More News & Reports</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {others.map((article) => (
              <Card key={article.id} className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/news/${article.id}`)}>
                <div className="relative h-48 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-2">{article.date}</p>
                  <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-[hsl(var(--gold))] transition-colors">{article.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">{article.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[hsl(var(--navy))]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Looking for Upcoming Trade Events?</h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">Browse and register for upcoming DIL trade delegations, summits, and matchmaking events.</p>
          <Button size="lg" className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold gap-2" onClick={() => navigate('/events')}>
            View Upcoming Events <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
