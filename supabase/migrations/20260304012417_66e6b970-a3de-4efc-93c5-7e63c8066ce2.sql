
CREATE OR REPLACE FUNCTION public.create_subscription_on_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, plan_name, status)
  VALUES (NEW.id, 'free', 'Free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;
