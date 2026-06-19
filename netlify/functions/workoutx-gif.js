exports.handler = async (event) => {
  const id = event.queryStringParameters?.id
  if (!id) return { statusCode: 400, body: 'Missing id' }

  const apiKey = process.env.WORKOUTX_API_KEY
  if (!apiKey) return { statusCode: 503, body: 'Not configured' }

  const url = `https://api.workoutxapp.com/v1/gifs/${encodeURIComponent(id)}.gif`

  try {
    const res = await fetch(url, { headers: { 'X-WorkoutX-Key': apiKey } })
    if (!res.ok) return { statusCode: res.status, body: 'GIF not found' }

    const buffer = await res.arrayBuffer()
    return {
      statusCode: 200,
      headers: {
        'Content-Type':  'image/gif',
        'Cache-Control': 'public, max-age=2592000', // 30-day browser cache
      },
      body:             Buffer.from(buffer).toString('base64'),
      isBase64Encoded:  true,
    }
  } catch (err) {
    return { statusCode: 502, body: err.message }
  }
}
