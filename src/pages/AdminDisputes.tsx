import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { disputeService } from '@/services/disputeService';
import { dealService } from '@/services/dealService';
import { getBusinessById, businesses } from '@/data/mockData';
import { Dispute, DisputeStatus, DisputeCategory, DISPUTE_STATUS_LABELS, DISPUTE_CATEGORY_LABELS, SLA_TIMELINES } from '@/types/dispute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  DollarSign,
  Gavel,
  CheckCircle2,
  XCircle,
  Eye,
  Video,
  Scale,
  AlertCircle,
} from 'lucide-react';

export default function AdminDisputes() {
  const disputes = disputeService.getAllDisputes();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<DisputeStatus | 'all'>('all');

  const filteredDisputes = filterStatus === 'all' 
    ? disputes 
    : disputes.filter(d => d.status === filterStatus);

  const getStatusBadge = (status: DisputeStatus) => {
    const colors: Record<DisputeStatus, string> = {
      initiated: 'bg-blue-100 text-blue-700',
      automated_mediation: 'bg-yellow-100 text-yellow-700',
      dil_mediation: 'bg-orange-100 text-orange-700',
      binding_arbitration: 'bg-red-100 text-red-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-600',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>{DISPUTE_STATUS_LABELS[status]}</span>;
  };

  const getCategoryBadge = (category: DisputeCategory) => {
    const colors: Record<DisputeCategory, string> = {
      payment: 'bg-blue-100 text-blue-700',
      fulfilment: 'bg-purple-100 text-purple-700',
      fraud: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[category]}`}>{DISPUTE_CATEGORY_LABELS[category]}</span>;
  };

  const getSLAStatus = (dispute: Dispute) => {
    const slaDays = SLA_TIMELINES[dispute.status];
    if (dispute.daysElapsed > slaDays) return 'overdue';
    if (dispute.daysElapsed > slaDays * 0.7) return 'warning';
    return 'ok';
  };

  const handleProposeResolution = () => {
    if (!selectedDispute) return;
    disputeService.proposeResolution(
      selectedDispute.id,
      resolution as any,
      undefined,
      resolutionNotes
    );
    setShowResolutionDialog(false);
    setResolution('');
    setResolutionNotes('');
    setSelectedDispute(null);
  };

  const stats = {
    total: disputes.length,
    active: disputes.filter(d => d.status !== 'resolved' && d.status !== 'closed').length,
    totalValue: disputes.reduce((sum, d) => sum + d.amount, 0),
    overdue: disputes.filter(d => {
      const slaDays = SLA_TIMELINES[d.status];
      return d.status !== 'resolved' && d.status !== 'closed' && d.daysElapsed > slaDays;
    }).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dispute Management</h1>
            <p className="text-muted-foreground">Monitor and resolve trade disputes</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {stats.active} Active
            </Badge>
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {stats.overdue} Overdue
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Disputes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Active Cases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">Overdue (SLA)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${(stats.totalValue / 1000).toFixed(0)}K</div>
              <div className="text-sm text-muted-foreground">Total Value at Stake</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Button 
            variant={filterStatus === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          {(['initiated', 'automated_mediation', 'dil_mediation', 'binding_arbitration', 'resolved'] as DisputeStatus[]).map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {DISPUTE_STATUS_LABELS[status]}
            </Button>
          ))}
        </div>

        {/* Disputes Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Deal</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map(dispute => {
                  const deal = dealService.getDeal(dispute.dealId);
                  const buyer = getBusinessById(dispute.buyerId);
                  const seller = getBusinessById(dispute.sellerId);
                  const slaStatus = getSLAStatus(dispute);
                  
                  return (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-mono text-sm">{dispute.caseNumber}</TableCell>
                      <TableCell className="text-sm">{deal?.title || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{buyer?.name} vs {seller?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(dispute.category)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{dispute.amount.toLocaleString()} {dispute.currency}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${
                          slaStatus === 'overdue' ? 'text-red-600' : 
                          slaStatus === 'warning' ? 'text-orange-600' : 'text-muted-foreground'
                        }`}>
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Day {dispute.daysElapsed}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDispute(dispute)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-3xl">
            {selectedDispute && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    {selectedDispute.title}
                  </DialogTitle>
                  <DialogDescription>
                    Case #{selectedDispute.caseNumber}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedDispute.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{selectedDispute.currency}</div>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      <div className="text-2xl font-bold">{selectedDispute.daysElapsed}</div>
                      <div className="text-sm text-muted-foreground">Days Elapsed</div>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                      {getStatusBadge(selectedDispute.status)}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedDispute.description}</p>
                  </div>

                  {/* Evidence */}
                  <div>
                    <h4 className="font-medium mb-2">Evidence ({selectedDispute.evidence.length})</h4>
                    <div className="space-y-2">
                      {selectedDispute.evidence.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No evidence submitted</p>
                      ) : (
                        selectedDispute.evidence.map(ev => (
                          <div key={ev.id} className="p-3 bg-secondary rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-sm">{ev.type.replace('_', ' ')}</div>
                              <Badge variant="outline">by {getBusinessById(ev.submittedBy)?.name}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{ev.description}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Questionnaire Responses */}
                  {selectedDispute.questionnaires.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Questionnaire Responses</h4>
                      <div className="space-y-3">
                        {selectedDispute.questionnaires.map(q => (
                          <div key={q.id} className="p-3 bg-secondary rounded-lg">
                            <div className="text-sm font-medium mb-1">Q: {q.question}</div>
                            <div className="text-sm text-muted-foreground">A: {q.answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  {selectedDispute.status === 'automated_mediation' && (
                    <Button onClick={() => disputeService.escalateToMediation(selectedDispute.id)}>
                      <Gavel className="h-4 w-4 mr-2" />
                      Escalate to DIL Mediation
                    </Button>
                  )}
                  {selectedDispute.status === 'dil_mediation' && (
                    <Button onClick={() => setShowResolutionDialog(true)}>
                      <Scale className="h-4 w-4 mr-2" />
                      Propose Resolution
                    </Button>
                  )}
                  <Button variant="outline">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Call
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Resolution Dialog */}
        <Dialog open={showResolutionDialog} onOpenChange={setShowResolutionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propose Resolution</DialogTitle>
              <DialogDescription>
                Propose a resolution for this dispute
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Resolution Type</Label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option value="">Select resolution...</option>
                  <option value="full_release_to_seller">Full Release to Seller</option>
                  <option value="full_refund_to_buyer">Full Refund to Buyer</option>
                  <option value="negotiated_split">Negotiated Split</option>
                </select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Explain the resolution..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResolutionDialog(false)}>Cancel</Button>
              <Button onClick={handleProposeResolution}>Submit Resolution</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
