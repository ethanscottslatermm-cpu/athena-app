-- ─── Phase 1 ─────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS circles CASCADE;
DROP TABLE IF EXISTS phase_daily_prompts CASCADE;

CREATE TABLE circles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  emoji text,
  description text,
  is_local boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

INSERT INTO circles (name, emoji, description, is_local) VALUES
  ('Pilates & Movement', '🧘', 'Sessions, form tips, motivation', false),
  ('Cycle Talk', '☽', 'Period questions, phase experiences', false),
  ('Nourish', '🌿', 'Recipes, hormone-supportive meals', false),
  ('Wins', '🏆', 'Celebrate every victory', false),
  ('Glow Up', '✨', 'Skin, beauty, self-care', false),
  ('Mental Health', '🧠', 'Mood, anxiety, soft life support', false),
  ('Sleep & Recovery', '💤', 'Wind-down routines, rest tips', false),
  ('Find My Tribe', '📍', 'Local meetups and gym buddies', true);

CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  circle_id uuid REFERENCES circles(id),
  content text NOT NULL,
  image_url text,
  is_anonymous boolean DEFAULT false,
  phase_snapshot text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE replies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, emoji)
);

CREATE TABLE phase_daily_prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_name text NOT NULL,
  prompt_date date NOT NULL,
  content text NOT NULL,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(phase_name, prompt_date)
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_daily_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts visible to all" ON posts FOR SELECT USING (true);
CREATE POLICY "users insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "replies visible to all" ON replies FOR SELECT USING (true);
CREATE POLICY "users insert own replies" ON replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions visible to all" ON reactions FOR SELECT USING (true);
CREATE POLICY "users manage own reactions" ON reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "prompts readable by all" ON phase_daily_prompts FOR SELECT USING (true);
CREATE POLICY "authenticated insert prompts" ON phase_daily_prompts FOR INSERT TO authenticated WITH CHECK (true);

-- ─── Phase 2 ─────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS meetup_rsvps CASCADE;
DROP TABLE IF EXISTS meetups CASCADE;
DROP TABLE IF EXISTS studio_review_summaries CASCADE;
DROP TABLE IF EXISTS studio_reviews CASCADE;
DROP TABLE IF EXISTS gym_buddy_profiles CASCADE;

CREATE TABLE meetups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  meetup_type text,
  location_city text,
  location_neighborhood text,
  meetup_date timestamptz,
  max_attendees int DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE meetup_rsvps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  meetup_id uuid REFERENCES meetups(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, meetup_id)
);

CREATE TABLE studio_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  studio_name text NOT NULL,
  studio_type text,
  location_city text,
  location_neighborhood text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  review_text text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE studio_review_summaries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  studio_name text NOT NULL UNIQUE,
  summary text NOT NULL,
  generated_at timestamptz DEFAULT now()
);

CREATE TABLE gym_buddy_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  location_city text,
  gym_name text,
  workout_styles text[] DEFAULT '{}',
  preferred_times text[] DEFAULT '{}',
  is_visible boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE studio_review_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_buddy_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meetups visible to all" ON meetups FOR SELECT USING (true);
CREATE POLICY "users insert own meetups" ON meetups FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "rsvps visible to all" ON meetup_rsvps FOR SELECT USING (true);
CREATE POLICY "users manage own rsvps" ON meetup_rsvps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "reviews visible to all" ON studio_reviews FOR SELECT USING (true);
CREATE POLICY "users insert own reviews" ON studio_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "summaries readable by all" ON studio_review_summaries FOR SELECT USING (true);
CREATE POLICY "authenticated insert summaries" ON studio_review_summaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated update summaries" ON studio_review_summaries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "buddy profiles visible" ON gym_buddy_profiles FOR SELECT USING (true);
CREATE POLICY "users manage own buddy profile" ON gym_buddy_profiles FOR ALL USING (auth.uid() = user_id);

-- ─── Phase 3 ─────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS challenge_entries CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;

CREATE TABLE badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon_emoji text,
  criteria text
);

CREATE TABLE challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  challenge_type text,
  module_link text,
  target_count int,
  start_date date,
  end_date date,
  badge_id uuid REFERENCES badges(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE challenge_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  current_progress int DEFAULT 0,
  UNIQUE(user_id, challenge_id)
);

CREATE TABLE user_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id),
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "badges visible to all" ON badges FOR SELECT USING (true);
CREATE POLICY "challenges visible to all" ON challenges FOR SELECT USING (true);
CREATE POLICY "entries visible to all" ON challenge_entries FOR SELECT USING (true);
CREATE POLICY "users manage own entries" ON challenge_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_badges visible to all" ON user_badges FOR SELECT USING (true);
CREATE POLICY "users insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

INSERT INTO badges (name, description, icon_emoji, criteria) VALUES
  ('Core Goddess', '7-Day Core Challenge complete', '🏛️', 'Complete 7 Pilates sessions in 7 days'),
  ('Hydration Queen', 'Hit water goal 14 days straight', '💧', 'Log 6+ glasses 14 days'),
  ('Phase Warrior', 'Logged every day for a full cycle', '☽', 'Log anything 28 days in a row'),
  ('Circle Spark', 'First community post', '✨', 'Post in any circle');

WITH b AS (SELECT id, name FROM badges)
INSERT INTO challenges (title, description, challenge_type, module_link, target_count, start_date, end_date, badge_id)
SELECT '7-Day Core Challenge','Complete 7 Pilates sessions','pilates','pilates_sessions',7,CURRENT_DATE,CURRENT_DATE+30,id FROM b WHERE name='Core Goddess'
UNION ALL
SELECT '14-Day Hydration Streak','Hit water goal 14 days','nourish','water_log',14,CURRENT_DATE,CURRENT_DATE+30,id FROM b WHERE name='Hydration Queen'
UNION ALL
SELECT 'Full Cycle Logger','Track something every day for 28 days','wellness','skin_logs',28,CURRENT_DATE,CURRENT_DATE+60,id FROM b WHERE name='Phase Warrior'
UNION ALL
SELECT 'Community Spark','Make your first community post','community','posts',1,CURRENT_DATE,CURRENT_DATE+90,id FROM b WHERE name='Circle Spark';

-- ─── Phase 4 ─────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS user_blocks CASCADE;
DROP TABLE IF EXISTS reports CASCADE;

CREATE TABLE user_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reason text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own blocks" ON user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "users manage own blocks" ON user_blocks FOR ALL USING (auth.uid() = blocker_id);
CREATE POLICY "users insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_choice text DEFAULT 'athena_1';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_phase_publicly boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_joined_at timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_on_leaderboard boolean DEFAULT false;

-- If profiles doesn't already have a readable policy, add one:
-- CREATE POLICY "profiles readable by authenticated" ON profiles FOR SELECT TO authenticated USING (true);

-- Supabase Storage: create a bucket named "community-posts" with public access
-- (Dashboard → Storage → New bucket → name: community-posts → Public: on)
