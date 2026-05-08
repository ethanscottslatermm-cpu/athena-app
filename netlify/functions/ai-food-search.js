const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { query } = JSON.parse(event.body)

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `You are a nutrition expert. Return ONLY valid JSON with:
{ "name": string, "calories": number, "protein_g": number,
  "carbs_g": number, "fat_g": number, "phase_notes": string }
No markdown, no explanation.`,
      messages: [{ role: 'user', content: `Nutrition info for: ${query}` }]
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
