import { 
  Dispute, 
  DisputeCategory, 
  DisputeStatus,
  DisputeResolution,
  DisputeEvidence,
  DisputeQuestionnaire,
  EVIDENCE_REQUIREMENTS,
  SLA_TIMELINES 
} from '@/types/dispute';

const generateId = () => `disp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateCaseNumber = () => `DIL-${Date.now().toString(36).toUpperCase()}`;

const mockDisputes: Dispute[] = [
  {
    id: 'disp_001',
    caseNumber: 'DIL-20260215-A1',
    dealId: 'deal_001',
    initiatorId: 'b1',
    respondentId: 'b2',
    category: 'fulfilment',
    status: 'dil_mediation',
    title: 'Shipment Quality Not As Agreed',
    description: 'The buyer claims the shipment quality does not match the agreed specifications. The olive oil delivered has a different viscosity than the samples provided during negotiation.',
    amount: 25000,
    currency: 'USD',
    evidence: [
      {
        id: 'ev_001',
        disputeId: 'disp_001',
        submittedBy: 'b1',
        type: 'quality_inspection',
        description: 'Independent quality inspection report showing deviation from specifications',
        submittedAt: '2026-02-15T10:00:00Z',
      },
      {
        id: 'ev_002',
        disputeId: 'disp_001',
        submittedBy: 'b2',
        type: 'bill_of_lading',
        description: 'Bill of lading showing proper handling and temperature control',
        submittedAt: '2026-02-16T14:00:00Z',
      },
    ],
    questionnaires: [
      {
        id: 'q_001',
        disputeId: 'disp_001',
        respondentId: 'b1',
        question: 'What did you agree to in the original deal?',
        answer: 'Extra virgin olive oil with acidity level below 0.4%. The delivered product tested at 0.8% acidity.',
        submittedAt: '2026-02-15T12:00:00Z',
      },
      {
        id: 'q_002',
        disputeId: 'disp_001',
        respondentId: 'b2',
        question: 'What did you agree to in the original deal?',
        answer: 'Premium olive oil suitable for cooking. No specific acidity was agreed upon in the contract.',
        submittedAt: '2026-02-16T09:00:00Z',
      },
    ],
    mediationSessions: [
      {
        id: 'med_001',
        disputeId: 'disp_001',
        mediatorId: 'admin_001',
        partyId: 'b1',
        scheduledAt: '2026-02-20T10:00:00Z',
        duration: 30,
        status: 'completed',
        notes: 'Buyer confirmed they have independent lab test results showing the quality issue.',
      },
    ],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-19T15:00:00Z',
    daysElapsed: 4,
    slaDeadline: '2026-02-22T08:00:00Z',
  },
  {
    id: 'disp_002',
    caseNumber: 'DIL-20260218-B2',
    dealId: 'deal_002',
    initiatorId: 'b5',
    respondentId: 'b9',
    category: 'payment',
    status: 'automated_mediation',
    title: 'Payment Not Received',
    description: 'Seller claims they have not received payment for the completed shipment. Buyer states payment was made 5 days ago.',
    amount: 15000,
    currency: 'EUR',
    evidence: [
      {
        id: 'ev_003',
        disputeId: 'disp_002',
        submittedBy: 'b5',
        type: 'payment_receipt',
        description: 'Bank transfer confirmation showing payment of €15,000',
        submittedAt: '2026-02-18T09:00:00Z',
      },
    ],
    questionnaires: [],
    mediationSessions: [],
    createdAt: '2026-02-18T08:00:00Z',
    updatedAt: '2026-02-18T09:00:00Z',
    daysElapsed: 2,
    slaDeadline: '2026-02-21T08:00:00Z',
  },
  {
    id: 'disp_003',
    caseNumber: 'DIL-20260210-C3',
    dealId: 'deal_003',
    initiatorId: 'b8',
    respondentId: 'b6',
    category: 'fraud',
    status: 'binding_arbitration',
    title: 'Suspected Fraudulent Activity',
    description: 'Buyer suspects the seller was misrepresenting their company capabilities and identity. Several red flags identified during due diligence.',
    amount: 75000,
    currency: 'USD',
    evidence: [
      {
        id: 'ev_004',
        disputeId: 'disp_003',
        submittedBy: 'b8',
        type: 'business_registration' as const,
        description: 'Registration documents obtained showing different directors than claimed',
        submittedAt: '2026-02-10T11:00:00Z',
      },
    ],
    questionnaires: [],
    mediationSessions: [],
    arbitratorId: 'arb_001',
    arbitratorDecision: 'Under review',
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
    daysElapsed: 8,
    slaDeadline: '2026-02-20T08:00:00Z',
  },
];

export const disputeService = {
  getDispute(id: string): Dispute | undefined {
    return mockDisputes.find(d => d.id === id);
  },

  getAllDisputes(): Dispute[] {
    return mockDisputes;
  },

  getDisputesByBusiness(businessId: string): Dispute[] {
    return mockDisputes.filter(
      d => d.initiatorId === businessId || d.respondentId === businessId
    );
  },

  getDisputesByStatus(status: DisputeStatus): Dispute[] {
    return mockDisputes.filter(d => d.status === status);
  },

  getDisputesByCategory(category: DisputeCategory): Dispute[] {
    return mockDisputes.filter(d => d.category === category);
  },

  getRequiredEvidence(category: DisputeCategory): string[] {
    return EVIDENCE_REQUIREMENTS[category];
  },

  createDispute(data: {
    dealId: string;
    initiatorId: string;
    respondentId: string;
    category: DisputeCategory;
    title: string;
    description: string;
    amount: number;
    currency: string;
  }): Dispute {
    const newDispute: Dispute = {
      id: generateId(),
      caseNumber: generateCaseNumber(),
      ...data,
      status: 'initiated',
      evidence: [],
      questionnaires: [],
      mediationSessions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      daysElapsed: 0,
      slaDeadline: new Date(Date.now() + SLA_TIMELINES.initiated * 24 * 60 * 60 * 1000).toISOString(),
    };
    mockDisputes.push(newDispute);
    return newDispute;
  },

  submitEvidence(
    disputeId: string,
    data: Omit<DisputeEvidence, 'id' | 'disputeId' | 'submittedAt'>
  ): Dispute | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    const newEvidence: DisputeEvidence = {
      ...data,
      id: generateId(),
      disputeId,
      submittedAt: new Date().toISOString(),
    };
    dispute.evidence.push(newEvidence);
    dispute.updatedAt = new Date().toISOString();
    return dispute;
  },

  submitQuestionnaire(
    disputeId: string,
    respondentId: string,
    answers: { question: string; answer: string }[]
  ): Dispute | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    const questionnaires: DisputeQuestionnaire[] = answers.map((q, i) => ({
      id: generateId(),
      disputeId,
      respondentId,
      question: q.question,
      answer: q.answer,
      submittedAt: new Date().toISOString(),
    }));
    dispute.questionnaires.push(...questionnaires);
    dispute.updatedAt = new Date().toISOString();
    return dispute;
  },

  attemptAutomatedResolution(disputeId: string): DisputeResolution | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    const initiatorResponse = dispute.questionnaires.find(q => q.respondentId === dispute.initiatorId);
    const respondentResponse = dispute.questionnaires.find(q => q.respondentId === dispute.respondentId);

    if (initiatorResponse && respondentResponse) {
      const keyTerms = ['agree', 'accept', 'refund', 'release', 'quality', 'payment'];
      const initiatorTerms = keyTerms.filter(t => initiatorResponse.answer.toLowerCase().includes(t));
      const respondentTerms = keyTerms.filter(t => respondentResponse.answer.toLowerCase().includes(t));
      const overlap = initiatorTerms.filter(t => respondentTerms.includes(t));

      if (overlap.length >= 2) {
        dispute.status = 'resolved';
        dispute.resolution = 'negotiated_split';
        dispute.resolutionAmount = dispute.amount * 0.5;
        dispute.resolutionNotes = 'Automated resolution: 50/50 split agreed by both parties';
        dispute.resolvedAt = new Date().toISOString();
        dispute.updatedAt = new Date().toISOString();
        return 'negotiated_split';
      }
    }

    dispute.status = 'automated_mediation';
    dispute.updatedAt = new Date().toISOString();
    return null;
  },

  escalateToMediation(disputeId: string): Dispute | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    dispute.status = 'dil_mediation';
    dispute.slaDeadline = new Date(Date.now() + SLA_TIMELINES.dil_mediation * 24 * 60 * 60 * 1000).toISOString();
    dispute.updatedAt = new Date().toISOString();
    return dispute;
  },

  scheduleMediation(
    disputeId: string,
    mediatorId: string,
    partyId: string,
    scheduledAt: string
  ): Dispute | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    dispute.mediationSessions.push({
      id: generateId(),
      disputeId,
      mediatorId,
      partyId,
      scheduledAt,
      duration: 30,
      status: 'scheduled',
    });
    dispute.updatedAt = new Date().toISOString();
    return dispute;
  },

  proposeResolution(
    disputeId: string,
    resolution: DisputeResolution,
    amount?: number,
    notes?: string
  ): Dispute | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    dispute.resolution = resolution;
    dispute.resolutionAmount = amount;
    dispute.resolutionNotes = notes;
    dispute.updatedAt = new Date().toISOString();
    return dispute;
  },

  acceptResolution(disputeId: string, partyId: string): Dispute | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute || !dispute.resolution) return null;

    dispute.status = 'resolved';
    dispute.resolvedAt = new Date().toISOString();
    dispute.updatedAt = new Date().toISOString();
    return dispute;
  },

  rejectResolution(disputeId: string): Dispute | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    dispute.status = 'binding_arbitration';
    dispute.slaDeadline = new Date(Date.now() + SLA_TIMELINES.binding_arbitration * 24 * 60 * 60 * 1000).toISOString();
    dispute.updatedAt = new Date().toISOString();
    return dispute;
  },

  bindingArbitration(
    disputeId: string,
    arbitratorId: string,
    decision: DisputeResolution,
    amount?: number,
    notes?: string
  ): Dispute | null {
    const dispute = mockDisputes.find(d => d.id === disputeId);
    if (!dispute) return null;

    dispute.status = 'resolved';
    dispute.arbitratorId = arbitratorId;
    dispute.arbitratorDecision = decision;
    dispute.resolution = decision;
    dispute.resolutionAmount = amount;
    dispute.resolutionNotes = notes;
    dispute.resolvedAt = new Date().toISOString();
    dispute.updatedAt = new Date().toISOString();
    return dispute;
  },

  getActiveDisputesCount(): number {
    return mockDisputes.filter(d => d.status !== 'resolved' && d.status !== 'closed').length;
  },

  getDisputesByDaysElapsed(): { range: string; count: number }[] {
    const ranges = [
      { label: '0-2 days', min: 0, max: 2 },
      { label: '3-5 days', min: 3, max: 5 },
      { label: '6-10 days', min: 6, max: 10 },
      { label: '10+ days', min: 11, max: Infinity },
    ];

    return ranges.map(range => ({
      range: range.label,
      count: mockDisputes.filter(
        d => d.daysElapsed >= range.min && d.daysElapsed <= range.max
      ).length,
    }));
  },
};
