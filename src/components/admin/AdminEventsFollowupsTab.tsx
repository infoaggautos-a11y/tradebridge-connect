import { AlertCircle, TrendingUp, Target, TrendingDown, DollarSign, Users, Calendar, UserCheck, FileText, Handshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { PostEventDealFollowup, PostEventDealFollowupStatus } from '@/types/postEventDealFollowup';
import { postEventDealFollowupService } from '@/services/postEventDealFollowupService';
import { useToast } from '@/hooks/use-toast';

export default function AdminEventsFollowupsTab() {
  const { toast } = useToast();
  const [followups, setFollowups] = useState<PostEventDealFollowup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    attendeeName: '',
    attendeeEmail: '',
    company: '',
    eventId: 'e0',
    eventTitle: '',
    dealValue: '',
    dealCurrency: 'USD',
    dealType: 'goods',
    followUpOwner: 'ops_team',
    nextActionDate: '',
    nextActionType: 'call',
    notes: '',
  });

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    setLoading(true);
    try {
      const allFollowups = await postEventDealFollowupService.getAllFollowups();
      setFollowups(allFollowups);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load follow-ups', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredFollowups = followups.filter(followup => {
    const matchesSearch = 
      searchTerm === '' ||
      followup.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followup.attendeeEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || followup.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: PostEventDealFollowupStatus) => {
    const colors = {
      new_lead: 'bg-blue-100 text-blue-800 border-blue-200',
      contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      proposal_sent: 'bg-purple-100 text-purple-800 border-purple-200',
      negotiation: 'bg-orange-100 text-orange-800 border-orange-200',
      won: 'bg-green-100 text-green-800 border-green-200',
      lost: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleStatusChange = async (followupId: string, status: PostEventDealFollowupStatus) => {
    try {
      const updated = await postEventDealFollowupService.updateFollowupStatus(followupId, status);
      if (updated) {
        setFollowups(prev => prev.map(item => item.id === followupId ? updated : item));
        toast({ title: 'Follow-up updated', description: `Status changed to ${status.replace('_', ' ')}.` });
      }
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message || 'Unable to update follow-up.', variant: 'destructive' });
    }
  };

  const handleOwnerChange = async (followupId: string, owner: string) => {
    try {
      const updated = await postEventDealFollowupService.assignFollowupOwner(followupId, owner);
      if (updated) {
        setFollowups(prev => prev.map(item => item.id === followupId ? updated : item));
        toast({ title: 'Owner assigned', description: `Follow-up assigned to ${owner.replace('_', ' ')}.` });
      }
    } catch (error: any) {
      toast({ title: 'Assignment failed', description: error.message || 'Unable to assign owner.', variant: 'destructive' });
    }
  };

  const handleCreateFollowup = async () => {
    if (!createForm.attendeeName.trim() || !createForm.attendeeEmail.trim() || !createForm.eventTitle.trim()) {
      toast({ title: 'Missing information', description: 'Attendee name, email, and event title are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const created = await postEventDealFollowupService.createPostEventFollowup({
        registrationId: '',
        eventId: createForm.eventId.trim() || 'e0',
        eventTitle: createForm.eventTitle.trim(),
        dealValue: Number(createForm.dealValue) || 0,
        dealCurrency: createForm.dealCurrency.trim() || 'USD',
        dealType: createForm.dealType as PostEventDealFollowup['dealType'],
        followUpOwner: createForm.followUpOwner,
        nextActionDate: createForm.nextActionDate || undefined,
        nextActionType: createForm.nextActionType as PostEventDealFollowup['nextActionType'],
        notes: createForm.notes.trim() || undefined,
        attendeeName: createForm.attendeeName.trim(),
        attendeeEmail: createForm.attendeeEmail.trim(),
        company: createForm.company.trim(),
        companyContact: createForm.attendeeName.trim(),
      });
      setFollowups(prev => [created, ...prev]);
      setIsCreateDialogOpen(false);
      setCreateForm({
        attendeeName: '',
        attendeeEmail: '',
        company: '',
        eventId: 'e0',
        eventTitle: '',
        dealValue: '',
        dealCurrency: 'USD',
        dealType: 'goods',
        followUpOwner: 'ops_team',
        nextActionDate: '',
        nextActionType: 'call',
        notes: '',
      });
      toast({ title: 'Follow-up created', description: 'The post-event opportunity has been added to the pipeline.' });
    } catch (error: any) {
      toast({ title: 'Create failed', description: error.message || 'Unable to create follow-up.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: followups.length,
    newLeads: followups.filter(f => f.status === 'new_lead').length,
    contacted: followups.filter(f => f.status === 'contacted').length,
    proposalsSent: followups.filter(f => f.status === 'proposal_sent').length,
    inNegotiation: followups.filter(f => f.status === 'negotiation').length,
    won: followups.filter(f => f.status === 'won').length,
    lost: followups.filter(f => f.status === 'lost').length,
    totalDealValue: followups.reduce((sum, f) => sum + f.dealValue, 0),
    winRate: followups.length > 0 ? (followups.filter(f => f.status === 'won').length / followups.length) * 100 : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Post-Event Deal Follow-up Management</h2>
          <p className="text-muted-foreground">Track and manage post-event deal follow-ups</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-[#CE2B37] text-white hover:bg-[#CE2B37]/90">
          <Handshake className="h-4 w-4 mr-2" /> Create Follow-up
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Follow-ups</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">New Leads</div>
            <div className="text-2xl font-bold text-blue-600">{stats.newLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Proposals Sent</div>
            <div className="text-2xl font-bold text-purple-600">{stats.proposalsSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">In Negotiation</div>
            <div className="text-2xl font-bold text-orange-600">{stats.inNegotiation}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Won Deals</div>
            <div className="text-2xl font-bold text-green-600">{stats.won}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Lost Deals</div>
            <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle>Follow-up Pipeline</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Search by name, company, event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new_lead">New Lead</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
            </div>
          ) : filteredFollowups.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No follow-ups found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deal Value</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Next Action</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFollowups.map(followup => (
                  <TableRow key={followup.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{followup.attendeeName}</div>
                        <div className="text-xs text-muted-foreground">{followup.attendeeEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{followup.company}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium max-w-[200px] truncate">{followup.eventTitle}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(followup.status)}`}>
                        {followup.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{followup.dealCurrency} {followup.dealValue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{followup.dealType}</div>
                    </TableCell>
                    <TableCell>
                      <Select value={followup.followUpOwner} onValueChange={(value) => handleOwnerChange(followup.id, value)}>
                        <SelectTrigger className="h-8 w-[150px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ops_team">Operations</SelectItem>
                          <SelectItem value="sales_team">Sales</SelectItem>
                          <SelectItem value="business_dev">Business Dev</SelectItem>
                          <SelectItem value="legal_team">Legal</SelectItem>
                          <SelectItem value="project_team">Project Team</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="font-medium">{followup.nextActionType}</div>
                        <div className="text-muted-foreground">{followup.nextActionDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={followup.status} onValueChange={(value) => handleStatusChange(followup.id, value as PostEventDealFollowupStatus)}>
                        <SelectTrigger className="h-8 w-[150px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_lead">New Lead</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Post-Event Follow-up</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Attendee Name *</Label>
                <Input value={createForm.attendeeName} onChange={(e) => setCreateForm(prev => ({ ...prev, attendeeName: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email *</Label>
                <Input type="email" value={createForm.attendeeEmail} onChange={(e) => setCreateForm(prev => ({ ...prev, attendeeEmail: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Company</Label>
                <Input value={createForm.company} onChange={(e) => setCreateForm(prev => ({ ...prev, company: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Event ID</Label>
                <Input value={createForm.eventId} onChange={(e) => setCreateForm(prev => ({ ...prev, eventId: e.target.value }))} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Event Title *</Label>
                <Input value={createForm.eventTitle} onChange={(e) => setCreateForm(prev => ({ ...prev, eventTitle: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Deal Value</Label>
                <Input type="number" value={createForm.dealValue} onChange={(e) => setCreateForm(prev => ({ ...prev, dealValue: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Currency</Label>
                <Input value={createForm.dealCurrency} onChange={(e) => setCreateForm(prev => ({ ...prev, dealCurrency: e.target.value.toUpperCase() }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Deal Type</Label>
                <Select value={createForm.dealType} onValueChange={(value) => setCreateForm(prev => ({ ...prev, dealType: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goods">Goods</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Owner</Label>
                <Select value={createForm.followUpOwner} onValueChange={(value) => setCreateForm(prev => ({ ...prev, followUpOwner: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ops_team">Operations</SelectItem>
                    <SelectItem value="sales_team">Sales</SelectItem>
                    <SelectItem value="business_dev">Business Dev</SelectItem>
                    <SelectItem value="legal_team">Legal</SelectItem>
                    <SelectItem value="project_team">Project Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Next Action</Label>
                <Select value={createForm.nextActionType} onValueChange={(value) => setCreateForm(prev => ({ ...prev, nextActionType: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="visit">Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Next Action Date</Label>
                <Input type="date" value={createForm.nextActionDate} onChange={(e) => setCreateForm(prev => ({ ...prev, nextActionDate: e.target.value }))} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">Notes</Label>
                <Textarea rows={3} value={createForm.notes} onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateFollowup} disabled={saving}>
                {saving ? 'Saving...' : 'Create Follow-up'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
