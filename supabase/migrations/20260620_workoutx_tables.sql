-- Remove YouTube cache (replaced by WorkoutX)
DROP TABLE IF EXISTS youtube_exercise_cache;

-- WorkoutX exercise cache (14-day TTL keeps usage within 500 req/month free tier)
CREATE TABLE IF NOT EXISTS workoutx_exercise_cache (
  muscle_id  text        PRIMARY KEY,
  results    jsonb       NOT NULL,
  cached_at  timestamptz DEFAULT now()
);

-- Usage log — lets you monitor live API calls vs cache hits before hitting the 500/month ceiling
CREATE TABLE IF NOT EXISTS workoutx_usage_log (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  called_at     timestamptz DEFAULT now(),
  muscle_id     text,
  was_cache_hit boolean     DEFAULT false
);

-- Convenience view: live API calls this calendar month
CREATE OR REPLACE VIEW workoutx_monthly_usage AS
SELECT count(*) AS live_calls_this_month
FROM workoutx_usage_log
WHERE was_cache_hit = false
  AND called_at >= date_trunc('month', now());
