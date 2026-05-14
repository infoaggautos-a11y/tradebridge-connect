-- Allow the public directory to show registered businesses while keeping office
-- accounts out of the public listing.
DROP POLICY IF EXISTS "Public can view directory registrations" ON public.business_registrations;

CREATE POLICY "Public can view directory registrations"
ON public.business_registrations
FOR SELECT
TO anon, authenticated
USING (
  lower(trim(company_name)) NOT IN ('hnery', 'taxcode', 'floodgate system')
);
