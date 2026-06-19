import { useState, useEffect } from 'react'
import { useAthena } from '../hooks/useAthena'

const DISMISS_KEY = (moduleName) => `athena_insight_dismissed_${moduleName}`

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function isDismissedToday(moduleName) {
  try {
    const raw = localStorage.getItem(DISMISS_KEY(moduleName))
    if (!raw) return false
    const { date } = JSON.parse(raw)
    return date === todayKey()
  } catch { return false }
}

function dismissToday(moduleName) {
  try {
    localStorage.setItem(DISMISS_KEY(moduleName), JSON.stringify({ date: todayKey() }))
  } catch {}
}

export default function AthenaInsightCard({ moduleName, preloadedContext = null }) {
  const { getInsight } = useAthena()

  const [insight,   setInsight]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [dismissed, setDismissed] = useState(() => isDismissedToday(moduleName))

  useEffect(() => {
    if (dismissed) { setLoading(false); return }
    let cancelled = false
    getInsight(moduleName).then(data => {
      if (!cancelled) { setInsight(data); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [moduleName])

  function handleDismiss() {
    dismissToday(moduleName)
    setDismissed(true)
  }

  function handleTellMore() {
    window.dispatchEvent(new CustomEvent('athena:open', {
      detail: { message: insight?.cta ?? `Tell me more about my ${moduleName} insight.` }
    }))
  }

  if (dismissed) return null

  return (
    <div style={{
      margin: '12px 0',
      borderRadius: 14,
      overflow: 'hidden',
      background: 'rgba(201,168,108,0.07)',
      border: '1px solid rgba(201,168,108,0.28)',
      borderLeft: '3px solid #C9A86C',
      animation: loading ? undefined : 'athenaCardIn 0.4s ease forwards',
    }}>
      <style>{`
        @keyframes athenaCardIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes athenaShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      {loading ? (
        <div style={{ padding: '14px 16px' }}>
          <div style={{
            height: 12, borderRadius: 6, marginBottom: 8, width: '60%',
            background: 'linear-gradient(90deg, rgba(201,168,108,0.08) 25%, rgba(201,168,108,0.18) 50%, rgba(201,168,108,0.08) 75%)',
            backgroundSize: '200% 100%',
            animation: 'athenaShimmer 1.4s infinite',
          }} />
          <div style={{
            height: 10, borderRadius: 5, marginBottom: 6, width: '100%',
            background: 'linear-gradient(90deg, rgba(201,168,108,0.08) 25%, rgba(201,168,108,0.18) 50%, rgba(201,168,108,0.08) 75%)',
            backgroundSize: '200% 100%',
            animation: 'athenaShimmer 1.4s infinite 0.2s',
          }} />
          <div style={{
            height: 10, borderRadius: 5, width: '80%',
            background: 'linear-gradient(90deg, rgba(201,168,108,0.08) 25%, rgba(201,168,108,0.18) 50%, rgba(201,168,108,0.08) 75%)',
            backgroundSize: '200% 100%',
            animation: 'athenaShimmer 1.4s infinite 0.4s',
          }} />
        </div>
      ) : insight ? (
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#C9A86C', fontSize: 10 }}>✦</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A86C' }}>
                Athena
              </span>
            </div>
            <button
              onClick={handleDismiss}
              style={{ color: 'rgba(59,51,48,0.3)', fontSize: 16, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              ×
            </button>
          </div>

          {insight.headline && (
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 600, color: '#2A1C14', marginBottom: 6, letterSpacing: '0.02em' }}>
              {insight.headline}
            </p>
          )}

          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#3B3330', lineHeight: 1.6, margin: 0 }}>
            {insight.body}
          </p>

          {insight.cta && (
            <button
              onClick={handleTellMore}
              style={{
                marginTop: 10,
                fontFamily: 'Cinzel, serif',
                fontSize: 9,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#C9A86C',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {insight.cta} →
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
