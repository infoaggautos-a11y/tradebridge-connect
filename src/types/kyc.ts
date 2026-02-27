export type KYCTier = 'guest' | 'basic' | 'verified' | 'trade_ready';

export type KYCStatus = 
  | 'not_started'
  | 'pending_review'
  | 'in_review'
  | 'additional_info_required'
  | 'approved'
  | 'rejected'
  | 'suspended';

export type DocumentType = 
  | 'cac_certificate'
  | 'chamber_of_commerce'
  | 'business_registration'
  | 'government_id'
  | 'national_id'
  | 'bvn'
  | 'tax_number'
  | 'utility_bill'
  | 'bank_statement'
  | 'video_kyc'
  | 'platform_agreement';

export type VerificationProvider = 'smile_identity' | 'sumsub' | 'manual' | 'dilt';

export interface KYCDocument {
  id: string;
  businessId: string;
  type: DocumentType;
  fileUrl?: string;
  provider?: VerificationProvider;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  submittedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
  metadata?: Record<string, unknown>;
}

export interface KYCApplication {
  id: string;
  businessId: string;
  currentTier: KYCTier;
  targetTier: KYCTier;
  status: KYCStatus;
  documents: KYCDocument[];
  contactPerson: {
    fullName: string;
    jobTitle: string;
    workEmail: string;
    phone: string;
    phoneVerified: boolean;
  };
  businessInfo: {
    companyName: string;
    country: string;
    sector: string;
    registrationNumber?: string;
    taxNumber?: string;
    address: string;
    city: string;
    state?: string;
    postalCode?: string;
  };
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    routingNumber?: string;
    isVerified: boolean;
  };
  videoKYCCompleted: boolean;
  platformAgreementSigned: boolean;
  tradeHistory?: {
    annualRevenue: string;
    exportExperience: string;
    countriesTraded: string[];
    documents: string[];
  };
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KYCWorkflowStep {
  id: string;
  tier: KYCTier;
  order: number;
  title: string;
  description: string;
  requiredDocuments: DocumentType[];
  estimatedTime: string;
  isOptional: boolean;
}

export const KYC_WORKFLOW: KYCWorkflowStep[] = [
  {
    id: 'step-basic-1',
    tier: 'basic',
    order: 1,
    title: 'Create Account',
    description: 'Sign up with your business email and verify your phone number',
    requiredDocuments: [],
    estimatedTime: '2 minutes',
    isOptional: false,
  },
  {
    id: 'step-verified-1',
    tier: 'verified',
    order: 1,
    title: 'Business Registration',
    description: 'Upload your CAC certificate or Chamber of Commerce registration',
    requiredDocuments: ['cac_certificate', 'chamber_of_commerce', 'business_registration'],
    estimatedTime: '5 minutes',
    isOptional: false,
  },
  {
    id: 'step-verified-2',
    tier: 'verified',
    order: 2,
    title: 'Contact Verification',
    description: 'Provide government ID for the primary contact person',
    requiredDocuments: ['government_id', 'national_id'],
    estimatedTime: '3 minutes',
    isOptional: false,
  },
  {
    id: 'step-verified-3',
    tier: 'verified',
    order: 3,
    title: 'Business Address',
    description: 'Verify your business address with a utility bill or bank statement',
    requiredDocuments: ['utility_bill', 'bank_statement'],
    estimatedTime: '2 minutes',
    isOptional: false,
  },
  {
    id: 'step-verified-4',
    tier: 'verified',
    order: 4,
    title: 'Tax Verification',
    description: 'Submit your BVN or national tax number for financial verification',
    requiredDocuments: ['bvn', 'tax_number'],
    estimatedTime: '2 minutes',
    isOptional: false,
  },
  {
    id: 'step-trade-ready-1',
    tier: 'trade_ready',
    order: 1,
    title: 'Video Verification',
    description: 'Complete a live video call for identity verification',
    requiredDocuments: ['video_kyc'],
    estimatedTime: '10 minutes',
    isOptional: false,
  },
  {
    id: 'step-trade-ready-2',
    tier: 'trade_ready',
    order: 2,
    title: 'Bank Account',
    description: 'Connect and verify your business bank account for payouts',
    requiredDocuments: [],
    estimatedTime: '5 minutes',
    isOptional: false,
  },
  {
    id: 'step-trade-ready-3',
    tier: 'trade_ready',
    order: 3,
    title: 'Trade History',
    description: 'Provide proof of trading history - bank statements or export certificates',
    requiredDocuments: [],
    estimatedTime: '10 minutes',
    isOptional: false,
  },
  {
    id: 'step-trade-ready-4',
    tier: 'trade_ready',
    order: 4,
    title: 'Platform Agreement',
    description: 'Sign the DIL Platform Agreement electronically',
    requiredDocuments: ['platform_agreement'],
    estimatedTime: '5 minutes',
    isOptional: false,
  },
];

export const KYC_TIER_FEATURES: Record<KYCTier, string[]> = {
  guest: [
    'Browse public business directory',
    'Read trade guides',
    'View event listings',
  ],
  basic: [
    'All Guest features',
    'Create draft business profile',
    'Browse trade matches',
    'Send one introduction request',
  ],
  verified: [
    'All Basic features',
    'Full matchmaking access',
    'Messaging with other businesses',
    'Purchase subscriptions',
    'Event registration',
  ],
  trade_ready: [
    'All Verified features',
    'Initiate escrow deals',
    'Participate in escrow deals',
    'Full Deal Room access',
    'Receive payouts',
  ],
};

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  cac_certificate: 'CAC Certificate (Nigeria)',
  chamber_of_commerce: 'Chamber of Commerce Registration',
  business_registration: 'Business Registration Certificate',
  government_id: 'Government-issued ID',
  national_id: 'National ID Card',
  bvn: 'Bank Verification Number (BVN)',
  tax_number: 'Tax Identification Number (TIN)',
  utility_bill: 'Utility Bill (Electricity/Water)',
  bank_statement: 'Bank Statement (Last 3 months)',
  video_kyc: 'Video KYC Verification',
  platform_agreement: 'DIL Platform Agreement',
};
