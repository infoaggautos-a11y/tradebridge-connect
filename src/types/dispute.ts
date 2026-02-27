export type DisputeCategory = 'payment' | 'fulfilment' | 'fraud';
export type DisputeStatus = 
  | 'initiated'
  | 'automated_mediation'
  | 'dil_mediation'
  | 'binding_arbitration'
  | 'resolved'
  | 'closed';

export type DisputeResolution = 
  | 'full_release_to_seller'
  | 'full_refund_to_buyer'
  | 'negotiated_split'
  | 'pending';

export type EvidenceType = 
  | 'bill_of_lading'
  | 'packing_list'
  | 'quality_inspection'
  | 'delivery_confirmation'
  | 'signed_milestone'
  | 'email_confirmation'
  | 'deliverable_files'
  | 'time_logs'
  | 'access_logs'
  | 'download_records'
  | 'written_acceptance'
  | 'payment_receipt'
  | 'communication_logs'
  | 'photos'
  | 'other';

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  submittedBy: string;
  type: EvidenceType;
  fileUrl?: string;
  description: string;
  submittedAt: string;
}

export interface DisputeQuestionnaire {
  id: string;
  disputeId: string;
  respondentId: string;
  question: string;
  answer: string;
  submittedAt: string;
}

export interface DisputeMediationSession {
  id: string;
  disputeId: string;
  mediatorId: string;
  partyId: string;
  scheduledAt: string;
  duration: number;
  meetingLink?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Dispute {
  id: string;
  caseNumber: string;
  dealId: string;
  initiatorId: string;
  respondentId: string;
  category: DisputeCategory;
  status: DisputeStatus;
  title: string;
  description: string;
  amount: number;
  currency: string;
  evidence: DisputeEvidence[];
  questionnaires: DisputeQuestionnaire[];
  mediationSessions: DisputeMediationSession[];
  resolution?: DisputeResolution;
  resolutionAmount?: number;
  resolutionNotes?: string;
  arbitratorId?: string;
  arbitratorDecision?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaDeadline?: string;
  daysElapsed: number;
}

export interface DisputeFilters {
  status?: DisputeStatus;
  category?: DisputeCategory;
  assignedMediator?: string;
  daysElapsed?: number;
}

export const DISPUTE_CATEGORY_LABELS: Record<DisputeCategory, string> = {
  payment: 'Payment Dispute',
  fulfilment: 'Fulfilment Dispute',
  fraud: 'Fraud Dispute',
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  initiated: 'Dispute Initiated',
  automated_mediation: 'Automated Mediation',
  dil_mediation: 'DIL Mediation',
  binding_arbitration: 'Binding Arbitration',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const DISPUTE_RESOLUTION_LABELS: Record<DisputeResolution, string> = {
  full_release_to_seller: 'Full Release to Seller',
  full_refund_to_buyer: 'Full Refund to Buyer',
  negotiated_split: 'Negotiated Split',
  pending: 'Pending Resolution',
};

export const EVIDENCE_REQUIREMENTS: Record<DisputeCategory, EvidenceType[]> = {
  payment: ['payment_receipt', 'bank_statement', 'communication_logs'],
  fulfilment: ['bill_of_lading', 'packing_list', 'quality_inspection', 'delivery_confirmation', 'photos'],
  fraud: ['business_registration', 'government_id', 'communication_logs', 'payment_receipt'],
};

export const SLA_TIMELINES: Record<DisputeStatus, number> = {
  initiated: 2,
  automated_mediation: 3,
  dil_mediation: 5,
  binding_arbitration: 10,
  resolved: 0,
  closed: 0,
};
