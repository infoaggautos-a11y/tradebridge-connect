import { useState, useEffect } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, CalendarDays, CreditCard, ArrowRight, Wallet, Loader2 } from 'lucide-react';

export default function MemberDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      setLoading(true);
      const [walletRes, matchRes] = await Promise.all([
        supabase.from('wallets').select('available_balance, balance, pending_balance').eq('user_id', user.id).single(),
        supabase.from('match_requests').select('id', { count: 'exact' }).eq('requester_id', user.id),
      ]);
      if (walletRes.data) setWalletBalance(walletRes.data.available_balance ?? 0);
      if (matchRes.count !== null) setMatchCount(matchRes.count);
      setLoading(false);
    };
    fetchData();
  }, [user?.id]);

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(a => (
            <Card key={a.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(a.href)}>
              <CardContent className="p-4 flex items-center gap-3">
                <a.icon className="h-5 w-5 text-[hsl(var(--gold))]" />
                <span className="text-sm font-medium">{a.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Subscription</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/subscription')}>Manage <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{user?.membershipTier} Plan</div>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.subscribed ? `Active until ${new Date(user.subscriptionEnd || '').toLocaleDateString()}` : 'Free tier'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Wallet Balance</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/wallet')}>View <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">${(walletBalance ?? 0).toLocaleString()}</div>
              )}
              <p className="text-sm text-muted-foreground mt-1">Available balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Match Requests</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/matches')}>View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{matchCount}</div>
              )}
              <p className="text-sm text-muted-foreground mt-1">Introduction requests sent</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Start Guide</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary">
                <h4 className="font-medium mb-1">1. Complete Your Profile</h4>
                <p className="text-sm text-muted-foreground">Add business details to improve match accuracy.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/profile')}>Go to Profile</Button>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <h4 className="font-medium mb-1">2. Get Verified</h4>
                <p className="text-sm text-muted-foreground">Upload documents for KYC verification.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/verification')}>Start KYC</Button>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <h4 className="font-medium mb-1">3. Find Trade Partners</h4>
                <p className="text-sm text-muted-foreground">Use TradeMatch to discover compatible businesses.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/matches')}>Find Matches</Button>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <h4 className="font-medium mb-1">4. Upgrade Plan</h4>
                <p className="text-sm text-muted-foreground">Unlock AI Advisor, Deal Room, and more.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/subscription')}>View Plans</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MemberLayout>
  );
}
