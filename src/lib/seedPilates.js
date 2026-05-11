/**
 * Pilates seed data runner.
 * Run from browser console or a one-time script:
 *   import { seedPilates } from './src/lib/seedPilates.js'
 *   seedPilates()
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Run the SQL below in your Supabase SQL editor BEFORE running this file.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { supabase } from './supabase'

// ─────────────────────────────────────────────────────────────────────────
// REQUIRED SQL (run in Supabase SQL editor first)
// ─────────────────────────────────────────────────────────────────────────
/*
-- Sessions
create table if not exists pilates_sessions (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  phase         text check (phase in ('menstrual','follicular','ovulation','luteal','all')),
  focus_area    text check (focus_area in ('core','glutes','arms','full_body','flexibility','recovery')),
  duration_min  int,
  difficulty    text check (difficulty in ('beginner','intermediate','advanced')),
  equipment     text default 'mat',
  thumbnail_url text,
  created_at    timestamptz default now()
);
alter table pilates_sessions enable row level security;
create policy "public read" on pilates_sessions for select using (true);

-- Exercises
create table if not exists pilates_exercises (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid references pilates_sessions(id) on delete cascade,
  name         text not null,
  sets         int,
  reps         int,
  duration_sec int,
  rest_sec     int default 30,
  form_cue     text,
  order_num    int,
  focus_area   text
);
alter table pilates_exercises enable row level security;
create policy "public read" on pilates_exercises for select using (true);

-- Session completions
create table if not exists session_completions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  session_id      uuid references pilates_sessions(id),
  completed_at    timestamptz default now(),
  duration_actual int,
  phase_at_time   text,
  rating          int check (rating between 1 and 5)
);
alter table session_completions enable row level security;
create policy "own" on session_completions using (auth.uid() = user_id);

-- Favorites
create table if not exists user_favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  session_id uuid references pilates_sessions(id) on delete cascade,
  unique(user_id, session_id)
);
alter table user_favorites enable row level security;
create policy "own" on user_favorites using (auth.uid() = user_id);

-- Challenges
create table if not exists challenges (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  description        text,
  duration_days      int,
  sessions_required  int,
  phase              text,
  badge_name         text,
  created_at         timestamptz default now()
);
alter table challenges enable row level security;
create policy "public read" on challenges for select using (true);

-- Challenge entries
create table if not exists challenge_entries (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade,
  challenge_id        uuid references challenges(id),
  joined_at           timestamptz default now(),
  sessions_completed  int default 0,
  completed_at        timestamptz
);
alter table challenge_entries enable row level security;
create policy "own" on challenge_entries using (auth.uid() = user_id);

-- Profile additions
alter table profiles add column if not exists level              text default 'beginner';
alter table profiles add column if not exists weekly_session_target int default 3;
alter table profiles add column if not exists preferred_duration int default 30;
alter table profiles add column if not exists preferred_equipment text default 'mat';
*/

// ─────────────────────────────────────────────────────────────────────────
// SESSION DATA  (5 per phase)
// ─────────────────────────────────────────────────────────────────────────
const SESSIONS = [
  // ── MENSTRUAL ────────────────────────────────────────────────────────
  {
    title: 'Gentle Restoration Flow',
    description: 'A nurturing session designed for the menstrual phase. These slow, supported movements honor your body during this time of release, helping ease cramping and lower back tension without depleting your energy.',
    phase: 'menstrual', focus_area: 'recovery', duration_min: 15, difficulty: 'beginner', equipment: 'mat',
  },
  {
    title: 'Spinal Release & Breathe',
    description: 'A deeply therapeutic practice focusing on spinal mobility and breath awareness. Ideal when your body is calling for gentleness and inward attention.',
    phase: 'menstrual', focus_area: 'flexibility', duration_min: 30, difficulty: 'beginner', equipment: 'mat',
  },
  {
    title: 'Restorative Mat Session',
    description: 'A longer, fully restorative practice that allows you to honor your need for rest. Gentle supine movements, deep stretches, and conscious breathing throughout.',
    phase: 'menstrual', focus_area: 'recovery', duration_min: 45, difficulty: 'beginner', equipment: 'mat',
  },
  {
    title: 'Pelvic Floor Reset',
    description: 'Focused breathwork and subtle core engagement to support your pelvic floor during menstruation. Light, intentional movement that restores rather than depletes.',
    phase: 'menstrual', focus_area: 'core', duration_min: 20, difficulty: 'beginner', equipment: 'mat',
  },
  {
    title: 'Supine Surrender Flow',
    description: 'Flowing movements entirely on your back. A beautiful intermediate session for those days when you want to move but stay close to the earth.',
    phase: 'menstrual', focus_area: 'flexibility', duration_min: 30, difficulty: 'intermediate', equipment: 'mat',
  },
  // ── FOLLICULAR ──────────────────────────────────────────────────────
  {
    title: 'Rising Energy Core',
    description: 'As your energy returns in the follicular phase, this session builds core foundation with classical Pilates exercises. A perfect entry into more dynamic movement.',
    phase: 'follicular', focus_area: 'core', duration_min: 30, difficulty: 'beginner', equipment: 'mat',
  },
  {
    title: 'Glute Awakening',
    description: 'Your growing strength and energy make this the ideal time to activate and build your glutes. This session uses classic mat work to fire up the posterior chain.',
    phase: 'follicular', focus_area: 'glutes', duration_min: 30, difficulty: 'beginner', equipment: 'mat',
  },
  {
    title: 'Full Body Foundation',
    description: 'A comprehensive intermediate session covering all muscle groups. Your follicular energy supports sustained effort and new challenges.',
    phase: 'follicular', focus_area: 'full_body', duration_min: 45, difficulty: 'intermediate', equipment: 'mat',
  },
  {
    title: 'Arm & Shoulder Sculpt',
    description: 'Upper body strength and tone using your bodyweight. Rising estrogen makes this phase ideal for building upper body endurance and strength.',
    phase: 'follicular', focus_area: 'arms', duration_min: 30, difficulty: 'intermediate', equipment: 'mat',
  },
  {
    title: 'Dynamic Stretch & Tone',
    description: 'A flowing session combining dynamic stretching with toning exercises. Great for days when you want to move freely and explore your range of motion.',
    phase: 'follicular', focus_area: 'flexibility', duration_min: 20, difficulty: 'beginner', equipment: 'mat',
  },
  // ── OVULATION ───────────────────────────────────────────────────────
  {
    title: 'Peak Power Core',
    description: 'Your peak energy phase calls for advanced core work. This challenging session uses classical and contemporary Pilates to maximize core strength and endurance.',
    phase: 'ovulation', focus_area: 'core', duration_min: 45, difficulty: 'intermediate', equipment: 'mat',
  },
  {
    title: 'Total Body Burn',
    description: 'Your most powerful session. Advanced full-body Pilates designed for ovulation\'s peak energy. High intensity, high focus, high reward.',
    phase: 'ovulation', focus_area: 'full_body', duration_min: 45, difficulty: 'advanced', equipment: 'mat',
  },
  {
    title: 'Glute Sculptor',
    description: 'An intermediate glute-focused session that takes advantage of your peak strength capacity. Expect deep work and satisfying results.',
    phase: 'ovulation', focus_area: 'glutes', duration_min: 30, difficulty: 'intermediate', equipment: 'mat',
  },
  {
    title: 'Strong Arms & Back',
    description: 'Build impressive upper body strength using only the mat. Your ovulation energy sustains the intensity required for this focused arm and back session.',
    phase: 'ovulation', focus_area: 'arms', duration_min: 30, difficulty: 'intermediate', equipment: 'mat',
  },
  {
    title: 'Athletic Flow',
    description: 'Advanced dynamic movement linking breath, core, and flow. A challenging session for ovulation\'s peak that builds athleticism and body awareness.',
    phase: 'ovulation', focus_area: 'full_body', duration_min: 30, difficulty: 'advanced', equipment: 'mat',
  },
  // ── LUTEAL ──────────────────────────────────────────────────────────
  {
    title: 'Grounding Evening Flow',
    description: 'As your energy turns inward, this session anchors you in calm, grounding movement. Perfect for evenings when your body is asking to slow down.',
    phase: 'luteal', focus_area: 'flexibility', duration_min: 30, difficulty: 'beginner', equipment: 'mat',
  },
  {
    title: 'Mindful Core & Breathe',
    description: 'Intentional core work paired with deep breathing for the luteal phase. Builds strength without overstimulation, honoring your shifting energy.',
    phase: 'luteal', focus_area: 'core', duration_min: 30, difficulty: 'intermediate', equipment: 'mat',
  },
  {
    title: 'Hip & Glute Release',
    description: 'A longer session dedicated to releasing tension in the hips and glutes — common tension areas in the luteal phase. Combines strengthening and deep release.',
    phase: 'luteal', focus_area: 'glutes', duration_min: 45, difficulty: 'intermediate', equipment: 'mat',
  },
  {
    title: 'Wind Down Restoration',
    description: 'Gentle restorative movement for the late luteal phase. Release tension, drop into your body, and prepare for the renewal of your next cycle.',
    phase: 'luteal', focus_area: 'recovery', duration_min: 20, difficulty: 'beginner', equipment: 'mat',
  },
  {
    title: 'Intuitive Movement',
    description: 'A balanced full-body session for the luteal phase that moves with — not against — your body\'s changing needs. Sustainable effort, conscious pace.',
    phase: 'luteal', focus_area: 'full_body', duration_min: 30, difficulty: 'intermediate', equipment: 'mat',
  },
]

// ─────────────────────────────────────────────────────────────────────────
// EXERCISES  (keyed by session title)
// ─────────────────────────────────────────────────────────────────────────
const EXERCISES = {
  'Gentle Restoration Flow': [
    { name: 'Constructive Rest',     duration_sec: 90,  rest_sec: 10, order_num: 1, focus_area: 'recovery',     form_cue: 'Lie on your back with knees bent, feet flat on the mat hip-width apart. Allow your spine to soften and your arms to rest beside you. Breathe deeply and let gravity support you.' },
    { name: 'Supine Knee Circles',   sets: 1, reps: 8,  rest_sec: 20, order_num: 2, focus_area: 'recovery',     form_cue: 'Draw one knee toward your chest and trace slow circles. Keep your lower back heavy on the mat. Switch legs. Move with your breath — inhale to start, exhale to complete each circle.' },
    { name: 'Gentle Spinal Twist',   duration_sec: 45,  rest_sec: 15, order_num: 3, focus_area: 'flexibility',  form_cue: 'From your back, let both knees fall gently to one side. Extend opposite arm. Breathe into the stretch, releasing tension with each exhale. Hold, then switch.' },
    { name: "Child's Pose",          duration_sec: 90,  rest_sec: 10, order_num: 4, focus_area: 'recovery',     form_cue: 'Sit back toward your heels, arms extended forward on the mat. Let your forehead release toward the mat. Breathe into your lower back, feeling it expand with each inhale.' },
    { name: 'Hip Flexor Supine',     duration_sec: 45,  rest_sec: 15, order_num: 5, focus_area: 'flexibility',  form_cue: 'Lying on your back, draw one knee to chest while keeping the other leg long on the mat. Gently press the drawn knee toward you. Feel the release along the front of the extended hip.' },
  ],

  'Spinal Release & Breathe': [
    { name: 'Diaphragmatic Breathing', duration_sec: 120, rest_sec: 10, order_num: 1, focus_area: 'recovery',    form_cue: 'Lie on your back, one hand on belly, one on chest. Breathe to expand the belly first, then the chest. Exhale fully, drawing navel toward spine. Three counts in, four counts out.' },
    { name: 'Knee Fold with Breath',   sets: 2, reps: 8,  rest_sec: 20, order_num: 2, focus_area: 'core',        form_cue: 'On an exhale, float one knee up to tabletop. Inhale at the top. Exhale to lower. The movement should come from the core, not momentum. Keep pelvis completely still.' },
    { name: 'Spine Articulation',      sets: 2, reps: 6,  rest_sec: 30, order_num: 3, focus_area: 'flexibility', form_cue: 'From standing, nod your head then slowly peel your spine forward, vertebra by vertebra, until you hang heavy. Slowly rebuild by pressing the feet to re-stack each vertebra from the base up.' },
    { name: 'Cat-Cow Stretch',         sets: 1, reps: 10, rest_sec: 20, order_num: 4, focus_area: 'flexibility', form_cue: 'On hands and knees, inhale to drop your belly and lift your head (cow). Exhale to arch your back and tuck your chin (cat). Move with your breath. Let the spine wave like water.' },
    { name: 'Mermaid Side Stretch',    duration_sec: 45,  rest_sec: 15, order_num: 5, focus_area: 'flexibility', form_cue: 'Sitting with legs folded, reach one arm up and over your head, creating a long lateral line. Breathe into the side of your ribs. Keep both sit bones grounded.' },
    { name: 'Figure Four Stretch',     duration_sec: 60,  rest_sec: 15, order_num: 6, focus_area: 'flexibility', form_cue: 'Lying on back, cross one ankle over the opposite knee. Either stay here or draw both legs toward you. Flex the top foot to protect the knee. Breathe into the outer hip.' },
  ],

  'Restorative Mat Session': [
    { name: 'Full Body Scan',          duration_sec: 120, rest_sec: 10, order_num: 1, focus_area: 'recovery',    form_cue: 'Lying on your back in savasana, systematically bring awareness to each body part from feet to crown. Release any held tension with each exhale. No movement, only presence.' },
    { name: 'Knee Circles',            sets: 1, reps: 8,  rest_sec: 20, order_num: 2, focus_area: 'recovery',    form_cue: 'Draw both knees to chest and circle them slowly together. Feel your lower back press into and release from the mat. Keep circles small and even.' },
    { name: 'Supine Twist',            duration_sec: 60,  rest_sec: 15, order_num: 3, focus_area: 'flexibility', form_cue: 'Knees bent, allow them to fall to one side. Extend opposite arm. Close your eyes and breathe into the rotation. Stay for 60 seconds, feeling tension melt with each exhale.' },
    { name: 'Legs Up the Wall',        duration_sec: 180, rest_sec: 10, order_num: 4, focus_area: 'recovery',    form_cue: 'Scoot close to a wall and rest your legs up it. Allow your lower back to soften. This gentle inversion promotes circulation and eases heavy legs. Breathe slowly and deeply.' },
    { name: "Child's Pose with Breath",duration_sec: 90,  rest_sec: 15, order_num: 5, focus_area: 'recovery',    form_cue: 'In child\'s pose, actively breathe into your back body. Feel your lower back and ribs expand on each inhale. On each exhale, feel your body sink deeper into the pose.' },
    { name: 'Gentle Neck Release',     duration_sec: 45,  rest_sec: 15, order_num: 6, focus_area: 'flexibility', form_cue: 'Lying on your back, slowly tilt your ear toward your shoulder. Place your hand gently on the same side of your head for light traction. Feel the release along the opposite side of your neck.' },
    { name: 'Savasana',                duration_sec: 120, rest_sec: 0,  order_num: 7, focus_area: 'recovery',    form_cue: 'Release all effort. Soften every muscle. Feel the weight of your body supported completely by the mat. Allow your breath to become natural and quiet. Simply be.' },
  ],

  'Pelvic Floor Reset': [
    { name: 'Breath Awareness',        duration_sec: 90,  rest_sec: 10, order_num: 1, focus_area: 'core',        form_cue: 'Lie on your back, knees bent. Place one hand on your lower belly. On your exhale, notice a natural lift through your pelvic floor. Do not force — simply observe and soften.' },
    { name: 'Kegel Contractions',      sets: 3, reps: 10, rest_sec: 30, order_num: 2, focus_area: 'core',        form_cue: 'Gently draw up through the pelvic floor as if stopping the flow of urine. Hold for 3 seconds, then release fully. Breathe throughout. The release is as important as the contraction.' },
    { name: 'Supine Hip Lifts',        sets: 2, reps: 8,  rest_sec: 30, order_num: 3, focus_area: 'core',        form_cue: 'Feet flat on mat, exhale and press through your feet to lift your hips slightly. Hold briefly at the top, connecting to your pelvic floor. Slowly lower on the inhale.' },
    { name: 'Happy Baby',              duration_sec: 60,  rest_sec: 15, order_num: 4, focus_area: 'flexibility', form_cue: 'Lie on your back and draw both knees wide toward your armpits, holding the outer edges of your feet. Gently press your feet into your hands. Let the pelvic floor completely release.' },
    { name: 'Supine Breathing Close',  duration_sec: 90,  rest_sec: 0,  order_num: 5, focus_area: 'recovery',    form_cue: 'Return to breath awareness. On each exhale, notice a gentle lift. On each inhale, a conscious release. Let this rhythm become natural. Feel the integration in your body.' },
  ],

  'Supine Surrender Flow': [
    { name: 'Supine Foot Flex Series', sets: 1, reps: 10, rest_sec: 20, order_num: 1, focus_area: 'flexibility', form_cue: 'Lying on your back, flex and point each foot, then circle through the ankle in both directions. Keep your legs either grounded or elevated — whichever feels supportive.' },
    { name: 'Single Leg Lift',         sets: 2, reps: 8,  rest_sec: 30, order_num: 2, focus_area: 'core',        form_cue: 'From your back, float one leg to the ceiling on an exhale, keeping the pelvis absolutely still. Inhale at the top, exhale to lower with control. The lower back stays connected to the mat.' },
    { name: 'Windmill Legs',           sets: 2, reps: 6,  rest_sec: 30, order_num: 3, focus_area: 'flexibility', form_cue: 'Both legs to the ceiling, slowly lower them as far as your lower back stays anchored. Inhale down, exhale up. Keep the movement slow and controlled, feeling deep abdominal connection.' },
    { name: 'Supine Spinal Twist',     duration_sec: 45,  rest_sec: 20, order_num: 4, focus_area: 'flexibility', form_cue: 'Both knees fall to one side, arms open wide. Feel the rotation through your thoracic spine. Breathe. On each exhale, soften further. Stay with the experience rather than the shape.' },
    { name: 'Bridge Pose',             sets: 3, reps: 8,  rest_sec: 30, order_num: 5, focus_area: 'glutes',      form_cue: 'Feet flat, press through both feet evenly as you lift your hips to a diagonal. Squeeze glutes at the top. Slowly lower one vertebra at a time. Feel the articulation of your spine.' },
    { name: 'Savasana Flow Close',     duration_sec: 90,  rest_sec: 0,  order_num: 6, focus_area: 'recovery',    form_cue: 'End in complete rest. Notice how your body feels after movement — the warmth, the aliveness. Breathe without effort. Allow the benefits of the session to integrate.' },
  ],

  'Rising Energy Core': [
    { name: 'Pelvic Tilt',            sets: 2, reps: 10, rest_sec: 20, order_num: 1, focus_area: 'core',   form_cue: 'Lying on your back, gently tilt your pelvis to flatten your lower back into the mat on the exhale, then release to a natural curve on the inhale. Small, precise movement.' },
    { name: 'Knee Fold Single Leg',   sets: 3, reps: 8,  rest_sec: 25, order_num: 2, focus_area: 'core',   form_cue: 'Float one knee to tabletop on an exhale. Your deep abdominals should initiate the movement — not the hip flexors. Keep your pelvis level and your lower back connected to the mat.' },
    { name: 'Hundred Prep',           duration_sec: 60,  rest_sec: 30, order_num: 3, focus_area: 'core',   form_cue: 'Curl head and shoulders off the mat. Hover arms just above the mat. Pump arms up and down 5 counts inhale, 5 counts exhale. Keep the curl of your upper body consistent.' },
    { name: 'Roll Up',                sets: 3, reps: 5,  rest_sec: 30, order_num: 4, focus_area: 'core',   form_cue: 'Lie flat, arms overhead. Inhale to prepare. Exhale, nod your head, peel your spine off the mat reaching toward your feet. Inhale at the top. Exhale to reverse, melting back down vertebra by vertebra.' },
    { name: 'Single Leg Stretch',     sets: 3, reps: 8,  rest_sec: 30, order_num: 5, focus_area: 'core',   form_cue: 'Curl your head and shoulders up. Draw one knee in while extending the other leg. Switch in a flowing motion. Inhale for two switches, exhale for two. Keep your curl stable throughout.' },
    { name: 'Criss Cross',            sets: 3, reps: 10, rest_sec: 30, order_num: 6, focus_area: 'core',   form_cue: 'From your curl, rotate to draw one elbow toward the opposite knee. Extend the other leg. Change sides in a controlled rhythm. The rotation comes from your waist, not your neck or shoulders.' },
  ],

  'Glute Awakening': [
    { name: 'Bridge Lift',            sets: 3, reps: 12, rest_sec: 30, order_num: 1, focus_area: 'glutes', form_cue: 'Feet flat and parallel, hip-width apart. Press through your heels as you lift your hips to a diagonal. Squeeze your glutes at the top — feel the work in your seat, not your lower back.' },
    { name: 'Single Leg Bridge',      sets: 3, reps: 8,  rest_sec: 30, order_num: 2, focus_area: 'glutes', form_cue: 'In bridge, extend one leg to the ceiling. Maintain level hips. Lower and lift the raised hip to meet the grounded hip height. Your supporting glute must stay active to prevent sinking.' },
    { name: 'Clam Shell',             sets: 3, reps: 12, rest_sec: 25, order_num: 3, focus_area: 'glutes', form_cue: 'Lying on your side, feet together and knees bent at 45 degrees. Keep feet together as you rotate the top knee open like a clamshell. The movement is in the hip, not the waist. Keep pelvis still.' },
    { name: 'Donkey Kick',            sets: 3, reps: 10, rest_sec: 25, order_num: 4, focus_area: 'glutes', form_cue: 'On all fours, flex your foot and press your heel toward the ceiling, keeping your knee at 90 degrees. Squeeze your glute at the top. Your back stays completely flat — do not let the hip hike.' },
    { name: 'Fire Hydrant',           sets: 3, reps: 10, rest_sec: 25, order_num: 5, focus_area: 'glutes', form_cue: 'From all fours, lift one knee directly out to the side, keeping it at 90 degrees. Your torso and pelvis should not shift. Isolate the hip abductor. Control the return.' },
    { name: 'Bridge Pulse',           sets: 3, reps: 15, rest_sec: 30, order_num: 6, focus_area: 'glutes', form_cue: 'Hold your hips at bridge height and pulse upward with small, rapid movements. Keep your glutes contracted and your hips as high as possible. Feel the burn build through the session.' },
  ],

  'Full Body Foundation': [
    { name: 'Roll Down Warm Up',       sets: 2, reps: 5,  rest_sec: 20, order_num: 1, focus_area: 'flexibility', form_cue: 'From standing, nod your head and peel your spine forward, vertebra by vertebra. Hang heavy, then rebuild from the base up. Find articulation in every segment of your spine.' },
    { name: 'Hundred',                 duration_sec: 90,  rest_sec: 30, order_num: 2, focus_area: 'core',        form_cue: 'Curl to a consistent head-and-shoulder height. Legs in tabletop or extended to 45 degrees. Pump your arms vigorously: 5 counts inhale, 5 counts exhale. Keep energy in the tips of your fingers.' },
    { name: 'Leg Circle',              sets: 2, reps: 5,  rest_sec: 30, order_num: 3, focus_area: 'core',        form_cue: 'One leg to ceiling, stabilize your torso. Circle the leg across your midline, down, around, and back up. Your pelvis must not rock. Reverse direction. The challenge is the stillness, not the movement.' },
    { name: 'Side Kick Series',        sets: 2, reps: 8,  rest_sec: 30, order_num: 4, focus_area: 'glutes',      form_cue: 'Lying on your side, feet stacked or staggered. Kick the top leg forward on a double inhale, then sweep back on a single exhale. Keep your torso completely stable and your waist lifted off the mat.' },
    { name: 'Push Up',                 sets: 3, reps: 8,  rest_sec: 30, order_num: 5, focus_area: 'arms',        form_cue: 'From a plank, bend elbows at a 45-degree angle to your body. Lower your chest toward the mat with control. Press the mat away to return. Maintain a rigid plank body throughout — no piking or sagging.' },
    { name: 'Teaser Prep',             sets: 3, reps: 5,  rest_sec: 35, order_num: 6, focus_area: 'core',        form_cue: 'From your back, roll up to a V position with knees bent. Hold briefly, finding balance on your sit bones with a long spine. Lower back down with control. This is a test of abdominal strength and control.' },
    { name: 'Swan Dive Prep',          sets: 3, reps: 5,  rest_sec: 30, order_num: 7, focus_area: 'full_body',   form_cue: 'Lying on your belly, press through your hands to lift your upper body. Keep your elbows soft and the movement coming from your back extensors, not your arms. Gaze slightly forward, not up.' },
    { name: "Child's Pose Close",      duration_sec: 60,  rest_sec: 0,  order_num: 8, focus_area: 'recovery',    form_cue: 'Sit back into child\'s pose. Let all effort dissolve. Feel the lengthening in your lower back and hips after the work. Breathe freely and let your body integrate the session.' },
  ],

  'Arm & Shoulder Sculpt': [
    { name: 'Chest Expansion',        sets: 3, reps: 10, rest_sec: 25, order_num: 1, focus_area: 'arms',   form_cue: 'Kneeling or standing, arms forward. Sweep arms back, squeezing your shoulder blades together. Hold briefly. Return with control. Feel the opening across your chest and activation across your upper back.' },
    { name: 'Pilates Push Up',        sets: 3, reps: 8,  rest_sec: 35, order_num: 2, focus_area: 'arms',   form_cue: 'Lower into a Pilates push-up with a perfectly rigid plank. Elbows track past your ribs. Lower until your chest nearly touches the mat. Press the mat away with equal force. No flaring elbows.' },
    { name: 'Tricep Dip',             sets: 3, reps: 10, rest_sec: 30, order_num: 3, focus_area: 'arms',   form_cue: 'Seated with hands behind you, fingers forward, legs extended. Bend elbows to lower hips toward the mat. Press through your palms to lift. Keep your shoulders down — do not shrug.' },
    { name: 'Thread the Needle',      sets: 2, reps: 8,  rest_sec: 25, order_num: 4, focus_area: 'arms',   form_cue: 'On hands and knees, thread one arm under your body, rotating your thoracic spine. Feel the shoulder and upper back stretch. Return and repeat. Focus on spinal rotation rather than reaching distance.' },
    { name: 'Plank Hold',             duration_sec: 45,  rest_sec: 30, order_num: 5, focus_area: 'arms',   form_cue: 'Hold a perfect plank: wrists under shoulders, hips level with shoulders and heels. Press the mat away. Draw your navel in. Hold your gaze slightly ahead of your hands. Every muscle is working.' },
    { name: 'Cobra Press',            sets: 3, reps: 8,  rest_sec: 25, order_num: 6, focus_area: 'arms',   form_cue: 'Lying on your belly, hands beside your chest. Exhale and press through your hands, lifting your chest. Use your back extensors, arms only assisting. Hold 2 seconds at the top. Lower with control.' },
  ],

  'Dynamic Stretch & Tone': [
    { name: 'Standing Roll Down',     sets: 2, reps: 5,  rest_sec: 20, order_num: 1, focus_area: 'flexibility', form_cue: 'From standing, nod your head and let the weight of your head and arms take your spine into a forward curl. Breathe at the bottom. Rebuild slowly from your base, pressing feet into the floor.' },
    { name: 'Lunge Hip Flexor',       duration_sec: 45,  rest_sec: 20, order_num: 2, focus_area: 'flexibility', form_cue: 'Step into a deep lunge, back knee lowered. Shift your weight forward until you feel a stretch in the front of your back hip. Breathe into the stretch. Keep your front knee tracking over your ankle.' },
    { name: 'World\'s Greatest Stretch', sets: 2, reps: 5, rest_sec: 25, order_num: 3, focus_area: 'flexibility', form_cue: 'From a lunge, plant your same-side hand inside your front foot. Rotate your opposite arm to the sky, following with your gaze. Feel the spiral through your entire body. Switch sides.' },
    { name: 'Leg Pull Front',         sets: 2, reps: 6,  rest_sec: 30, order_num: 4, focus_area: 'full_body',   form_cue: 'In a plank, lift one leg with a pointed toe. Rock forward and back through your toes — a small but demanding movement. Your entire body must maintain rigidity. Switch legs.' },
    { name: 'Pigeon Stretch',         duration_sec: 60,  rest_sec: 15, order_num: 5, focus_area: 'flexibility', form_cue: 'From all fours, bring one shin forward parallel to your mat\'s short edge. Extend the back leg. Lower forward over your front shin. Breathe into your outer hip. Feel the deep hip opener.' },
  ],

  'Peak Power Core': [
    { name: 'Hundred',                duration_sec: 90,  rest_sec: 30, order_num: 1, focus_area: 'core',   form_cue: 'Full classical hundred: curl high, legs extended to 45 degrees. Pump your arms for 100 counts breathing 5 in, 5 out. Maintain a steady, high curl. Draw your navel deeply to your spine.' },
    { name: 'Roll Up',                sets: 4, reps: 8,  rest_sec: 25, order_num: 2, focus_area: 'core',   form_cue: 'Classical roll up — arms overhead to start. Articulate through every vertebra both up and down. Keep your feet grounded. The hardest part is maintaining the hollow curve of your abdomen throughout.' },
    { name: 'Single Leg Stretch',     sets: 4, reps: 10, rest_sec: 25, order_num: 3, focus_area: 'core',   form_cue: 'Alternating single leg stretch: one hand on ankle, one on knee. Switch with precision and rhythm. Both elbows wide. Maintain a consistent deep curl of the upper body. No bouncing of the head.' },
    { name: 'Double Leg Stretch',     sets: 4, reps: 10, rest_sec: 25, order_num: 4, focus_area: 'core',   form_cue: 'Draw both knees in, exhale extend both legs and arms. Circle arms around to gather knees in on the next exhale. Your abdominals must scoop deeper as your legs extend further.' },
    { name: 'Criss Cross',            sets: 4, reps: 12, rest_sec: 25, order_num: 5, focus_area: 'core',   form_cue: 'Rotate your upper body deeply as you extend each leg. Hold each position briefly before switching. Focus on the oblique contraction at the end range. The extended leg controls the work load.' },
    { name: 'Teaser',                 sets: 3, reps: 5,  rest_sec: 40, order_num: 6, focus_area: 'core',   form_cue: 'From your back, simultaneously lift both legs and your torso to form a perfect V. Hold at the top. Roll down slowly. This is one of the most demanding core exercises — full body control required.' },
    { name: 'Plank to Downdog',       sets: 3, reps: 8,  rest_sec: 30, order_num: 7, focus_area: 'core',   form_cue: 'From plank, exhale to push back through a downward-facing dog — hips high, long spine. Inhale forward to plank. The transition should be fluid and controlled, with deep core engagement throughout.' },
  ],

  'Total Body Burn': [
    { name: 'Warm Up Flow',           sets: 1, reps: 8,  rest_sec: 20, order_num: 1, focus_area: 'full_body', form_cue: 'Cat-cow to child\'s pose to downdog: flow through these shapes 8 times to prepare your body for the intensity ahead. Move with your breath. Warm up slowly to work intensely.' },
    { name: 'Hundred Advanced',       duration_sec: 100, rest_sec: 30, order_num: 2, focus_area: 'core',      form_cue: 'Full hundred with legs fully extended low to the mat. The lower the legs, the more work your abdominals must do to support them. Maintain an absolutely stable pelvis throughout all 100 counts.' },
    { name: 'Jackknife',              sets: 3, reps: 5,  rest_sec: 40, order_num: 3, focus_area: 'core',      form_cue: 'Roll your legs overhead then press them straight to the ceiling in one motion, body in a vertical line. Lower your hips back down with control. This advanced inversion requires significant spinal mobility.' },
    { name: 'Control Balance',        sets: 3, reps: 4,  rest_sec: 40, order_num: 4, focus_area: 'full_body', form_cue: 'In shoulder stand position, hold one leg vertical and lower the other toward the mat. Alternate legs with control. Deep abdominal work combined with shoulder stability and hip flexor strength.' },
    { name: 'Side Kick Kneeling',     sets: 3, reps: 10, rest_sec: 30, order_num: 5, focus_area: 'glutes',    form_cue: 'Kneel with one hand on the mat and the other behind your head. Lift the opposite leg to hip height and kick forward and back. Balance and core control are tested as much as leg strength.' },
    { name: 'Push Up Series',         sets: 4, reps: 10, rest_sec: 30, order_num: 6, focus_area: 'arms',      form_cue: 'Classical Pilates push ups from a full plank. Elbows by your sides. Between each set, walk your hands back to your feet and roll up to standing. Roll back down to start. This transition is part of the exercise.' },
    { name: 'Full Teaser Hold',       duration_sec: 30,  rest_sec: 40, order_num: 7, focus_area: 'core',      form_cue: 'Hold the teaser V-position for a sustained 30 seconds. Breathe. Find the balance between effort and ease at your current maximum. This tests everything you have built in the session.' },
    { name: 'Cool Down Roll',         sets: 1, reps: 6,  rest_sec: 15, order_num: 8, focus_area: 'recovery',  form_cue: 'Lie on your back, hug your knees, and gently roll side to side on your spine. Massage the muscles you have worked. Breathe freely and feel your effort transform into integration.' },
  ],

  'Glute Sculptor': [
    { name: 'Heel Press Series',      sets: 3, reps: 15, rest_sec: 25, order_num: 1, focus_area: 'glutes', form_cue: 'Face down, hands under forehead, press one heel toward the ceiling keeping the knee bent. Squeeze your glute maximally at the top. Your hip stays on the mat. Control the return.' },
    { name: 'Bridge with Abduction',  sets: 3, reps: 10, rest_sec: 30, order_num: 2, focus_area: 'glutes', form_cue: 'In bridge, open both knees outward against the resistance of gravity, then squeeze them back together. Keep your hips lifted throughout. Feel both the glutes and the hip abductors working.' },
    { name: 'Arabesque Pulses',       sets: 3, reps: 20, rest_sec: 25, order_num: 3, focus_area: 'glutes', form_cue: 'On all fours, extend one leg straight behind you. Pulse upward with small, rapid movements. Keep the glute contracted and the movement coming from the hip, not the lower back.' },
    { name: 'Prone Hip Extension',    sets: 3, reps: 8,  rest_sec: 30, order_num: 4, focus_area: 'glutes', form_cue: 'Lying face down, lift both legs slightly off the mat — just an inch — then alternate pressing one higher than the other. Both glutes working. Keep your lower back from arching excessively.' },
    { name: 'Standing Balance Kick',  sets: 3, reps: 8,  rest_sec: 30, order_num: 5, focus_area: 'glutes', form_cue: 'Standing on one leg, hinge forward slightly and extend the opposite leg behind you in a standing arabesque. Squeeze the lifted glute. Your supporting leg works hard for balance. Arms can extend forward.' },
    { name: 'Bridge Hold & Squeeze',  duration_sec: 45,  rest_sec: 30, order_num: 6, focus_area: 'glutes', form_cue: 'Hold your bridge at maximum height and squeeze your glutes as hard as you can for 45 seconds straight. Breathe continuously. This isometric hold will fatigue the muscles deeply.' },
  ],

  'Strong Arms & Back': [
    { name: 'Lat Pull Down Reach',    sets: 3, reps: 10, rest_sec: 25, order_num: 1, focus_area: 'arms',   form_cue: 'Sitting tall, reach both arms overhead. Draw them down and back as if pulling a bar, squeezing your shoulder blades together and engaging your lats. Breathe out on the pull, in on the release.' },
    { name: 'Superman Hold',          duration_sec: 45,  rest_sec: 30, order_num: 2, focus_area: 'arms',   form_cue: 'Lying face down, simultaneously lift your arms, chest, and legs off the mat. Hold this extended position. Your back extensors, glutes, and shoulders all work together. Breathe steadily throughout.' },
    { name: 'Tricep Push Up',         sets: 3, reps: 10, rest_sec: 30, order_num: 3, focus_area: 'arms',   form_cue: 'Narrow push up with elbows tracking past your hips. This variation maximally loads the triceps. Keep a perfectly straight body line. If needed, lower to knees while maintaining hip extension.' },
    { name: 'Swimming',               duration_sec: 60,  rest_sec: 25, order_num: 4, focus_area: 'full_body', form_cue: 'Face down, lift opposite arm and leg simultaneously. Alternate in a rapid flutter, breathing rhythmically. Your spine stays neutral and your belly draws in to support your lower back.' },
    { name: 'Side Plank',             duration_sec: 30,  rest_sec: 30, order_num: 5, focus_area: 'arms',   form_cue: 'Support yourself on one hand (or forearm) and the outer edge of your foot. Your body forms one straight diagonal line. Resist the urge to let your hip sag. Press the floor away throughout.' },
    { name: 'Down Dog Push Up',       sets: 3, reps: 8,  rest_sec: 30, order_num: 6, focus_area: 'arms',   form_cue: 'From downward dog, lower your head toward the mat by bending your elbows — this loads the shoulders and triceps uniquely. Press back to downdog. A challenging variation that requires shoulder stability.' },
  ],

  'Athletic Flow': [
    { name: 'Standing Warm Up Flow',  duration_sec: 90,  rest_sec: 15, order_num: 1, focus_area: 'full_body', form_cue: 'Roll downs, arm circles, hip circles, and deep lunges. Move freely through these preparatory shapes for 90 seconds. Get your blood moving and your joints lubricated for the advanced work ahead.' },
    { name: 'Plank Flow Series',      sets: 3, reps: 8,  rest_sec: 30, order_num: 2, focus_area: 'full_body', form_cue: 'Plank → pike push up → downdog → single leg downdog → plank. Each transition should be controlled and fluid. Your core must work continuously to maintain stability through these shape changes.' },
    { name: 'Jumping Lunges',         sets: 3, reps: 10, rest_sec: 35, order_num: 3, focus_area: 'full_body', form_cue: 'From a lunge, use explosive power to jump and switch legs in the air. Land softly, absorbing the impact through your bent knee. This is the most cardiovascular moment of the session — push hard.' },
    { name: 'Rolling Like a Ball',    sets: 3, reps: 8,  rest_sec: 20, order_num: 4, focus_area: 'core',      form_cue: 'Balance on your sit bones, spine in a C-curve, hands on ankles. Roll back to your shoulder blades — not your neck — and roll back up to balance. Use your abdominals, not momentum, to return.' },
    { name: 'Boomerang',              sets: 3, reps: 4,  rest_sec: 40, order_num: 5, focus_area: 'full_body', form_cue: 'This advanced sequence moves from roll up through overhead leg crossing to balance and stretching. It requires coordination, abdominal strength, and spinal mobility. Move with clear intention.' },
    { name: 'Full Body Burn Out',     duration_sec: 60,  rest_sec: 30, order_num: 6, focus_area: 'full_body', form_cue: 'Alternate between 10 seconds of maximum effort plank reaches and 10 seconds of active recovery in child\'s pose. Six rounds. Push to your edge, recover completely, and push again.' },
  ],

  'Grounding Evening Flow': [
    { name: 'Seated Breath Work',     duration_sec: 120, rest_sec: 10, order_num: 1, focus_area: 'recovery',    form_cue: 'Sit tall and breathe in for 4 counts, hold for 4, exhale for 6. This longer exhale activates the parasympathetic nervous system, beginning the grounding process before movement.' },
    { name: 'Cat-Cow Slow',           sets: 1, reps: 10, rest_sec: 20, order_num: 2, focus_area: 'flexibility', form_cue: 'Move through cat-cow at half your normal speed. Linger at each end of the movement. Breathe into areas of tightness. Let this be a moving meditation — no rush, only presence.' },
    { name: 'Seated Spinal Rotation', sets: 2, reps: 8,  rest_sec: 25, order_num: 3, focus_area: 'flexibility', form_cue: 'Sitting tall, cross your arms across your chest. Slowly rotate your upper body to one side on the exhale, return on the inhale. Keep your lower body still. Feel each vertebra participate in the rotation.' },
    { name: 'Mermaid Deep Stretch',   duration_sec: 60,  rest_sec: 20, order_num: 4, focus_area: 'flexibility', form_cue: 'Allow yourself to fully inhabit this lateral stretch. Place your hand on the mat for support and reach deeply over. Breathe into the side of your ribs. Feel the space you are creating.' },
    { name: 'Hip Flexor Release',     duration_sec: 60,  rest_sec: 20, order_num: 5, focus_area: 'flexibility', form_cue: 'In a kneeling lunge, shift your weight forward until you feel the stretch at the front of your back hip. Let go completely. This area holds significant tension during the luteal phase — give it time.' },
    { name: 'Supine Release',         duration_sec: 120, rest_sec: 0,  order_num: 6, focus_area: 'recovery',    form_cue: 'Lie flat on your back. Let your legs fall naturally apart. Arms slightly away from your body. Close your eyes. Breathe without control. Let the mat support you completely. Rest here.' },
  ],

  'Mindful Core & Breathe': [
    { name: 'Breath Foundation',      duration_sec: 90,  rest_sec: 15, order_num: 1, focus_area: 'core',   form_cue: 'Lying on your back, find the natural breath-to-core connection. On each exhale, feel your deep abdominals draw in gently. Establish this pattern before you begin moving. Let the breath lead.' },
    { name: 'Pelvic Tilt Series',     sets: 3, reps: 10, rest_sec: 25, order_num: 2, focus_area: 'core',   form_cue: 'Move slowly between pelvic tilt (spine flat) and neutral spine. Find every gradation between these two positions. This develops proprioception and control in the deep stabilizers of your spine.' },
    { name: 'Slow Hundred',           duration_sec: 100, rest_sec: 35, order_num: 3, focus_area: 'core',   form_cue: 'Perform the hundred at half speed. Focus on the quality of each breath, the depth of your curl, and the consistency of your arm pump. Less is more in the luteal phase — precision over intensity.' },
    { name: 'Roll Up Slow',           sets: 3, reps: 6,  rest_sec: 35, order_num: 4, focus_area: 'core',   form_cue: 'Take 8 full seconds to roll up and 8 full seconds to roll back down. This slow pace eliminates momentum and requires pure abdominal strength and control. Notice where your control breaks down.' },
    { name: 'Scissors Controlled',    sets: 3, reps: 8,  rest_sec: 30, order_num: 5, focus_area: 'core',   form_cue: 'Lie on your back, both legs to the ceiling. Slowly lower one leg toward the mat while the other stays vertical. Your lower back must not lift. This is maximum control — no speed, no momentum.' },
    { name: 'Savasana Integration',   duration_sec: 90,  rest_sec: 0,  order_num: 6, focus_area: 'recovery', form_cue: 'Let go of all effort. Feel the intelligent core connection you have just cultivated. Notice the gentle internal tone that remains even in rest. Breathe into your belly. This is enough.' },
  ],

  'Hip & Glute Release': [
    { name: 'Supine Hip Rotation',    sets: 2, reps: 8,  rest_sec: 25, order_num: 1, focus_area: 'flexibility', form_cue: 'Lying on your back with one knee bent, allow the knee to trace large circles toward the ceiling and back around. Let the hip joint move freely in all directions. Release, do not force.' },
    { name: 'Figure Four Stretch',    duration_sec: 90,  rest_sec: 20, order_num: 2, focus_area: 'flexibility', form_cue: 'Lying on back, cross ankle over knee. Draw both legs in or place foot flat. Hold and breathe into the outer hip and glute. This stretches the piriformis — a common tension zone in the luteal phase.' },
    { name: 'Bridge Hip Circles',     sets: 3, reps: 6,  rest_sec: 30, order_num: 3, focus_area: 'glutes',      form_cue: 'In bridge, slowly circle your hips in a horizontal plane, articulating every part of the joint. This releases compression while maintaining glute activation. Keep both feet equally weighted.' },
    { name: 'Lateral Leg Swing',      sets: 2, reps: 10, rest_sec: 25, order_num: 4, focus_area: 'glutes',      form_cue: 'Standing with support, swing one leg side to side in front of you. Keep the movement pendulum-like and free. The goal is joint mobility, not strength. Let gravity assist the movement.' },
    { name: 'Glute Stretch Prone',    duration_sec: 60,  rest_sec: 20, order_num: 5, focus_area: 'flexibility', form_cue: 'Face down, bring one knee toward the outside of your hip. Breathe deeply into the stretch across the outer glute. This direct glute stretch releases tension accumulated during the luteal phase.' },
    { name: 'Wide Squat Hold',        duration_sec: 60,  rest_sec: 30, order_num: 6, focus_area: 'flexibility', form_cue: 'Stand with feet wide, toes slightly turned out. Sink into a deep squat, heels down if possible. Place hands on inner thighs to gently open the hips further. This is both a stretch and a strength hold.' },
    { name: 'Rolling Close',          sets: 1, reps: 5,  rest_sec: 0,  order_num: 7, focus_area: 'recovery',    form_cue: 'Lie on your back and gently roll from side to side, allowing your whole hip and glute area to be massaged by the mat. Breathe freely. Feel the relief of all you have released in this session.' },
  ],

  'Wind Down Restoration': [
    { name: 'Progressive Relaxation', duration_sec: 120, rest_sec: 10, order_num: 1, focus_area: 'recovery',    form_cue: 'Working from your feet up, contract each muscle group for 3 seconds, then completely release. Feet, calves, thighs, glutes, belly, hands, arms, shoulders, face. Feel the contrast of tension and release.' },
    { name: 'Supported Bridge Rest',  duration_sec: 90,  rest_sec: 15, order_num: 2, focus_area: 'recovery',    form_cue: 'Place a pillow or folded blanket under your hips in bridge. Let your hips be passively supported. This gentle inversion promotes circulation and takes pressure off your lower back. Simply breathe.' },
    { name: 'Legs Up Rest',           duration_sec: 180, rest_sec: 10, order_num: 3, focus_area: 'recovery',    form_cue: 'Rest your legs up a wall or on a chair. Let your arms fall wide. Close your eyes. Feel the relief in your legs and lower back. This is not passive — it is active rest, conscious recovery.' },
    { name: 'Savasana',               duration_sec: 120, rest_sec: 0,  order_num: 4, focus_area: 'recovery',    form_cue: 'Complete stillness. Every muscle has permission to let go. Every thought can drift past like a cloud. This is the practice. Remain here as long as you need. Honor this phase of your cycle with deep rest.' },
  ],

  'Intuitive Movement': [
    { name: 'Body Awareness Check',   duration_sec: 60,  rest_sec: 10, order_num: 1, focus_area: 'recovery',    form_cue: 'Before you begin, close your eyes and check in with your body. Where are you carrying tension? Where do you feel energy? Let these answers inform how you approach today\'s session.' },
    { name: 'Fluid Spine Roll',       sets: 2, reps: 6,  rest_sec: 20, order_num: 2, focus_area: 'flexibility', form_cue: 'Roll your spine slowly through all its ranges: forward, back, side, and rotation. Move at the pace your body requests. There are no rules here — only honest movement and listening.' },
    { name: 'Modified Hundred',       duration_sec: 80,  rest_sec: 30, order_num: 3, focus_area: 'core',        form_cue: 'Hundred at the intensity that feels right today. If you need legs in tabletop, use tabletop. If you need to lower the curl, do so. Breathe. Stay connected to what your body needs today.' },
    { name: 'Intuitive Side Work',    sets: 2, reps: 10, rest_sec: 25, order_num: 4, focus_area: 'glutes',      form_cue: 'Side-lying, move through the side kick series at your pace. Forward and back, up and down, circles. Let your range of motion guide you rather than the desire for a certain shape. Honor your body today.' },
    { name: 'Upper Body Flow',        sets: 2, reps: 8,  rest_sec: 30, order_num: 5, focus_area: 'arms',        form_cue: 'Move through push up variations and chest openers at an effort level that feels sustainable and nourishing. This is not performance — it is care. Do what feels good and stop where it doesn\'t.' },
    { name: 'Integration & Close',    duration_sec: 90,  rest_sec: 0,  order_num: 6, focus_area: 'recovery',    form_cue: 'Lie in savasana. Notice what you gave yourself today. This session was an act of self-care, tuned to your body\'s current needs. Rest and receive the benefits of listening to yourself.' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────
// CHALLENGES
// ─────────────────────────────────────────────────────────────────────────
const CHALLENGES = [
  { name: '7-Day Core Reset',      description: 'One core session every day for a week to build deep abdominal strength.',       duration_days: 7,  sessions_required: 7,  phase: null,         badge_name: 'Core Warrior' },
  { name: '28-Day Foundations',    description: 'A complete beginner\'s journey through Pilates fundamentals.',                   duration_days: 28, sessions_required: 20, phase: null,         badge_name: 'Foundation Builder' },
  { name: 'Cycle Sync Challenge',  description: 'Complete one phase-specific session per week for your full cycle.',              duration_days: 28, sessions_required: 8,  phase: null,         badge_name: 'Cycle Syncer' },
  { name: 'Menstrual Ease',        description: 'Commit to gentle, restorative movement during your next menstrual phase.',       duration_days: 7,  sessions_required: 4,  phase: 'menstrual',  badge_name: 'Rest Warrior' },
  { name: 'Ovulation Peak Power',  description: 'Harness your peak energy with 5 challenging sessions during ovulation.',        duration_days: 5,  sessions_required: 5,  phase: 'ovulation',  badge_name: 'Peak Power' },
]

// ─────────────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────────────
export async function seedPilates() {
  console.log('🌱 Seeding Pilates data...')

  // 1. Insert sessions
  const { data: insertedSessions, error: sErr } = await supabase
    .from('pilates_sessions')
    .insert(SESSIONS)
    .select()
  if (sErr) { console.error('Sessions error:', sErr); return }
  console.log(`✓ Inserted ${insertedSessions.length} sessions`)

  // 2. Build exercises array using returned session IDs
  const exercises = []
  insertedSessions.forEach(session => {
    const sessionExercises = EXERCISES[session.title]
    if (!sessionExercises) return
    sessionExercises.forEach(ex => {
      exercises.push({ ...ex, session_id: session.id })
    })
  })

  const { data: insertedEx, error: eErr } = await supabase
    .from('pilates_exercises')
    .insert(exercises)
    .select()
  if (eErr) { console.error('Exercises error:', eErr); return }
  console.log(`✓ Inserted ${insertedEx.length} exercises`)

  // 3. Insert challenges
  const { data: insertedCh, error: chErr } = await supabase
    .from('challenges')
    .insert(CHALLENGES)
    .select()
  if (chErr) { console.error('Challenges error:', chErr); return }
  console.log(`✓ Inserted ${insertedCh.length} challenges`)

  console.log('✅ Pilates seed complete!')
}
