import { TMOSApplicationPayload, TMOSDocumentReadiness, TMOSScoreBreakdown, TMOSWorkflowStage } from '@/types/tmos';

const hasText = (value?: string) => Boolean(value && value.trim().length > 1);

const scoreExportReadiness = (payload: TMOSApplicationPayload) => {
  let score = 0;
  if (payload.exportExperience === 'active_exporter') score += 12;
  if (payload.exportExperience === 'previous_exporter') score += 9;
  if (payload.exportExperience === 'export_ready') score += 6;
  if (hasText(payload.certifications)) score += 5;
  if (hasText(payload.companyProfileUrl)) score += 3;
  return Math.min(score, 20);
};

const scoreCompanyCapacity = (payload: TMOSApplicationPayload) => {
  const employeeScore: Record<string, number> = {
    '1-10': 3,
    '10-25': 6,
    '25-50': 9,
    '50-100': 12,
    '100+': 15,
  };
  return employeeScore[payload.employeeCount || ''] || 4;
};

const scoreFinancialCapacity = (payload: TMOSApplicationPayload) => {
  const turnoverScore: Record<string, number> = {
    under_50k: 5,
    '50k_250k': 10,
    '250k_1m': 15,
    above_1m: 20,
  };
  return turnoverScore[payload.annualTurnover || ''] || 6;
};

const scoreIntentClarity = (payload: TMOSApplicationPayload) => {
  let score = 0;
  if (hasText(payload.businessObjective)) score += 8;
  if ((payload.lookingFor || []).length > 0) score += 6;
  if (hasText(payload.targetCountries)) score += 3;
  if (hasText(payload.expectedMeetings)) score += 3;
  return Math.min(score, 20);
};

const scoreProductQuality = (payload: TMOSApplicationPayload) => {
  let score = 0;
  if (hasText(payload.productService)) score += 10;
  if (hasText(payload.sector)) score += 5;
  if (hasText(payload.certifications)) score += 5;
  if (hasText(payload.companyProfileUrl)) score += 5;
  return Math.min(score, 25);
};

export function calculateTMOSScore(payload: TMOSApplicationPayload) {
  const breakdown: TMOSScoreBreakdown = {
    exportReadiness: scoreExportReadiness(payload),
    companyCapacity: scoreCompanyCapacity(payload),
    financialCapacity: scoreFinancialCapacity(payload),
    intentClarity: scoreIntentClarity(payload),
    productQuality: scoreProductQuality(payload),
    outcome: 'needs_review',
  };

  const total =
    breakdown.exportReadiness +
    breakdown.companyCapacity +
    breakdown.financialCapacity +
    breakdown.intentClarity +
    breakdown.productQuality;

  breakdown.outcome =
    total >= 75 ? 'accepted' :
    total >= 55 ? 'needs_review' :
    total >= 40 ? 'waitlisted' :
    'rejected';

  return { total, breakdown };
}

export function stageToLegacyStatus(stage: TMOSWorkflowStage) {
  if (stage === 'accepted' || stage === 'qualified') return 'confirmed';
  if (stage === 'rejected') return 'cancelled';
  return 'pending';
}

export function calculateDocumentReadiness(readiness?: TMOSDocumentReadiness) {
  const required = [
    Boolean(readiness?.passportReady),
    Boolean(readiness?.companyProfileReady),
  ];
  const optional = [
    Boolean(readiness?.productCatalogueReady),
    Boolean(readiness?.certificationReady),
  ];
  const requiredReady = required.filter(Boolean).length;
  const optionalReady = optional.filter(Boolean).length;
  const totalReady = requiredReady + optionalReady;

  return {
    requiredReady,
    requiredTotal: required.length,
    optionalReady,
    optionalTotal: optional.length,
    totalReady,
    total: required.length + optional.length,
    complete: requiredReady === required.length,
  };
}
