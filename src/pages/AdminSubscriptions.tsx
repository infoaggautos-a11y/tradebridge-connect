import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const mockSubs = [
  { business: 'Lagos Agro Exports Ltd', plan: 'Growth', amount: '$149/mo', status: 'Active', since: '2025-08-01' },
  { business: 'Napoli Trade Solutions', plan: 'Starter', amount: '$49/mo', status: 'Active', since: '2025-10-15' },
  { business: 'Roma Pharma International', plan: 'Enterprise', amount: '$499/mo', status: 'Active', since: '2025-06-01' },
  { business: 'Accra Textiles Co.', plan: 'Growth', amount: '$149/mo', status: 'Active', since: '2025-11-20' },
  { business: 'Milano Fashion House', plan: 'Enterprise', amount: '$499/mo', status: 'Active', since: '2025-04-01' },
  { business: 'TechBridge Africa', plan: 'Free', amount: '$0', status: 'Active', since: '2026-01-10' },
  { business: 'Onitsha Trading Company', plan: 'Starter', amount: '$49/mo', status: 'Cancelled', since: '2025-09-01' },
];

export default function AdminSubscriptionsPage() {
  const active = mockSubs.filter(s => s.status === 'Active').length;
  const mrr = mockSubs.reduce((acc, s) => acc + parseInt(s.amount.replace(/[^0-9]/g, '') || '0'), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Subscription Management</h1>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{mockSubs.length}</div><div className="text-xs text-muted-foreground">Total Subscriptions</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{active}</div><div className="text-xs text-muted-foreground">Active</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">${mrr}</div><div className="text-xs text-muted-foreground">Monthly Revenue</div></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubs.map((sub, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{sub.business}</TableCell>
                    <TableCell><Badge variant="outline">{sub.plan}</Badge></TableCell>
                    <TableCell>{sub.amount}</TableCell>
                    <TableCell><Badge className={sub.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{sub.status}</Badge></TableCell>
                    <TableCell>{new Date(sub.since).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
