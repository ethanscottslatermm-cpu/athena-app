const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const body = JSON.parse(event.body)
    const { type } = body
    let result

    if (type === 'skin_tip') {
      const { phase, label, dayOfCycle } = body
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `You are a cycle-aware esthetician. Return ONLY valid JSON: {"tip":string}
tip is exactly one warm, specific sentence about the most important skin focus for this cycle phase. Ground it in hormonal science.`,
        messages: [{ role: 'user', content: `Phase: ${label || phase}, day ${dayOfCycle || 1} of cycle.` }],
      })
      result = safeObj(r.content[0].text)

    } else if (type === 'am_routine' || type === 'pm_routine') {
      const { phase, label } = body
      const isAM = type === 'am_routine'
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: `You are a cycle-aware esthetician. Return ONLY a valid JSON array with no markdown:
[{"emoji":string,"step":string,"product_type":string,"instruction":string,"duration":string}]
Generate exactly 5 ${isAM ? 'morning' : 'evening'} skincare steps tailored to the cycle phase. product_type is e.g. "Cleanser", "SPF", "Serum". instruction is 1-2 warm, actionable sentences. duration is short like "30 sec" or "2 min".`,
        messages: [{ role: 'user', content: `Cycle phase: ${label || phase}. Create a phase-aligned ${isAM ? 'AM' : 'PM'} skincare routine.` }],
      })
      const text  = r.content[0].text.trim()
      const start = text.indexOf('[')
      result = { steps: JSON.parse(start >= 0 ? text.slice(start) : text) }

    } else if (type === 'concern_insight') {
      const { concern, phase, label, count } = body
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: `You are a cycle-aware esthetician. Return ONLY valid JSON: {"insight":string}
insight is exactly one warm, specific sentence connecting this recurring skin concern to the cycle phase. Be reassuring and hormone-science grounded.`,
        messages: [{ role: 'user', content: `Concern "${concern}" appeared ${count || 'multiple'} times during the ${label || phase} phase.` }],
      })
      result = safeObj(r.content[0].text)

    } else if (type === 'phase_reflection') {
      const { prevPhase, prevLabel, avgRating, topConcerns } = body
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: `You are a warm cycle-aware skin guide. Return ONLY valid JSON: {"title":string,"body":string}
title is 4-6 words. body is 2-3 warm, non-judgmental sentences: one acknowledging the skin experience of the previous phase, one inviting what the new phase calls for in skincare. No clinical language.`,
        messages: [{ role: 'user', content: `Previous phase: ${prevLabel || prevPhase}. Average skin condition: ${avgRating || 'unknown'}/5. Common concerns: ${(topConcerns || []).join(', ') || 'none'}. A new phase is beginning.` }],
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
