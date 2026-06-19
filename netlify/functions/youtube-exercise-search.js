const { createClient } = require('@supabase/supabase-js')

// Service-role client — only used server-side, never exposed to the browser.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Maps MuscleMap pair keys to search-friendly anatomical terms.
const SEARCH_NAMES = {
  traps:        'trapezius',
  front_delts:  'front deltoid',
  chest:        'chest pectoral',
  biceps:       'biceps',
  forearms:     'forearms',
  upper_abs:    'upper abs',
  mid_abs:      'core abs',
  lower_abs:    'lower abs',
  obliques:     'obliques',
  v_cut:        'hip flexor',
  hips:         'hip glute',
  inner_thigh:  'inner thigh',
  quads:        'quadriceps',
  outer_quad:   'outer quad',
  inner_quad:   'VMO inner quad',
  shins:        'tibialis anterior',
  calves_inner: 'calf',
  wrists:       'wrist forearm',
  knees:        'knee stability',
  feet:         'foot ankle',
}

const CACHE_TTL_DAYS = 7

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

  // ── Cache check ────────────────────────────────────────────────────────────
  const { data: cached } = await supabase
    .from('youtube_exercise_cache')
    .select('results, cached_at')
    .eq('muscle_id', muscleId)
    .maybeSingle()

  if (cached) {
    const ageDays = (Date.now() - new Date(cached.cached_at).getTime()) / 86400000
    if (ageDays < CACHE_TTL_DAYS) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: cached.results }),
      }
    }
  }

  // ── Live YouTube API call ──────────────────────────────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'YouTube API not configured' }) }
  }

  const muscleName = SEARCH_NAMES[muscleId] ?? muscleId.replace(/_/g, ' ')
  const params = new URLSearchParams({
    part:              'snippet',
    q:                 `women's ${muscleName} workout female trainer`,
    type:              'video',
    maxResults:        '6',
    relevanceLanguage: 'en',
    safeSearch:        'strict',
    videoDuration:     'medium',
    key:               apiKey,
  })

  let ytData
  try {
    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
    ytData = await ytRes.json()
    if (!ytRes.ok) throw new Error(ytData.error?.message ?? 'YouTube API error')
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) }
  }

  const videos = (ytData.items ?? []).map(item => ({
    id:        item.id.videoId,
    title:     item.snippet.title,
    thumbnail: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? '',
    channel:   item.snippet.channelTitle,
  }))

  // ── Write cache ────────────────────────────────────────────────────────────
  await supabase
    .from('youtube_exercise_cache')
    .upsert({ muscle_id: muscleId, results: videos, cached_at: new Date().toISOString() })

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videos }),
  }
}
