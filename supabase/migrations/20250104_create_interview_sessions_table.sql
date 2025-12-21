-- Interview Coach Database Schema
-- Part 2: Interview Sessions Table (Tracks active/completed interview simulations)

create table if not exists interview_sessions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  
  -- State Machine: INTRO → ASK → ANSWER → FEEDBACK → SUMMARY
  current_phase text default 'INTRO' check (current_phase in ('INTRO', 'ASK', 'ANSWER', 'FEEDBACK', 'SUMMARY', 'COMPLETED')),
  
  -- Session Metadata
  total_questions int default 0,
  started_at timestamptz default now(),
  completed_at timestamptz,
  
  -- Session Notes (for future analytics)
  overall_score int check (overall_score between 1 and 10),
  feedback_summary text
);

-- Enable RLS
alter table interview_sessions enable row level security;

-- RLS Policies for Sessions
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

-- Indexes
create index interview_sessions_application_id_idx on interview_sessions(application_id);
create index interview_sessions_user_id_idx on interview_sessions(user_id);
create index interview_sessions_started_at_idx on interview_sessions(started_at desc);
