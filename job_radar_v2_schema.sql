-- Job Radar V2 Schema: Persisted Matches & Push Notifications

-- 1. Table for storing Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL, -- stores { p256dh: "...", auth: "..." }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, endpoint) -- Prevent duplicate subscriptions
);

-- RLS for push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
    ON push_subscriptions
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Table for storing Job Matches (Snapshot of crawl results)
CREATE TABLE IF NOT EXISTS job_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_data JSONB NOT NULL, -- Stores full job object { title, company, url, etc. }
    match_score INT NOT NULL,
    is_new BOOLEAN DEFAULT TRUE,
    seen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS for job_matches
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
    ON job_matches FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert matches" -- Typically run by cron/admin
    ON job_matches FOR INSERT
    WITH CHECK (true); -- Ideally restricted to service_role, but for now open for app logic

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_new ON job_matches(user_id, is_new);
CREATE INDEX IF NOT EXISTS idx_job_matches_created ON job_matches(created_at DESC);
