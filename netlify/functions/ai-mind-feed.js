const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { phase, label, dayOfCycle, emotions } = JSON.parse(event.body)
    const emotionStr = Array.isArray(emotions) && emotions.length
      ? emotions.join(', ')
      : 'not specified'

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 900,
      system: `You are a cycle-aware wellness guide for women. Return a JSON array of exactly 5 feed cards. Each card has: { type, title, body, tag }. Types must be exactly these in this order: "reflection", "phase_education", "micro_tip", "affirmation", "breathwork". Each body is 2-3 warm, direct sentences. Tags are short labels like "Luteal Wisdom", "Breathe", "Mindset", "Your Body". Return only the raw JSON array, no markdown, no explanation.`,
      messages: [{
        role: 'user',
        content: `Phase: ${label || phase || 'luteal'}. Day ${dayOfCycle || 1} of 28. Emotions: ${emotionStr}.`,
      }],
    })

    let cards = null
    try {
      const text = response.content[0].text.trim()
      const start = text.indexOf('[')
      cards = JSON.parse(start >= 0 ? text.slice(start) : text)
    } catch { cards = null }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: Array.isArray(cards) ? cards : [] }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
