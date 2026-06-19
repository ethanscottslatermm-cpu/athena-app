-- YouTube exercise video cache (no RLS needed — public read, server-only write)
CREATE TABLE IF NOT EXISTS youtube_exercise_cache (
  muscle_id  text        PRIMARY KEY,
  results    jsonb       NOT NULL,
  cached_at  timestamptz DEFAULT now()
);

-- Unified workout log (written from both MuscleBottomSheet → LogWorkoutModal
-- and from the WeightExerciseLog manual entry form)
CREATE TABLE IF NOT EXISTS muscle_workouts (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  muscle_id     text,                  -- nullable for manual entries with no muscle tag
  exercise_name text        NOT NULL,
  sets          integer,
  reps          integer,
  weight_kg     numeric,
  logged_at     date        DEFAULT CURRENT_DATE,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE muscle_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workouts" ON muscle_workouts
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS muscle_workouts_user_logged
  ON muscle_workouts(user_id, logged_at DESC);

-- Weight tracking log (one entry per user per day via UNIQUE + upsert)
CREATE TABLE IF NOT EXISTS weight_logs (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  weight     numeric     NOT NULL,
  unit       text        DEFAULT 'lbs' CHECK (unit IN ('lbs', 'kg')),
  logged_at  date        DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, logged_at)
);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own weight logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS weight_logs_user_logged
  ON weight_logs(user_id, logged_at DESC);
