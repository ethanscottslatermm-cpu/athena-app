import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export function useAthena() {
  const { user } = useAuth()
  const userId = user?.id

  async function getDailyBrief() {
    if (!userId) return null
    const res = await fetch('/.netlify/functions/athena-brief', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId }),
    })
    if (!res.ok) return null
    return res.json()
  }

  async function getInsight(moduleName) {
    if (!userId) return null
    const res = await fetch('/.netlify/functions/athena-insight', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId, moduleName }),
    })
    if (!res.ok) return null
    return res.json()
  }

  async function sendMessage(message, conversationHistory = [], moduleContext = 'advisor') {
    if (!userId) return null
    const res = await fetch('/.netlify/functions/athena-chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId, message, conversationHistory, moduleContext }),
    })
    if (!res.ok) return null
    return res.json()
  }

  async function getHistory(limit = 20) {
    if (!userId) return []
    const { data } = await supabase
      .from('athena_conversations')
      .select('role, content, created_at, module_context')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []).reverse()
  }

  async function getSessionBrief(sessionType) {
    if (!userId) return null
    return getInsight(`pilates-pre-${sessionType}`)
  }

  async function saveSessionFeedback(sessionId, feeling, energyAfter) {
    if (!userId || !sessionId) return
    await supabase
      .from('session_completions')
      .update({ feeling, energy_after: energyAfter })
      .eq('id', sessionId)
      .eq('user_id', userId)
  }

  async function getCyclePatterns() {
    if (!userId) return null
    const res = await fetch('/.netlify/functions/athena-context', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId }),
    })
    if (!res.ok) return null
    const ctx = await res.json()
    return ctx?.patterns ?? null
  }

  return {
    getDailyBrief,
    getInsight,
    sendMessage,
    getHistory,
    getSessionBrief,
    saveSessionFeedback,
    getCyclePatterns,
  }
}
