-- 1. Create tables first (IF NOT EXISTS)
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now(),
  primary key (id)
);

create table if not exists public.subscriptions (
  id uuid not null default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null, -- 'active', 'expired', 'pending'
  provider_id text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  primary key (id)
);

create table if not exists public.webhook_logs (
  id uuid not null default gen_random_uuid(),
  payload jsonb,
  processed boolean default false,
  created_at timestamptz default now(),
  primary key (id)
);

-- 2. Enable RLS (safe to run multiple times)
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.webhook_logs enable row level security;

-- 3. Manage Policies (Drop then Create to ensure update)
-- Now that tables definitely exist, we can drop policies on them without error.

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
