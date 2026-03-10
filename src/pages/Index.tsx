import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { businesses, events } from '@/data/mockData';
import {
  Globe, Users, Handshake, CalendarDays, ArrowRight, CheckCircle,
  Building2, TrendingUp, Shield, Briefcase, Ship, Award, Landmark,
  Quote, MapPin, Clock, ChevronRight
} from 'lucide-react';

import heroImage from '@/assets/hero-trade-summit.jpg';
import agricultureImage from '@/assets/agriculture-trade.jpg';
import eventConferenceImage from '@/assets/event-conference.jpg';
import textilesImage from '@/assets/textiles-fashion.jpg';
import logisticsImage from '@/assets/logistics-port.jpg';
import delegationImage from '@/assets/delegation-group.jpg';
import matchmakingImage from '@/assets/matchmaking-session.jpg';

const stats = [
  { label: 'Registered Businesses', value: '500+', icon: Building2 },
  { label: 'Trade Matches Made', value: '1,200+', icon: Handshake },
  { label: 'Countries Connected', value: '15', icon: Globe },
  { label: 'Events Hosted', value: '24', icon: CalendarDays },
];

const services = [
  {
    title: 'International Trade Promotions',
    description: 'Comprehensive solutions to businesses seeking to expand their global footprint through structured trade facilitation and market access programs.',
    image: agricultureImage,
    icon: Ship,
  },
  {
    title: 'Trade Meetings & Delegations',
    description: 'Organizing curated trade meetings and delegations connecting Nigerian producers with international buyers for direct sourcing partnerships.',
    image: delegationImage,
    icon: Users,
  },
  {
    title: 'Business Matchmaking',
    description: 'AI-powered matchmaking engine connecting Nigerian exporters with international buyers based on sector alignment, capacity, and verified intent.',
    image: matchmakingImage,
    icon: Handshake,
  },
  {
    title: 'Multilateral Economic Cooperation',
    description: 'Fostering global partnerships and economic growth through business development, multilateral economic exchange, and strategic cooperation frameworks.',
    image: logisticsImage,
    icon: Landmark,
  },
];

const howItWorks = [
  { step: '01', title: 'Register & Verify', description: 'Create your business profile, upload CAC documents, select sectors and target markets. DIL team verifies within 48 hours.', icon: Shield },
  { step: '02', title: 'Build Trade Profile', description: 'Add products/services, certifications, export history, minimum order quantities, and preferred deal types.', icon: Briefcase },
  { step: '03', title: 'Get Matched', description: 'Our algorithm computes compatibility scores across sector fit, geographic reach, capacity alignment, and verified intent.', icon: Users },
  { step: '04', title: 'Trade & Grow', description: 'Receive curated introductions. Both parties accept before contact info is shared. Quality over volume.', icon: TrendingUp },
];

const testimonials = [
  {
    quote: "DIL's trade platform connected us with three major Italian buyers within our first month. The verification process gave our partners confidence in doing business with us.",
    name: 'Chief Ade Ogunleye',
    role: 'CEO, Lagos Agro Exports Ltd',
    country: 'Nigeria',
  },
  {
    quote: "The trade delegation to Treviso organized by DIL was professionally managed from start to finish. We signed two MOUs and are now exporting to three new markets.",
    name: 'Kwame Asante',
    role: 'Director, Accra Textiles Co.',
    country: 'Ghana',
  },
  {
    quote: "As an Italian manufacturer looking to source from West Africa, DIL's platform provided exactly the verified, trade-ready businesses we needed.",
    name: 'Marco Bianchi',
    role: 'President, Italy-Africa Business Council',
    country: 'Italy',
  },
];

const newsItems = [
  {
    title: 'DIL CEO Drives Historic Nigeria-Italy Economic Pact in Attigliano',
    excerpt: 'The Comune di Attigliano signed a Declaration of Intent with the Associazione "Italian Nigerian Business", solidifying international cooperation commitments.',
    date: 'December 1, 2025',
    image: '/images/news/attigliano-pact.jpg',
    slug: 'attigliano-pact',
  },
  {
    title: 'Nigeria and Italy Strengthen Ties in Innovation, Science & Technology',
    excerpt: 'The Honourable Minister of Innovation, Science, and Technology, Chief Uche Nnaji, met with His Excellency, Lacopo Foti, the Acting Ambassador of Italy to Nigeria.',
    date: 'March 16, 2025',
    image: '/images/news/business-development.jpg',
    slug: 'innovation-science-technology',
  },
  {
    title: 'Business Mission to Confindustria Reggio Calabria, Italy',
    excerpt: 'Theme: "Trade, Investment and Strategic Partnership Opportunities" — A landmark business mission fostering Nigeria-Italy bilateral trade.',
    date: 'July 31, 2023',
    image: '/images/news/reggio-calabria.jpg',
    slug: 'reggio-calabria-mission',
  },
];

const partners = [
  'Nigerian Export Promotion Council',
  'Confindustria',
  'Treviso Chamber of Commerce',
  'African Development Bank',
  'ECOWAS Commission',
  'Italian Embassy, Abuja',
  'Ghana Chamber of Commerce',
  'EU Commission',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const featuredBusinesses = businesses.filter(b => b.verificationLevel === 'premium').slice(0, 4);
  const upcomingEvents = events.filter(e => !e.isPast).slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <img src={heroImage} alt="Nigeria-Italy Trade Summit delegates" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/40" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-gold/20 text-gold border-gold/30 mb-6 text-sm">Nigeria — Italy Trade Corridor</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Connecting African Businesses to <span className="text-gold">Global Markets</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-4 leading-relaxed max-w-2xl">
              DIL Global Trade Platform is the premier digital infrastructure for verified trade matchmaking, 
              international delegations, and cross-border commerce facilitation.
            </p>
            <p className="text-base text-gray-400 mb-8 max-w-xl">
              Powered by Dauno Integrated Ltd — a transnational company incorporated in Abuja, Nigeria, 
              with a special focus on Business Re-engineering and Trade Promotion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gold text-navy hover:bg-gold-light font-semibold text-base px-8" onClick={() => navigate('/login')}>
                Join the Platform <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-gray-400 text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => navigate('/directory')}>
                Explore Directory
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy-dark py-12 border-t border-navy-light">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-gold mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About DIL */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-gold/10 text-gold border-gold/20 mb-4">About Dauno Integrated Ltd</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Building Bridges Between <span className="text-gold">Africa & Europe</span>
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Dauno Integrated Ltd (DIL) is a transnational company incorporated in Abuja, Nigeria (RC: 1963419), 
                with special focus on Business Re-engineering. Our forte and capability are in Business and Trade Promotion 
                across the Nigeria–Italy trade corridor and beyond.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                DIL provides relevant trade support and consistent business services for its growing clientele both 
                in Nigeria and abroad. We connect our clients with the best quality products and opportunities the 
                market has to offer through a well-detailed and curated customer delivery service.
              </p>
              <blockquote className="border-l-4 border-gold pl-4 italic text-muted-foreground mb-6">
                "We connect our clients with the best quality products that the market has to offer and we strive 
                to make sure that they are satisfied through a well-detailed and curated customer delivery service."
              </blockquote>
              <div className="flex gap-4">
                <Button className="bg-gold text-navy hover:bg-gold-light" onClick={() => navigate('/directory')}>
                  Explore Directory <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => window.open('https://www.daunointegrated.com/about-us/', '_blank')}>
                  Learn More About DIL
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={delegationImage} alt="Nigerian delegation visit" className="rounded-lg shadow-lg w-full h-48 object-cover" />
              <img src={eventConferenceImage} alt="Trade conference" className="rounded-lg shadow-lg w-full h-48 object-cover mt-8" />
              <img src={agricultureImage} alt="Agricultural exports" className="rounded-lg shadow-lg w-full h-48 object-cover" />
              <img src={textilesImage} alt="African textiles" className="rounded-lg shadow-lg w-full h-48 object-cover mt-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-gold/10 text-gold border-gold/20 mb-4">Our Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Comprehensive Trade Solutions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer well-rounded services to support businesses seeking to expand into international markets.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-52 overflow-hidden">
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                      <service.icon className="h-5 w-5 text-navy" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-gold/10 text-gold border-gold/20 mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Your Path to Global Trade</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Four simple steps to connect with verified trade partners worldwide.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="text-center relative">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gold/30" />
                )}
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <item.icon className="h-8 w-8 text-gold" />
                </div>
                <div className="text-sm font-bold text-gold mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <Badge className="bg-gold/10 text-gold border-gold/20 mb-2">Directory</Badge>
              <h2 className="text-3xl font-bold text-foreground">Featured Businesses</h2>
              <p className="text-muted-foreground mt-2">Premium verified companies on our platform.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/directory')}>View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBusinesses.map(biz => (
              <Card key={biz.id} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/directory/${biz.id}`)}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                    <Building2 className="h-6 w-6 text-gold" />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="border-gold text-gold text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Premium
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{biz.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{biz.country} · {biz.sectors[0]}</p>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{biz.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gold">{biz.tradeReadinessScore}%</div>
                    <div className="text-xs text-muted-foreground">Trade Ready</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events with images */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <Badge className="bg-gold/10 text-gold border-gold/20 mb-2">Events</Badge>
              <h2 className="text-3xl font-bold text-foreground">Upcoming Events & Delegations</h2>
              <p className="text-muted-foreground mt-2">Trade missions, conferences, workshops, and delegation programs.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/events')}>View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, i) => {
              const eventImages = [heroImage, eventConferenceImage, delegationImage];
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/events/${event.id}`)}>
                  <div className="relative h-48 overflow-hidden">
                    <img src={event.imageUrl || eventImages[i]} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-gold text-navy border-0 capitalize">{event.type.replace('-', ' ')}</Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{event.location}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="bg-gold/20 text-gold border-gold/30 mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Partners Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-navy-light border-navy-light">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-gold/40 mb-4" />
                  <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.role}</div>
                    <div className="text-xs text-gold mt-1">{t.country}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News from DIL */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <Badge className="bg-gold/10 text-gold border-gold/20 mb-2">News & Updates</Badge>
              <h2 className="text-3xl font-bold text-foreground">Latest from DIL</h2>
              <p className="text-muted-foreground mt-2">Trade news, events coverage, and partnership announcements.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/news')}>
              View All News <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {newsItems.map((news, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/news/${news.slug}`)}>
                <div className="relative h-48 overflow-hidden">
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" /> {news.date}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-gold transition-colors">{news.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{news.excerpt}</p>
                  <div className="flex items-center gap-1 text-gold text-sm mt-3 font-medium">
                    Read More <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="bg-gold/10 text-gold border-gold/20 mb-4">Our Network</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Trusted Partners & Institutions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map((partner, i) => (
              <div key={i} className="bg-background rounded-lg p-6 text-center border border-border hover:border-gold/30 transition-colors">
                <Landmark className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="py-20 relative overflow-hidden">
        <img src={logisticsImage} alt="Global trade logistics" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/90" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="bg-gold/20 text-gold border-gold/30 mb-6">Get Started Today</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Trade Globally?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of verified businesses on the DIL Global Trade Platform. Start free and upgrade as you grow. 
            Access verified matchmaking, international events, and dedicated trade support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gold text-navy hover:bg-gold-light font-semibold" onClick={() => navigate('/membership')}>
              View Membership Plans
            </Button>
            <Button size="lg" variant="outline" className="border-gray-400 text-gray-300 hover:bg-white/10" onClick={() => navigate('/login')}>
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
