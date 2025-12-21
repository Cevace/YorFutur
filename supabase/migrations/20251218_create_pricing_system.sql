-- Migration: Create Pricing System Tables
-- Date: 2025-12-18
-- Description: Creates plans, subscriptions, and mollie_products tables for the pricing/entitlements system

-- ========================================
-- 1. PLANS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (name IN ('free', 'essential', 'professional', 'executive')),
    display_name TEXT NOT NULL,
    headline TEXT,
    sub_headline TEXT,
    monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    quarterly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '{}',
    bullets TEXT[] DEFAULT '{}',
    cta_text TEXT DEFAULT 'Kies Plan',
    sort_order INT DEFAULT 0,
    is_highlighted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 2. USER SUBSCRIPTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan_id UUID REFERENCES plans(id),
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'frozen', 'cancelled')),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly')),
    
    -- Trial tracking
    trial_started_at TIMESTAMPTZ DEFAULT NOW(),
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Billing period tracking
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Mollie integration
    mollie_customer_id TEXT,
    mollie_subscription_id TEXT,
    mollie_mandate_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 3. MOLLIE PRODUCTS TABLE (SKU Mapping)
-- ========================================
CREATE TABLE IF NOT EXISTS mollie_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    plan_id UUID REFERENCES plans(id),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly')),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 4. RLS POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mollie_products ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone (public pricing)
CREATE POLICY "Plans are publicly readable"
    ON plans FOR SELECT
    TO authenticated, anon
    USING (true);

-- Users can only view their own subscription
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks/admin)
CREATE POLICY "Service role manages subscriptions"
    ON subscriptions FOR ALL
    TO service_role
    USING (true);

-- Mollie products readable by authenticated users
CREATE POLICY "Mollie products readable by authenticated"
    ON mollie_products FOR SELECT
    TO authenticated
    USING (true);

-- ========================================
-- 5. INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends ON subscriptions(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_mollie_products_sku ON mollie_products(sku);

-- ========================================
-- 6. TRIGGER: Update timestamp
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. SEED DATA: Plans
-- ========================================
INSERT INTO plans (name, display_name, headline, sub_headline, monthly_price, quarterly_price, features, bullets, cta_text, sort_order, is_highlighted)
VALUES 
    (
        'free',
        'Free',
        'Probeer',
        'Ontdek de mogelijkheden.',
        0,
        0,
        '{
            "cvTemplates": "limited",
            "pdfDownloads": false,
            "motivationLetters": "limited",
            "cvTuner": "score_only",
            "linkedinOptimizer": false,
            "jobRadar": "limited",
            "interviewCoach": "none",
            "assessmentTrainer": false,
            "liveCvLink": false
        }'::jsonb,
        ARRAY['1 CV Template (met watermerk)', 'Preview only (geen download)', 'Score-only CV analyse'],
        'Blijf op Free',
        0,
        false
    ),
    (
        'essential',
        'Essential',
        'Start',
        'Alles voor een perfect CV en Brief.',
        12,
        29,
        '{
            "cvTemplates": "standard",
            "pdfDownloads": true,
            "motivationLetters": "unlimited",
            "cvTuner": "basic",
            "linkedinOptimizer": false,
            "jobRadar": "full",
            "interviewCoach": "none",
            "assessmentTrainer": false,
            "liveCvLink": false
        }'::jsonb,
        ARRAY['Onbeperkt CV''s & Brieven maken', 'Download als PDF (Geen watermerk)', 'Slimme Sollicitatie Tracker'],
        'Kies Essential',
        1,
        false
    ),
    (
        'professional',
        'Professional',
        'Versnel',
        'Word 3x vaker uitgenodigd.',
        27,
        67,
        '{
            "cvTemplates": "standard",
            "pdfDownloads": true,
            "motivationLetters": "unlimited",
            "cvTuner": "advanced",
            "linkedinOptimizer": true,
            "jobRadar": "priority",
            "interviewCoach": "basic",
            "assessmentTrainer": false,
            "liveCvLink": true
        }'::jsonb,
        ARRAY['Alles uit Essential', 'AI CV Tuner (Herschrijf je CV)', 'LinkedIn Profiel Optimizer'],
        'Start Professional',
        2,
        true
    ),
    (
        'executive',
        'Executive',
        'Win',
        'Versla de concurrentie in assessments.',
        47,
        117,
        '{
            "cvTemplates": "premium",
            "pdfDownloads": true,
            "motivationLetters": "unlimited",
            "cvTuner": "advanced",
            "linkedinOptimizer": true,
            "jobRadar": "priority",
            "interviewCoach": "advanced",
            "assessmentTrainer": true,
            "liveCvLink": true
        }'::jsonb,
        ARRAY['Alles uit Professional', 'Assessment Training (SHL, etc)', '1-op-1 Interview Coach Simulatie'],
        'Word Executive',
        3,
        false
    )
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    headline = EXCLUDED.headline,
    sub_headline = EXCLUDED.sub_headline,
    monthly_price = EXCLUDED.monthly_price,
    quarterly_price = EXCLUDED.quarterly_price,
    features = EXCLUDED.features,
    bullets = EXCLUDED.bullets,
    cta_text = EXCLUDED.cta_text,
    sort_order = EXCLUDED.sort_order,
    is_highlighted = EXCLUDED.is_highlighted;

-- ========================================
-- 8. SEED DATA: Mollie Products
-- ========================================
INSERT INTO mollie_products (sku, plan_id, billing_cycle, price, description)
SELECT 'CEV-ESS-M', id, 'monthly', 12.00, 'Essential Monthly' FROM plans WHERE name = 'essential'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO mollie_products (sku, plan_id, billing_cycle, price, description)
SELECT 'CEV-ESS-Q3', id, 'quarterly', 29.00, 'Essential Quarterly' FROM plans WHERE name = 'essential'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO mollie_products (sku, plan_id, billing_cycle, price, description)
SELECT 'CEV-PRO-M', id, 'monthly', 27.00, 'Professional Monthly' FROM plans WHERE name = 'professional'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO mollie_products (sku, plan_id, billing_cycle, price, description)
SELECT 'CEV-PRO-Q3', id, 'quarterly', 67.00, 'Professional Quarterly' FROM plans WHERE name = 'professional'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO mollie_products (sku, plan_id, billing_cycle, price, description)
SELECT 'CEV-EXE-M', id, 'monthly', 47.00, 'Executive Monthly' FROM plans WHERE name = 'executive'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO mollie_products (sku, plan_id, billing_cycle, price, description)
SELECT 'CEV-EXE-Q3', id, 'quarterly', 117.00, 'Executive Quarterly' FROM plans WHERE name = 'executive'
ON CONFLICT (sku) DO NOTHING;
