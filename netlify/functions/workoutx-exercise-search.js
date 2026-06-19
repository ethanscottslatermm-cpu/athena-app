const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const CACHE_TTL_DAYS = 14

// Maps Athena MuscleMap pair keys → WorkoutX target muscle names.
// Run GET /v1/exercises/targetList to see the full available list.
const TARGET_NAMES = {
  traps:        'traps',
  front_delts:  'delts',
  chest:        'pectorals',
  biceps:       'biceps',
  forearms:     'forearms',
  upper_abs:    'abs',
  mid_abs:      'abs',
  lower_abs:    'abs',
  obliques:     'obliques',
  v_cut:        'hip flexors',
  hips:         'glutes',
  inner_thigh:  'adductors',
  quads:        'quads',
  outer_quad:   'quads',
  inner_quad:   'quads',
  shins:        'tibialis anterior',
  calves_inner: 'calves',
  wrists:       'forearms',
  knees:        null,  // not a trainable muscle target
  feet:         null,
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let muscleId
  try {
    ;({ muscleId } = JSON.parse(event.body ?? '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!muscleId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'muscleId required' }) }
  }

  const target = TARGET_NAMES[muscleId]
  if (!target) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercises: [] }),
    }
  }

  // ── Cache check (14-day TTL to stay well within 500 req/month free tier) ──
  const { data: cached } = await supabase
    .from('workoutx_exercise_cache')
    .select('results, cached_at')
    .eq('muscle_id', muscleId)
    .maybeSingle()

  if (cached) {
    const ageDays = (Date.now() - new Date(cached.cached_at).getTime()) / 86400000
    if (ageDays < CACHE_TTL_DAYS) {
      await supabase.from('workoutx_usage_log').insert({ muscle_id: muscleId, was_cache_hit: true })
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercises: cached.results }),
      }
    }
  }

  // ── Live WorkoutX API call ─────────────────────────────────────────────────
  const apiKey = process.env.WORKOUTX_API_KEY
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'WorkoutX API not configured' }) }
  }

  const url = `https://api.workoutxapp.com/v1/exercises/target/${encodeURIComponent(target)}?limit=8`

  let json
  try {
    const res = await fetch(url, { headers: { 'X-WorkoutX-Key': apiKey } })
    json = await res.json()
    if (!res.ok) throw new Error(json.error ?? json.message ?? `API error ${res.status}`)
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) }
  }

  const raw = Array.isArray(json) ? json : (json.data ?? [])

  const exercises = raw.map(ex => ({
    id:               ex.id,
    name:             ex.name,
    // Proxy GIFs through our own function — WorkoutX GIF URLs require the
    // API key header, which browsers can't send via <img> tags.
    gifUrl:           ex.id ? `/.netlify/functions/workoutx-gif?id=${ex.id}` : null,
    equipment:        ex.equipment    ?? 'Body Weight',
    difficulty:       ex.difficulty   ?? 'beginner',
    target:           ex.target       ?? target,
    bodyPart:         ex.bodyPart,
    instructions:     ex.instructions ?? [],
    secondaryMuscles: ex.secondaryMuscles ?? [],
    recommendedSets:  ex.recommendedSets,
    recommendedReps:  ex.recommendedReps,
  }))

  // ── Upsert cache + log live call ──────────────────────────────────────────
  await Promise.all([
    supabase
      .from('workoutx_exercise_cache')
      .upsert({ muscle_id: muscleId, results: exercises, cached_at: new Date().toISOString() }),
    supabase
      .from('workoutx_usage_log')
      .insert({ muscle_id: muscleId, was_cache_hit: false }),
  ])

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exercises }),
  }
}
