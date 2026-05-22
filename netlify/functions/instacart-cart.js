// Instacart Shoppable Recipes API
// Set INSTACART_API_KEY in Netlify env vars
// Docs: https://docs.instacart.com/developer_platform_api/

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { items } = JSON.parse(event.body || '{}')
    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'items array required' }) }
    }

    const apiKey = process.env.INSTACART_API_KEY
    if (!apiKey) throw new Error('INSTACART_API_KEY not configured')

    const res = await fetch('https://connect.instacart.com/v1/partners/recipe/shoppable', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        title: 'My Athena Phase List',
        image_url: '',
        source_url: 'https://athena.app',
        instructions: ['Shop your Athena phase-aligned grocery list'],
        ingredients: items.map(item => ({
          name: item.name,
          quantity: String(item.quantity ?? 1),
          unit: item.unit ?? '',
          display_text: [item.quantity ?? 1, item.unit, item.name].filter(Boolean).join(' '),
        })),
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Instacart API ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const url = data.url ?? data.link ?? data.shoppable_url ?? data.recipe_url ?? null
    if (!url) throw new Error('No URL in Instacart response')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
