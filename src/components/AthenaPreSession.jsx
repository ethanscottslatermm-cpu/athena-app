import { useState, useEffect } from 'react'
import { useAthena } from '../hooks/useAthena'

export default function AthenaPreSession({ session, onBegin, onLighterDay }) {
  const { getSessionBrief } = useAthena()
  const [insight, setInsight] = useState(null)
  const [skipped, setSkipped] = useState(false)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    getSessionBrief(session?.phase ?? 'general').then(setInsight)
    const t = setTimeout(() => setCanSkip(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Auto-dismiss after 4 seconds if user doesn't interact
  useEffect(() => {
    const t = setTimeout(() => onBegin(), 4000)
    return () => clearTimeout(t)
  }, [])

  if (skipped) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: '#1A0E14',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px',
    }}>
      <style>{`
        @keyframes preSessionIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes skipAppear {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div style={{ animation: 'preSessionIn 0.5s ease forwards', textAlign: 'center', maxWidth: 320 }}>
        <span style={{ color: '#C9A86C', fontSize: 18, display: 'block', marginBottom: 12 }}>✦</span>

        <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,108,0.6)', marginBottom: 16 }}>
          Before You Begin
        </p>

        {insight ? (
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 17, color: '#F2EDE8', lineHeight: 1.65, marginBottom: 32 }}>
            {insight.body}
          </p>
        ) : (
          <div style={{ marginBottom: 32 }}>
            <div style={{ height: 14, borderRadius: 7, marginBottom: 10, width: '80%', margin: '0 auto 10px', background: 'rgba(201,168,108,0.1)' }} />
            <div style={{ height: 14, borderRadius: 7, width: '60%', margin: '0 auto', background: 'rgba(201,168,108,0.1)' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onBegin}
            style={{
              padding: '12px 28px',
              background: 'rgba(201,168,108,0.12)',
              border: '1px solid rgba(201,168,108,0.5)',
              borderRadius: 22,
              fontFamily: 'Cinzel, serif', fontSize: 10,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#C9A86C', cursor: 'pointer',
            }}
          >
            Begin Session
          </button>

          {onLighterDay && (
            <button
              onClick={onLighterDay}
              style={{
                padding: '12px 20px',
                background: 'transparent',
                border: '1px solid rgba(242,237,232,0.2)',
                borderRadius: 22,
                fontFamily: 'Cinzel, serif', fontSize: 10,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(242,237,232,0.5)', cursor: 'pointer',
              }}
            >
              Lighter Day →
            </button>
          )}
        </div>
      </div>

      {canSkip && (
        <button
          onClick={() => { setSkipped(true); onBegin() }}
          style={{
            position: 'absolute', bottom: 52, right: 24,
            background: 'rgba(242,237,232,0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(242,237,232,0.2)',
            borderRadius: 20, padding: '8px 20px',
            fontFamily: 'Cinzel, serif', fontSize: 9,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(242,237,232,0.7)', cursor: 'pointer',
            animation: 'skipAppear 0.4s ease forwards',
          }}
        >
          Skip
        </button>
      )}
    </div>
  )
}
