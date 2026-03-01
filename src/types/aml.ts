export type AMLRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type AMLCheckType = 'business' | 'individual' | 'sanctions' | 'pep' | 'full';
export type AMLCheckResult = 'approved' | 'rejected' | 'pending' | 'flagged';

export interface AMLCheck {
  id: string;
  userId: string;
  type: AMLCheckType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: AMLCheckResult;
  riskLevel: AMLRiskLevel;
  checkedAt: string;
  expiresAt?: string;
  details: {
    businessName?: string;
    individualName?: string;
    dateOfBirth?: string;
    registrationNumber?: string;
    country?: string;
    address?: string;
    directors?: { name: string; nationality: string; dateOfBirth?: string }[];
    verificationScore?: number;
    documentsVerified?: string[];
    missingDocuments?: string[];
    sanctionsMatch?: boolean;
    pepMatch?: boolean;
    adverseMedia?: boolean;
    matches?: SanctionsMatch[];
    listsChecked?: string[];
  };
  providerReference?: string;
}

export interface AMLScreeningResult {
  isMatch: boolean;
  riskScore: AMLRiskLevel;
  matches: SanctionsMatch[];
  listsChecked: string[];
}

export interface SanctionsMatch {
  listName: string;
  matchScore: number;
  matchedName: string;
  reason: string;
  address?: string;
  dateOfBirth?: string;
  country?: string;
}

export interface BusinessVerification {
  isVerified: boolean;
  verificationScore: number;
  riskScore: AMLRiskLevel;
  documentsVerified: string[];
  missingDocuments: string[];
  notes?: string;
}

export interface PEPMatch {
  name: string;
  position: string;
  country: string;
  riskLevel: string;
  relationship: string;
  since?: string;
}

export interface AdverseMediaArticle {
  title: string;
  source: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  summary?: string;
}

export interface AMLReport {
  id: string;
  userId: string;
  generatedAt: string;
  checks: AMLCheck[];
  overallRisk: AMLRiskLevel;
  recommendation: 'approve' | 'review' | 'reject';
  nextReviewDate: string;
}

export const AML_RISK_LABELS: Record<AMLRiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

export const AML_CHECK_TYPE_LABELS: Record<AMLCheckType, string> = {
  business: 'Business Verification',
  individual: 'Individual Verification',
  sanctions: 'Sanctions Screening',
  pep: 'PEP Search',
  full: 'Full AML Check',
};

export const getRiskColor = (risk: AMLRiskLevel): string => {
  switch (risk) {
    case 'low': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'high': return 'text-orange-600';
    case 'critical': return 'text-red-600';
  }
};
