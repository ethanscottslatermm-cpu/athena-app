const Anthropic = require('@anthropic-ai/sdk')
const { createClient } = require('@supabase/supabase-js')
const { buildContext } = require('./_athenaContext')
const { buildNotificationSystemPrompt } = require('./_athenaPrompt')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function determineTrigger(ctx) {
  const { cycle, sleep, pilates, nourish } = ctx

  if (cycle?.periodExpectedIn === 1)    return 'period_tomorrow'
  if (cycle?.dayOfCycle === 1)          return 'period_day_one'
  if (cycle?.dayOfPhase === 1)          return 'phase_transition'
  if (sleep?.sleepDebtAccumulated || (sleep?.weeklyAverage && sleep.weeklyAverage < 6)) return 'sleep_debt'
  if (pilates?.lastSessionDaysAgo >= 5) return 'no_pilates'
  if (nourish?.proteinStreak >= 4)      return 'protein_streak'
  return 'daily_wisdom'
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { userId } = JSON.parse(event.body)
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'userId required' }) }

    const supabase = getSupabase()
    const ctx = await buildContext(userId)
    const triggerType = determineTrigger(ctx)
    const systemPrompt = buildNotificationSystemPrompt(ctx, triggerType)

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: 'Generate the notification.' }],
    })

    const text = response.content[0].text.trim()
    const { message } = JSON.parse(text)

    await supabase.from('athena_notifications').insert({
      user_id:      userId,
      message,
      trigger_type: triggerType,
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, triggerType }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
