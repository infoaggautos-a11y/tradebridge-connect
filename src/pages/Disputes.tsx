import { useState } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessById } from '@/data/mockData';
import { disputeService } from '@/services/disputeService';
import { dealService } from '@/services/dealService';
import { Dispute, DisputeCategory, DisputeStatus, DISPUTE_CATEGORY_LABELS, DISPUTE_STATUS_LABELS } from '@/types/dispute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  MessageSquare,
  Upload,
  Gavel,
  ArrowRight,
  Scale,
  DollarSign,
} from 'lucide-react';

export default function Disputes() {
  const { user } = useAuth();
  const businessId = user?.businessId || 'b1';
  const disputes = disputeService.getDisputesByBusiness(businessId);
  const deals = dealService.getDealsByBusiness(businessId).filter(d => d.status !== 'completed' && d.status !== 'cancelled');
  
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDispute, setNewDispute] = useState({
    dealId: '',
    category: 'fulfilment' as DisputeCategory,
    title: '',
    description: '',
    amount: 0,
    currency: 'USD',
  });

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

  const handleCreateDispute = () => {
    const deal = deals.find(d => d.id === newDispute.dealId);
    if (!deal) return;

    const otherPartyId = deal.buyerId === businessId ? deal.sellerId : deal.buyerId;
    disputeService.createDispute({
      dealId: deal.id,
      initiatorId: businessId,
      respondentId: otherPartyId,
      category: newDispute.category,
      title: newDispute.title,
      description: newDispute.description,
      amount: newDispute.amount,
      currency: newDispute.currency,
    });
    setShowCreateDialog(false);
    setNewDispute({ dealId: '', category: 'fulfilment', title: '', description: '', amount: 0, currency: 'USD' });
  };

  const isInitiator = (dispute: Dispute) => dispute.initiatorId === businessId;

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dispute Resolution</h1>
            <p className="text-muted-foreground">Manage and resolve trade disputes</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Raise Dispute
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raise a Dispute</DialogTitle>
                <DialogDescription>
                  Describe your issue and provide supporting evidence
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select Deal</Label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newDispute.dealId}
                    onChange={(e) => setNewDispute({...newDispute, dealId: e.target.value})}
                  >
                    <option value="">Select a deal...</option>
                    {deals.map(deal => (
                      <option key={deal.id} value={deal.id}>
                        {deal.title} - ${deal.totalAmount.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Dispute Category</Label>
                  <select 
                    className="w-full mt-1 p-2 border rounded-md"
                    value={newDispute.category}
                    onChange={(e) => setNewDispute({...newDispute, category: e.target.value as DisputeCategory})}
                  >
                    <option value="payment">Payment Dispute</option>
                    <option value="fulfilment">Fulfilment Dispute</option>
                    <option value="fraud">Fraud Dispute</option>
                  </select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input 
                    placeholder="Brief description of the issue"
                    value={newDispute.title}
                    onChange={(e) => setNewDispute({...newDispute, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Description (min 50 words)</Label>
                  <Textarea 
                    placeholder="Describe what happened in detail..."
                    value={newDispute.description}
                    onChange={(e) => setNewDispute({...newDispute, description: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount in Dispute</Label>
                    <Input 
                      type="number"
                      value={newDispute.amount}
                      onChange={(e) => setNewDispute({...newDispute, amount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={newDispute.currency}
                      onChange={(e) => setNewDispute({...newDispute, currency: e.target.value})}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="NGN">NGN</option>
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateDispute} disabled={newDispute.description.split(' ').length < 50}>
                  Submit Dispute
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Disputes */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Your Disputes</h2>
            {disputes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No disputes filed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    If you have an issue with a trade deal, you can raise a dispute
                  </p>
                </CardContent>
              </Card>
            ) : (
              disputes.map(dispute => {
                const deal = dealService.getDeal(dispute.dealId);
                const otherPartyId = isInitiator(dispute) ? dispute.respondentId : dispute.initiatorId;
                const otherParty = getBusinessById(otherPartyId);
                
                return (
                  <Card key={dispute.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedDispute(dispute)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium">{dispute.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Case #{dispute.caseNumber} · {deal?.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getCategoryBadge(dispute.category)}
                          {getStatusBadge(dispute.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-medium">{otherParty?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{dispute.amount.toLocaleString()} {dispute.currency}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Day {dispute.daysElapsed}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resolution Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">1</div>
                  <div>
                    <div className="font-medium text-sm">Initiate</div>
                    <div className="text-xs text-muted-foreground">Submit your dispute with evidence</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-medium">2</div>
                  <div>
                    <div className="font-medium text-sm">Automated Mediation</div>
                    <div className="text-xs text-muted-foreground">System tries to find resolution (0-2 days)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium">3</div>
                  <div>
                    <div className="font-medium text-sm">DIL Mediation</div>
                    <div className="text-xs text-muted-foreground">Trade expert reviews (2-5 days)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-medium">4</div>
                  <div>
                    <div className="font-medium text-sm">Binding Arbitration</div>
                    <div className="text-xs text-muted-foreground">Final decision by arbitrator (5-10 days)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Evidence Guidelines
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dispute Detail Dialog */}
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-3xl">
            {selectedDispute && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    {selectedDispute.title}
                  </DialogTitle>
                  <DialogDescription>
                    Case #{selectedDispute.caseNumber} · {DISPUTE_CATEGORY_LABELS[selectedDispute.category]}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status Timeline */}
                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedDispute.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{selectedDispute.currency}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedDispute.daysElapsed}</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                    <div className="text-center">
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
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Evidence ({selectedDispute.evidence.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedDispute.evidence.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No evidence submitted yet</p>
                      ) : (
                        selectedDispute.evidence.map(ev => (
                          <div key={ev.id} className="flex items-center justify-between p-2 rounded bg-secondary">
                            <div>
                              <div className="text-sm font-medium">{ev.type.replace('_', ' ')}</div>
                              <div className="text-xs text-muted-foreground">{ev.description}</div>
                            </div>
                            <Badge variant="outline">Submitted</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Resolution */}
                  {selectedDispute.resolution && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Resolution: {selectedDispute.resolution.replace('_', ' ')}
                      </h4>
                      {selectedDispute.resolutionNotes && (
                        <p className="text-sm text-green-600 mt-1">{selectedDispute.resolutionNotes}</p>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Evidence
                  </Button>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Mediator
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MemberLayout>
  );
}
