import { useState } from 'react';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const featureRows = [
    { label: 'Directory Profile', free: 'Yes', starter: 'Yes', growth: 'Yes', enterprise: 'Yes' },
    { label: 'Match Views/Month', free: '3', starter: 'Unlimited', growth: 'Unlimited', enterprise: 'Unlimited' },
    { label: 'Deal Room', free: 'No', starter: 'Yes', growth: 'Yes', enterprise: 'Yes' },
    { label: 'Escrow Transactions', free: 'No', starter: '2/mo', growth: 'Unlimited', enterprise: 'Unlimited' },
    { label: 'Commission Rate', free: '5%', starter: '4%', growth: '3%', enterprise: '2%' },
    { label: 'AI Trade Advisor', free: 'No', starter: 'No', growth: 'Yes', enterprise: 'Yes' },
    { label: 'Trade Intelligence', free: 'No', starter: 'Basic', growth: 'Full', enterprise: 'Custom' },
    { label: 'Event Discount', free: 'No', starter: '10%', growth: '25%', enterprise: 'Free access' },
    { label: 'Support', free: 'Email', starter: 'Email', growth: 'Priority', enterprise: 'Dedicated' },
    { label: 'API Access', free: 'No', starter: 'No', growth: 'No', enterprise: 'Yes' },
    { label: 'Account Manager', free: 'No', starter: 'No', growth: 'No', enterprise: 'Yes' },
  ];

  const getDisplayPrice = (tier: string, monthlyPrice: number, annualMonthlyPrice: number) => {
    if (tier === 'free') return 'Free';
    if (tier === 'enterprise') return 'Custom';
    return billingCycle === 'annual' ? `$${annualMonthlyPrice}` : `$${monthlyPrice}`;
  };

  const getPeriodLabel = (tier: string) => {
    if (tier === 'free') return 'forever';
    if (tier === 'enterprise') return 'pricing';
    return '/month';
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img src={matchmakingImage} alt="Trade partnership" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/90" />
        <div className="container mx-auto px-4 py-16 relative z-10 text-center">
          <Badge className="bg-gold/20 text-gold border-gold/30 mb-4">Membership</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Trade Membership</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Low entry pricing plus deal-based commissions. Start free, close deals, and scale only when it makes sense.</p>
        </div>
      </div>

      {/* Pricing */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-border bg-background p-1">
            <button
              type="button"
              className={`px-4 py-2 text-sm rounded-md transition ${billingCycle === 'monthly' ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground'}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm rounded-md transition ${billingCycle === 'annual' ? 'bg-gold text-navy font-semibold' : 'text-muted-foreground'}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual - Save 20%
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {membershipPlans.map(plan => (
            <Card key={plan.tier} className={`relative ${plan.highlighted ? 'border-gold shadow-lg ring-2 ring-gold/20' : ''}`}>
              {plan.highlighted && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy">Most Popular</Badge>}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{getDisplayPrice(plan.tier, plan.monthlyPrice, plan.annualMonthlyPrice)}</span>
                  <span className="text-muted-foreground text-sm"> {getPeriodLabel(plan.tier)}</span>
                </div>
                {plan.tier !== 'free' && plan.tier !== 'enterprise' && billingCycle === 'annual' && (
                  <p className="text-xs text-muted-foreground mt-1">Billed as ${plan.annualPrice}/year - cancel anytime</p>
                )}
                {plan.tier !== 'free' && plan.tier !== 'enterprise' && plan.ngnMonthlyPrice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    NGN: {billingCycle === 'annual' ? `N${plan.ngnAnnualPrice?.toLocaleString()}/year` : `N${plan.ngnMonthlyPrice.toLocaleString()}/month`}
                  </p>
                )}
                {plan.trialAvailable && <p className="text-xs text-green-600 font-medium mt-1">14-day free trial. No credit card required.</p>}
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
                <Button
                  className={`w-full ${plan.highlighted ? 'bg-gold text-navy hover:bg-gold-light' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => navigate(plan.tier === 'enterprise' ? '/contact-us' : '/login')}
                >
                  {plan.tier === 'free' && 'Get Started'}
                  {(plan.tier === 'starter' || plan.tier === 'growth') && 'Start 14-Day Free Trial'}
                  {plan.tier === 'enterprise' && 'Contact Sales'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-5xl mx-auto mt-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">We only earn when you earn.</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Plan</th>
                      <th className="text-left p-3">Commission on Deals</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b"><td className="p-3">Explorer</td><td className="p-3 font-semibold">5%</td></tr>
                    <tr className="border-b"><td className="p-3">Pro</td><td className="p-3 font-semibold">4%</td></tr>
                    <tr className="border-b"><td className="p-3">Business</td><td className="p-3 font-semibold">3%</td></tr>
                    <tr><td className="p-3">Enterprise</td><td className="p-3 font-semibold">2%</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Feature Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Feature</th>
                    <th className="text-left p-3">Explorer</th>
                    <th className="text-left p-3">Pro</th>
                    <th className="text-left p-3">Business</th>
                    <th className="text-left p-3">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {featureRows.map((row) => (
                    <tr key={row.label} className="border-b last:border-b-0">
                      <td className="p-3 font-medium">{row.label}</td>
                      <td className="p-3">{row.free}</td>
                      <td className="p-3">{row.starter}</td>
                      <td className="p-3">{row.growth}</td>
                      <td className="p-3">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
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
