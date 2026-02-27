export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type TriggerType = 'signup' | 'subscription_upgrade' | 'inactive_member' | 'event_registration' | 'deal_milestone' | 'birthday' | 'anniversary';
export type AudienceSegment = 'all_members' | 'free_members' | 'paid_members' | 'inactive_30_days' | 'verified_businesses' | 'event_attendees';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  audience: AudienceSegment;
  trigger?: TriggerType;
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  opens: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: TriggerType;
  steps: AutomationStep[];
  isActive: boolean;
  createdAt: string;
}

export interface AutomationStep {
  id: string;
  type: 'email' | 'wait' | 'condition' | 'action';
  config: Record<string, unknown>;
  nextStepId?: string;
}

export interface CampaignMetric {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
}

export interface AudienceStats {
  totalMembers: number;
  activeMembers: number;
  freeMembers: number;
  paidMembers: number;
  verifiedMembers: number;
  inactiveMembers: number;
}
