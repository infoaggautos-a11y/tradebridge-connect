import { useState } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { kycService } from '@/services/kycService';
import { getBusinessById, businesses } from '@/data/mockData';
import { KYCApplication, KYCTier, KYCStatus, DOCUMENT_LABELS } from '@/types/kyc';
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
  TableRow 
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
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Clock,
  Building2,
  User,
  FileText,
  Shield,
} from 'lucide-react';

export default function AdminKYCQueue() {
  const applications = kycService.getAllApplications();
  const pendingApps = applications.filter(a => a.status === 'pending_review' || a.status === 'in_review');
  const [selectedApp, setSelectedApp] = useState<KYCApplication | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const getStatusBadge = (status: KYCStatus) => {
    const config: Record<KYCStatus, { color: string; label: string }> = {
      not_started: { color: 'bg-gray-100 text-gray-600', label: 'Not Started' },
      pending_review: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Review' },
      in_review: { color: 'bg-blue-100 text-blue-700', label: 'In Review' },
      additional_info_required: { color: 'bg-orange-100 text-orange-700', label: 'Additional Info Required' },
      approved: { color: 'bg-green-100 text-green-700', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
      suspended: { color: 'bg-red-100 text-red-700', label: 'Suspended' },
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config[status].color}`}>{config[status].label}</span>;
  };

  const getBusiness = (id: string) => getBusinessById(id) || businesses.find(b => b.id === id);

  const handleApprove = (appId: string) => {
    kycService.approveApplication(appId, 'Approved by admin');
    setSelectedApp(null);
  };

  const handleReject = (appId: string) => {
    kycService.rejectApplication(appId, rejectReason);
    setShowRejectDialog(false);
    setRejectReason('');
    setSelectedApp(null);
  };

  const handleRequestInfo = (appId: string) => {
    kycService.requestAdditionalInfo(appId, infoMessage);
    setShowInfoDialog(false);
    setInfoMessage('');
    setSelectedApp(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">KYC Verification Queue</h1>
            <p className="text-muted-foreground">Review and process business verification applications</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {pendingApps.length} Pending
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{applications.length}</div>
              <div className="text-sm text-muted-foreground">Total Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{pendingApps.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(a => a.status === 'approved').length}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {applications.filter(a => a.status === 'rejected').length}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Applications</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input placeholder="Search businesses..." className="pl-9 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map(app => {
                  const business = getBusiness(app.businessId);
                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{business?.name || app.businessInfo.companyName}</div>
                            <div className="text-xs text-muted-foreground">{app.businessInfo.country}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{app.currentTier} → {app.targetTier}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{app.documents.filter(d => d.status === 'verified').length}/{app.documents.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(app.createdAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApp(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
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

        {/* Review Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl">
            {selectedApp && (
              <>
                <DialogHeader>
                  <DialogTitle>Review Application</DialogTitle>
                  <DialogDescription>
                    {getBusiness(selectedApp.businessId)?.name} - {selectedApp.targetTier} Verification
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Business Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Company Name</Label>
                      <div className="font-medium">{selectedApp.businessInfo.companyName}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Country</Label>
                      <div className="font-medium">{selectedApp.businessInfo.country}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Sector</Label>
                      <div className="font-medium">{selectedApp.businessInfo.sector}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Registration #</Label>
                      <div className="font-medium">{selectedApp.businessInfo.registrationNumber || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Person
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Name:</span> {selectedApp.contactPerson.fullName}</div>
                      <div><span className="text-muted-foreground">Title:</span> {selectedApp.contactPerson.jobTitle}</div>
                      <div><span className="text-muted-foreground">Email:</span> {selectedApp.contactPerson.workEmail}</div>
                      <div><span className="text-muted-foreground">Phone:</span> {selectedApp.contactPerson.phone}</div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Submitted Documents
                    </h4>
                    <div className="space-y-2">
                      {selectedApp.documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No documents submitted yet</p>
                      ) : (
                        selectedApp.documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                            <div>
                              <div className="font-medium text-sm">{DOCUMENT_LABELS[doc.type]}</div>
                              <div className="text-xs text-muted-foreground">
                                Submitted {new Date(doc.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.status === 'verified' && (
                                <Badge className="bg-green-100 text-green-700">Verified</Badge>
                              )}
                              {doc.status === 'pending' && (
                                <Badge variant="outline">Pending</Badge>
                              )}
                              {doc.status === 'rejected' && (
                                <div className="flex items-center gap-1">
                                  <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                                  <span className="text-xs text-red-600">{doc.rejectionReason}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setShowInfoDialog(true)}>
                    Request More Info
                  </Button>
                  <Button variant="destructive" onClick={() => setShowRejectDialog(true)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedApp.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejection. This will be visible to the applicant.
              </DialogDescription>
            </DialogHeader>
            <Textarea 
              placeholder="Reason for rejection..." 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleReject(selectedApp?.id || '')}>
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Info Dialog */}
        <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Additional Information</DialogTitle>
              <DialogDescription>
                Specify what additional information or documents are needed.
              </DialogDescription>
            </DialogHeader>
            <Textarea 
              placeholder="What additional information is needed?" 
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInfoDialog(false)}>Cancel</Button>
              <Button onClick={() => handleRequestInfo(selectedApp?.id || '')}>
                Send Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
