import { useState } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessById } from '@/data/mockData';
import { kycService } from '@/services/kycService';
import { KYCTier, KYCStatus, KYC_WORKFLOW, KYC_TIER_FEATURES, DOCUMENT_LABELS, KYCDocument } from '@/types/kyc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  Shield, 
  AlertCircle,
  ArrowRight,
  FileText,
  Building2,
  User,
  MapPin,
  Landmark,
  Video,
  Wallet,
  History,
  PenTool,
  Clock
} from 'lucide-react';

export default function KYCVerification() {
  const { user } = useAuth();
  const business = user?.businessId ? getBusinessById(user.businessId) : null;
  const kycApp = user?.businessId ? kycService.getApplication(user.businessId) : null;
  
  const currentTier: KYCTier = kycApp?.currentTier || 'basic';
  const targetTier: KYCTier = kycApp?.targetTier || 'verified';
  const status: KYCStatus = kycApp?.status || 'not_started';
  
  const workflow = KYC_WORKFLOW.filter(step => 
    step.tier === targetTier || 
    (targetTier === 'verified' && step.tier === 'basic')
  );

  const getStepStatus = (step: typeof workflow[0], index: number) => {
    if (!kycApp) return 'pending';
    const docIndex = index;
    if (docIndex < kycApp.documents.filter(d => d.status === 'verified').length) return 'completed';
    if (docIndex < kycApp.documents.filter(d => d.status !== 'rejected').length) return 'in_progress';
    return 'pending';
  };

  const getTierBadge = (tier: KYCTier) => {
    const colors: Record<KYCTier, string> = {
      guest: 'bg-gray-100 text-gray-600',
      basic: 'bg-blue-100 text-blue-700',
      verified: 'bg-green-100 text-green-700',
      trade_ready: 'bg-gold/20 text-gold-dark',
    };
    const labels: Record<KYCTier, string> = {
      guest: 'Guest',
      basic: 'Basic Member',
      verified: 'Verified Member',
      trade_ready: 'Trade Ready',
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[tier]}`}>{labels[tier]}</span>;
  };

  const getStatusBadge = (s: KYCStatus) => {
    const config: Record<KYCStatus, { color: string; label: string }> = {
      not_started: { color: 'bg-gray-100 text-gray-600', label: 'Not Started' },
      pending_review: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Review' },
      in_review: { color: 'bg-blue-100 text-blue-700', label: 'In Review' },
      additional_info_required: { color: 'bg-orange-100 text-orange-700', label: 'Additional Info Required' },
      approved: { color: 'bg-green-100 text-green-700', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
      suspended: { color: 'bg-red-100 text-red-700', label: 'Suspended' },
    };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config[s].color}`}>{config[s].label}</span>;
  };

  const submittedDocs = kycApp?.documents.filter(d => d.status !== 'rejected') || [];
  const progress = submittedDocs.length > 0 
    ? Math.round((submittedDocs.length / workflow.length) * 100)
    : 0;

  return (
    <MemberLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Verification Center</h1>
            <p className="text-muted-foreground">Complete verification to unlock full platform access</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Current Tier:</span>
            {getTierBadge(currentTier)}
          </div>
        </div>

        {/* Status Banner */}
        {status !== 'approved' && (
          <Card className={status === 'additional_info_required' || status === 'rejected' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {status === 'additional_info_required' || status === 'rejected' ? (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                ) : (
                  <Clock className="h-5 w-5 text-blue-600" />
                )}
                <div className="flex-1">
                  <div className="font-medium">
                    {status === 'not_started' && 'Start your verification journey'}
                    {status === 'pending_review' && 'Verification under review'}
                    {status === 'in_review' && 'Verification in review'}
                    {status === 'additional_info_required' && 'Action required: Additional information needed'}
                    {status === 'rejected' && 'Verification was not approved'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {kycApp?.reviewerNotes || 'Complete all steps to unlock Trade Ready status'}
                  </div>
                </div>
                {getStatusBadge(status)}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gold" />
                  Verification Progress
                </CardTitle>
                <CardDescription>
                  {targetTier === 'verified' ? 'Complete business verification to access full features' : 'Complete Trade Ready verification to use escrow'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  
                  <div className="grid gap-3 mt-6">
                    {workflow.map((step, index) => (
                      <div 
                        key={step.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          getStepStatus(step, index) === 'completed' 
                            ? 'bg-green-50 border-green-200' 
                            : getStepStatus(step, index) === 'in_progress'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-secondary/50'
                        }`}
                      >
                        <div className="mt-0.5">
                          {getStepStatus(step, index) === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : getStepStatus(step, index) === 'in_progress' ? (
                            <Circle className="h-5 w-5 text-blue-600 animate-pulse" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{step.title}</div>
                          <div className="text-sm text-muted-foreground">{step.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {step.isOptional ? 'Optional' : `${step.requiredDocuments.length} document(s) required`} · {step.estimatedTime}
                          </div>
                        </div>
                        <Button variant={getStepStatus(step, index) === 'pending' ? 'default' : 'outline'} size="sm">
                          {getStepStatus(step, index) === 'completed' ? 'Edit' : 'Complete'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Section */}
            {kycApp?.documents && kycApp.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Submitted Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kycApp.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{DOCUMENT_LABELS[doc.type]}</div>
                            <div className="text-xs text-muted-foreground">
                              Submitted {new Date(doc.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === 'verified' && <Badge className="bg-green-100 text-green-700">Verified</Badge>}
                          {doc.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                          {doc.status === 'rejected' && (
                            <div className="flex items-center gap-1">
                              <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                              <span className="text-xs text-red-600 max-w-[150px] truncate">{doc.rejectionReason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tier Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(['basic', 'verified', 'trade_ready'] as KYCTier[]).map(tier => (
                    <div key={tier} className={`p-3 rounded-lg ${tier === targetTier ? 'bg-gold/10 border border-gold' : 'bg-secondary'}`}>
                      <div className="font-medium text-sm mb-2">{getTierBadge(tier)}</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {KYC_TIER_FEATURES[tier].map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Contact Verification Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
