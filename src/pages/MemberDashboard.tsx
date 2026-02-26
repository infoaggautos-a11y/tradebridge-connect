import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessById, sampleMatches, events, businesses } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, CalendarDays, CreditCard, ArrowRight } from 'lucide-react';

export default function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const business = user?.businessId ? getBusinessById(user.businessId) : null;
  const myMatches = sampleMatches.slice(0, 3);
  const myEvents = events.filter(e => user?.registeredEvents.includes(e.id));

  const quickActions = [
    { label: 'Browse Directory', icon: Building2, href: '/directory' },
    { label: 'Find Matches', icon: Users, href: '/matches' },
    { label: 'View Events', icon: CalendarDays, href: '/events' },
    { label: 'Manage Subscription', icon: CreditCard, href: '/subscription' },
  ];

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Your trade dashboard overview.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(a => (
            <Card key={a.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(a.href)}>
              <CardContent className="p-4 flex items-center gap-3">
                <a.icon className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium">{a.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Profile Overview</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>Edit <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              {business ? (
                <div className="space-y-4">
                  <div><div className="font-semibold">{business.name}</div><div className="text-sm text-muted-foreground">{business.country} · {business.sectors.join(', ')}</div></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Profile Completeness</span><span>{business.profileCompleteness}%</span></div><Progress value={business.profileCompleteness} className="h-2" /></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>Trade Readiness</span><span>{business.tradeReadinessScore}%</span></div><Progress value={business.tradeReadinessScore} className="h-2" /></div>
                  <Badge className="capitalize bg-gold/20 text-gold-dark">{business.verificationLevel} Verified</Badge>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Complete your business profile to unlock matching.</p>
              )}
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Subscription</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/subscription')}>Manage <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user?.membershipTier} Plan</div>
              <p className="text-sm text-muted-foreground mt-1">Match views used: {user?.matchViewsUsed || 0}{user?.membershipTier === 'free' ? ' / 3' : ' (unlimited)'}</p>
            </CardContent>
          </Card>

          {/* My Matches */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Matches</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/matches')}>View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myMatches.map(m => {
                  const biz = getBusinessById(m.businessId);
                  return biz ? (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                      <div><div className="font-medium text-sm">{biz.name}</div><div className="text-xs text-muted-foreground">{biz.country}</div></div>
                      <Badge className="bg-gold/20 text-gold-dark">{m.matchScore}%</Badge>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>

          {/* My Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">My Events</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>Browse <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              {myEvents.length > 0 ? (
                <div className="space-y-3">
                  {myEvents.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                      <div><div className="font-medium text-sm">{e.title}</div><div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</div></div>
                      <Badge variant="outline">Registered</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No registered events yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MemberLayout>
  );
}
