const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const body = JSON.parse(event.body)
    const { type } = body
    let result

    if (type === 'food_search') {
      const { query } = body
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: `You are a nutrition database. Return ONLY valid JSON with no markdown:
{"food_name":string,"calories":number,"protein_g":number,"carbs_g":number,"fat_g":number,"serving_size":number,"serving_unit":string}
All values are per one serving. serving_size is the numeric amount (e.g. 1, 100, 250). serving_unit is the unit (e.g. "serving","g","oz","cup","slice"). calories and macros are realistic database values.`,
        messages: [{ role: 'user', content: `Nutrition info for: ${query}` }],
      })
      result = safeParseObj(r.content[0].text)

    } else if (type === 'phase_plate') {
      const { phase, label } = body
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: `You are a cycle-aware nutritionist. Return ONLY valid JSON with no markdown:
{"eat_more":[{"name":string,"note":string}],"anti_inflammatory":[{"name":string,"note":string}],"gentle_limits":[{"name":string,"note":string}]}
Each array has exactly 5 items. "gentle_limits" must use non-judgmental, body-positive language (e.g. "Worth easing up on" or "May not serve you now"). "note" is one short supportive phrase per item.`,
        messages: [{ role: 'user', content: `Cycle phase: ${label || phase}. Generate a phase-aligned nutrition guide.` }],
      })
      result = safeParseObj(r.content[0].text)

    } else if (type === 'phase_reflection') {
      const { phase, label, logSummary } = body
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: `You are a warm cycle-aware wellness guide. Return ONLY valid JSON with no markdown:
{"title":string,"body":string}
title is 4-6 words. body is 2-3 warm, non-judgmental sentences: one reflecting on what the body accomplished in the previous phase, one inviting what nourishment the new phase calls for. No diet language.`,
        messages: [{ role: 'user', content: `Previous phase: ${label || phase}. Nutrition log summary: ${logSummary || 'varied eating patterns'}. New phase is beginning. Write a phase transition reflection.` }],
      })
      result = safeParseObj(r.content[0].text)

    } else if (type === 'phase_tip') {
      const { phase, label, dayOfCycle } = body
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: `You are a cycle-aware nutritionist. Return ONLY valid JSON with no markdown: {"tip":string}
tip is exactly one warm, actionable sentence about the most important nutritional focus for this cycle phase. No generic advice.`,
        messages: [{ role: 'user', content: `Phase: ${label || phase}, day ${dayOfCycle || 1} of cycle.` }],
      })
      result = safeParseObj(r.content[0].text)

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

function safeParseObj(text) {
  const t = text.trim()
  const start = t.indexOf('{')
  if (start < 0) throw new Error('No JSON object in response')
  return JSON.parse(t.slice(start))
}
