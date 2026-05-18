const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const body = JSON.parse(event.body)
    const { type } = body
    let result

    if (type === 'sleep_tip') {
      // Haiku — quick 1-sentence phase-aligned sleep tip
      const { phase, label, dayOfCycle } = body
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `You are a cycle-aware sleep specialist. Return ONLY valid JSON: {"tip":string}
tip is exactly one warm, actionable sentence about the most important sleep focus for this cycle phase. No generic advice.`,
        messages: [{ role: 'user', content: `Phase: ${label || phase}, day ${dayOfCycle || 1} of cycle.` }],
      })
      result = safeObj(r.content[0].text)

    } else if (type === 'wind_down') {
      // Sonnet — generate 5-6 phase-appropriate wind-down routine cards
      const { phase, label } = body
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: `You are a cycle-aware sleep therapist. Return ONLY valid JSON array with no markdown:
[{"emoji":string,"title":string,"duration":string,"instruction":string}]
Generate exactly 5 wind-down routine steps tailored to the cycle phase. Each instruction is 1-2 warm, actionable sentences. Duration is short like "5 min" or "10 min".`,
        messages: [{ role: 'user', content: `Cycle phase: ${label || phase}. Create a phase-aligned bedtime wind-down routine.` }],
      })
      const text = r.content[0].text.trim()
      const start = text.indexOf('[')
      result = { steps: JSON.parse(start >= 0 ? text.slice(start) : text) }

    } else if (type === 'tag_insight') {
      // Haiku — 1-sentence insight for a recurring sleep tag this phase
      const { tag, phase, label, count } = body
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `You are a cycle-aware sleep specialist. Return ONLY valid JSON: {"insight":string}
insight is exactly one warm, specific sentence connecting this recurring sleep symptom to the current cycle phase. Be reassuring and science-grounded.`,
        messages: [{ role: 'user', content: `Tag "${tag}" appeared ${count || 'multiple'} times during the ${label || phase} phase. Explain why.` }],
      })
      result = safeObj(r.content[0].text)

    } else if (type === 'phase_reflection') {
      // Sonnet — reflect on last phase's sleep data as a new phase begins
      const { prevPhase, prevLabel, avgHours, avgQuality, topTags } = body
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: `You are a warm cycle-aware sleep guide. Return ONLY valid JSON: {"title":string,"body":string}
title is 4-6 words. body is 2-3 warm, non-judgmental sentences: one acknowledging the previous phase's sleep experience, one inviting what the new phase calls for in terms of sleep. No clinical language.`,
        messages: [{ role: 'user', content: `Previous phase: ${prevLabel || prevPhase}. Average sleep: ${avgHours || 'unknown'} hrs. Average quality: ${avgQuality || 'unknown'}/5. Common tags: ${(topTags || []).join(', ') || 'none'}. A new phase is beginning.` }],
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
