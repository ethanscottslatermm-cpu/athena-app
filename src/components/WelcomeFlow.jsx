import { useState, useEffect } from 'react'

const WELCOMED_KEY = 'athena_welcomed_v1'

const STEPS = [
  {
    eyebrow: 'Welcome',
    title: 'You found Athena',
    body: 'This is more than a wellness app. It is a commitment you are making to understand your body, honour your rhythms, and stop living on autopilot. You chose this — and that already matters.',
  },
  {
    eyebrow: 'Accountability',
    title: 'Your record, your truth',
    body: 'Every log, every session, every honest entry becomes data that belongs entirely to you. Athena holds the record so you can look back, spot patterns, and hold yourself gently accountable.',
  },
  {
    eyebrow: 'Take charge',
    title: 'Live in alignment',
    body: 'Your cycle, your skin, your mind, your body — all telling the same story in different languages. Athena helps you hear them all at once. The woman you are becoming already lives inside you.',
  },
]

export default function WelcomeFlow() {
  const [step,    setStep]    = useState(0)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(WELCOMED_KEY) !== 'true') {
      // Small delay so the app renders first
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  function next() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      finish()
    }
  }

  function finish() {
    setExiting(true)
    localStorage.setItem(WELCOMED_KEY, 'true')
    setTimeout(() => setVisible(false), 420)
  }

  if (!visible) return null

  const s      = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <>
      <style>{`
        @keyframes wOverlayIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes wOverlayOut { from { opacity: 1 } to { opacity: 0 } }
        @keyframes wCardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(18,12,10,0.9)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
        animation: exiting
          ? 'wOverlayOut 0.42s ease forwards'
          : 'wOverlayIn 0.4s ease both',
      }}>
        <div
          key={step}
          style={{
            background: 'rgba(242,237,232,0.99)',
            borderRadius: 24,
            border: '1px solid rgba(212,160,160,0.28)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.1)',
            padding: '36px 28px 28px',
            width: '100%', maxWidth: 360,
            animation: 'wCardIn 0.35s cubic-bezier(0.34,1.18,0.64,1) both',
          }}
        >
          {/* Accent bar */}
          <div style={{
            width: 36, height: 2.5, borderRadius: 2,
            background: 'linear-gradient(90deg, #D4A0A0, #C4859A)',
            marginBottom: 22,
          }} />

          {/* Eyebrow */}
          <p style={{
            fontFamily: 'Cinzel, serif', fontSize: 8.5,
            letterSpacing: '0.32em', textTransform: 'uppercase',
            color: '#D4A0A0', margin: '0 0 10px',
          }}>
            {s.eyebrow}
          </p>

          {/* Title */}
          <h2 style={{
            fontFamily: 'Cinzel, serif', fontSize: 23,
            color: '#3B3330', margin: '0 0 18px',
            lineHeight: 1.22,
          }}>
            {s.title}
          </h2>

          {/* Body */}
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontStyle: 'italic', fontSize: 16.5,
            color: '#5C4A45', lineHeight: 1.68,
            margin: '0 0 34px',
          }}>
            {s.body}
          </p>

          {/* Progress dots + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 20 : 6,
                  height: 6, borderRadius: 3,
                  background: i === step ? '#D4A0A0' : 'rgba(212,160,160,0.28)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                }} />
              ))}
            </div>

            <button
              onClick={next}
              style={{
                padding: '11px 26px', borderRadius: 22,
                background: isLast
                  ? 'linear-gradient(135deg, #D4A0A0 0%, #C4859A 100%)'
                  : 'rgba(212,160,160,0.12)',
                border: `1.5px solid ${isLast ? 'transparent' : 'rgba(212,160,160,0.38)'}`,
                cursor: 'pointer',
                fontFamily: 'Cinzel, serif', fontSize: 9.5,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: isLast ? '#fff' : '#D4A0A0',
                transition: 'all 0.22s',
                boxShadow: isLast ? '0 4px 16px rgba(212,160,160,0.35)' : 'none',
              }}
            >
              {isLast ? 'Begin' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
