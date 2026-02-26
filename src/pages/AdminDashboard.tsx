import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { businesses, events, sampleMatches, activityLog } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, CheckCircle, Users, Handshake, CalendarDays, CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const kpis = [
  { label: 'Total Businesses', value: businesses.length, icon: Building2, color: 'text-blue-500' },
  { label: 'Verified Businesses', value: businesses.filter(b => b.verificationLevel !== 'basic').length, icon: CheckCircle, color: 'text-green-500' },
  { label: 'Active Matches', value: sampleMatches.length, icon: Users, color: 'text-purple-500' },
  { label: 'Pending Requests', value: sampleMatches.filter(m => m.status === 'pending').length, icon: Handshake, color: 'text-orange-500' },
  { label: 'Event Revenue', value: '$45,200', icon: CalendarDays, color: 'text-gold' },
  { label: 'Subscription Revenue', value: '$12,800', icon: CreditCard, color: 'text-emerald-500' },
];

const growthData = [
  { month: 'Sep', businesses: 8 }, { month: 'Oct', businesses: 10 }, { month: 'Nov', businesses: 11 },
  { month: 'Dec', businesses: 12 }, { month: 'Jan', businesses: 14 }, { month: 'Feb', businesses: 15 },
];

const sectorData = [
  { name: 'Agriculture', value: 4 }, { name: 'Manufacturing', value: 3 }, { name: 'Textiles', value: 3 },
  { name: 'Technology', value: 1 }, { name: 'Oil & Gas', value: 1 }, { name: 'Other', value: 3 },
];
const COLORS = ['#c5a55a', '#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#6b7280'];

const revenueData = [
  { month: 'Sep', events: 8000, subs: 5200 }, { month: 'Oct', events: 12000, subs: 6800 },
  { month: 'Nov', events: 6000, subs: 8400 }, { month: 'Dec', events: 15000, subs: 9200 },
  { month: 'Jan', events: 10000, subs: 11000 }, { month: 'Feb', events: 45200, subs: 12800 },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Revenue Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="events" fill="#c5a55a" name="Events" />
                  <Bar dataKey="subs" fill="#2563eb" name="Subscriptions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

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
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Business Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="businesses" stroke="#c5a55a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityLog.slice(0, 8).map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs capitalize">{entry.type}</Badge>
                    <span className="text-sm">{entry.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
