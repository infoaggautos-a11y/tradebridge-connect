ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS workflow_stage TEXT NOT NULL DEFAULT 'new_registration',
  ADD COLUMN IF NOT EXISTS application_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS qualification_score INTEGER,
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS relationship_manager_id UUID,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

ALTER TABLE public.event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_workflow_stage_check;

ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_workflow_stage_check
  CHECK (
    workflow_stage IN (
      'new_registration',
      'under_review',
      'qualified',
      'waitlisted',
      'rejected',
      'accepted',
      'package_selected',
      'invoice_generated',
      'payment_confirmed',
      'document_collection',
      'visa_support',
      'business_matching',
      'meeting_schedule_confirmed',
      'travel_confirmed',
      'event_attended',
      'deal_follow_up'
    )
  );

UPDATE public.event_registrations
SET workflow_stage = CASE
  WHEN status = 'confirmed' THEN 'accepted'
  WHEN status = 'cancelled' THEN 'rejected'
  ELSE 'new_registration'
END
WHERE workflow_stage = 'new_registration';

CREATE TABLE IF NOT EXISTS public.tmos_stage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  reason TEXT,
  actor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tmos_stage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all TMOS stage events" ON public.tmos_stage_events;
CREATE POLICY "Admins can view all TMOS stage events"
  ON public.tmos_stage_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert TMOS stage events" ON public.tmos_stage_events;
CREATE POLICY "Admins can insert TMOS stage events"
  ON public.tmos_stage_events FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can view own TMOS stage events" ON public.tmos_stage_events;
CREATE POLICY "Users can view own TMOS stage events"
  ON public.tmos_stage_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.id = tmos_stage_events.event_registration_id
        AND er.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.log_event_registration_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.workflow_stage IS DISTINCT FROM OLD.workflow_stage THEN
    INSERT INTO public.tmos_stage_events (
      event_registration_id,
      event_id,
      from_stage,
      to_stage,
      actor_id
    )
    VALUES (
      NEW.id,
      NEW.event_id,
      OLD.workflow_stage,
      NEW.workflow_stage,
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS event_registration_stage_change_audit ON public.event_registrations;
CREATE TRIGGER event_registration_stage_change_audit
  AFTER UPDATE OF workflow_stage ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.log_event_registration_stage_change();

CREATE INDEX IF NOT EXISTS idx_event_registrations_workflow_stage
  ON public.event_registrations(workflow_stage);

CREATE INDEX IF NOT EXISTS idx_event_registrations_score
  ON public.event_registrations(qualification_score DESC);

CREATE INDEX IF NOT EXISTS idx_event_registrations_payload_gin
  ON public.event_registrations USING GIN(application_payload);

CREATE INDEX IF NOT EXISTS idx_tmos_stage_events_registration
  ON public.tmos_stage_events(event_registration_id, created_at DESC);
