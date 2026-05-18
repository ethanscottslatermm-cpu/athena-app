-- ─── Nourish Module Tables ────────────────────────────────────────────────────
-- Run this in the Supabase SQL editor for your Athena project.

-- food_log: daily meal entries per user
CREATE TABLE IF NOT EXISTS food_log (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date         date        NOT NULL,
  meal_type    text        NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name    text        NOT NULL,
  calories     numeric     NOT NULL DEFAULT 0,
  protein_g    numeric     NOT NULL DEFAULT 0,
  carbs_g      numeric     NOT NULL DEFAULT 0,
  fat_g        numeric     NOT NULL DEFAULT 0,
  serving_size numeric     NOT NULL DEFAULT 1,
  serving_unit text        NOT NULL DEFAULT 'serving',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own food_log"
  ON food_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS food_log_user_date ON food_log(user_id, date);

-- water_log: daily glass count per user (upsert by user_id + date)
CREATE TABLE IF NOT EXISTS water_log (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date           date        NOT NULL,
  glasses_count  int         NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE water_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own water_log"
  ON water_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- phase_food_cache: shared AI-generated phase plate content (no RLS needed)
CREATE TABLE IF NOT EXISTS phase_food_cache (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_name   text        NOT NULL,
  generated_at timestamptz DEFAULT now(),
  content      jsonb       NOT NULL
);

CREATE INDEX IF NOT EXISTS phase_food_cache_phase_date
  ON phase_food_cache(phase_name, generated_at DESC);
