
CREATE OR REPLACE FUNCTION public.create_wallet_on_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.wallets (user_id, balance, available_balance, pending_balance, currency)
  VALUES (NEW.id, 0, 0, 0, 'USD')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Also fix search_path on the other signup functions
CREATE OR REPLACE FUNCTION public.create_subscription_on_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_id, plan_name, status)
  VALUES (NEW.id, 'free', 'Free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$function$;
