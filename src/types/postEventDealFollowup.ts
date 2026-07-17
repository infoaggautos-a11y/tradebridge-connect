export type PostEventDealFollowupStatus = 
  | 'new_lead'
  | 'contacted'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export type MeetingOutcome = 
  | 'meeting_scheduled'
  | 'meeting_completed'
  | 'meeting_cancelled'
  | 'no_response'
  | 'rescheduled'
  | 'virtual_meeting'
  | 'in_person';

export interface PostEventDealFollowup {
  id: string;
  registrationId: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  company: string;
  companyContact: string;
  status: PostEventDealFollowupStatus;
  dealValue: number;
  dealCurrency: string;
  dealType: 'goods' | 'services' | 'digital' | 'mixed';
  matchId: string;
  followUpOwner: string;
  nextActionDate: string;
  nextActionType: 'call' | 'email' | 'meeting' | 'proposal' | 'visit';
  meetingOutcome?: MeetingOutcome;
  meetingDate?: string;
  meetingNotes?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  lastActionBy?: string;
  lastActionDate?: string;
}

export type PostEventDealFollowupFilter = {
  status?: PostEventDealFollowupStatus;
  eventId?: string;
  registrationId?: string;
  followUpOwner?: string;
  dateRange?: {
    start: string;
    end: string;
  };
};

export const POST_EVENT_FOLLOWUP_STATUS_LABELS: Record<PostEventDealFollowupStatus, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const MEETING_OUTCOME_LABELS: Record<MeetingOutcome, string> = {
  meeting_scheduled: 'Meeting Scheduled',
  meeting_completed: 'Meeting Completed',
  meeting_cancelled: 'Meeting Cancelled',
  no_response: 'No Response',
  rescheduled: 'Rescheduled',
  virtual_meeting: 'Virtual Meeting',
  in_person: 'In-Person Meeting',
};

export const NEXT_ACTION_TYPE_LABELS: Record<PostEventDealFollowup['nextActionType'], string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
  proposal: 'Send Proposal',
  visit: 'Site Visit',
};

export const POST_EVENT_DEAL_TYPES: Array<{value: PostEventDealFollowup['dealType']; label: string}> = [
  { value: 'goods', label: 'Goods' },
  { value: 'services', label: 'Services' },
  { value: 'digital', label: 'Digital Products' },
  { value: 'mixed', label: 'Mixed (Goods + Services)' },
];
