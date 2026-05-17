const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { phase, label } = JSON.parse(event.body)

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 60,
      system: `Return only one sentence of emotional guidance for a woman in the given cycle phase. Warm, direct, no fluff. Max 15 words. No preamble, no quotes.`,
      messages: [{
        role:    'user',
        content: `Cycle phase: ${label || phase}.`,
      }],
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insight: response.content[0].text.trim() }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
