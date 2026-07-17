import { supabase } from '@/integrations/supabase/client';
import {
  MeetingOutcome,
  PostEventDealFollowup,
  PostEventDealFollowupFilter,
  PostEventDealFollowupStatus,
} from '@/types/postEventDealFollowup';

type FollowupRow = {
  id: string;
  event_registration_id: string | null;
  event_id: string;
  event_title: string;
  attendee_name: string;
  attendee_email: string;
  company: string | null;
  company_contact: string | null;
  status: string;
  deal_value: number;
  deal_currency: string;
  deal_type: string;
  match_id: string | null;
  follow_up_owner: string;
  next_action_date: string | null;
  next_action_type: string;
  meeting_outcome: string | null;
  meeting_date: string | null;
  meeting_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  last_action_date: string | null;
};

const toFollowup = (row: FollowupRow): PostEventDealFollowup => ({
  id: row.id,
  registrationId: row.event_registration_id || '',
  eventId: row.event_id,
  eventTitle: row.event_title,
  attendeeName: row.attendee_name,
  attendeeEmail: row.attendee_email,
  company: row.company || '',
  companyContact: row.company_contact || '',
  status: row.status as PostEventDealFollowupStatus,
  dealValue: Number(row.deal_value || 0),
  dealCurrency: row.deal_currency,
  dealType: row.deal_type as PostEventDealFollowup['dealType'],
  matchId: row.match_id || '',
  followUpOwner: row.follow_up_owner,
  nextActionDate: row.next_action_date || '',
  nextActionType: row.next_action_type as PostEventDealFollowup['nextActionType'],
  meetingOutcome: row.meeting_outcome as MeetingOutcome | undefined,
  meetingDate: row.meeting_date || undefined,
  meetingNotes: row.meeting_notes || undefined,
  notes: row.notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  completedAt: row.completed_at || undefined,
  lastActionDate: row.last_action_date || undefined,
});

const buildQuery = () =>
  supabase
    .from('tmos_deal_followups')
    .select('*')
    .order('next_action_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

export const postEventDealFollowupService = {
  async getFollowup(id: string): Promise<PostEventDealFollowup | undefined> {
    const { data, error } = await supabase.from('tmos_deal_followups').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? toFollowup(data as FollowupRow) : undefined;
  },

  async getAllFollowups(): Promise<PostEventDealFollowup[]> {
    const { data, error } = await buildQuery();
    if (error) throw error;
    return ((data || []) as FollowupRow[]).map(toFollowup);
  },

  async getFollowupsByRegistration(registrationId: string): Promise<PostEventDealFollowup[]> {
    const { data, error } = await buildQuery().eq('event_registration_id', registrationId);
    if (error) throw error;
    return ((data || []) as FollowupRow[]).map(toFollowup);
  },

  async getFollowupsByEvent(eventId: string): Promise<PostEventDealFollowup[]> {
    const { data, error } = await buildQuery().eq('event_id', eventId);
    if (error) throw error;
    return ((data || []) as FollowupRow[]).map(toFollowup);
  },

  async filterFollowups(filters: PostEventDealFollowupFilter): Promise<PostEventDealFollowup[]> {
    let query = buildQuery();
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.eventId) query = query.eq('event_id', filters.eventId);
    if (filters.registrationId) query = query.eq('event_registration_id', filters.registrationId);
    if (filters.followUpOwner) query = query.eq('follow_up_owner', filters.followUpOwner);
    if (filters.dateRange) {
      query = query.gte('created_at', filters.dateRange.start).lte('created_at', filters.dateRange.end);
    }
    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as FollowupRow[]).map(toFollowup);
  },

  async createPostEventFollowup(data: {
    registrationId: string;
    eventId: string;
    eventTitle?: string;
    matchId?: string;
    dealValue: number;
    dealCurrency: string;
    dealType?: PostEventDealFollowup['dealType'];
    followUpOwner?: string;
    nextActionDate?: string;
    nextActionType?: PostEventDealFollowup['nextActionType'];
    notes?: string;
    meetingDate?: string;
    meetingOutcome?: MeetingOutcome;
    meetingNotes?: string;
    attendeeName?: string;
    attendeeEmail?: string;
    company?: string;
    companyContact?: string;
  }): Promise<PostEventDealFollowup> {
    const { data: inserted, error } = await supabase
      .from('tmos_deal_followups')
      .insert({
        event_registration_id: data.registrationId || null,
        event_id: data.eventId,
        event_title: data.eventTitle || '',
        attendee_name: data.attendeeName || '',
        attendee_email: data.attendeeEmail || '',
        company: data.company || null,
        company_contact: data.companyContact || null,
        match_id: data.matchId || null,
        deal_value: data.dealValue,
        deal_currency: data.dealCurrency,
        deal_type: data.dealType || 'goods',
        follow_up_owner: data.followUpOwner || 'ops_team',
        next_action_date: data.nextActionDate || null,
        next_action_type: data.nextActionType || 'call',
        meeting_date: data.meetingDate || null,
        meeting_outcome: data.meetingOutcome || null,
        meeting_notes: data.meetingNotes || null,
        notes: data.notes || null,
      })
      .select()
      .single();
    if (error) throw error;
    return toFollowup(inserted as FollowupRow);
  },

  async updateFollowupStatus(
    followupId: string,
    status: PostEventDealFollowupStatus,
    notes?: string,
  ): Promise<PostEventDealFollowup | null> {
    const { data, error } = await supabase
      .from('tmos_deal_followups')
      .update({
        status,
        notes: notes || undefined,
        completed_at: status === 'won' || status === 'lost' ? new Date().toISOString() : null,
        last_action_date: new Date().toISOString(),
      })
      .eq('id', followupId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? toFollowup(data as FollowupRow) : null;
  },

  async logMeetingOutcome(followupId: string, meetingData: {
    outcome: MeetingOutcome;
    date: string;
    notes?: string;
    nextActionType?: PostEventDealFollowup['nextActionType'];
    nextActionDate?: string;
  }): Promise<PostEventDealFollowup | null> {
    const { data, error } = await supabase
      .from('tmos_deal_followups')
      .update({
        meeting_outcome: meetingData.outcome,
        meeting_date: meetingData.date,
        meeting_notes: meetingData.notes || null,
        next_action_type: meetingData.nextActionType || undefined,
        next_action_date: meetingData.nextActionDate || undefined,
        last_action_date: new Date().toISOString(),
      })
      .eq('id', followupId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? toFollowup(data as FollowupRow) : null;
  },

  async assignFollowupOwner(followupId: string, owner: string): Promise<PostEventDealFollowup | null> {
    const { data, error } = await supabase
      .from('tmos_deal_followups')
      .update({ follow_up_owner: owner, last_action_date: new Date().toISOString() })
      .eq('id', followupId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? toFollowup(data as FollowupRow) : null;
  },

  async scheduleNextAction(followupId: string, nextActionData: {
    nextActionType: PostEventDealFollowup['nextActionType'];
    nextActionDate: string;
    notes?: string;
  }): Promise<PostEventDealFollowup | null> {
    const { data, error } = await supabase
      .from('tmos_deal_followups')
      .update({
        next_action_type: nextActionData.nextActionType,
        next_action_date: nextActionData.nextActionDate,
        notes: nextActionData.notes || undefined,
        last_action_date: new Date().toISOString(),
      })
      .eq('id', followupId)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? toFollowup(data as FollowupRow) : null;
  },
};
