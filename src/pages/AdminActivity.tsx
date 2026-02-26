import { AdminLayout } from '@/layouts/AdminLayout';
import { activityLog } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const typeColors: Record<string, string> = {
  business: 'bg-blue-100 text-blue-700',
  match: 'bg-purple-100 text-purple-700',
  event: 'bg-gold/20 text-gold-dark',
  subscription: 'bg-green-100 text-green-700',
};

export default function AdminActivityPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {activityLog.map(entry => (
                <div key={entry.id} className="flex items-start justify-between py-3 border-b last:border-0">
                  <div className="flex items-start gap-3">
                    <Badge className={`${typeColors[entry.type]} capitalize text-xs mt-0.5`}>{entry.type}</Badge>
                    <div>
                      <p className="text-sm">{entry.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">by {entry.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
