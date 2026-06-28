# MuscleDetailSheet Refactor — Local Exercise Library

## Changes Made

### 1. New Hook: `useExerciseData.js`
Replaces `useExerciseVideos` with a local-first approach:
- Queries `exercise_library` table filtered by `muscle_id`
- Left-joins with `youtube_video_cache` to attach video metadata
- Handles decorative muscles (hand_left/right, knee_left/right, foot_left/right)
- Triggers background video lookups for cache misses via edge function
- Returns: `{ exercises, loading, error, isDecorative }`

### 2. New Component: `ExerciseCard.jsx`
New card layout matching the specified design:
```
[Exercise Name — bold, Tenor Sans]
[equipment pill]  [sets × reps pill]  [+ Log]  [▶ Watch]
```
- Equipment and sets×reps rendered as semantic pills with color coding
- Watch button disabled/loading state while video is resolving
- Expandable to show YouTube embed + instructions list when clicked
- Log button opens LogWorkoutModal with exercise pre-filled

### 3. Updated: `MuscleBottomSheet.jsx`
- Uses `useExerciseData` instead of `useExerciseVideos`
- Displays ExerciseCard for each exercise
- Added shuffle button (client-side reorder)
- Shows "Last trained: [date]" under muscle name in header
- Decorative muscle handling: shows message instead of exercises
- Removed old video card horizontal scroll layout

### 4. New Netlify Function: `youtube-exercise-video.js`
- Takes `exercise_id` and `exercise_name` as input
- Returns `{ video_id, channel_title, not_found }`
- Caches results in `youtube_video_cache` table
- 90-day TTL (configurable)

---

## Required Database Schema

### `exercise_library`
```sql
CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muscle_id TEXT NOT NULL,
  name TEXT NOT NULL,
  equipment TEXT,
  sets INT,
  reps TEXT,  -- e.g., "8-12", "30 sec hold"
  instructions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_exercise_library_muscle ON exercise_library(muscle_id);
```

### `youtube_video_cache`
```sql
CREATE TABLE youtube_video_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercise_library(id) ON DELETE CASCADE,
  video_id TEXT,
  channel_title TEXT,
  not_found BOOLEAN DEFAULT FALSE,
  cached_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX idx_youtube_cache_exercise ON youtube_video_cache(exercise_id);
```

### RLS Policies
Both tables should be readable by authenticated users (no write access from client).

---

## Testing Checklist

- [ ] Build succeeds (`npm run build`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Open a muscle with exercises (e.g., chest, biceps)
  - [ ] Exercise cards render with layout: name | equipment | sets×reps | buttons
  - [ ] Shuffle button re-orders exercises client-side
  - [ ] Last trained date shows below muscle name
- [ ] Click Watch button on an exercise
  - [ ] Card expands inline
  - [ ] YouTube iframe loads (if video_id exists)
  - [ ] Instructions list appears below video (if available)
  - [ ] Channel title shown beneath embed
- [ ] Click + Log button
  - [ ] LogWorkoutModal opens with exercise name pre-filled
  - [ ] Saving creates a new muscle_workouts entry
- [ ] Open a decorative muscle (e.g., knees, feet)
  - [ ] Shows message: "This is a joint, not a muscle group…"
  - [ ] No exercise list or Log button
- [ ] Verify background video lookups:
  - [ ] Check `youtube_video_cache` table for new entries
  - [ ] Video thumbnails and channel titles fade in once resolved
- [ ] Check browser console for stale states and errors

---

## Notes

- The hook does **not** block rendering on video lookups — they happen in the background
- Decorative muscles are: `hand_left`, `hand_right`, `knee_left`, `knee_right`, `foot_left`, `foot_right`
- Old `useExerciseVideos` hook can be removed once fully migrated
- The old Atlases style (horizontal scroll thumbnail cards) is replaced with inline video embeds within each card
