import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { businesses, SECTORS, COUNTRIES, VerificationLevel } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle, XCircle, Shield, Star } from 'lucide-react';

const verificationColors: Record<string, string> = {
  basic: 'bg-muted text-muted-foreground',
  verified: 'bg-blue-100 text-blue-700',
  premium: 'bg-gold/20 text-gold-dark',
};

export default function AdminBusinessesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = businesses.filter(b => {
    const matchesSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || b.verificationLevel === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Business Management</h1>
          <Badge variant="outline">{businesses.length} total</Badge>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search businesses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Trade Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(biz => (
                  <TableRow key={biz.id}>
                    <TableCell className="font-medium">{biz.name}</TableCell>
                    <TableCell>{biz.country}</TableCell>
                    <TableCell><div className="flex flex-wrap gap-1">{biz.sectors.slice(0, 2).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div></TableCell>
                    <TableCell><Badge className={`${verificationColors[biz.verificationLevel]} capitalize text-xs`}>{biz.verificationLevel}</Badge></TableCell>
                    <TableCell>{biz.tradeReadinessScore}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 text-green-600" onClick={() => toast({ title: 'Approved', description: `${biz.name} has been approved.` })}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-red-600" onClick={() => toast({ title: 'Rejected', description: `${biz.name} has been rejected.` })}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Select onValueChange={(v) => toast({ title: 'Verification Updated', description: `${biz.name} set to ${v}.` })}>
                          <SelectTrigger className="h-7 w-24 text-xs"><SelectValue placeholder="Level" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
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
