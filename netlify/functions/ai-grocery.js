const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { type, phase, text, items } = JSON.parse(event.body || '{}')
    let result

    if (type === 'phase_list') {
      const r = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
        system: 'You are a cycle-aware nutritionist. Return ONLY a valid JSON array with no markdown, no explanation, no prefix text. The array must be complete and valid JSON.',
        messages: [{
          role: 'user',
          content: `Return exactly 20 hormone-supportive grocery items for a woman in the ${phase} phase of her menstrual cycle. Each item must have: { "name": string, "category": one of ["Produce","Proteins","Dairy","Pantry","Grains","Other"], "quantity": number, "unit": string (e.g. "bunch","oz","can","cup","lbs","each","bag"), "reason": "one warm encouraging sentence about why this food supports this phase" }. Return ONLY the JSON array starting with [ and ending with ].`,
        }],
      })
      result = safeParseArr(r.content[0].text)

    } else if (type === 'add_item') {
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: 'You are a grocery list parser. Return ONLY valid JSON with no markdown: { "name": string, "category": one of ["Produce","Proteins","Dairy","Pantry","Grains","Other"], "quantity": number, "unit": string }',
        messages: [{
          role: 'user',
          content: `Parse this grocery item into structured data: "${text}"`,
        }],
      })
      result = safeParseObj(r.content[0].text)

    } else if (type === 'list_insight') {
      const itemNames = (items || []).slice(0, 12).map(i => i.name).join(', ')
      const r = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: 'You are a warm, empowering cycle-aware nutritionist. Return ONLY valid JSON with no markdown: { "insight": string }. insight is one warm, specific, encouraging sentence about the nutritional theme in this list.',
        messages: [{
          role: 'user',
          content: `Cycle phase: ${phase}. Grocery list: ${itemNames}. Give one phase-aligned eating insight.`,
        }],
      })
      result = safeParseObj(r.content[0].text)

    } else {
      return { statusCode: 400, body: JSON.stringify({ error: `Unknown type: ${type}` }) }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

function safeParseArr(text) {
  const t = text.trim()
  const start = t.indexOf('[')
  if (start < 0) throw new Error('No JSON array in response')
  const end = t.lastIndexOf(']')
  return JSON.parse(t.slice(start, end + 1))
}

function safeParseObj(text) {
  const t = text.trim()
  const start = t.indexOf('{')
  if (start < 0) throw new Error('No JSON object in response')
  const end = t.lastIndexOf('}')
  return JSON.parse(t.slice(start, end + 1))
}
