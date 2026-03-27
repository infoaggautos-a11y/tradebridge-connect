-- Invoice System Tables

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'standalone' CHECK (type IN ('standalone', 'deal_milestone', 'deal_full')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'void')),
  
  seller_id UUID NOT NULL,
  seller_name TEXT NOT NULL,
  seller_email TEXT,
  seller_address TEXT,
  
  buyer_id UUID NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_address TEXT,
  
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total NUMERIC(15, 2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  deal_id UUID,
  deal_title TEXT,
  deal_milestone_id UUID,
  milestone_title TEXT,
  
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  terms TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items table
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(15, 3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  discount NUMERIC(15, 2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice payments table (for partial payments)
CREATE TABLE IF NOT EXISTS public.invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method TEXT DEFAULT 'bank_transfer',
  reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice events table (audit log)
CREATE TABLE IF NOT EXISTS public.invoice_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_seller ON public.invoices(seller_id);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer ON public.invoices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_deal ON public.invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON public.invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_events_invoice ON public.invoice_events(invoice_id);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_events ENABLE ROW LEVEL SECURITY;

-- Sellers can view/manage their invoices
CREATE POLICY "Sellers can view their invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (seller_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Sellers can create invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (seller_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Sellers can update their invoices"
ON public.invoices FOR UPDATE
TO authenticated
USING (seller_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()));

-- Buyers can view invoices sent to them
CREATE POLICY "Buyers can view their invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (buyer_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()));

-- Admins can manage all invoices
CREATE POLICY "Admins can view all invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all invoices"
ON public.invoices FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete draft invoices"
ON public.invoices FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') AND status = 'draft');

-- Line items follow invoice access
CREATE POLICY "Access line items with invoice access"
ON public.invoice_line_items FOR ALL
TO authenticated
USING (invoice_id IN (SELECT id FROM public.invoices WHERE seller_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()) OR buyer_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin')));

-- Payments follow invoice access
CREATE POLICY "Access payments with invoice access"
ON public.invoice_payments FOR ALL
TO authenticated
USING (invoice_id IN (SELECT id FROM public.invoices WHERE seller_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()) OR buyer_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin')));

-- Events follow invoice access
CREATE POLICY "Access events with invoice access"
ON public.invoice_events FOR SELECT
TO authenticated
USING (invoice_id IN (SELECT id FROM public.invoices WHERE seller_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()) OR buyer_id IN (SELECT business_id FROM public.businesses WHERE owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin')));

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
