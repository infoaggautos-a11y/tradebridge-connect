-- Create match_requests table for storing trade match requests
CREATE TABLE public.match_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  requester_email TEXT NOT NULL,
  requester_business_name TEXT NOT NULL,
  matched_business_name TEXT NOT NULL,
  matched_business_id TEXT,
  match_score INTEGER NOT NULL DEFAULT 0,
  sectors TEXT[] DEFAULT '{}',
  target_countries TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own match requests"
  ON public.match_requests FOR SELECT
  USING (auth.uid() = requester_id);

CREATE POLICY "Users can create match requests"
  ON public.match_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Authenticated users can view all match requests"
  ON public.match_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update match requests"
  ON public.match_requests FOR UPDATE
  TO authenticated
  USING (true);