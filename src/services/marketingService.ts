import { Campaign, AutomationWorkflow, CampaignMetric, AudienceStats, EmailTemplate, CampaignStatus, TriggerType, AudienceSegment } from '@/types/marketing';

export const emailTemplates: EmailTemplate[] = [
  {
    id: 't1',
    name: 'Welcome Email',
    subject: 'Welcome to DIL Trade Bridge!',
    body: 'Dear {{name}},\n\nWelcome to DIL Trade Bridge! We are excited to have you join our global trade network.\n\nGet started by:\n1. Completing your business profile\n2. Exploring potential trade partners\n3. Upgrading to access premium features\n\nBest regards,\nThe DIL Team',
    variables: ['name', 'company'],
  },
  {
    id: 't2',
    name: 'New Match Alert',
    subject: 'You have a new trade match!',
    body: 'Dear {{name}},\n\nGreat news! We\'ve found a new trade partner that matches your business profile.\n\n{{match_details}}\n\nReady to connect? Click below to start a conversation.\n\nBest regards,\nThe DIL Team',
    variables: ['name', 'match_details'],
  },
  {
    id: 't3',
    name: 'Event Reminder',
    subject: 'Reminder: {{event_name}} is coming up!',
    body: 'Dear {{name}},\n\nJust a friendly reminder that {{event_name}} is happening on {{event_date}}.\n\nDon\'t miss out on this great opportunity to connect with industry leaders and expand your network.\n\nBest regards,\nThe DIL Team',
    variables: ['name', 'event_name', 'event_date'],
  },
  {
    id: 't4',
    name: 'Subscription Renewal',
    subject: 'Your DIL subscription is about to renew',
    body: 'Dear {{name}},\n\nYour {{plan_name}} subscription will automatically renew on {{renewal_date}}.\n\nYour current benefits include:\n{{benefits}}\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nThe DIL Team',
    variables: ['name', 'plan_name', 'renewal_date', 'benefits'],
  },
  {
    id: 't5',
    name: 'Inactive Member Re-engagement',
    subject: 'We miss you, {{name}}!',
    body: 'Dear {{name}},\n\nIt\'s been a while since you\'ve been active on DIL Trade Bridge. We\'ve missed you!\n\nHere\'s what you might have missed:\n- {{new_matches}} new potential partners\n- {{upcoming_events}} upcoming events\n- {{market_updates}} market intelligence updates\n\nCome back and see what\'s new!\n\nBest regards,\nThe DIL Team',
    variables: ['name', 'new_matches', 'upcoming_events', 'market_updates'],
  },
];

export const campaigns: Campaign[] = [
  { id: 'c1', name: 'February Newsletter', subject: 'February Trade Intelligence Report', status: 'completed', audience: 'all_members', sentAt: '2026-02-15', recipients: 1250, opens: 687, clicks: 234, conversions: 45, createdAt: '2026-02-10' },
  { id: 'c2', name: 'Nigeria-Italy Summit Promo', subject: 'Register Now: Nigeria-Italy Trade Summit 2026', status: 'active', audience: 'verified_businesses', recipients: 456, opens: 298, clicks: 156, conversions: 78, createdAt: '2026-02-20' },
  { id: 'c3', name: 'Growth Plan Upgrade Campaign', subject: 'Unlock More Trade Opportunities with Growth', status: 'active', audience: 'free_members', trigger: 'subscription_upgrade', recipients: 890, opens: 423, clicks: 189, conversions: 34, createdAt: '2026-02-18' },
  { id: 'c4', name: 'Re-engagement: Inactive Members', subject: 'We miss you!', status: 'scheduled', audience: 'inactive_30_days', trigger: 'inactive_member', scheduledAt: '2026-03-01', recipients: 234, opens: 0, clicks: 0, conversions: 0, createdAt: '2026-02-25' },
  { id: 'c5', name: 'Event: West Africa AgriTech', subject: 'Join Our AgriTech Workshop', status: 'draft', audience: 'all_members', recipients: 0, opens: 0, clicks: 0, conversions: 0, createdAt: '2026-02-26' },
];

export const workflows: AutomationWorkflow[] = [
  {
    id: 'w1',
    name: 'New Member Onboarding',
    trigger: 'signup',
    isActive: true,
    createdAt: '2026-01-15',
    steps: [
      { id: 's1', type: 'email', config: { templateId: 't1', delay: 0 } },
      { id: 's2', type: 'wait', config: { days: 3 } },
      { id: 's3', type: 'email', config: { templateId: 't2', delay: 0 } },
    ],
  },
  {
    id: 'w2',
    name: 'Match Notification',
    trigger: 'deal_milestone',
    isActive: true,
    createdAt: '2026-01-20',
    steps: [
      { id: 's1', type: 'email', config: { templateId: 't2', delay: 0 } },
    ],
  },
  {
    id: 'w3',
    name: 'Inactive Member Re-engagement',
    trigger: 'inactive_member',
    isActive: true,
    createdAt: '2026-02-01',
    steps: [
      { id: 's1', type: 'wait', config: { days: 30 } },
      { id: 's2', type: 'email', config: { templateId: 't5', delay: 0 } },
      { id: 's3', type: 'wait', config: { days: 7 } },
      { id: 's4', type: 'condition', config: { field: 'opened_email', value: true } },
    ],
  },
];

export const audienceStats: AudienceStats = {
  totalMembers: 2847,
  activeMembers: 1923,
  freeMembers: 1456,
  paidMembers: 1391,
  verifiedMembers: 2134,
  inactiveMembers: 456,
};

export const campaignMetrics: CampaignMetric[] = [
  { date: '2026-02-20', sent: 890, delivered: 876, opened: 423, clicked: 189, converted: 34 },
  { date: '2026-02-21', sent: 456, delivered: 450, opened: 298, clicked: 156, converted: 78 },
  { date: '2026-02-22', sent: 234, delivered: 230, opened: 145, clicked: 67, converted: 12 },
  { date: '2026-02-23', sent: 1250, delivered: 1234, opened: 687, clicked: 234, converted: 45 },
  { date: '2026-02-24', sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 },
  { date: '2026-02-25', sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 },
  { date: '2026-02-26', sent: 456, delivered: 449, opened: 267, clicked: 123, converted: 28 },
];

export function getTriggerLabel(trigger: TriggerType): string {
  const labels: Record<TriggerType, string> = {
    signup: 'New Signup',
    subscription_upgrade: 'Subscription Upgrade',
    inactive_member: 'Inactive 30 Days',
    event_registration: 'Event Registration',
    deal_milestone: 'Deal Milestone',
    birthday: 'Birthday',
    anniversary: 'Platform Anniversary',
  };
  return labels[trigger];
}

export function getAudienceLabel(audience: AudienceSegment): string {
  const labels: Record<AudienceSegment, string> = {
    all_members: 'All Members',
    free_members: 'Free Members',
    paid_members: 'Paid Members',
    inactive_30_days: 'Inactive 30+ Days',
    verified_businesses: 'Verified Businesses',
    event_attendees: 'Event Attendees',
  };
  return labels[audience];
}

export function getStatusColor(status: CampaignStatus): string {
  const colors: Record<CampaignStatus, string> = {
    draft: 'secondary',
    scheduled: 'outline',
    active: 'default',
    paused: 'warning',
    completed: 'secondary',
  };
  return colors[status];
}
