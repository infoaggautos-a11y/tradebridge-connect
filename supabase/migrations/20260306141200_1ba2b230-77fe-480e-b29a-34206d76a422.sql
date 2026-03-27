
-- Drop the restrictive SELECT policy and replace with one that lets all authenticated users read registrations
DROP POLICY IF EXISTS "Users view own registration" ON public.business_registrations;

CREATE POLICY "Authenticated users can view registrations"
ON public.business_registrations
FOR SELECT
TO authenticated
USING (true);
