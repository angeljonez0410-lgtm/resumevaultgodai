-- ResumeVaultGodAI - Full Schema
-- Run this in Supabase SQL Editor

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email_address TEXT,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  professional_summary TEXT,
  skills TEXT,
  certifications TEXT,
  experiences JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  saved_resume TEXT,
  saved_tailored_resume TEXT,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
  stripe_customer_id TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS stripe_checkout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL CHECK (credits > 0),
  stripe_customer_id TEXT,
  payment_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION add_user_credits(
  target_user_id UUID,
  credits_to_add INTEGER,
  stripe_customer TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF credits_to_add <= 0 THEN
    RAISE EXCEPTION 'credits_to_add must be positive';
  END IF;

  INSERT INTO user_profiles (user_id, credits, stripe_customer_id)
  VALUES (target_user_id, credits_to_add, stripe_customer)
  ON CONFLICT (user_id)
  DO UPDATE SET
    credits = user_profiles.credits + EXCLUDED.credits,
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, user_profiles.stripe_customer_id),
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION process_stripe_checkout_session(
  checkout_session_id TEXT,
  target_user_id UUID,
  credits_to_add INTEGER,
  stripe_customer TEXT DEFAULT NULL,
  stripe_payment_status TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF credits_to_add <= 0 THEN
    RAISE EXCEPTION 'credits_to_add must be positive';
  END IF;

  INSERT INTO stripe_checkout_sessions (
    session_id,
    user_id,
    credits,
    stripe_customer_id,
    payment_status
  )
  VALUES (
    checkout_session_id,
    target_user_id,
    credits_to_add,
    stripe_customer,
    stripe_payment_status
  );

  PERFORM add_user_credits(target_user_id, credits_to_add, stripe_customer);
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    RETURN FALSE;
END;
$$;

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_description TEXT,
  ats_keywords TEXT,
  status TEXT DEFAULT 'applied',
  salary_range TEXT,
  job_url TEXT,
  notes TEXT,
  applied_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saved Resumes
CREATE TABLE IF NOT EXISTS saved_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  ats_score INTEGER,
  type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT 'Anonymous',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own applications" ON job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON job_applications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own resumes" ON saved_resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON saved_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON saved_resumes FOR DELETE USING (auth.uid() = user_id);

-- Reviews: anyone can read, users can insert their own
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id ON user_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_checkout_sessions_user_id ON stripe_checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_resumes_user_id ON saved_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
