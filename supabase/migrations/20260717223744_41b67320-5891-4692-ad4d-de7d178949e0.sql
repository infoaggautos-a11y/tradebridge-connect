
-- === 1. event_registrations workflow fields ===
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
  CHECK (workflow_stage IN (
    'new_registration','under_review','qualified','waitlisted','rejected','accepted',
    'package_selected','invoice_generated','payment_confirmed','document_collection',
    'visa_support','business_matching','meeting_schedule_confirmed','travel_confirmed',
    'event_attended','deal_follow_up'
  ));

UPDATE public.event_registrations
SET workflow_stage = CASE
  WHEN status = 'confirmed' THEN 'accepted'
  WHEN status = 'cancelled' THEN 'rejected'
  ELSE 'new_registration'
END
WHERE workflow_stage = 'new_registration';

-- === 2. tmos_stage_events ===
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
GRANT SELECT, INSERT ON public.tmos_stage_events TO authenticated;
GRANT ALL ON public.tmos_stage_events TO service_role;
ALTER TABLE public.tmos_stage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view TMOS stage events" ON public.tmos_stage_events
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert TMOS stage events" ON public.tmos_stage_events
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own TMOS stage events" ON public.tmos_stage_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.event_registrations er
            WHERE er.id = tmos_stage_events.event_registration_id
              AND er.user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.log_event_registration_stage_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.workflow_stage IS DISTINCT FROM OLD.workflow_stage THEN
    INSERT INTO public.tmos_stage_events (event_registration_id, event_id, from_stage, to_stage, actor_id)
    VALUES (NEW.id, NEW.event_id, OLD.workflow_stage, NEW.workflow_stage, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS event_registration_stage_change_audit ON public.event_registrations;
CREATE TRIGGER event_registration_stage_change_audit
  AFTER UPDATE OF workflow_stage ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.log_event_registration_stage_change();

CREATE INDEX IF NOT EXISTS idx_event_registrations_workflow_stage ON public.event_registrations(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_event_registrations_score ON public.event_registrations(qualification_score DESC);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payload_gin ON public.event_registrations USING GIN(application_payload);
CREATE INDEX IF NOT EXISTS idx_tmos_stage_events_registration ON public.tmos_stage_events(event_registration_id, created_at DESC);

-- === 3. document + message tables ===
CREATE TABLE IF NOT EXISTS public.tmos_document_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT true,
  applies_to_stages TEXT[] NOT NULL DEFAULT ARRAY['document_collection'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, code)
);
GRANT SELECT ON public.tmos_document_requirements TO anon, authenticated;
GRANT ALL ON public.tmos_document_requirements TO service_role;

CREATE TABLE IF NOT EXISTS public.tmos_delegate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  document_code TEXT NOT NULL,
  label TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'not_submitted',
  review_notes TEXT,
  uploaded_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_registration_id, document_code),
  CHECK (status IN ('not_submitted','submitted','approved','rejected','expired'))
);
GRANT SELECT, INSERT, UPDATE ON public.tmos_delegate_documents TO authenticated;
GRANT ALL ON public.tmos_delegate_documents TO service_role;

CREATE TABLE IF NOT EXISTS public.tmos_message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_registration_id UUID REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  event_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  template_key TEXT,
  workflow_stage TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (channel IN ('email','whatsapp')),
  CHECK (status IN ('queued','sent','failed','skipped'))
);
GRANT SELECT ON public.tmos_message_logs TO authenticated;
GRANT ALL ON public.tmos_message_logs TO service_role;

ALTER TABLE public.tmos_document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tmos_delegate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tmos_message_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read TMOS document requirements" ON public.tmos_document_requirements
  FOR SELECT USING (true);
CREATE POLICY "Admins manage TMOS document requirements" ON public.tmos_document_requirements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage all TMOS delegate documents" ON public.tmos_delegate_documents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own TMOS delegate documents" ON public.tmos_delegate_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.event_registrations er
            WHERE er.id = tmos_delegate_documents.event_registration_id
              AND er.user_id = auth.uid())
  );
CREATE POLICY "Users insert own TMOS delegate documents" ON public.tmos_delegate_documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.event_registrations er
            WHERE er.id = tmos_delegate_documents.event_registration_id
              AND er.user_id = auth.uid())
  );

CREATE POLICY "Admins view all TMOS message logs" ON public.tmos_message_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own TMOS message logs" ON public.tmos_message_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.event_registrations er
            WHERE er.id = tmos_message_logs.event_registration_id
              AND er.user_id = auth.uid())
  );

CREATE TRIGGER update_tmos_document_requirements_updated_at
  BEFORE UPDATE ON public.tmos_document_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tmos_delegate_documents_updated_at
  BEFORE UPDATE ON public.tmos_delegate_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_tmos_document_requirements_event ON public.tmos_document_requirements(event_id);
CREATE INDEX IF NOT EXISTS idx_tmos_delegate_documents_registration ON public.tmos_delegate_documents(event_registration_id);
CREATE INDEX IF NOT EXISTS idx_tmos_delegate_documents_status ON public.tmos_delegate_documents(event_id, status);
CREATE INDEX IF NOT EXISTS idx_tmos_message_logs_registration ON public.tmos_message_logs(event_registration_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tmos_message_logs_status ON public.tmos_message_logs(event_id, status);

INSERT INTO public.tmos_document_requirements (event_id, code, label, description, required)
VALUES
  ('e0', 'passport', 'International Passport', 'Bio-data page scan with at least six months validity.', true),
  ('e0', 'company_profile', 'Company Profile', 'Short company profile or corporate brochure.', true),
  ('e0', 'product_catalogue', 'Product Catalogue', 'Catalogue, product sheet, or service capability statement.', false),
  ('e0', 'certifications', 'Certifications', 'NAFDAC, ISO, organic, export licence, or other relevant documents.', false)
ON CONFLICT (event_id, code) DO UPDATE
SET label = EXCLUDED.label, description = EXCLUDED.description, required = EXCLUDED.required;

-- === 4. storage.objects policies for tmos-documents ===
DROP POLICY IF EXISTS "Admins can read TMOS document objects" ON storage.objects;
CREATE POLICY "Admins can read TMOS document objects" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'tmos-documents' AND public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Users can read own TMOS document objects" ON storage.objects;
CREATE POLICY "Users can read own TMOS document objects" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'tmos-documents'
    AND EXISTS (
      SELECT 1 FROM public.event_registrations er
      WHERE er.user_id = auth.uid()
        AND name LIKE er.event_id || '/' || er.id || '/%'
    )
  );
