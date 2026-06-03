const Anthropic = require('@anthropic-ai/sdk')
const { createClient } = require('@supabase/supabase-js')
const { buildContext } = require('./_athenaContext')
const { buildBriefSystemPrompt } = require('./_athenaPrompt')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { userId } = JSON.parse(event.body)
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'userId required' }) }

    const supabase = getSupabase()
    const today = new Date().toISOString().split('T')[0]

    // Check if brief already generated today
    const { data: existing } = await supabase
      .from('athena_daily_brief')
      .select('*')
      .eq('user_id', userId)
      .eq('brief_date', today)
      .maybeSingle()

    if (existing) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existing),
      }
    }

    const ctx = await buildContext(userId)
    const systemPrompt = buildBriefSystemPrompt(ctx)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Generate my daily brief.' }],
    })

    const text = response.content[0].text.trim()
    const brief = JSON.parse(text)

    const row = {
      user_id:        userId,
      brief_date:     today,
      greeting:       brief.greeting,
      rhythm_insight: brief.rhythmInsight,
      action_focus:   brief.actionFocus,
      intention:      brief.intention,
      phase_day:      brief.phaseDay,
    }

    await supabase.from('athena_daily_brief').upsert(row, { onConflict: 'user_id,brief_date' })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
