-- Interview Coach Database Schema
-- Part 3: Interview Messages Table (Stores conversation history)

create table if not exists interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references interview_sessions(id) on delete cascade not null,
  
  -- Message Content
  role text not null check (role in ('assistant', 'user', 'system')),
  content text not null,
  
  -- Metadata
  created_at timestamptz default now()
);

-- Enable RLS
alter table interview_messages enable row level security;

-- RLS Policies for Messages
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

-- Indexes
create index interview_messages_session_id_idx on interview_messages(session_id);
create index interview_messages_created_at_idx on interview_messages(created_at);
