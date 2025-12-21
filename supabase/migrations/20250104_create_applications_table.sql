-- Interview Coach Database Schema
-- Part 1: Applications Table (Stores job application context + AI-enriched company data)

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  
  -- User Input
  company_name text not null,
  job_title text not null,
  vacancy_text text,
  cv_snapshot text,
  
  -- AI Enriched Data (Populated by Tavily Agent)
  company_culture_summary text,
  recent_company_news text,
  intelligence_status text default 'pending' check (intelligence_status in ('pending', 'researching', 'complete', 'failed')),
  
  -- Application Status
  status text default 'preparation' check (status in ('preparation', 'applied', 'hired', 'rejected')),
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table applications enable row level security;

-- RLS Policies for Applications
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

-- Index for performance
create index applications_user_id_idx on applications(user_id);
create index applications_status_idx on applications(status);
create index applications_created_at_idx on applications(created_at desc);
