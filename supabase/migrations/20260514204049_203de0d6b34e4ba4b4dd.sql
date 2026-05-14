-- Add 'office' role to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'office';

-- Allow admins to insert/update user_roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
