-- Combined Interview Coach Database Setup
-- Run this in Supabase SQL Editor

-- 1. Applications Table
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  
  -- User Input
  company_name text not null,
  job_title text not null,
  vacancy_text text,
  cv_snapshot text,
  
  -- AI Enriched Data
  company_culture_summary text,
  recent_company_news text,
  intelligence_status text default 'pending' check (intelligence_status in ('pending', 'researching', 'complete', 'failed')),
  
  -- Application Status
  status text default 'preparation' check (status in ('preparation', 'applied', 'hired', 'rejected')),
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table applications enable row level security;

create policy "Users can view own applications"
  on applications for select
  using (auth.uid() = user_id);

create policy "Users can create own applications"
  on applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on applications for delete
  using (auth.uid() = user_id);

create index applications_user_id_idx on applications(user_id);
create index applications_status_idx on applications(status);
create index applications_created_at_idx on applications(created_at desc);

-- 2. Interview Sessions Table
create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  
  -- State Machine
  current_phase text default 'INTRO' check (current_phase in ('INTRO', 'ASK', 'ANSWER', 'FEEDBACK', 'SUMMARY', 'COMPLETED')),
  
  -- Session Metadata
  total_questions int default 0,
  started_at timestamptz default now(),
  completed_at timestamptz,
  overall_score int check (overall_score between 1 and 10),
  feedback_summary text
);

alter table interview_sessions enable row level security;

create policy "Users can view own sessions"
  on interview_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create own sessions"
  on interview_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on interview_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on interview_sessions for delete
  using (auth.uid() = user_id);

create index interview_sessions_application_id_idx on interview_sessions(application_id);
create index interview_sessions_user_id_idx on interview_sessions(user_id);
create index interview_sessions_started_at_idx on interview_sessions(started_at desc);

-- 3. Interview Messages Table
create table if not exists interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade not null,
  
  -- Message Content
  role text not null check (role in ('assistant', 'user', 'system')),
  content text not null,
  
  -- Metadata
  created_at timestamptz default now()
);

alter table interview_messages enable row level security;

create policy "Users can view messages from their sessions"
  on interview_messages for select
  using (
    session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

create policy "Users can insert messages to their sessions"
  on interview_messages for insert
  with check (
    session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

create policy "Users can delete messages from their sessions"
  on interview_messages for delete
  using (
    session_id in (
      select id from interview_sessions where user_id = auth.uid()
    )
  );

create index interview_messages_session_id_idx on interview_messages(session_id);
create index interview_messages_created_at_idx on interview_messages(created_at);

-- 4. Helper Function
create or replace function increment_question_count(session_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update interview_sessions
  set total_questions = total_questions + 1
  where id = session_id;
end;
$$;
