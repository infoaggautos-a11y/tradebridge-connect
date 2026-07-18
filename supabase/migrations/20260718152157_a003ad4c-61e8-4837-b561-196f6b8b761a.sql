CREATE TABLE IF NOT EXISTS public.tmos_deal_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  event_id TEXT NOT NULL,
  event_title TEXT NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  company TEXT,
  company_contact TEXT,
  match_id UUID REFERENCES public.tmos_delegate_matches(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new_lead',
  deal_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
  deal_currency TEXT NOT NULL DEFAULT 'USD',
  deal_type TEXT NOT NULL DEFAULT 'goods',
  follow_up_owner TEXT NOT NULL DEFAULT 'ops_team',
  next_action_date DATE,
  next_action_type TEXT NOT NULL DEFAULT 'call',
  meeting_outcome TEXT,
  meeting_date TIMESTAMPTZ,
  meeting_notes TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  last_action_by UUID,
  last_action_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost')),
  CHECK (deal_type IN ('goods', 'services', 'digital', 'mixed')),
  CHECK (next_action_type IN ('call', 'email', 'meeting', 'proposal', 'visit')),
  CHECK (meeting_outcome IS NULL OR meeting_outcome IN ('meeting_scheduled', 'meeting_completed', 'meeting_cancelled', 'no_response', 'rescheduled', 'virtual_meeting', 'in_person'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tmos_deal_followups TO authenticated;
GRANT ALL ON public.tmos_deal_followups TO service_role;

ALTER TABLE public.tmos_deal_followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage TMOS deal followups" ON public.tmos_deal_followups;
CREATE POLICY "Admins manage TMOS deal followups"
  ON public.tmos_deal_followups FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own TMOS deal followups" ON public.tmos_deal_followups;
CREATE POLICY "Users view own TMOS deal followups"
  ON public.tmos_deal_followups FOR SELECT
  USING (
    event_registration_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.id = tmos_deal_followups.event_registration_id
        AND er.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS update_tmos_deal_followups_updated_at ON public.tmos_deal_followups;
CREATE TRIGGER update_tmos_deal_followups_updated_at
  BEFORE UPDATE ON public.tmos_deal_followups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_tmos_deal_followups_event
  ON public.tmos_deal_followups(event_id, status);
CREATE INDEX IF NOT EXISTS idx_tmos_deal_followups_registration
  ON public.tmos_deal_followups(event_registration_id);
CREATE INDEX IF NOT EXISTS idx_tmos_deal_followups_next_action
  ON public.tmos_deal_followups(next_action_date, status);