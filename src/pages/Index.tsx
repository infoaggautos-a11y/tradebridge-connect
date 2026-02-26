import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { businesses, events, membershipPlans } from '@/data/mockData';
import { Globe, Users, Handshake, CalendarDays, ArrowRight, CheckCircle, Building2, TrendingUp, Shield } from 'lucide-react';

const stats = [
  { label: 'Registered Businesses', value: '500+', icon: Building2 },
  { label: 'Trade Matches Made', value: '1,200+', icon: Handshake },
  { label: 'Countries Connected', value: '15', icon: Globe },
  { label: 'Events Hosted', value: '24', icon: CalendarDays },
];

const howItWorks = [
  { step: '01', title: 'Register & Verify', description: 'Create your business profile and complete verification for enhanced trust.', icon: Shield },
  { step: '02', title: 'Get Matched', description: 'Our algorithm connects you with compatible trade partners across borders.', icon: Users },
  { step: '03', title: 'Trade & Grow', description: 'Engage through facilitated introductions, events, and deal support.', icon: TrendingUp },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const featuredBusinesses = businesses.filter(b => b.verificationLevel === 'premium').slice(0, 4);
  const upcomingEvents = events.filter(e => !e.isPast).slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light opacity-80" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-gold/20 text-gold border-gold/30 mb-6">Nigeria — Italy Trade Corridor</Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Connecting African Businesses to <span className="text-gold">Global Markets</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
              DIL Global Trade Platform is the premier digital infrastructure for verified trade matchmaking, 
              international delegations, and cross-border commerce facilitation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gold text-navy hover:bg-gold-light font-semibold text-base px-8" onClick={() => navigate('/login')}>
                Join the Platform <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-gray-400 text-gray-300 hover:bg-navy-light hover:text-white" onClick={() => navigate('/directory')}>
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

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three simple steps to connect with verified trade partners worldwide.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-gold" />
                </div>
                <div className="text-sm font-bold text-gold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
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
              <h2 className="text-3xl font-bold text-foreground">Featured Businesses</h2>
              <p className="text-muted-foreground mt-2">Premium verified companies on our platform.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/directory')}>View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBusinesses.map(biz => (
              <Card key={biz.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/directory/${biz.id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="border-gold text-gold text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Premium
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{biz.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{biz.country} · {biz.sectors[0]}</p>
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

      {/* Upcoming Events */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Upcoming Events</h2>
              <p className="text-muted-foreground mt-2">Trade missions, delegations, and conferences.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/events')}>View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/events/${event.id}`)}>
                <CardContent className="p-6">
                  <Badge className="mb-3 bg-gold/10 text-gold border-0">{event.type.replace('-', ' ')}</Badge>
                  <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                  <div className="text-sm text-muted-foreground">
                    <div>📅 {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div>📍 {event.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="py-20 bg-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Trade Globally?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of verified businesses on the DIL Global Trade Platform. Start free and upgrade as you grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gold text-navy hover:bg-gold-light font-semibold" onClick={() => navigate('/membership')}>
              View Membership Plans
            </Button>
            <Button size="lg" variant="outline" className="border-gray-400 text-gray-300 hover:bg-navy-light" onClick={() => navigate('/login')}>
              Create Free Account
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
