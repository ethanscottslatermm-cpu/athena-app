-- ─── Skin Module Tables ───────────────────────────────────────────────────────
-- Run in the Supabase SQL editor. Safe to re-run (drops first).

DROP TABLE IF EXISTS skin_logs CASCADE;
DROP TABLE IF EXISTS skin_routine_cache CASCADE;

-- skin_logs: one entry per user per day
CREATE TABLE skin_logs (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date         date        NOT NULL,
  condition_rating int         CHECK (condition_rating BETWEEN 1 AND 5),
  concerns         text[]      DEFAULT '{}',
  notes            text,
  phase_name       text,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE skin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own skin_logs"
  ON skin_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX skin_logs_user_date ON skin_logs(user_id, log_date DESC);

-- skin_routine_cache: shared AI-generated AM/PM routines per phase
CREATE TABLE skin_routine_cache (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_name   text        NOT NULL,
  time_of_day  text        NOT NULL CHECK (time_of_day IN ('am', 'pm')),
  generated_at timestamptz DEFAULT now(),
  content      jsonb       NOT NULL
);

CREATE INDEX skin_routine_cache_phase ON skin_routine_cache(phase_name, time_of_day, generated_at DESC);
