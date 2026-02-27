import { useState } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessById, businesses } from '@/data/mockData';
import { dealService } from '@/services/dealService';
import { DealStatus, DealMilestone, DEAL_STATUS_LABELS, ESCROW_STATUS_LABELS } from '@/types/deal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  DollarSign,
  Package,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Shield,
  Wallet,
  RefreshCw,
  MoreHorizontal,
  Upload,
} from 'lucide-react';

export default function DealRoom() {
  const { user } = useAuth();
  const businessId = user?.businessId || 'b1';
  const allDeals = dealService.getAllDeals();
  const myDeals = allDeals.filter(d => d.buyerId === businessId || d.sellerId === businessId);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(myDeals[0]?.id || null);
  const selectedDeal = selectedDealId ? dealService.getDeal(selectedDealId) : null;
  const escrow = selectedDeal ? dealService.getEscrowByDeal(selectedDeal.id) : null;

  const isBuyer = selectedDeal?.buyerId === businessId;
  const otherPartyId = isBuyer ? selectedDeal?.sellerId : selectedDeal?.buyerId;
  const otherParty = otherPartyId ? getBusinessById(otherPartyId) : null;

  const getStatusBadge = (status: DealStatus) => {
    const colors: Record<DealStatus, string> = {
      draft: 'bg-gray-100 text-gray-600',
      negotiating: 'bg-blue-100 text-blue-700',
      terms_agreed: 'bg-purple-100 text-purple-700',
      escrow_funded: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-orange-100 text-orange-700',
      completed: 'bg-green-100 text-green-700',
      disputed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-600',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>{DEAL_STATUS_LABELS[status]}</span>;
  };

  const getEscrowBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-600',
      funded: 'bg-green-100 text-green-700',
      released: 'bg-blue-100 text-blue-700',
      refunded: 'bg-red-100 text-red-700',
      frozen: 'bg-red-100 text-red-700',
      partially_released: 'bg-yellow-100 text-yellow-700',
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>{ESCROW_STATUS_LABELS[status as keyof typeof ESCROW_STATUS_LABELS] || status}</span>;
  };

  const getMilestoneProgress = () => {
    if (!selectedDeal) return 0;
    const completed = selectedDeal.milestones.filter(m => m.status === 'accepted' || m.status === 'delivered').length;
    return Math.round((completed / selectedDeal.milestones.length) * 100);
  };

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deal Room</h1>
            <p className="text-muted-foreground">Manage your trade deals and escrow</p>
          </div>
          <Button>
            <Package className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Deal List */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Your Deals</h3>
            {myDeals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No deals yet</p>
                </CardContent>
              </Card>
            ) : (
              myDeals.map(deal => {
                const isSelected = deal.id === selectedDealId;
                const otherId = deal.buyerId === businessId ? deal.sellerId : deal.buyerId;
                const other = getBusinessById(otherId);
                
                return (
                  <Card 
                    key={deal.id} 
                    className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-gold' : 'hover:shadow-md'}`}
                    onClick={() => setSelectedDealId(deal.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground font-mono">{deal.dealNumber}</span>
                        {getStatusBadge(deal.status)}
                      </div>
                      <div className="font-medium text-sm mb-1">{deal.title}</div>
                      <div className="text-xs text-muted-foreground">{other?.name}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{deal.totalAmount.toLocaleString()} {deal.currency}</span>
                        <span className="text-xs text-muted-foreground">{deal.milestones.length} milestones</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Deal Details */}
          <div className="lg:col-span-3 space-y-6">
            {selectedDeal ? (
              <>
                {/* Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedDeal.title}</CardTitle>
                        <CardDescription>{selectedDeal.dealNumber}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedDeal.status)}
                        {escrow && getEscrowBadge(escrow.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Value</div>
                        <div className="text-2xl font-bold">{selectedDeal.totalAmount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{selectedDeal.currency}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Deal Type</div>
                        <div className="font-medium capitalize">{selectedDeal.type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Counterparty</div>
                        <div className="font-medium">{otherParty?.name}</div>
                        <div className="text-xs text-muted-foreground">{otherParty?.country}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="flex items-center gap-2">
                          <Progress value={getMilestoneProgress()} className="flex-1" />
                          <span className="text-sm font-medium">{getMilestoneProgress()}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="milestones" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="escrow">Escrow</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                  </TabsList>

                  {/* Milestones Tab */}
                  <TabsContent value="milestones">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5" />
                          Milestones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedDeal.milestones.map((milestone, index) => (
                            <div 
                              key={milestone.id} 
                              className={`flex items-start gap-4 p-4 rounded-lg border ${
                                milestone.status === 'accepted' ? 'bg-green-50 border-green-200' :
                                milestone.status === 'delivered' ? 'bg-blue-50 border-blue-200' :
                                milestone.status === 'disputed' ? 'bg-red-50 border-red-200' :
                                'bg-secondary'
                              }`}
                            >
                              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{milestone.title}</div>
                                  <Badge variant={milestone.status === 'accepted' ? 'default' : 'outline'}>
                                    {milestone.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">{milestone.description}</div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="font-medium">{milestone.amount.toLocaleString()} {milestone.currency}</div>
                                  {milestone.deliveredAt && (
                                    <div className="text-xs text-muted-foreground">
                                      Delivered {new Date(milestone.deliveredAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {milestone.status === 'pending' && (
                                <Button size="sm">
                                  {isBuyer ? 'Fund' : 'Deliver'}
                                </Button>
                              )}
                              {milestone.status === 'delivered' && isBuyer && (
                                <Button size="sm">
                                  Accept & Release
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Escrow Tab */}
                  <TabsContent value="escrow">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Escrow Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {escrow ? (
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="p-4 bg-secondary rounded-lg">
                                <div className="text-sm text-muted-foreground">Escrow Amount</div>
                                <div className="text-2xl font-bold">{escrow.amount.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">{escrow.currency}</div>
                              </div>
                              <div className="p-4 bg-secondary rounded-lg">
                                <div className="text-sm text-muted-foreground">DIL Commission</div>
                                <div className="text-2xl font-bold text-gold-dark">{escrow.commission.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">{(escrow.commissionRate * 100).toFixed(1)}%</div>
                              </div>
                              <div className="p-4 bg-secondary rounded-lg">
                                <div className="text-sm text-muted-foreground">Status</div>
                                <div className="mt-1">{getEscrowBadge(escrow.status)}</div>
                              </div>
                            </div>

                            {/* Escrow Timeline */}
                            <div className="space-y-2">
                              <h4 className="font-medium">Transaction History</h4>
                              {escrow.transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                  <div>
                                    <div className="font-medium text-sm capitalize">{tx.type.replace('_', ' ')}</div>
                                    <div className="text-xs text-muted-foreground">{tx.description}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">{tx.amount.toLocaleString()} {tx.currency}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(tx.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            {escrow.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button className="flex-1">
                                  <Wallet className="h-4 w-4 mr-2" />
                                  Fund Escrow
                                </Button>
                              </div>
                            )}
                            {escrow.status === 'funded' && (
                              <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Request Extension
                                </Button>
                                <Button variant="destructive" className="flex-1">
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Raise Dispute
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-medium mb-2">No Escrow Created</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Create an escrow to secure this deal
                            </p>
                            <Button>
                              <Shield className="h-4 w-4 mr-2" />
                              Create Escrow
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Deal Documents
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedDeal.documents.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No documents attached</p>
                          ) : (
                            selectedDeal.documents.map((doc, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium text-sm">{doc}</div>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">Download</Button>
                              </div>
                            ))
                          )}
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Terms Tab */}
                  <TabsContent value="terms">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Deal Terms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedDeal.terms}</p>
                        <Button variant="outline" className="w-full mt-4">
                          <FileText className="h-4 w-4 mr-2" />
                          View Full Agreement
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Select a Deal</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a deal from the list to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
