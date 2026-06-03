const { buildContext } = require('./_athenaContext')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { userId } = JSON.parse(event.body)
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: 'userId required' }) }

    const ctx = await buildContext(userId)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ctx),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
