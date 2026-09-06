-- ==============================================================================
-- FIRST CLICK PAYMENT PIPELINE - SUPABASE REALTIME SCHEMA
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create or update the 'clients' table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('website', 'social_media', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Website Fields
  website_project TEXT,
  website_total NUMERIC DEFAULT 0,
  website_advance NUMERIC DEFAULT 0,
  website_delivery_date DATE,
  website_due_date DATE,
  website_status TEXT DEFAULT 'upcoming',
  website_stage TEXT DEFAULT 'lead',

  -- Maintenance Fields
  maintenance_enabled BOOLEAN DEFAULT FALSE,
  maintenance_amount NUMERIC DEFAULT 0,
  maintenance_start_date DATE,
  maintenance_next_due DATE,
  maintenance_status TEXT DEFAULT 'upcoming',

  -- Social Media Fields
  social_package TEXT,
  social_amount NUMERIC DEFAULT 0,
  social_start_date DATE,
  social_next_due DATE,
  social_advance NUMERIC DEFAULT 0,
  social_outstanding NUMERIC DEFAULT 0,
  social_status TEXT DEFAULT 'upcoming',

  -- Aggregate Totals
  total_contract_value NUMERIC DEFAULT 0,
  total_paid NUMERIC DEFAULT 0,
  total_due NUMERIC DEFAULT 0,
  overall_status TEXT DEFAULT 'due'
);

-- 2. Ensure payments table has all columns and matches schema
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  business TEXT NOT NULL,
  service TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  received NUMERIC DEFAULT 0,
  remaining NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  method TEXT DEFAULT 'upi',
  transaction_id TEXT,
  status TEXT DEFAULT 'due',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Policies (allows read/write with publishable/anon key)
DROP POLICY IF EXISTS "Public full access on clients" ON public.clients;
CREATE POLICY "Public full access on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on payments" ON public.payments;
CREATE POLICY "Public full access on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable Realtime Replication for Instant Live Sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'clients'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
  END IF;
END $$;
