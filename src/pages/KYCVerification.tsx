import { useState, useRef } from 'react';
import { MemberLayout } from '@/layouts/MemberLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessById } from '@/data/mockData';
import { kycService } from '@/services/kycService';
import { KYCTier, KYCStatus, KYC_WORKFLOW, KYC_TIER_FEATURES, DOCUMENT_LABELS, DocumentType, KYCDocument } from '@/types/kyc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  Shield, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Building2,
  User,
  MapPin,
  Landmark,
  Video,
  Wallet,
  PenTool,
  Clock,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Loader2,
  X,
  Camera,
  UploadCloud
} from 'lucide-react';

interface FormData {
  companyName: string;
  country: string;
  sector: string;
  registrationNumber: string;
  taxNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  phoneOTP: string;
  phoneVerified: boolean;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  annualRevenue: string;
  exportExperience: string;
  countriesTraded: string[];
  platformAgreement: boolean;
}

const initialFormData: FormData = {
  companyName: '',
  country: '',
  sector: '',
  registrationNumber: '',
  taxNumber: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  contactPhone: '',
  phoneOTP: '',
  phoneVerified: false,
  bankName: '',
  accountNumber: '',
  accountHolderName: '',
  annualRevenue: '',
  exportExperience: '',
  countriesTraded: [],
  platformAgreement: false,
};

const documentCategories: { category: string; documents: DocumentType[] }[] = [
  { category: 'Business Registration', documents: ['cac_certificate', 'chamber_of_commerce', 'business_registration'] },
  { category: 'Identity Verification', documents: ['government_id', 'national_id'] },
  { category: 'Address Verification', documents: ['utility_bill', 'bank_statement'] },
  { category: 'Financial Verification', documents: ['bvn', 'tax_number'] },
];

const sectors = [
  'Agriculture & Food', 'Manufacturing', 'Textiles & Fashion', 'Oil & Gas',
  'Technology', 'Construction Materials', 'Minerals & Mining',
  'Healthcare & Pharma', 'Logistics & Shipping', 'Financial Services',
];

const countries = [
  'Nigeria', 'Italy', 'Ghana', 'Kenya', 'South Africa',
  'United Kingdom', 'Germany', 'France', 'United States', 'China',
];

const revenueRanges = [
  'Under $50,000', '$50,000 - $100,000', '$100,000 - $500,000',
  '$500,000 - $1,000,000', '$1,000,000 - $5,000,000', 'Over $5,000,000',
];

const experienceRanges = [
  'Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'Over 10 years',
];

export default function KYCVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const business = user?.businessId ? getBusinessById(user.businessId) : null;
  const kycApp = user?.businessId ? kycService.getApplication(user.businessId) : null;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploadedDocuments, setUploadedDocuments] = useState<Map<DocumentType, File>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentTier: KYCTier = kycApp?.currentTier || 'basic';
  const targetTier: KYCTier = kycApp?.targetTier || 'verified';
  const status: KYCStatus = kycApp?.status || 'not_started';
  
  const totalSteps = targetTier === 'trade_ready' ? 5 : 4;
  
  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (docType: DocumentType, file: File) => {
    setUploadedDocuments(prev => new Map(prev).set(docType, file));
    toast({
      title: "Document uploaded",
      description: `${DOCUMENT_LABELS[docType]} has been uploaded successfully.`,
    });
  };

  const handleRemoveDocument = (docType: DocumentType) => {
    setUploadedDocuments(prev => {
      const newMap = new Map(prev);
      newMap.delete(docType);
      return newMap;
    });
  };

  const handleSendOTP = () => {
    if (!formData.contactPhone) {
      toast({ title: "Error", description: "Please enter your phone number", variant: "destructive" });
      return;
    }
    setOtpSent(true);
    toast({
      title: "OTP Sent",
      description: `A verification code has been sent to ${formData.contactPhone}`,
    });
  };

  const handleVerifyOTP = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setFormData(prev => ({ ...prev, phoneVerified: true, phoneOTP: '' }));
      setShowPhoneDialog(false);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully.",
      });
    }, 1500);
  };

  const handleScheduleVideoKYC = () => {
    setShowVideoDialog(false);
    toast({
      title: "Video KYC Scheduled",
      description: "You will receive a link for your video verification call.",
    });
  };

  const handleSubmitApplication = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Application Submitted",
        description: "Your verification application has been submitted for review.",
      });
    }, 2000);
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Business Information';
      case 2: return 'Document Upload';
      case 3: return 'Contact Verification';
      case 4: return 'Financial Details';
      case 5: return 'Final Verification';
      default: return '';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.country && formData.sector && formData.address && formData.city;
      case 2:
        const requiredDocs = ['cac_certificate', 'government_id', 'utility_bill'];
        return requiredDocs.every(doc => uploadedDocuments.has(doc as DocumentType));
      case 3:
        return formData.contactName && formData.contactTitle && formData.contactEmail && formData.phoneVerified;
      case 4:
        return formData.bankName && formData.accountNumber && formData.accountHolderName;
      case 5:
        return formData.platformAgreement;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={formData.country} onValueChange={(v) => updateFormData('country', v)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sector *</Label>
                <Select value={formData.sector} onValueChange={(v) => updateFormData('sector', v)}>
                  <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                  <SelectContent>
                    {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  placeholder="CAC/Registration number"
                  value={formData.registrationNumber}
                  onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tax ID / TIN</Label>
                <Input
                  placeholder="Tax identification number"
                  value={formData.taxNumber}
                  onChange={(e) => updateFormData('taxNumber', e.target.value)}
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Business Address
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Street Address *</Label>
                  <Input
                    placeholder="Enter street address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    placeholder="Postal code"
                    value={formData.postalCode}
                    onChange={(e) => updateFormData('postalCode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Please upload clear, legible documents. Accepted formats: PDF, JPG, PNG. Max file size: 10MB.
              </p>
            </div>
            
            {documentCategories.map(({ category, documents }) => (
              <div key={category} className="space-y-3">
                <h3 className="font-medium">{category}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {documents.map(docType => {
                    const hasFile = uploadedDocuments.has(docType);
                    return (
                      <div key={docType} className={`p-4 rounded-lg border-2 border-dashed ${hasFile ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                        {hasFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium text-sm">{DOCUMENT_LABELS[docType]}</p>
                                <p className="text-xs text-muted-foreground">{uploadedDocuments.get(docType)?.name}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveDocument(docType)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(docType, file);
                              }}
                            />
                            <div className="text-center">
                              <UploadCloud className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm font-medium">{DOCUMENT_LABELS[docType]}</p>
                              <p className="text-xs text-muted-foreground">Click to upload</p>
                            </div>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Contact person full name"
                  value={formData.contactName}
                  onChange={(e) => updateFormData('contactName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  placeholder="e.g. Managing Director"
                  value={formData.contactTitle}
                  onChange={(e) => updateFormData('contactTitle', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Work Email *</Label>
                <Input
                  type="email"
                  placeholder="work@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData('contactEmail', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="+234..."
                    value={formData.contactPhone}
                    onChange={(e) => updateFormData('contactPhone', e.target.value)}
                    disabled={formData.phoneVerified}
                  />
                  {formData.phoneVerified ? (
                    <Badge className="bg-green-100 text-green-700">Verified</Badge>
                  ) : (
                    <Button variant="outline" onClick={() => setShowPhoneDialog(true)}>
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Important</p>
                  <p className="text-sm text-yellow-700">
                    The phone number must belong to the contact person. You will receive an OTP to verify ownership.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name *</Label>
                <Input
                  placeholder="e.g. First Bank of Nigeria"
                  value={formData.bankName}
                  onChange={(e) => updateFormData('bankName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Number *</Label>
                <Input
                  placeholder="10-12 digit account number"
                  value={formData.accountNumber}
                  onChange={(e) => updateFormData('accountNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Account Holder Name *</Label>
                <Input
                  placeholder="Name as appears on bank account"
                  value={formData.accountHolderName}
                  onChange={(e) => updateFormData('accountHolderName', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Trade History</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Annual Revenue</Label>
                  <Select value={formData.annualRevenue} onValueChange={(v) => updateFormData('annualRevenue', v)}>
                    <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                    <SelectContent>
                      {revenueRanges.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Export Experience</Label>
                  <Select value={formData.exportExperience} onValueChange={(v) => updateFormData('exportExperience', v)}>
                    <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                    <SelectContent>
                      {experienceRanges.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Video className="h-5 w-5" /> Video KYC Verification
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete a short video call to verify your identity. Our system will match your face with your uploaded ID.
              </p>
              <Button onClick={() => setShowVideoDialog(true)}>
                <Video className="h-4 w-4 mr-2" />
                Schedule Video Call
              </Button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <PenTool className="h-5 w-5" /> Platform Agreement
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                By signing the DIL Platform Agreement, you agree to our terms of service, dispute resolution policy, and commission structure.
              </p>
              <Button variant="outline" onClick={() => setShowAgreementDialog(true)}>
                <FileText className="h-4 w-4 mr-2" />
                View & Sign Agreement
              </Button>
            </div>

            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
              <Checkbox
                id="agreement"
                checked={formData.platformAgreement}
                onCheckedChange={(checked) => updateFormData('platformAgreement', checked)}
              />
              <label htmlFor="agreement" className="text-sm">
                I have read and agree to the DIL Platform Agreement
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

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
            <Badge variant="outline" className="bg-blue-100 text-blue-700">
              {currentTier === 'basic' ? 'Basic Member' : currentTier === 'verified' ? 'Verified' : 'Trade Ready'}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{getStepTitle(currentStep)}</CardTitle>
              <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            </div>
            <Progress value={progressPercent} className="mt-2" />
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            
            <div className="flex items-center justify-between mt-8 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmitApplication} disabled={!canProceed() || isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle2 className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What You'll Unlock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-medium mb-2">Verified Member</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Full matchmaking access</li>
                  <li>✓ Messaging with businesses</li>
                  <li>✓ Purchase subscriptions</li>
                  <li>✓ Event registration</li>
                </ul>
              </div>
              <div className="p-4 bg-gold/10 border border-gold rounded-lg">
                <h4 className="font-medium mb-2">Trade Ready</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Initiate escrow deals</li>
                  <li>✓ Participate in escrow</li>
                  <li>✓ Full Deal Room access</li>
                  <li>✓ Receive payouts</li>
                </ul>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="font-medium mb-2">Trust Badge</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Verified badge on profile</li>
                  <li>✓ Higher match visibility</li>
                  <li>✓ Priority in searches</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone Verification Dialog */}
        <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Phone Number</DialogTitle>
              <DialogDescription>
                We'll send a one-time password (OTP) to your phone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!otpSent ? (
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+234..."
                    value={formData.contactPhone}
                    onChange={(e) => updateFormData('contactPhone', e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <Label>Enter OTP</Label>
                  <Input
                    placeholder="6-digit code"
                    value={formData.phoneOTP}
                    onChange={(e) => updateFormData('phoneOTP', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    For demo, enter any 6-digit code (e.g., 123456)
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              {!otpSent ? (
                <Button onClick={handleSendOTP}>Send OTP</Button>
              ) : (
                <Button onClick={handleVerifyOTP} disabled={isVerifying}>
                  {isVerifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Verify
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Video KYC Dialog */}
        <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Video KYC</DialogTitle>
              <DialogDescription>
                Select a time slot for your video verification call.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(time => (
                  <Button key={time} variant="outline" className="text-sm">
                    {time}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Video call duration: ~10 minutes
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleScheduleVideoKYC}>Confirm Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Agreement Dialog */}
        <Dialog open={showAgreementDialog} onOpenChange={setShowAgreementDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>DIL Platform Agreement</DialogTitle>
            </DialogHeader>
            <div className="h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg text-sm">
              <h4 className="font-medium mb-2">1. Acceptance of Terms</h4>
              <p className="text-muted-foreground mb-4">
                By accessing and using DIL (Direct International Trade) platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <h4 className="font-medium mb-2">2. Business Verification</h4>
              <p className="text-muted-foreground mb-4">
                All businesses must complete KYC verification before engaging in escrow transactions. Verification includes business registration documents, identity verification, and financial background checks.
              </p>
              <h4 className="font-medium mb-2">3. Escrow Services</h4>
              <p className="text-muted-foreground mb-4">
                DIL provides escrow services to protect both buyers and sellers. Funds are released only upon confirmation of delivery or completion of services.
              </p>
              <h4 className="font-medium mb-2">4. Commission & Fees</h4>
              <p className="text-muted-foreground mb-4">
                DIL charges a commission on successful transactions. Standard rate is 2.5%, with discounts for premium members.
              </p>
              <h4 className="font-medium mb-2">5. Dispute Resolution</h4>
              <p className="text-muted-foreground mb-4">
                Any disputes arising from transactions will be handled through our dispute resolution process, including mediation and arbitration.
              </p>
              <h4 className="font-medium mb-2">6. Data Privacy</h4>
              <p className="text-muted-foreground">
                We are committed to protecting your privacy. Your business information will only be shared with verified trade partners.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAgreementDialog(false)}>Close</Button>
              <Button onClick={() => { setFormData(prev => ({ ...prev, platformAgreement: true })); setShowAgreementDialog(false); }}>
                I Accept & Sign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MemberLayout>
  );
}
