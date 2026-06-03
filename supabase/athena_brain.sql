-- Athena Brain: AI intelligence layer schema
-- Run in Supabase SQL editor

-- Daily brief cache
CREATE TABLE IF NOT EXISTS athena_daily_brief (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users NOT NULL,
  brief_date      DATE NOT NULL,
  greeting        TEXT,
  rhythm_insight  TEXT,
  action_focus    TEXT,
  intention       TEXT,
  phase_day       TEXT,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, brief_date)
);

-- Conversation history
CREATE TABLE IF NOT EXISTS athena_conversations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  module_context  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Context cache (4-hour TTL enforced in application layer)
CREATE TABLE IF NOT EXISTS athena_context_cache (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users NOT NULL,
  context_json    JSONB NOT NULL,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ DEFAULT NOW() + INTERVAL '4 hours',
  UNIQUE(user_id)
);

-- Notification log
CREATE TABLE IF NOT EXISTS athena_notifications (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users NOT NULL,
  message         TEXT NOT NULL,
  trigger_type    TEXT,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Post-session feedback columns on session_completions
ALTER TABLE session_completions ADD COLUMN IF NOT EXISTS feeling TEXT;
ALTER TABLE session_completions ADD COLUMN IF NOT EXISTS energy_after TEXT;

-- Enable RLS
ALTER TABLE athena_daily_brief     ENABLE ROW LEVEL SECURITY;
ALTER TABLE athena_conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE athena_context_cache   ENABLE ROW LEVEL SECURITY;
ALTER TABLE athena_notifications   ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users own their brief"
  ON athena_daily_brief FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their conversations"
  ON athena_conversations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their context"
  ON athena_context_cache FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their notifications"
  ON athena_notifications FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_created
  ON athena_conversations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_brief_user_date
  ON athena_daily_brief(user_id, brief_date DESC);
