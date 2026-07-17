CREATE TABLE IF NOT EXISTS public.tmos_business_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  country TEXT,
  sector TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('active', 'inactive', 'blocked'))
);

CREATE TABLE IF NOT EXISTS public.tmos_delegate_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  partner_id UUID REFERENCES public.tmos_business_partners(id) ON DELETE SET NULL,
  partner_company TEXT NOT NULL,
  partner_contact_name TEXT,
  partner_email TEXT,
  partner_country TEXT,
  partner_sector TEXT,
  match_score INTEGER NOT NULL DEFAULT 50 CHECK (match_score BETWEEN 0 AND 100),
  match_rationale TEXT,
  meeting_objective TEXT,
  scheduled_at TIMESTAMPTZ,
  location TEXT,
  meeting_format TEXT NOT NULL DEFAULT 'in_person',
  status TEXT NOT NULL DEFAULT 'proposed',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (meeting_format IN ('in_person', 'virtual', 'hybrid')),
  CHECK (status IN ('proposed', 'confirmed', 'declined', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.tmos_itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  match_id UUID REFERENCES public.tmos_delegate_matches(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'meeting',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  location TEXT,
  visibility TEXT NOT NULL DEFAULT 'delegate',
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (item_type IN ('meeting', 'briefing', 'site_visit', 'travel', 'networking', 'admin')),
  CHECK (visibility IN ('internal', 'delegate')),
  CHECK (status IN ('draft', 'scheduled', 'confirmed', 'completed', 'cancelled'))
);

ALTER TABLE public.tmos_business_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tmos_delegate_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tmos_itinerary_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tmos_business_partners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tmos_delegate_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tmos_itinerary_items TO authenticated;
GRANT ALL ON public.tmos_business_partners TO service_role;
GRANT ALL ON public.tmos_delegate_matches TO service_role;
GRANT ALL ON public.tmos_itinerary_items TO service_role;

DROP POLICY IF EXISTS "Admins manage TMOS business partners" ON public.tmos_business_partners;
CREATE POLICY "Admins manage TMOS business partners"
  ON public.tmos_business_partners FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage TMOS delegate matches" ON public.tmos_delegate_matches;
CREATE POLICY "Admins manage TMOS delegate matches"
  ON public.tmos_delegate_matches FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own TMOS delegate matches" ON public.tmos_delegate_matches;
CREATE POLICY "Users view own TMOS delegate matches"
  ON public.tmos_delegate_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.id = tmos_delegate_matches.event_registration_id
        AND er.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage TMOS itinerary items" ON public.tmos_itinerary_items;
CREATE POLICY "Admins manage TMOS itinerary items"
  ON public.tmos_itinerary_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own TMOS itinerary items" ON public.tmos_itinerary_items;
CREATE POLICY "Users view own TMOS itinerary items"
  ON public.tmos_itinerary_items FOR SELECT
  USING (
    visibility = 'delegate'
    AND EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.id = tmos_itinerary_items.event_registration_id
        AND er.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_tmos_business_partners_updated_at
  BEFORE UPDATE ON public.tmos_business_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tmos_delegate_matches_updated_at
  BEFORE UPDATE ON public.tmos_delegate_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tmos_itinerary_items_updated_at
  BEFORE UPDATE ON public.tmos_itinerary_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_tmos_business_partners_event
  ON public.tmos_business_partners(event_id, status);

CREATE INDEX IF NOT EXISTS idx_tmos_delegate_matches_registration
  ON public.tmos_delegate_matches(event_registration_id, status);

CREATE INDEX IF NOT EXISTS idx_tmos_delegate_matches_event
  ON public.tmos_delegate_matches(event_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_tmos_itinerary_registration
  ON public.tmos_itinerary_items(event_registration_id, start_at);

CREATE INDEX IF NOT EXISTS idx_tmos_itinerary_event
  ON public.tmos_itinerary_items(event_id, start_at);

INSERT INTO public.tmos_business_partners (event_id, company_name, country, sector, contact_name, email, profile)
VALUES
  ('e0', 'Innofood SRL', 'Italy', 'Agri-food innovation', 'Partnership Desk', 'partnerships@innofood.example', '{"interests":["food technology","processing equipment","export partnerships"]}'::jsonb),
  ('e0', 'Desk Africa Medio Oriente', 'Italy', 'Institutional trade', 'Delegate Relations', 'delegates@deskafrica.example', '{"interests":["policy introductions","trade facilitation","Italian market access"]}'::jsonb),
  ('e0', 'Treviso Food Innovation Cluster', 'Italy', 'Food manufacturing', 'B2B Coordination', 'b2b@trevisofood.example', '{"interests":["factory visits","buyer introductions","technology transfer"]}'::jsonb)
ON CONFLICT DO NOTHING;
