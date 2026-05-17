import { useState } from 'react'

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

export default function SessionComplete({ session, elapsed, phaseData, onBack, onShareCommunity }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)

  const phase = phaseData?.phase
    ? phaseData.phase.charAt(0).toUpperCase() + phaseData.phase.slice(1)
    : null

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-between px-6 py-safe text-center"
      style={{
        background: '#F2EDE8',
        paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)',
      }}
    >
      {/* ── Checkmark ───────────────────────────────────────────────────── */}
      <div />

      <div className="flex flex-col items-center gap-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(196,133,154,0.12)',
            border: '2px solid rgba(196,133,154,0.5)',
            animation: 'goldPulse 1s ease-out',
          }}
        >
          <span className="text-rose text-4xl">✓</span>
        </div>

        <div>
          <p className="font-cinzel text-brown/40 text-xs tracking-widest uppercase mb-1">
            Session Complete
          </p>
          <h2 className="font-cinzel text-brown text-2xl leading-tight">{session?.title}</h2>
        </div>

        {/* Stats */}
        <div className="flex gap-4 justify-center">
          {[
            { icon: '⏱', value: formatTime(elapsed), label: 'Duration' },
            { icon: '💪', value: (session?.focus_area ?? '').replace(/_/g, ' '), label: 'Focus' },
            phase ? { icon: '◯', value: phase, label: 'Phase' } : null,
          ].filter(Boolean).map(({ icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center py-3 px-4 rounded-xl"
              style={{ background: 'rgba(196,175,168,0.2)', border: '1px solid rgba(196,175,168,0.58)' }}
            >
              <span className="text-base mb-1">{icon}</span>
              <span className="font-cinzel text-rose text-sm capitalize">{value}</span>
              <span className="font-garamond text-brown/35 text-[10px] mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Rating */}
        <div className="flex flex-col items-center gap-2">
          <p className="font-garamond text-brown/40 text-sm">Rate this session</p>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="w-10 h-10 flex items-center justify-center text-2xl transition-transform"
                style={{
                  transform: (hovered || rating) >= star ? 'scale(1.2)' : 'scale(1)',
                  color: (hovered || rating) >= star ? '#C4859A' : 'rgba(37,34,32,0.2)',
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="w-full space-y-3">
        <button
          onClick={() => onShareCommunity?.({ session, elapsed, rating })}
          className="w-full py-3 rounded-xl font-garamond text-sm text-rose"
          style={{ border: '1px solid rgba(196,133,154,0.4)' }}
        >
          Share to Community
        </button>
        <button
          onClick={() => onBack?.(rating)}
          className="w-full py-4 rounded-xl font-cinzel tracking-widest text-sm text-rose"
          style={{
            background: 'linear-gradient(90deg, rgba(196,133,154,0.15) 0%, rgba(196,133,154,0.35) 50%, rgba(196,133,154,0.15) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 2.5s infinite',
            border: '1px solid rgba(196,133,154,0.55)',
          }}
        >
          BACK TO STUDIO
        </button>
      </div>
    </div>
  )
}
