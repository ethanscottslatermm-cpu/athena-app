import { useState } from 'react'
import { useAthena } from '../hooks/useAthena'

const FEELING_OPTIONS  = ['Strong', 'Good', 'Hard', 'Too much']
const ENERGY_OPTIONS   = ['Energized', 'Neutral', 'Drained']

export default function AthenaPostSession({ completionId, onDone }) {
  const { saveSessionFeedback } = useAthena()
  const [feeling, setFeeling]   = useState(null)
  const [energy,  setEnergy]    = useState(null)
  const [saving,  setSaving]    = useState(false)

  async function handleDone() {
    if (!feeling || !energy) return
    setSaving(true)
    await saveSessionFeedback(completionId, feeling, energy)
    onDone()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: '#1A0E14',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px',
    }}>
      <style>{`
        @keyframes postSessionIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ animation: 'postSessionIn 0.5s ease forwards', width: '100%', maxWidth: 340 }}>
        <span style={{ color: '#C9A86C', fontSize: 16, display: 'block', textAlign: 'center', marginBottom: 10 }}>✦</span>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,108,0.6)', textAlign: 'center', marginBottom: 32 }}>
          Check In
        </p>

        {/* Question 1 */}
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#F2EDE8', marginBottom: 14, textAlign: 'center' }}>
          How did that feel?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {FEELING_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setFeeling(opt)}
              style={{
                padding: '9px 18px',
                borderRadius: 22,
                border: feeling === opt ? '1.5px solid #C9A86C' : '1px solid rgba(242,237,232,0.2)',
                background: feeling === opt ? 'rgba(201,168,108,0.12)' : 'transparent',
                fontFamily: 'Cinzel, serif', fontSize: 10,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: feeling === opt ? '#C9A86C' : 'rgba(242,237,232,0.55)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Question 2 */}
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#F2EDE8', marginBottom: 14, textAlign: 'center' }}>
          Energy level now?
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 36 }}>
          {ENERGY_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setEnergy(opt)}
              style={{
                padding: '9px 16px',
                borderRadius: 22,
                border: energy === opt ? '1.5px solid #C9A86C' : '1px solid rgba(242,237,232,0.2)',
                background: energy === opt ? 'rgba(201,168,108,0.12)' : 'transparent',
                fontFamily: 'Cinzel, serif', fontSize: 10,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: energy === opt ? '#C9A86C' : 'rgba(242,237,232,0.55)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <button
          onClick={handleDone}
          disabled={!feeling || !energy || saving}
          style={{
            width: '100%', padding: '14px',
            background: feeling && energy ? 'rgba(201,168,108,0.15)' : 'transparent',
            border: `1px solid ${feeling && energy ? 'rgba(201,168,108,0.55)' : 'rgba(242,237,232,0.15)'}`,
            borderRadius: 14,
            fontFamily: 'Cinzel, serif', fontSize: 10,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: feeling && energy ? '#C9A86C' : 'rgba(242,237,232,0.3)',
            cursor: feeling && energy ? 'pointer' : 'default',
            transition: 'all 0.25s',
          }}
        >
          {saving ? '···' : 'Done'}
        </button>
      </div>
    </div>
  )
}
