-- Match requesters are businesses too. Backfill requester businesses that were
-- created through TradeMatch but never inserted into business_registrations.
INSERT INTO public.business_registrations (
  company_name,
  contact_person,
  email,
  country,
  sector,
  products_services,
  export_markets,
  additional_notes,
  user_id,
  account_created,
  created_at,
  updated_at
)
SELECT DISTINCT ON (lower(trim(mr.requester_business_name)), lower(trim(mr.requester_email)))
  mr.requester_business_name,
  mr.requester_business_name,
  mr.requester_email,
  'Nigeria',
  COALESCE(NULLIF(mr.sectors[1], ''), 'Other'),
  CASE
    WHEN array_length(mr.sectors, 1) > 0 THEN array_to_string(mr.sectors, ', ')
    ELSE NULL
  END,
  CASE
    WHEN array_length(mr.target_countries, 1) > 0 THEN array_to_string(mr.target_countries, ', ')
    ELSE NULL
  END,
  'Business created from TradeMatch request history.',
  mr.requester_id,
  true,
  MIN(mr.created_at),
  now()
FROM public.match_requests mr
WHERE trim(COALESCE(mr.requester_business_name, '')) <> ''
  AND lower(trim(mr.requester_business_name)) NOT IN ('unknown business', 'my business', 'hnery', 'taxcode', 'floodgate system')
  AND NOT EXISTS (
    SELECT 1
    FROM public.business_registrations br
    WHERE lower(trim(br.company_name)) = lower(trim(mr.requester_business_name))
       OR lower(trim(br.email)) = lower(trim(mr.requester_email))
  )
GROUP BY
  mr.requester_business_name,
  mr.requester_email,
  mr.sectors,
  mr.target_countries,
  mr.requester_id;
