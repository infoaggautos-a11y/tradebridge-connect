import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { membershipPlans } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export default function MembershipPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="bg-navy py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Membership Plans</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">Choose the plan that matches your trade ambitions. Start free and scale as your business grows.</p>
        </div>
      </div>
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
    </PublicLayout>
  );
}
