-- ─── Sleep Module Tables ──────────────────────────────────────────────────────
-- Run in the Supabase SQL editor. Safe to re-run (drops first).

DROP TABLE IF EXISTS sleep_logs CASCADE;
DROP TABLE IF EXISTS wind_down_cache CASCADE;

-- sleep_logs: one entry per user per night
CREATE TABLE sleep_logs (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date       date        NOT NULL,
  bedtime        time,
  wake_time      time,
  total_hours    numeric,
  quality_rating int         CHECK (quality_rating BETWEEN 1 AND 5),
  tags           text[]      DEFAULT '{}',
  dream_notes    text,
  phase_name     text,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own sleep_logs"
  ON sleep_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX sleep_logs_user_date ON sleep_logs(user_id, log_date DESC);

-- wind_down_cache: shared AI-generated wind-down routines per phase
CREATE TABLE wind_down_cache (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_name   text        NOT NULL,
  generated_at timestamptz DEFAULT now(),
  content      jsonb       NOT NULL
);

CREATE INDEX wind_down_cache_phase ON wind_down_cache(phase_name, generated_at DESC);
