// Kroger API — set KROGER_CLIENT_ID and KROGER_CLIENT_SECRET in Netlify env vars
// Register at https://developer.kroger.com to obtain credentials

let krogerToken = null
let tokenExpiry = 0

async function getKrogerToken() {
  if (krogerToken && Date.now() < tokenExpiry) return krogerToken

  const id = process.env.KROGER_CLIENT_ID
  const secret = process.env.KROGER_CLIENT_SECRET
  if (!id || !secret) throw new Error('KROGER_CLIENT_ID / KROGER_CLIENT_SECRET not configured')

  const credentials = Buffer.from(`${id}:${secret}`).toString('base64')
  const res = await fetch('https://api.kroger.com/v1/connect/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Kroger auth failed ${res.status}: ${body}`)
  }

  const data = await res.json()
  krogerToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return krogerToken
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { itemName } = JSON.parse(event.body || '{}')
    if (!itemName) return { statusCode: 400, body: JSON.stringify({ error: 'itemName required' }) }

    const token = await getKrogerToken()
    const res = await fetch(
      `https://api.kroger.com/v1/products?filter.term=${encodeURIComponent(itemName)}&filter.limit=1`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )

    if (!res.ok) throw new Error(`Kroger products API ${res.status}`)

    const data = await res.json()
    const product = data.data?.[0]
    if (!product) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ found: false }) }
    }

    const priceObj = product.items?.[0]?.price
    const price = priceObj?.regular ?? priceObj?.promo ?? null

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ found: true, productId: product.productId, name: product.description, price }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
