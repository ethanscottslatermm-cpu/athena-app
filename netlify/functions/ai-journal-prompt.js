const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  try {
    const { phase, mood, energy, emotions, moodWeather } = JSON.parse(event.body)

    const emotionCtx = Array.isArray(emotions) && emotions.length
      ? `Emotions: ${emotions.join(', ')}.`
      : ''
    const weatherCtx = moodWeather ? `Inner weather: ${moodWeather}.` : ''

    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 60,
      system: `You are a cycle-aware journaling guide for women. Return ONLY a single reflective journal question — no preamble, no quotes. It should feel intimate and specific, not generic wellness advice. Tailor it to the cycle phase and emotional state provided. Maximum 18 words.`,
      messages: [{
        role:    'user',
        content: `Cycle phase: ${phase || 'unknown'}. Mood: ${mood}/10. Energy: ${energy}/10. ${emotionCtx} ${weatherCtx}`.trim(),
      }],
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: response.content[0].text.trim() }),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
