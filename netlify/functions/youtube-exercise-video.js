const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const CACHE_TTL_DAYS = 90

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let exercise_id, exercise_name
  try {
    ;({ exercise_id, exercise_name } = JSON.parse(event.body ?? '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  if (!exercise_id || !exercise_name) {
    return { statusCode: 400, body: JSON.stringify({ error: 'exercise_id and exercise_name required' }) }
  }

  // ── Cache check ────────────────────────────────────────────────────────────
  const { data: cached } = await supabase
    .from('youtube_video_cache')
    .select('video_id, not_found, cached_at, channel_title')
    .eq('exercise_id', exercise_id)
    .maybeSingle()

  if (cached) {
    const ageDays = (Date.now() - new Date(cached.cached_at).getTime()) / 86400000
    if (ageDays < CACHE_TTL_DAYS) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: cached.video_id,
          channel_title: cached.channel_title,
          not_found: cached.not_found,
        }),
      }
    }
  }

  // ── Live YouTube API call ──────────────────────────────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return { statusCode: 503, body: JSON.stringify({ error: 'YouTube API not configured' }) }
  }

  const params = new URLSearchParams({
    part:              'snippet',
    q:                 `${exercise_name} exercise form tutorial women`,
    type:              'video',
    maxResults:        '1',
    relevanceLanguage: 'en',
    safeSearch:        'strict',
    videoDuration:     'medium',
    key:               apiKey,
  })

  let video_id = null
  let channel_title = null
  let not_found = false

  try {
    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
    const ytData = await ytRes.json()

    if (!ytRes.ok) {
      throw new Error(ytData.error?.message ?? 'YouTube API error')
    }

    const firstResult = ytData.items?.[0]
    if (firstResult) {
      video_id = firstResult.id.videoId
      channel_title = firstResult.snippet.channelTitle
    } else {
      not_found = true
    }
  } catch (err) {
    not_found = true
  }

  // ── Write cache ────────────────────────────────────────────────────────────
  await supabase.from('youtube_video_cache').upsert({
    exercise_id,
    video_id,
    channel_title,
    not_found,
    cached_at: new Date().toISOString(),
  })

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_id, channel_title, not_found }),
  }
}
