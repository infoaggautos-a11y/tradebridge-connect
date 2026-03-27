import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle, Users, Handshake, CreditCard, Presentation, Loader2, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#c5a55a', '#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#6b7280'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalRegistrations: 0,
    pendingMatches: 0,
    totalMatches: 0,
    activeSubscriptions: 0,
    totalPayments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [regRes, matchRes, subRes, payRes, actRes] = await Promise.all([
        supabase.from('business_registrations').select('id, sector', { count: 'exact' }),
        supabase.from('match_requests').select('id, status', { count: 'exact' }),
        supabase.from('subscriptions').select('id, status', { count: 'exact' }).neq('plan_id', 'free'),
        supabase.from('payments').select('id, amount', { count: 'exact' }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const regs = regRes.data || [];
      const matches = matchRes.data || [];
      const subs = subRes.data || [];

      // Build sector data
      const sectorMap: Record<string, number> = {};
      regs.forEach((r: any) => {
        const s = r.sector || 'Other';
        sectorMap[s] = (sectorMap[s] || 0) + 1;
      });
      setSectorData(Object.entries(sectorMap).map(([name, value]) => ({ name, value })));

      setStats({
        totalBusinesses: regs.length,
        totalRegistrations: regRes.count || 0,
        pendingMatches: matches.filter((m: any) => m.status === 'pending').length,
        totalMatches: matches.length,
        activeSubscriptions: subs.filter((s: any) => s.status === 'active').length,
        totalPayments: payRes.count || 0,
      });

      setRecentActivity(actRes.data || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const kpis = [
    { label: 'Registered Businesses', value: stats.totalBusinesses, icon: Building2, color: 'text-blue-500' },
    { label: 'Total Match Requests', value: stats.totalMatches, icon: Users, color: 'text-purple-500' },
    { label: 'Pending Matches', value: stats.pendingMatches, icon: Handshake, color: 'text-orange-500' },
    { label: 'Paid Subscriptions', value: stats.activeSubscriptions, icon: CreditCard, color: 'text-emerald-500' },
    { label: 'Total Payments', value: stats.totalPayments, icon: DollarSign, color: 'text-[hsl(var(--gold))]' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => window.open('/presentation.html', '_blank')}>
            <Presentation className="h-4 w-4 mr-2" />View Presentation
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {kpis.map(kpi => (
                <Card key={kpi.label}>
                  <CardContent className="p-4">
                    <kpi.icon className={`h-5 w-5 ${kpi.color} mb-2`} />
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <div className="text-xs text-muted-foreground">{kpi.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {sectorData.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Businesses by Sector</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={sectorData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name }) => name}>
                          {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent activity logged yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.map((entry: any) => (
                        <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs capitalize">{entry.type}</Badge>
                            <span className="text-sm">{entry.action}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
