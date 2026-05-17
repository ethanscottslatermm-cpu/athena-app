const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { emotions, moodWeather, phase } = JSON.parse(event.body)

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 80,
      system: `You are a warm, emotionally intelligent wellness companion for women. Based on the emotions provided, return ONLY a single affirmation sentence — no preamble, no explanation. It should feel deeply personal, not generic. Maximum 20 words. Speak directly to her: "You are...", "It is okay to...", "Your feelings are...". Never use the word 'valid'.`,
      messages: [{
        role:    'user',
        content: `Emotions: ${emotions.join(', ')}. Inner weather: ${moodWeather || 'unspecified'}. Cycle phase: ${phase || 'unknown'}.`,
      }],
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ affirmation: response.content[0].text.trim() }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
