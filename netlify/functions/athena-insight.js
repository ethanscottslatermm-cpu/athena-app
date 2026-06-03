const Anthropic = require('@anthropic-ai/sdk')
const { buildContext } = require('./_athenaContext')
const { buildInsightSystemPrompt } = require('./_athenaPrompt')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { userId, moduleName } = JSON.parse(event.body)
    if (!userId || !moduleName) {
      return { statusCode: 400, body: JSON.stringify({ error: 'userId and moduleName required' }) }
    }

    const ctx = await buildContext(userId)
    const systemPrompt = buildInsightSystemPrompt(ctx, moduleName)

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: `Generate an insight card for ${moduleName}.` }],
    })

    const text = response.content[0].text.trim()
    const insight = JSON.parse(text)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insight),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
