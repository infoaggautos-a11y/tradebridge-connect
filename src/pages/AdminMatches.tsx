import { AdminLayout } from '@/layouts/AdminLayout';
import { sampleMatches, getBusinessById } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminMatchesPage() {
  const { toast } = useToast();

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Match Requests</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleMatches.map(m => {
                  const biz = getBusinessById(m.businessId);
                  if (!biz) return null;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{biz.name}</TableCell>
                      <TableCell><Badge className="bg-gold/20 text-gold-dark">{m.matchScore}%</Badge></TableCell>
                      <TableCell>{biz.sectors[0]}</TableCell>
                      <TableCell>{biz.country}</TableCell>
                      <TableCell><Badge className={`${statusColors[m.status]} capitalize text-xs`}>{m.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-green-600" onClick={() => toast({ title: 'Approved', description: 'Match introduction approved.' })}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-red-600" onClick={() => toast({ title: 'Declined', description: 'Match request declined.' })}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
