const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const body = JSON.parse(event.body)
    const { type } = body
    let result

    if (type === 'phase_prompt') {
      const { phase, label } = body
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: `You are a warm women's wellness community facilitator. Return ONLY valid JSON: {"prompt":string}
prompt is a single inviting question or reflection for the community today, tailored to the cycle phase. 1–2 sentences, warm and specific.`,
        messages: [{ role: 'user', content: `Cycle phase: ${label || phase}. Create today's community prompt.` }],
      })
      result = safeObj(r.content[0].text)

    } else if (type === 'meetup_description') {
      const { title, meetupType } = body
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: `You are a friendly wellness community manager. Return ONLY valid JSON: {"description":string}
description is 2–3 warm, inviting sentences for a local wellness meetup. Fun and welcoming tone.`,
        messages: [{ role: 'user', content: `Meetup: "${title}". Type: ${meetupType}. Write a suggested description.` }],
      })
      result = safeObj(r.content[0].text)

    } else if (type === 'studio_summary') {
      const { studioName, studioType, reviews } = body
      const reviewText = reviews.map(r => `Rating: ${r.rating}/5 — ${r.review_text}`).join('\n')
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 250,
        system: `You are a wellness community curator. Return ONLY valid JSON: {"summary":string}
summary is 2–3 warm sentences highlighting what members love about this studio. Extract common themes. Positive, encouraging.`,
        messages: [{ role: 'user', content: `Studio: ${studioName} (${studioType})\nReviews:\n${reviewText}` }],
      })
      result = safeObj(r.content[0].text)

    } else if (type === 'challenge_complete') {
      const { challengeTitle, badgeName, phase, displayName } = body
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 250,
        system: `You are a warm wellness coach celebrating a user's achievement. Return ONLY valid JSON: {"message":string}
message is 2–3 warm, personal, celebratory sentences. Acknowledge the effort, make it feel earned and special.`,
        messages: [{ role: 'user', content: `"${displayName || 'Goddess'}" completed "${challengeTitle}" and earned "${badgeName}". Phase: ${phase || 'wellness'}.` }],
      })
      result = safeObj(r.content[0].text)

    } else {
      return { statusCode: 400, body: JSON.stringify({ error: `Unknown type: ${type}` }) }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

function safeObj(text) {
  const t = text.trim()
  const start = t.indexOf('{')
  if (start < 0) throw new Error('No JSON object in response')
  return JSON.parse(t.slice(start))
}
