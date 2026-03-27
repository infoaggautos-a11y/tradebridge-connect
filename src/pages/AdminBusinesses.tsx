import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { businesses } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, XCircle, Eye, Building2, ClipboardList, Loader2, Mail, Phone, MapPin, Globe, RefreshCw } from 'lucide-react';

const verificationColors: Record<string, string> = {
  basic: 'bg-muted text-muted-foreground',
  verified: 'bg-blue-100 text-blue-700',
  premium: 'bg-gold/20 text-gold-dark',
};

type Registration = {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  country: string;
  city: string | null;
  address: string | null;
  website: string | null;
  sector: string | null;
  products_services: string | null;
  export_markets: string | null;
  import_interests: string | null;
  company_size: string | null;
  annual_revenue: string | null;
  registration_number: string | null;
  additional_notes: string | null;
  account_created: boolean | null;
  user_id: string | null;
  created_at: string | null;
};

export default function AdminBusinessesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const { data, error } = await supabase
        .from('business_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingRegs(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filtered = businesses.filter(b => {
    const matchesSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || b.verificationLevel === filter;
    return matchesSearch && matchesFilter;
  });

  const filteredRegs = registrations.filter(r =>
    !regSearch ||
    r.company_name.toLowerCase().includes(regSearch.toLowerCase()) ||
    r.contact_person.toLowerCase().includes(regSearch.toLowerCase()) ||
    r.email.toLowerCase().includes(regSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Business Management</h1>
        </div>

        <Tabs defaultValue="registrations">
          <TabsList>
            <TabsTrigger value="registrations" className="gap-2">
              <ClipboardList className="h-4 w-4" /> Registrations ({registrations.length})
            </TabsTrigger>
            <TabsTrigger value="directory" className="gap-2">
              <Building2 className="h-4 w-4" /> Directory ({businesses.length})
            </TabsTrigger>
          </TabsList>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search registrations..." value={regSearch} onChange={e => setRegSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" onClick={fetchRegistrations} disabled={loadingRegs}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingRegs ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>

            {loadingRegs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRegs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No registrations found. Businesses that register via the public form will appear here.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegs.map(reg => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-medium">{reg.company_name}</TableCell>
                          <TableCell>{reg.contact_person}</TableCell>
                          <TableCell className="text-sm">{reg.email}</TableCell>
                          <TableCell>{reg.country}</TableCell>
                          <TableCell>{reg.sector ? <Badge variant="outline" className="text-xs">{reg.sector}</Badge> : '—'}</TableCell>
                          <TableCell>
                            <Badge className={reg.account_created ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {reg.account_created ? 'Created' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedReg(reg)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Directory Tab */}
          <TabsContent value="directory" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Registration Detail Dialog */}
      <Dialog open={!!selectedReg} onOpenChange={() => setSelectedReg(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedReg && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-accent" />
                  {selectedReg.company_name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={selectedReg.email} />
                <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={selectedReg.phone} />
                <InfoItem label="Contact Person" value={selectedReg.contact_person} />
                <InfoItem icon={<MapPin className="h-4 w-4" />} label="Location" value={[selectedReg.city, selectedReg.country].filter(Boolean).join(', ')} />
                <InfoItem label="Address" value={selectedReg.address} />
                <InfoItem icon={<Globe className="h-4 w-4" />} label="Website" value={selectedReg.website} />
                <InfoItem label="Sector" value={selectedReg.sector} />
                <InfoItem label="Company Size" value={selectedReg.company_size} />
                <InfoItem label="Annual Revenue" value={selectedReg.annual_revenue} />
                <InfoItem label="RC Number" value={selectedReg.registration_number} />
                <div className="md:col-span-2">
                  <InfoItem label="Products & Services" value={selectedReg.products_services} />
                </div>
                <InfoItem label="Export Markets" value={selectedReg.export_markets} />
                <InfoItem label="Import Interests" value={selectedReg.import_interests} />
                <div className="md:col-span-2">
                  <InfoItem label="Additional Notes" value={selectedReg.additional_notes} />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 pt-2 border-t">
                  <Badge className={selectedReg.account_created ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    Account {selectedReg.account_created ? 'Created' : 'Pending'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Registered {selectedReg.created_at ? new Date(selectedReg.created_at).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function InfoItem({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">{icon}{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  );
}
