const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { phase, mood, energy } = JSON.parse(event.body)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are a warm, insightful women's wellness coach.
Generate a single journaling prompt tailored to the user's cycle phase and current mood.
Return ONLY the prompt text — no quotes, no explanation, no preamble.`,
      messages: [{
        role: 'user',
        content: `Cycle phase: ${phase}. Mood score: ${mood}/10. Energy: ${energy}/10.`
      }]
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: response.content[0].text.trim() })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
