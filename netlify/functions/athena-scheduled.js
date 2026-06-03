// Runs daily at 7:00 AM UTC via Netlify scheduled functions
// Configure in netlify.toml: [functions."athena-scheduled"] schedule = "0 7 * * *"
const { createClient } = require('@supabase/supabase-js')

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

exports.handler = async () => {
  try {
    const supabase = getSupabase()
    const siteUrl = process.env.URL || 'https://athena-io.netlify.app'

    // Get all active users (profiles with notifications_on)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('notifications_on', true)

    if (!profiles?.length) {
      return { statusCode: 200, body: JSON.stringify({ processed: 0 }) }
    }

    // Generate notification for each user (limit concurrency)
    const BATCH = 5
    let processed = 0

    for (let i = 0; i < profiles.length; i += BATCH) {
      const batch = profiles.slice(i, i + BATCH)
      await Promise.all(batch.map(async ({ id }) => {
        try {
          await fetch(`${siteUrl}/.netlify/functions/athena-notification`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ userId: id }),
          })
          processed++
        } catch (_) {}
      }))
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ processed }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
