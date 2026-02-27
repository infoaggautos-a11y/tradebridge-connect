import { 
  KYCTier, 
  KYCStatus, 
  KYCApplication, 
  KYCDocument, 
  KYC_WORKFLOW,
  KYC_TIER_FEATURES 
} from '@/types/kyc';

const generateId = () => `kyc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const mockKYCApplications: KYCApplication[] = [
  {
    id: 'kyc_001',
    businessId: 'b1',
    currentTier: 'verified',
    targetTier: 'verified',
    status: 'approved',
    documents: [
      {
        id: 'doc_001',
        businessId: 'b1',
        type: 'cac_certificate',
        status: 'verified',
        submittedAt: '2026-01-15T10:00:00Z',
        verifiedAt: '2026-01-16T14:30:00Z',
      },
      {
        id: 'doc_002',
        businessId: 'b1',
        type: 'government_id',
        status: 'verified',
        submittedAt: '2026-01-15T10:00:00Z',
        verifiedAt: '2026-01-16T14:30:00Z',
      },
      {
        id: 'doc_003',
        businessId: 'b1',
        type: 'utility_bill',
        status: 'verified',
        submittedAt: '2026-01-15T10:00:00Z',
        verifiedAt: '2026-01-16T14:30:00Z',
      },
    ],
    contactPerson: {
      fullName: 'Chidi Okonkwo',
      jobTitle: 'Managing Director',
      workEmail: 'info@lagosagroexports.ng',
      phone: '+2348012345678',
      phoneVerified: true,
    },
    businessInfo: {
      companyName: 'Lagos Agro Exports Ltd',
      country: 'Nigeria',
      sector: 'Agriculture & Food',
      registrationNumber: 'RC-1234567',
      taxNumber: 'TIN-9876543',
      address: '15 Marina Road',
      city: 'Lagos',
      state: 'Lagos State',
      postalCode: '101241',
    },
    videoKYCCompleted: false,
    platformAgreementSigned: false,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-16T14:30:00Z',
  },
  {
    id: 'kyc_002',
    businessId: 'b7',
    currentTier: 'basic',
    targetTier: 'verified',
    status: 'pending_review',
    documents: [
      {
        id: 'doc_004',
        businessId: 'b7',
        type: 'business_registration',
        status: 'pending',
        submittedAt: '2026-02-20T09:00:00Z',
      },
    ],
    contactPerson: {
      fullName: 'Adaora Nwosu',
      jobTitle: 'CEO',
      workEmail: 'hello@techbridgeafrica.ng',
      phone: '+2348098765432',
      phoneVerified: true,
    },
    businessInfo: {
      companyName: 'TechBridge Africa',
      country: 'Nigeria',
      sector: 'Technology',
      address: '42 Awolowo Road',
      city: 'Lagos',
      state: 'Lagos State',
    },
    videoKYCCompleted: false,
    platformAgreementSigned: false,
    createdAt: '2026-02-20T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
  },
  {
    id: 'kyc_003',
    businessId: 'b13',
    currentTier: 'basic',
    targetTier: 'verified',
    status: 'additional_info_required',
    documents: [
      {
        id: 'doc_005',
        businessId: 'b13',
        type: 'government_id',
        status: 'rejected',
        submittedAt: '2026-02-18T11:00:00Z',
        rejectionReason: 'Image is blurry. Please upload a clearer photo of your ID.',
      },
    ],
    contactPerson: {
      fullName: 'Emeka Okafor',
      jobTitle: 'Director',
      workEmail: 'info@onitshatrading.ng',
      phone: '+2348034567890',
      phoneVerified: true,
    },
    businessInfo: {
      companyName: 'Onitsha Trading Company',
      country: 'Nigeria',
      sector: 'Manufacturing',
      address: '100 Market Road',
      city: 'Onitsha',
      state: 'Anambra State',
    },
    videoKYCCompleted: false,
    platformAgreementSigned: false,
    reviewerNotes: 'Document rejected: blurry image. Please resubmit.',
    createdAt: '2026-02-18T11:00:00Z',
    updatedAt: '2026-02-19T10:00:00Z',
  },
];

export const kycService = {
  getApplication(businessId: string): KYCApplication | undefined {
    return mockKYCApplications.find(app => app.businessId === businessId);
  },

  getAllApplications(): KYCApplication[] {
    return mockKYCApplications;
  },

  getPendingApplications(): KYCApplication[] {
    return mockKYCApplications.filter(
      app => app.status === 'pending_review' || app.status === 'in_review'
    );
  },

  getApplicationById(id: string): KYCApplication | undefined {
    return mockKYCApplications.find(app => app.id === id);
  },

  getWorkflowForTier(tier: KYCTier): typeof KYC_WORKFLOW {
    return KYC_WORKFLOW.filter(step => step.tier === tier);
  },

  getFeaturesForTier(tier: KYCTier): string[] {
    return KYC_TIER_FEATURES[tier];
  },

  getNextTier(currentTier: KYCTier): KYCTier {
    const tiers: KYCTier[] = ['guest', 'basic', 'verified', 'trade_ready'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : currentTier;
  },

  getProgress(application: KYCApplication): { completed: number; total: number; percentage: number } {
    const workflow = this.getWorkflowForTier(application.targetTier);
    const submittedDocs = application.documents.filter(d => d.status !== 'rejected');
    return {
      completed: submittedDocs.length,
      total: workflow.length,
      percentage: Math.round((submittedDocs.length / workflow.length) * 100),
    };
  },

  createApplication(
    businessId: string,
    data: Partial<KYCApplication>
  ): KYCApplication {
    const newApplication: KYCApplication = {
      id: generateId(),
      businessId,
      currentTier: 'basic',
      targetTier: 'verified',
      status: 'not_started',
      documents: [],
      contactPerson: data.contactPerson || {
        fullName: '',
        jobTitle: '',
        workEmail: '',
        phone: '',
        phoneVerified: false,
      },
      businessInfo: data.businessInfo || {
        companyName: '',
        country: '',
        sector: '',
        address: '',
        city: '',
      },
      videoKYCCompleted: false,
      platformAgreementSigned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockKYCApplications.push(newApplication);
    return newApplication;
  },

  submitDocument(
    applicationId: string,
    document: Omit<KYCDocument, 'id'>
  ): KYCDocument | null {
    const app = mockKYCApplications.find(a => a.id === applicationId);
    if (!app) return null;

    const newDoc: KYCDocument = {
      ...document,
      id: generateId(),
    };
    app.documents.push(newDoc);
    app.status = 'pending_review';
    app.updatedAt = new Date().toISOString();
    return newDoc;
  },

  verifyDocument(
    applicationId: string,
    documentId: string,
    approved: boolean,
    reason?: string
  ): KYCApplication | null {
    const app = mockKYCApplications.find(a => a.id === applicationId);
    if (!app) return null;

    const doc = app.documents.find(d => d.id === documentId);
    if (!doc) return null;

    if (approved) {
      doc.status = 'verified';
      doc.verifiedAt = new Date().toISOString();
    } else {
      doc.status = 'rejected';
      doc.rejectionReason = reason || 'Document verification failed';
    }

    const allDocsVerified = app.documents.every(d => d.status === 'verified');
    if (allDocsVerified) {
      app.status = 'approved';
      app.currentTier = app.targetTier;
      app.reviewedAt = new Date().toISOString();
    }

    app.updatedAt = new Date().toISOString();
    return app;
  },

  approveApplication(
    applicationId: string,
    notes?: string
  ): KYCApplication | null {
    const app = mockKYCApplications.find(a => a.id === applicationId);
    if (!app) return null;

    app.status = 'approved';
    app.currentTier = app.targetTier;
    app.reviewerNotes = notes;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();
    return app;
  },

  rejectApplication(
    applicationId: string,
    reason: string
  ): KYCApplication | null {
    const app = mockKYCApplications.find(a => a.id === applicationId);
    if (!app) return null;

    app.status = 'rejected';
    app.reviewerNotes = reason;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();
    return app;
  },

  requestAdditionalInfo(
    applicationId: string,
    message: string
  ): KYCApplication | null {
    const app = mockKYCApplications.find(a => a.id === applicationId);
    if (!app) return null;

    app.status = 'additional_info_required';
    app.reviewerNotes = message;
    app.updatedAt = new Date().toISOString();
    return app;
  },
};
