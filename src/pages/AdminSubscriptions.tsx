import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

interface SubRow {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: string | null;
  created_at: string | null;
  current_period_end: string | null;
  profiles?: { name: string | null; email: string } | null;
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('subscriptions')
      .select('*, profiles(name, email)')
      .order('created_at', { ascending: false });
    setSubs((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const active = subs.filter(s => s.status === 'active' && s.plan_id !== 'free').length;
  const paid = subs.filter(s => s.plan_id !== 'free').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Subscription Management</h1>
          <Button variant="outline" size="sm" onClick={fetchSubs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{subs.length}</div><div className="text-xs text-muted-foreground">Total Users</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{active}</div><div className="text-xs text-muted-foreground">Active Paid</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{paid}</div><div className="text-xs text-muted-foreground">Total Paid</div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period End</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{(sub as any).profiles?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{(sub as any).profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{sub.plan_name}</Badge></TableCell>
                      <TableCell>
                        <Badge className={sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-sm">{sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
