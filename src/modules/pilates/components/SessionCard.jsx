const PHASE_COLORS = {
  menstrual: '#8B1A1A',
  follicular: '#8FAF8A',
  ovulation: '#C9A86C',
  luteal: '#6B4F6B',
  all: '#C9A86C',
}

function Heart({ filled, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? '#C9A86C' : 'none'}
      stroke={filled ? '#C9A86C' : 'rgba(244,239,230,0.5)'}
      strokeWidth={2}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function Pill({ children }) {
  return (
    <span
      className="font-garamond text-[11px] px-2 py-0.5 rounded-full capitalize"
      style={{
        background: 'rgba(201,168,108,0.12)',
        border: '1px solid rgba(201,168,108,0.35)',
        color: '#C9A86C',
      }}
    >
      {children}
    </span>
  )
}

export default function SessionCard({
  session,
  onTap,
  onFavorite,
  isFavorite,
  variant = 'grid',
}) {
  if (!session) return null
  const pc = PHASE_COLORS[session.phase] ?? '#C9A86C'

  // ── Featured (full-width, 200px tall) ────────────────────────────────────
  if (variant === 'featured') {
    return (
      <div
        onClick={onTap}
        className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
        style={{
          height: 200,
          background: `linear-gradient(135deg, ${pc}30 0%, rgba(8,5,4,0.88) 100%)`,
          border: `1px solid ${pc}35`,
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(session.id) }}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center z-10"
        >
          <Heart filled={isFavorite} />
        </button>
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <h3 className="font-cinzel text-ivory text-lg leading-tight mb-2">{session.title}</h3>
          <div className="flex gap-2 flex-wrap">
            <Pill>{session.duration_min} min</Pill>
            <Pill>{(session.focus_area ?? '').replace(/_/g, ' ')}</Pill>
            <Pill>{session.difficulty}</Pill>
          </div>
        </div>
        <div
          onClick={e => { e.stopPropagation(); onTap?.() }}
          className="absolute bottom-4 right-4 px-4 py-2 rounded-lg font-cinzel text-[10px] tracking-widest text-gold cursor-pointer"
          style={{
            background: 'rgba(201,168,108,0.15)',
            border: '1px solid rgba(201,168,108,0.4)',
          }}
        >
          START
        </div>
      </div>
    )
  }

  // ── Scroll (160×200) ──────────────────────────────────────────────────────
  if (variant === 'scroll') {
    return (
      <div
        onClick={onTap}
        className="relative shrink-0 rounded-xl overflow-hidden cursor-pointer"
        style={{
          width: 160,
          height: 200,
          background: `linear-gradient(160deg, ${pc}28 0%, rgba(8,5,4,0.9) 100%)`,
          border: `1px solid ${pc}28`,
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(session.id) }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center z-10"
        >
          <Heart filled={isFavorite} size={16} />
        </button>
        <div className="absolute inset-0 flex flex-col justify-end p-3">
          <h4 className="font-cinzel text-ivory text-[13px] leading-tight mb-1.5">{session.title}</h4>
          <p className="font-garamond text-ivory/50 text-xs capitalize">
            {session.duration_min} min · {(session.focus_area ?? '').replace(/_/g, ' ')}
          </p>
        </div>
      </div>
    )
  }

  // ── Grid (2-column) ───────────────────────────────────────────────────────
  return (
    <div
      onClick={onTap}
      className="relative rounded-xl overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(8,5,4,0.65)',
        border: '1px solid rgba(244,239,230,0.08)',
      }}
    >
      <div
        className="relative h-20 flex items-end p-2"
        style={{ background: `linear-gradient(160deg, ${pc}28 0%, rgba(8,5,4,0.92) 100%)` }}
      >
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full" style={{ background: pc }} />
        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(session.id) }}
          className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center"
        >
          <Heart filled={isFavorite} size={15} />
        </button>
      </div>
      <div className="p-2.5">
        <h4 className="font-cinzel text-ivory text-[13px] leading-tight mb-1">{session.title}</h4>
        <p className="font-garamond text-ivory/40 text-xs capitalize">
          {session.duration_min} min · {(session.focus_area ?? '').replace(/_/g, ' ')} · {session.difficulty}
        </p>
      </div>
    </div>
  )
}
