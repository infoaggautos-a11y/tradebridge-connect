import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { membershipPlans } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Shield, Users, TrendingUp, Award } from 'lucide-react';

import matchmakingImage from '@/assets/matchmaking-session.jpg';

const benefits = [
  { icon: Shield, title: 'Verified Trust', description: 'Three-tier verification ensures every business on the platform is legitimate and trade-ready.' },
  { icon: Users, title: 'Curated Introductions', description: 'DIL facilitates warm introductions — no cold outreach. Both parties accept before contact info is shared.' },
  { icon: TrendingUp, title: 'Trade Intelligence', description: 'Access market data, sector opportunity maps, and trade analytics to make informed decisions.' },
  { icon: Award, title: 'Event Priority', description: 'Premium access to trade missions, delegations, conferences, and B2B matchmaking sessions.' },
];

export default function MembershipPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img src={matchmakingImage} alt="Trade partnership" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/90" />
        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <Badge className="bg-gold/20 text-gold border-gold/30 mb-4">Membership</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Trade Membership</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Choose the plan that matches your trade ambitions. Start free and scale as your business grows into new markets.</p>
        </div>
      </div>

      {/* Pricing */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {membershipPlans.map(plan => (
            <Card key={plan.tier} className={`relative ${plan.highlighted ? 'border-gold shadow-lg ring-2 ring-gold/20' : ''}`}>
              {plan.highlighted && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy">Most Popular</Badge>}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price === 0 ? 'Free' : `$${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.highlighted ? 'bg-gold text-navy hover:bg-gold-light' : ''}`} variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => navigate('/login')}>
                  {plan.price === 0 ? 'Get Started' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Join the Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Beyond matchmaking — a complete trade infrastructure designed for serious businesses.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <b.icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Trading?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">Create your free account today and explore the platform. Upgrade anytime as your trade needs grow.</p>
          <Button size="lg" className="bg-gold text-navy hover:bg-gold-light font-semibold" onClick={() => navigate('/login')}>
            Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
