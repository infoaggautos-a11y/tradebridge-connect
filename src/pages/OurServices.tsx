import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Briefcase, Users, Building2, Ship, BookOpen, BarChart3 } from 'lucide-react';

const services = [
  {
    title: 'International Trade Promotions & Services',
    description: 'We offer comprehensive solutions to businesses seeking to expand their global footprint. Our trade promotion services connect Nigerian enterprises with international markets through strategic partnerships, market access programs, and export facilitation.',
    image: '/images/services/trade-promotions.jpg',
    icon: Globe,
    features: ['Market access facilitation', 'Export documentation support', 'Trade compliance advisory', 'International buyer-seller matching'],
  },
  {
    title: 'Trade & Investment Programme Productions',
    description: 'We offer comprehensive solutions to enhance economic development through strategic trade facilitation and investment promotion. Our programmes bring together investors, entrepreneurs, and policymakers to create sustainable economic partnerships.',
    image: '/images/services/trade-investment.jpg',
    icon: BarChart3,
    features: ['Investment forums & summits', 'Programme design & execution', 'Stakeholder engagement', 'Impact assessment & reporting'],
  },
  {
    title: 'Trade Meetings & Trade Delegations',
    description: 'We specialize in organizing Trade Meetings and Trade Delegations, providing tailored solutions to connect businesses with global opportunities. Our delegations have facilitated partnerships between Nigeria, Italy, and other nations.',
    image: '/images/services/trade-meetings.jpg',
    icon: Users,
    features: ['Delegation planning & logistics', 'B2B matchmaking sessions', 'Government-level introductions', 'Post-delegation follow-up'],
  },
  {
    title: 'Business Development & Multilateral Economic Cooperation',
    description: 'We foster global partnerships and advance economic growth through multilateral cooperation. Our business development services help enterprises scale across borders with strategic advisory and partnership facilitation.',
    image: '/images/services/business-development.jpg',
    icon: Building2,
    features: ['Strategic advisory', 'Multilateral partnership brokering', 'Economic zone facilitation', 'Public-private partnership development'],
  },
  {
    title: 'Connecting Exporters to Verified International Buyers',
    description: 'We connect Nigerian exporters to verified international buyers and importers through our proprietary TradeMatch platform and extensive network of trade partners across Europe, Asia, and the Americas.',
    image: '/images/services/exporters-buyers.jpg',
    icon: Ship,
    features: ['Buyer verification & vetting', 'Trade partner matching', 'Supply chain facilitation', 'Quality assurance support'],
  },
  {
    title: 'Trade Exhibitions, Expos & Conferences',
    description: 'We organize and participate in Trade Exhibitions, Expo Fairs, Conferences, Conventions, Summits, and Forums that bring together industry leaders, entrepreneurs, and policymakers from around the world.',
    image: '/images/services/trade-exhibitions.jpg',
    icon: Briefcase,
    features: ['Exhibition booth coordination', 'Speaker curation', 'Attendee management', 'Media & PR coverage'],
  },
  {
    title: 'Consultancy & Training for SMEs, Women & Youths',
    description: 'We provide targeted consultancy and training services designed to empower SMEs, women entrepreneurs, and youths with the knowledge and skills needed to succeed in international trade.',
    image: '/images/services/training-smes.jpg',
    icon: BookOpen,
    features: ['Export readiness training', 'Women entrepreneurship programs', 'Youth trade mentorship', 'SME capacity building'],
  },
];

export default function OurServices() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-[hsl(var(--navy))] py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[hsl(var(--gold))] font-semibold tracking-wider uppercase text-sm mb-3">Our Business Activities</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Well-Rounded Services for Global Trade</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">From trade promotion to investment facilitation, we provide end-to-end solutions for businesses seeking international growth.</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div key={service.title} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
                <div className="relative group overflow-hidden rounded-2xl aspect-[4/3]" style={{ direction: 'ltr' }}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy))]/40 to-transparent" />
                  <div className="absolute top-4 left-4 p-3 bg-[hsl(var(--gold))]/90 rounded-xl">
                    <service.icon className="h-6 w-6 text-[hsl(var(--navy))]" />
                  </div>
                </div>
                <div style={{ direction: 'ltr' }}>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{service.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))]" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(var(--navy))]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Need a Tailored Solution?</h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">Let us know your specific needs and we'll create a custom strategy for your business growth.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/contact">
              <Button size="lg" className="bg-[hsl(var(--gold))] text-[hsl(var(--navy))] hover:bg-[hsl(var(--gold-light))] font-semibold gap-2">
                Get In Touch <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/directory">
              <Button size="lg" variant="outline" className="border-[hsl(var(--gold))] text-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--navy))]">
                Browse Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
