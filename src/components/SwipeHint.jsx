import { useState, useEffect } from 'react'

export default function SwipeHint() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    // First nudge after 4 s, then every 30 s
    const first    = setTimeout(() => setTick(t => t + 1), 4000)
    const interval = setInterval(() => setTick(t => t + 1), 30000)
    return () => { clearTimeout(first); clearInterval(interval) }
  }, [])

  if (tick === 0) return null

  return (
    <>
      <style>{`
        @keyframes swipeHint {
          0%   { transform: translateX(110%); opacity: 0; }
          18%  { transform: translateX(0);    opacity: 1; }
          72%  { transform: translateX(0);    opacity: 1; }
          100% { transform: translateX(110%); opacity: 0; }
        }
      `}</style>
      <div
        key={tick}
        style={{
          position: 'fixed',
          right: 0,
          top: '52%',
          zIndex: 90,
          animation: 'swipeHint 3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          background: 'rgba(107, 82, 72, 0.68)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '10px 0 0 10px',
          padding: '9px 10px 9px 13px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          boxShadow: '-2px 0 12px rgba(42,28,20,0.18)',
        }}>
          {/* double chevron */}
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5h12M7 1l-5 4 5 4" stroke="#F5EDE3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
            <path d="M10 1l-5 4 5 4" stroke="#F5EDE3" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.52rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#F5EDE3',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
          }}>
            swipe
          </span>
        </div>
      </div>
    </>
  )
}
