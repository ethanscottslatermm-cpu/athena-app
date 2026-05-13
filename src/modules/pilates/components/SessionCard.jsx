const PHASE_COLORS = {
  menstrual: '#8B1A1A',
  follicular: '#8FAF8A',
  ovulation: '#C9A86C',
  luteal: '#6B4F6B',
  all: '#C9A86C',
}

const SESSION_IMAGES = {
  'dynamic stretch & tone':   '/images/sessions/Dynamic Stretch & Tone.png',
  'glute awakening':          '/images/sessions/Glute Awakening.png',
  'grounding evening flow':   '/images/sessions/Grounding Evening Flow.png',
  'pelvic floor reset':       '/images/sessions/Pelvic Floor Reset.png',
  'restorative mat session':  '/images/sessions/Restorative Mat Session.png',
  'rising energy core':       '/images/sessions/Rising Energy Core.png',
  'spinal release & breathe': '/images/sessions/Spinal Release & Breathe.png',
  'supine surrender flow':    '/images/sessions/Supine Surrender Flow.png',
  'arm & shoulder sculpt':    '/images/sessions/Arm & Shoulder Sculpt.png',
  'wind down restoration':    '/images/sessions/Wind Down Restoration.png',
  'mindful core & breathing': '/images/sessions/Mindful Core & Breathing.png',
  'intuitive movement':       '/images/sessions/Intuitive Movement.png',
}

// These PNGs have embedded padding — use a larger background-size to push borders outside the clip boundary
const PADDED_BG = {
  'arm & shoulder sculpt':    { backgroundSize: '155%', backgroundPosition: 'center center' },
  'wind down restoration':    { backgroundSize: '155%', backgroundPosition: 'center center' },
  'mindful core & breathing': { backgroundSize: '155%', backgroundPosition: 'center center' },
  'intuitive movement':       { backgroundSize: '170%', backgroundPosition: 'center center' },
}

function getSessionImage(title) {
  return SESSION_IMAGES[title?.trim().toLowerCase()] ?? null
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
        background: 'rgba(8,5,4,0.55)',
        border: '1px solid rgba(201,168,108,0.45)',
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
  const pc  = PHASE_COLORS[session.phase] ?? '#C9A86C'
  const img = getSessionImage(session.title)

  const paddedBg = PADDED_BG[session.title?.trim().toLowerCase()] ?? {}

  const bgStyle = img
    ? {
        backgroundImage: `url("${img}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        ...paddedBg,
      }
    : {
        background: `linear-gradient(135deg, ${pc}30 0%, rgba(8,5,4,0.88) 100%)`,
      }

  // Overlay gradient — deeper when there's a photo so text stays readable
  const overlayStyle = img
    ? { background: 'linear-gradient(to bottom, rgba(6,4,4,0.08) 0%, rgba(6,4,4,0.55) 45%, rgba(6,4,4,0.94) 100%)' }
    : { background: `linear-gradient(to bottom, transparent 0%, rgba(8,5,4,0.7) 60%, rgba(8,5,4,0.95) 100%)` }

  // ── Featured (full-width, 220px tall) ────────────────────────────────────
  if (variant === 'featured') {
    return (
      <div
        onClick={onTap}
        className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
        style={{ height: 220, border: `1px solid ${img ? 'rgba(201,168,108,0.2)' : `${pc}35`}`, ...bgStyle }}
      >
        <div className="absolute inset-0" style={overlayStyle} />

        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(session.id) }}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center z-10"
        >
          <Heart filled={isFavorite} />
        </button>

        <div className="absolute inset-0 flex flex-col justify-end p-4 z-10">
          <h3 className="font-cinzel text-ivory text-lg leading-tight mb-1">{session.title}</h3>
          {session.description && (
            <p
              className="font-garamond italic text-ivory/60 text-xs leading-snug mb-2"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {session.description}
            </p>
          )}
          <div className="flex gap-2 flex-wrap">
            <Pill>{session.duration_min} min</Pill>
            <Pill>{(session.focus_area ?? '').replace(/_/g, ' ')}</Pill>
            <Pill>{session.difficulty}</Pill>
          </div>
        </div>

        <div
          onClick={e => { e.stopPropagation(); onTap?.() }}
          className="absolute bottom-4 right-4 px-4 py-2 rounded-lg font-cinzel text-[10px] tracking-widest text-gold cursor-pointer z-10"
          style={{
            background: 'rgba(8,5,4,0.7)',
            border: '1px solid rgba(201,168,108,0.4)',
          }}
        >
          START
        </div>
      </div>
    )
  }

  // ── Scroll (160×210) ──────────────────────────────────────────────────────
  if (variant === 'scroll') {
    return (
      <div
        onClick={onTap}
        className="relative shrink-0 rounded-xl overflow-hidden cursor-pointer"
        style={{ width: 160, height: 210, border: `1px solid ${img ? 'rgba(201,168,108,0.18)' : `${pc}28`}`, ...bgStyle }}
      >
        <div className="absolute inset-0" style={overlayStyle} />

        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(session.id) }}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center z-10"
        >
          <Heart filled={isFavorite} size={16} />
        </button>

        <div className="absolute inset-0 flex flex-col justify-end p-3 z-10">
          <h4 className="font-cinzel text-ivory text-[13px] leading-tight mb-1">{session.title}</h4>
          {session.description && (
            <p
              className="font-garamond italic text-ivory/50 text-[11px] leading-snug mb-1.5"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {session.description}
            </p>
          )}
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
        className="relative h-24 overflow-hidden"
        style={{ ...bgStyle }}
      >
        <div className="absolute inset-0" style={overlayStyle} />
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full z-10" style={{ background: pc }} />
        <button
          onClick={e => { e.stopPropagation(); onFavorite?.(session.id) }}
          className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center z-10"
        >
          <Heart filled={isFavorite} size={15} />
        </button>
      </div>
      <div className="p-2.5">
        <h4 className="font-cinzel text-ivory text-[13px] leading-tight mb-1">{session.title}</h4>
        {session.description && (
          <p
            className="font-garamond italic text-ivory/40 text-[11px] leading-snug mb-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {session.description}
          </p>
        )}
        <p className="font-garamond text-ivory/40 text-xs capitalize">
          {session.duration_min} min · {(session.focus_area ?? '').replace(/_/g, ' ')} · {session.difficulty}
        </p>
      </div>
    </div>
  )
}
