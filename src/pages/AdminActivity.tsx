import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

const typeColors: Record<string, string> = {
  business: 'bg-blue-100 text-blue-700',
  match: 'bg-purple-100 text-purple-700',
  event: 'bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))]',
  subscription: 'bg-green-100 text-green-700',
  auth: 'bg-orange-100 text-orange-700',
  general: 'bg-gray-100 text-gray-700',
};

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setActivities(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchActivities(); }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <Button variant="outline" size="sm" onClick={fetchActivities} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No activity recorded yet. Activity will appear as users interact with the platform.</p>
            ) : (
              <div className="space-y-4">
                {activities.map(entry => (
                  <div key={entry.id} className="flex items-start justify-between py-3 border-b last:border-0">
                    <div className="flex items-start gap-3">
                      <Badge className={`${typeColors[entry.type] || typeColors.general} capitalize text-xs mt-0.5`}>{entry.type}</Badge>
                      <div>
                        <p className="text-sm">{entry.action}</p>
                        {entry.user_email && <p className="text-xs text-muted-foreground mt-1">by {entry.user_email}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
