-- Create table for Question History
create table if not exists user_questions_history (
  id uuid default uuid_generate_v4() primary key,
  user_email text not null, -- using email as foreign key reference since we use email for auth in saas_leads
  question_id text not null, -- or integer depending on question table
  is_correct boolean not null,
  answered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  subject text -- optional for easy stats
);

-- Create table for Essay Submissions
create table if not exists essay_submissions (
  id uuid default uuid_generate_v4() primary key,
  user_email text not null,
  topic text not null,
  essay_text text,
  score integer,
  competencies_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Simple)
-- alter table user_questions_history enable row level security;
-- alter table essay_submissions enable row level security;

-- create policy "Users can insert their own history"
--   on user_questions_history for insert
--   with check (auth.uid() is not null); -- Or simpler check if using custom auth

-- create policy "Users can view their own history"
--   on user_questions_history for select
--   using (true); -- Simplified for now, ideally check user_email

-- create policy "Users can insert their own essays"
--   on essay_submissions for insert
--   with check (true);

-- create policy "Users can view their own essays"
--   on essay_submissions for select
--   using (true);
