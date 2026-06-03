const Anthropic = require('@anthropic-ai/sdk')
const { createClient } = require('@supabase/supabase-js')
const { buildContext } = require('./_athenaContext')
const { buildSystemPrompt } = require('./_athenaPrompt')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getSupabase() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { userId, message, conversationHistory = [], moduleContext = 'advisor' } = JSON.parse(event.body)
    if (!userId || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'userId and message required' }) }
    }

    const supabase = getSupabase()
    const ctx = await buildContext(userId)
    const systemPrompt = buildSystemPrompt(ctx, moduleContext)

    // Use last 10 turns for context continuity
    const historyForApi = conversationHistory.slice(-20).map(m => ({
      role:    m.role,
      content: m.content,
    }))

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   [...historyForApi, { role: 'user', content: message }],
    })

    const assistantMessage = response.content[0].text

    // Store both turns in Supabase
    await supabase.from('athena_conversations').insert([
      { user_id: userId, role: 'user',      content: message,           module_context: moduleContext },
      { user_id: userId, role: 'assistant', content: assistantMessage,  module_context: moduleContext },
    ])

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: assistantMessage }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
