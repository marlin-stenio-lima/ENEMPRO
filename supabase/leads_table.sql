-- Create the saas_leads table
CREATE TABLE IF NOT EXISTS public.saas_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    plan TEXT NOT NULL DEFAULT 'start', -- 'start', 'pro', 'advanced'
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'blocked'
    purchase_price NUMERIC(10,2),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.saas_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can do everything on saas_leads"
ON public.saas_leads
FOR ALL
USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);

-- Policy: Service Role (server-side) can insert/update (for webhooks)
-- Implicitly true for service_role, but good to know.

-- Policy: Users can read their own lead data (optional, if you want them to see their plan)
CREATE POLICY "Users can read own lead data"
ON public.saas_leads
FOR SELECT
USING (
    email = auth.email()
);
