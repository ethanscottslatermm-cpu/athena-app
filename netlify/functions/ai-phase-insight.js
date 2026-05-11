const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { phase, symptoms, moods, sleepAvg, cycleData } = JSON.parse(event.body)

    const cycleContext = cycleData
      ? `Cycle data: average length ${cycleData.avgCycle ?? 'unknown'} days, ` +
        `average period ${cycleData.avgPeriod ?? 'unknown'} days, ` +
        `${cycleData.cycleCount ?? 0} cycles tracked, ` +
        `regularity: ${cycleData.regularity ?? 'unknown'}.`
      : ''

    const moodContext = Array.isArray(moods) && moods.some(m => m > 0)
      ? `Mood distribution (Low→Great): ${moods.join(', ')}.`
      : ''

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 500,
      system: `You are Athena — a wise, empathetic women's health AI built into a wellness app.
Analyze the user's cycle data and provide warm, personalized insight in 2-3 sentences.
Be specific to their data, supportive, and grounded in cycle science.
Return ONLY valid JSON with no markdown:
{
  "headline": "string (one powerful sentence, max 12 words)",
  "body": "string (2-3 sentences of personalized insight)",
  "tip": "string (one actionable, phase-appropriate recommendation)",
  "energy_forecast": "low" | "medium" | "high"
}`,
      messages: [{
        role:    'user',
        content: `Current phase: ${phase}.
Top symptoms: ${(symptoms ?? []).slice(0, 5).join(', ') || 'none logged'}.
${moodContext}
${sleepAvg ? `Average sleep: ${sleepAvg} hours.` : ''}
${cycleContext}`.trim(),
      }],
    })

    const text = response.content[0].text.trim()
    const data = JSON.parse(text)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
