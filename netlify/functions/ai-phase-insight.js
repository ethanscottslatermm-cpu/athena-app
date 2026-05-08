const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { phase, symptoms, moods, sleepAvg } = JSON.parse(event.body)

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: `You are Athena — a wise, empathetic women's health AI.
Analyze the user's cycle phase data and provide a personalized insight.
Return ONLY valid JSON:
{
  "headline": string (one powerful sentence),
  "body": string (2-3 sentences of insight),
  "tip": string (one actionable recommendation),
  "energy_forecast": "low" | "medium" | "high"
}`,
      messages: [{
        role: 'user',
        content: `Phase: ${phase}. Recent symptoms: ${JSON.stringify(symptoms)}.
Mood trend: ${JSON.stringify(moods)}. Average sleep: ${sleepAvg} hours.`
      }]
    })

    const data = JSON.parse(response.content[0].text)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
