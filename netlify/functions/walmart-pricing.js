// Walmart Open API — set WALMART_CLIENT_ID and WALMART_CLIENT_SECRET in Netlify env vars
// Register at https://developer.walmart.com to obtain credentials

let walmartToken = null
let walmartTokenExpiry = 0

async function getWalmartToken() {
  if (walmartToken && Date.now() < walmartTokenExpiry) return walmartToken

  const id = process.env.WALMART_CLIENT_ID
  const secret = process.env.WALMART_CLIENT_SECRET
  if (!id || !secret) throw new Error('WALMART_CLIENT_ID / WALMART_CLIENT_SECRET not configured')

  const res = await fetch('https://marketplace.walmartapis.com/v3/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      'WM_SVC.NAME': 'Walmart Marketplace',
      'WM_QOS.CORRELATION_ID': `athena-${Date.now()}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Walmart auth failed ${res.status}: ${body}`)
  }

  const data = await res.json()
  walmartToken = data.access_token
  walmartTokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return walmartToken
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { itemName } = JSON.parse(event.body || '{}')
    if (!itemName) return { statusCode: 400, body: JSON.stringify({ error: 'itemName required' }) }

    const token = await getWalmartToken()
    const res = await fetch(
      `https://developer.api.walmart.com/api-proxy/service/affil/product/v2/search?query=${encodeURIComponent(itemName)}&numItems=1&facet=off`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'WM_SVC.NAME': 'Walmart Marketplace',
          'WM_QOS.CORRELATION_ID': `athena-${Date.now()}`,
        },
      }
    )

    if (!res.ok) throw new Error(`Walmart search ${res.status}`)

    const data = await res.json()
    const item = data.items?.[0]
    if (!item) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ found: false }) }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        found: true,
        productId: String(item.itemId ?? ''),
        name: item.name,
        price: item.salePrice ?? item.msrp ?? null,
      }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
