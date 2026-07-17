export type TMOSWorkflowStage =
  | 'new_registration'
  | 'under_review'
  | 'qualified'
  | 'waitlisted'
  | 'rejected'
  | 'accepted'
  | 'package_selected'
  | 'invoice_generated'
  | 'payment_confirmed'
  | 'document_collection'
  | 'visa_support'
  | 'business_matching'
  | 'meeting_schedule_confirmed'
  | 'travel_confirmed'
  | 'event_attended'
  | 'deal_follow_up';

export type TMOSQualificationOutcome = 'accepted' | 'waitlisted' | 'needs_review' | 'rejected';

export interface TMOSApplicationPayload {
  sector?: string;
  productService?: string;
  annualTurnover?: string;
  employeeCount?: string;
  exportExperience?: string;
  certifications?: string;
  businessObjective?: string;
  lookingFor?: string[];
  targetCountries?: string;
  expectedMeetings?: string;
  companyProfileUrl?: string;
  documentReadiness?: TMOSDocumentReadiness;
}

export interface TMOSScoreBreakdown {
  exportReadiness: number;
  companyCapacity: number;
  financialCapacity: number;
  intentClarity: number;
  productQuality: number;
  outcome: TMOSQualificationOutcome;
}

export const TMOS_STAGE_LABELS: Record<TMOSWorkflowStage, string> = {
  new_registration: 'New Registration',
  under_review: 'Under Review',
  qualified: 'Qualified',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
  accepted: 'Accepted',
  package_selected: 'Package Selected',
  invoice_generated: 'Invoice Generated',
  payment_confirmed: 'Payment Confirmed',
  document_collection: 'Document Collection',
  visa_support: 'Visa Support',
  business_matching: 'Business Matching',
  meeting_schedule_confirmed: 'Meeting Schedule Confirmed',
  travel_confirmed: 'Travel Confirmed',
  event_attended: 'Event Attended',
  deal_follow_up: 'Deal Follow-up',
};

export const TMOS_ADMIN_STAGES: TMOSWorkflowStage[] = [
  'new_registration',
  'under_review',
  'qualified',
  'waitlisted',
  'accepted',
  'document_collection',
  'visa_support',
  'business_matching',
  'meeting_schedule_confirmed',
  'travel_confirmed',
  'event_attended',
  'deal_follow_up',
  'rejected',
];

export type TMOSDocumentStatus = 'not_submitted' | 'submitted' | 'approved' | 'rejected' | 'expired';

export interface TMOSDocumentReadiness {
  passportReady?: boolean;
  companyProfileReady?: boolean;
  productCatalogueReady?: boolean;
  certificationReady?: boolean;
}

export interface TMOSDocumentRequirement {
  code: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface TMOSDelegateDocument {
  id?: string;
  event_registration_id?: string;
  document_code: string;
  label: string;
  status: TMOSDocumentStatus;
  file_url?: string | null;
  file_name?: string | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
}

export interface TMOSMessageLog {
  channel: 'email' | 'whatsapp';
  recipient: string;
  subject?: string | null;
  workflow_stage?: string | null;
  status: 'queued' | 'sent' | 'failed' | 'skipped';
  error_message?: string | null;
  sent_at?: string | null;
}

export const TMOS_DEFAULT_DOCUMENT_REQUIREMENTS: TMOSDocumentRequirement[] = [
  {
    code: 'passport',
    label: 'International Passport',
    required: true,
    description: 'Bio-data page scan with at least six months validity.',
  },
  {
    code: 'company_profile',
    label: 'Company Profile',
    required: true,
    description: 'Short company profile or corporate brochure.',
  },
  {
    code: 'product_catalogue',
    label: 'Product Catalogue',
    required: false,
    description: 'Catalogue, product sheet, or service capability statement.',
  },
  {
    code: 'certifications',
    label: 'Certifications',
    required: false,
    description: 'NAFDAC, ISO, organic, export licence, or other relevant documents.',
  },
];
