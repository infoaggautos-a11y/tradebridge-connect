CREATE TABLE IF NOT EXISTS public.business_registrations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL DEFAULT 'Italy',
  city TEXT,
  address TEXT,
  website TEXT,
  sector TEXT,
  products_services TEXT,
  export_markets TEXT,
  import_interests TEXT,
  company_size TEXT,
  annual_revenue TEXT,
  registration_number TEXT,
  additional_notes TEXT,
  user_id UUID,
  account_created BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.business_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit registration" ON public.business_registrations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users view own registration" ON public.business_registrations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON public.business_registrations
  FOR ALL TO service_role USING (true) WITH CHECK (true);