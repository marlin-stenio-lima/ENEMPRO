-- Create Questions Table
create table if not exists public.questions (
  id uuid not null default gen_random_uuid(),
  exam_name text not null,
  year int,
  day int,
  question_number text,
  text text,
  answer text,
  images text[], -- Array of image URLs
  page_number int,
  created_at timestamptz default now(),
  primary key (id)
);

-- Enable RLS
alter table public.questions enable row level security;

-- Policy: Allow read access to all (or authenticated)
create policy "Public read access" on public.questions
  for select using (true);

-- Policy: Allow insert/update only to service role or authenticated admins
-- For simplicity in this script, we might need to allow anon insert IF we are using anon key for the script (not recommended), 
-- OR strictly rely on the Service Role Key in the python script. 
-- Assuming the Python script uses SERVICE_ROLE_KEY if available, or we just open it up temporarily.
-- create policy "Anon insert" on public.questions for insert with check (true);
