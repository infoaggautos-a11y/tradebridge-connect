CREATE TABLE IF NOT EXISTS public.tmos_travel_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_registration_id UUID NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  visa_status TEXT NOT NULL DEFAULT 'not_started',
  invitation_letter_status TEXT NOT NULL DEFAULT 'not_started',
  flight_status TEXT NOT NULL DEFAULT 'not_started',
  accommodation_status TEXT NOT NULL DEFAULT 'not_started',
  passport_valid_until DATE,
  visa_appointment_at TIMESTAMPTZ,
  arrival_at TIMESTAMPTZ,
  departure_at TIMESTAMPTZ,
  arrival_airport TEXT,
  departure_airport TEXT,
  accommodation_name TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_registration_id),
  CHECK (visa_status IN ('not_started', 'invitation_requested', 'appointment_booked', 'submitted', 'approved', 'rejected', 'not_required')),
  CHECK (invitation_letter_status IN ('not_started', 'drafting', 'issued', 'sent')),
  CHECK (flight_status IN ('not_started', 'requested', 'booked', 'confirmed', 'changed', 'cancelled')),
  CHECK (accommodation_status IN ('not_started', 'requested', 'reserved', 'confirmed', 'changed', 'cancelled'))
);

ALTER TABLE public.tmos_travel_cases ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tmos_travel_cases TO authenticated;
GRANT ALL ON public.tmos_travel_cases TO service_role;

DROP POLICY IF EXISTS "Admins manage TMOS travel cases" ON public.tmos_travel_cases;
CREATE POLICY "Admins manage TMOS travel cases"
  ON public.tmos_travel_cases FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own TMOS travel case" ON public.tmos_travel_cases;
CREATE POLICY "Users view own TMOS travel case"
  ON public.tmos_travel_cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.event_registrations er
      WHERE er.id = tmos_travel_cases.event_registration_id
        AND er.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_tmos_travel_cases_updated_at
  BEFORE UPDATE ON public.tmos_travel_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_tmos_travel_cases_event
  ON public.tmos_travel_cases(event_id, visa_status, flight_status);

CREATE INDEX IF NOT EXISTS idx_tmos_travel_cases_registration
  ON public.tmos_travel_cases(event_registration_id);
