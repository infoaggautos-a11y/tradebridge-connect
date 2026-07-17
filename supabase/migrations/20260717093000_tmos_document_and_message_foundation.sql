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
  CHECK (status IN ('not_submitted', 'submitted', 'approved', 'rejected', 'expired'))
);

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
  CHECK (channel IN ('email', 'whatsapp')),
  CHECK (status IN ('queued', 'sent', 'failed', 'skipped'))
);

ALTER TABLE public.tmos_document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tmos_delegate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tmos_message_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage TMOS document requirements" ON public.tmos_document_requirements;
CREATE POLICY "Admins manage TMOS document requirements"
  ON public.tmos_document_requirements FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage all TMOS delegate documents" ON public.tmos_delegate_documents;
CREATE POLICY "Admins manage all TMOS delegate documents"
  ON public.tmos_delegate_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own TMOS delegate documents" ON public.tmos_delegate_documents;
CREATE POLICY "Users view own TMOS delegate documents"
  ON public.tmos_delegate_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.id = tmos_delegate_documents.event_registration_id
        AND er.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users insert own TMOS delegate documents" ON public.tmos_delegate_documents;
CREATE POLICY "Users insert own TMOS delegate documents"
  ON public.tmos_delegate_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.id = tmos_delegate_documents.event_registration_id
        AND er.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins view all TMOS message logs" ON public.tmos_message_logs;
CREATE POLICY "Admins view all TMOS message logs"
  ON public.tmos_message_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own TMOS message logs" ON public.tmos_message_logs;
CREATE POLICY "Users view own TMOS message logs"
  ON public.tmos_message_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.id = tmos_message_logs.event_registration_id
        AND er.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_tmos_document_requirements_updated_at
  BEFORE UPDATE ON public.tmos_document_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tmos_delegate_documents_updated_at
  BEFORE UPDATE ON public.tmos_delegate_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_tmos_document_requirements_event
  ON public.tmos_document_requirements(event_id);

CREATE INDEX IF NOT EXISTS idx_tmos_delegate_documents_registration
  ON public.tmos_delegate_documents(event_registration_id);

CREATE INDEX IF NOT EXISTS idx_tmos_delegate_documents_status
  ON public.tmos_delegate_documents(event_id, status);

CREATE INDEX IF NOT EXISTS idx_tmos_message_logs_registration
  ON public.tmos_message_logs(event_registration_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tmos_message_logs_status
  ON public.tmos_message_logs(event_id, status);

INSERT INTO public.tmos_document_requirements (event_id, code, label, description, required)
VALUES
  ('e0', 'passport', 'International Passport', 'Bio-data page scan with at least six months validity.', true),
  ('e0', 'company_profile', 'Company Profile', 'Short company profile or corporate brochure.', true),
  ('e0', 'product_catalogue', 'Product Catalogue', 'Catalogue, product sheet, or service capability statement.', false),
  ('e0', 'certifications', 'Certifications', 'NAFDAC, ISO, organic, export licence, or other relevant documents.', false)
ON CONFLICT (event_id, code) DO UPDATE
SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  required = EXCLUDED.required;
