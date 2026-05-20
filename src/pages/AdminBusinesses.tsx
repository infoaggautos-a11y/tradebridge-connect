import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { businesses as initialBusinesses, SECTORS, COUNTRIES } from '@/data/mockData';
import type { Business } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle, XCircle, Eye, Building2, ClipboardList, Loader2, Mail, Phone, MapPin, Globe, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';

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

const emptyBusiness = (): Partial<Business> => ({
  id: '', name: '', country: 'Nigeria', sectors: [], products: [],
  exportCapacity: '', certifications: [], minOrderQty: '',
  preferredMarkets: [], verificationLevel: 'basic', tradeReadinessScore: 50,
  profileCompleteness: 50, description: '', yearEstablished: 2024,
  employees: '', contactEmail: '', website: '',
});

export default function AdminBusinessesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const [showBizDialog, setShowBizDialog] = useState(false);
  const [editingBiz, setEditingBiz] = useState<Partial<Business> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => { fetchRegistrations(); }, []);

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

  const openAddDialog = () => {
    setEditingBiz({ ...emptyBusiness(), id: `b${Date.now()}` });
    setShowBizDialog(true);
  };

  const openEditDialog = (biz: Business) => {
    setEditingBiz({ ...biz });
    setShowBizDialog(true);
  };

  const handleSaveBusiness = () => {
    if (!editingBiz) return;
    if (!editingBiz.name?.trim()) {
      toast({ title: 'Name required', description: 'Business name cannot be empty.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const isNew = !businesses.find(b => b.id === editingBiz.id);
    if (isNew) {
      const completeBiz: Business = {
        id: editingBiz.id || `b${Date.now()}`,
        name: editingBiz.name || '',
        country: editingBiz.country || 'Nigeria',
        sectors: editingBiz.sectors || [],
        products: editingBiz.products || [],
        exportCapacity: editingBiz.exportCapacity || '',
        certifications: editingBiz.certifications || [],
        minOrderQty: editingBiz.minOrderQty || '',
        preferredMarkets: editingBiz.preferredMarkets || [],
        verificationLevel: (editingBiz.verificationLevel as any) || 'basic',
        tradeReadinessScore: editingBiz.tradeReadinessScore || 50,
        profileCompleteness: editingBiz.profileCompleteness || 50,
        description: editingBiz.description || '',
        yearEstablished: editingBiz.yearEstablished || 2024,
        employees: editingBiz.employees || '',
        contactEmail: editingBiz.contactEmail || '',
        website: editingBiz.website,
      };
      setBusinesses(prev => [completeBiz, ...prev]);
      toast({ title: 'Business Added', description: `${completeBiz.name} added to directory.` });
    } else {
      setBusinesses(prev => prev.map(b => b.id === editingBiz.id ? { ...b, ...editingBiz } as Business : b));
      toast({ title: 'Business Updated', description: `${editingBiz.name} updated.` });
    }
    setShowBizDialog(false);
    setEditingBiz(null);
    setSaving(false);
  };

  const handleDeleteBusiness = (id: string) => {
    const biz = businesses.find(b => b.id === id);
    setBusinesses(prev => prev.filter(b => b.id !== id));
    setConfirmDelete(null);
    toast({ title: 'Business Removed', description: `${biz?.name || 'Business'} removed from directory.` });
  };

  const handleVerificationChange = (bizId: string, level: string) => {
    setBusinesses(prev => prev.map(b => b.id === bizId ? { ...b, verificationLevel: level as any } : b));
    const biz = businesses.find(b => b.id === bizId);
    toast({ title: 'Verification Updated', description: `${biz?.name} set to ${level}.` });
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(s => s !== item) : [...arr, item];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Business Management</h1>
        </div>

        <Tabs defaultValue="directory">
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
              <Card><CardContent className="py-12 text-center text-muted-foreground">
                No registrations found. Businesses that register via the public form will appear here.
              </CardContent></Card>
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
              <Button className="bg-gold text-navy hover:bg-gold-light" onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" /> Add Business
              </Button>
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
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(biz => (
                      <TableRow key={biz.id}>
                        <TableCell className="font-medium">{biz.name}</TableCell>
                        <TableCell>{biz.country}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {biz.sectors.slice(0, 2).map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={biz.verificationLevel} onValueChange={(v) => handleVerificationChange(biz.id, v)}>
                            <SelectTrigger className={`h-7 w-24 text-xs ${verificationColors[biz.verificationLevel]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{biz.tradeReadinessScore}%</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => openEditDialog(biz)}>
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => setConfirmDelete(biz.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
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

      {/* Add/Edit Business Dialog */}
      <Dialog open={showBizDialog} onOpenChange={(open) => { if (!open) { setShowBizDialog(false); setEditingBiz(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{businesses.find(b => b.id === editingBiz?.id) ? 'Edit Business' : 'Add Business'}</DialogTitle>
          </DialogHeader>
          {editingBiz && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="md:col-span-2">
                <Label>Business Name</Label>
                <Input value={editingBiz.name || ''} onChange={e => setEditingBiz({ ...editingBiz, name: e.target.value })} />
              </div>
              <div>
                <Label>Country</Label>
                <Select value={editingBiz.country} onValueChange={v => setEditingBiz({ ...editingBiz, country: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Verification Level</Label>
                <Select value={editingBiz.verificationLevel} onValueChange={v => setEditingBiz({ ...editingBiz, verificationLevel: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Sectors</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SECTORS.map(s => (
                    <Badge
                      key={s}
                      variant={editingBiz.sectors?.includes(s) ? 'default' : 'outline'}
                      className={`cursor-pointer ${editingBiz.sectors?.includes(s) ? 'bg-gold text-navy' : ''}`}
                      onClick={() => setEditingBiz({ ...editingBiz, sectors: toggleArrayItem(editingBiz.sectors || [], s) })}
                    >{s}</Badge>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>Products (comma-separated)</Label>
                <Input value={(editingBiz.products || []).join(', ')} onChange={e => setEditingBiz({ ...editingBiz, products: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
              </div>
              <div>
                <Label>Export Capacity</Label>
                <Input value={editingBiz.exportCapacity || ''} onChange={e => setEditingBiz({ ...editingBiz, exportCapacity: e.target.value })} />
              </div>
              <div>
                <Label>Min Order Qty</Label>
                <Input value={editingBiz.minOrderQty || ''} onChange={e => setEditingBiz({ ...editingBiz, minOrderQty: e.target.value })} />
              </div>
              <div>
                <Label>Trade Readiness Score</Label>
                <Input type="number" min={0} max={100} value={editingBiz.tradeReadinessScore || 50} onChange={e => setEditingBiz({ ...editingBiz, tradeReadinessScore: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Year Established</Label>
                <Input type="number" value={editingBiz.yearEstablished || 2024} onChange={e => setEditingBiz({ ...editingBiz, yearEstablished: parseInt(e.target.value) || 2024 })} />
              </div>
              <div>
                <Label>Employees</Label>
                <Input value={editingBiz.employees || ''} onChange={e => setEditingBiz({ ...editingBiz, employees: e.target.value })} />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input value={editingBiz.contactEmail || ''} onChange={e => setEditingBiz({ ...editingBiz, contactEmail: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea value={editingBiz.description || ''} onChange={e => setEditingBiz({ ...editingBiz, description: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBizDialog(false); setEditingBiz(null); }}>Cancel</Button>
            <Button className="bg-gold text-navy hover:bg-gold-light" onClick={handleSaveBusiness} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {businesses.find(b => b.id === editingBiz?.id) ? 'Update' : 'Add'} Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Business</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <strong>{businesses.find(b => b.id === confirmDelete)?.name}</strong> from the directory?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDeleteBusiness(confirmDelete)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
