# DATABASE SETUP INSTRUCTIES

## ⚠️ BELANGRIJK: Je moet deze stappen volgen om de Tracker te laten werken!

### Stap 1: Open Supabase Dashboard
1. Ga naar [https://supabase.com](https://supabase.com)
2. Log in en open je project
3. Klik op "SQL Editor" in het linkermenu

### Stap 2: Voer het SQL Script uit
1. Klik op "+ New Query"
2. Kopieer ALLE onderstaande SQL code:

```sql
-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  recruiter_name TEXT,
  application_url TEXT,
  status TEXT NOT NULL DEFAULT 'applied',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own applications"
  ON job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON job_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
```

3. Plak de code in de SQL Editor
4. Klik op "RUN" (of druk Cmd/Ctrl + Enter)

### Stap 3: Verificatie
Je zou moeten zien:
- ✅ "Success. No rows returned"
- OF een bericht dat de tabel succesvol is aangemaakt

### Stap 4: Test de Tracker
1. Ga naar `/dashboard/tracker` in je app
2. Klik "+ Nieuwe Sollicitatie"
3. Vul de gegevens in
4. Voeg toe!

## Problemen?

**Error: "relation already exists"**
→ De tabel bestaat al, dit is OK!

**Error: "permission denied"**
→ Check of je admin rechten hebt in Supabase

**Error: "schema cache"**
→ Refresh de pagina in je browser en probeer opnieuw

---

Na het uitvoeren van deze SQL script zou alles moeten werken! 🚀
