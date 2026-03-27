import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Eye, RefreshCw, Loader2, Handshake, Clock, Users } from 'lucide-react';

interface MatchRequest {
  id: string;
  requester_id: string;
  requester_email: string;
  requester_business_name: string;
  matched_business_name: string;
  matched_business_id: string | null;
  match_score: number;
  sectors: string[];
  target_countries: string[];
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export default function AdminMatchesPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MatchRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('match_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setRequests(data as unknown as MatchRequest[]);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('match_requests')
      .update({ status, admin_notes: adminNotes || null } as any)
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: status === 'approved' ? 'Approved' : 'Declined', description: `Match request ${status}.` });
      setSelected(null);
      setAdminNotes('');
      fetchRequests();
    }
    setUpdating(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    introduced: 'bg-blue-100 text-blue-700',
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    declined: requests.filter(r => r.status === 'declined').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Match Requests Management</h1>
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Handshake className="h-8 w-8 text-[hsl(var(--gold))]" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.declined}</div>
                <div className="text-xs text-muted-foreground">Declined</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No match requests yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Matched Business</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{req.requester_business_name}</div>
                          <div className="text-xs text-muted-foreground">{req.requester_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{req.matched_business_name}</TableCell>
                      <TableCell>
                        <Badge className="bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))]">{req.match_score}%</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[req.status] || statusColors.pending} capitalize text-xs`}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => { setSelected(req); setAdminNotes(req.admin_notes || ''); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.status === 'pending' && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 text-green-600" onClick={() => updateStatus(req.id, 'approved')}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-red-600" onClick={() => updateStatus(req.id, 'declined')}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Match Request Details</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Requester</label>
                    <p className="font-medium">{selected.requester_business_name}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Email</label>
                    <p className="font-medium">{selected.requester_email}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Matched Business</label>
                    <p className="font-medium">{selected.matched_business_name}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Match Score</label>
                    <p className="font-bold text-[hsl(var(--gold))]">{selected.match_score}%</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Sectors</label>
                    <p className="font-medium">{selected.sectors?.join(', ') || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Target Countries</label>
                    <p className="font-medium">{selected.target_countries?.join(', ') || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this match request..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              {selected?.status === 'pending' && (
                <>
                  <Button variant="destructive" onClick={() => updateStatus(selected.id, 'declined')} disabled={updating}>
                    {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Decline
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selected.id, 'approved')} disabled={updating}>
                    {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
