import ExerciseRow from './components/ExerciseRow'

const PHASE_COLORS = {
  menstrual: '#8B1A1A',
  follicular: '#8FAF8A',
  ovulation: '#C9A86C',
  luteal: '#6B4F6B',
  all: '#C9A86C',
}

function Heart({ filled }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24"
      fill={filled ? '#C9A86C' : 'none'}
      stroke={filled ? '#C9A86C' : 'rgba(244,239,230,0.6)'}
      strokeWidth={1.8}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function SessionDetail({ session, exercises = [], isFavorite, onFavoriteToggle, onStart, onClose }) {
  if (!session) return null

  const pc = PHASE_COLORS[session.phase] ?? '#C9A86C'
  const phaseLabel = session.phase && session.phase !== 'all'
    ? session.phase.charAt(0).toUpperCase() + session.phase.slice(1)
    : 'All phases'

  const sessionExercises = exercises
    .filter(e => e.session_id === session.id)
    .sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0))

  const stats = [
    { icon: '⏱', label: `${session.duration_min} min` },
    { icon: '🔥', label: (session.focus_area ?? '').replace(/_/g, ' ') },
    { icon: '💪', label: session.difficulty },
    { icon: '🎯', label: session.equipment },
  ]

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: 'rgba(6,4,4,0.98)', animation: 'sheetUp 0.32s ease-out' }}
    >
      {/* ── Header area ──────────────────────────────────────────────────── */}
      <div
        className="relative shrink-0"
        style={{
          height: 240,
          background: `linear-gradient(160deg, ${pc}45 0%, rgba(8,5,4,0.97) 100%)`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute z-10 flex items-center justify-center rounded-full"
          style={{ top: 52, left: 16, width: 40, height: 40, background: 'rgba(0,0,0,0.5)' }}
        >
          <span className="text-ivory/80 text-xl leading-none">‹</span>
        </button>
        <button
          onClick={() => onFavoriteToggle?.(session.id)}
          className="absolute z-10 flex items-center justify-center"
          style={{ top: 52, right: 16, width: 40, height: 40 }}
        >
          <Heart filled={isFavorite} />
        </button>
        <div className="absolute bottom-6 left-4 right-16">
          <span
            className="inline-block font-garamond text-xs px-2.5 py-0.5 rounded-full mb-2 capitalize"
            style={{ background: `${pc}28`, color: pc, border: `1px solid ${pc}45` }}
          >
            Best for {phaseLabel}
          </span>
          <h2 className="font-cinzel text-ivory text-[22px] leading-tight mb-2">
            {session.title}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {[`${session.duration_min} min`, session.focus_area, session.difficulty, session.equipment]
              .filter(Boolean)
              .map(tag => (
                <span
                  key={tag}
                  className="font-garamond text-[11px] px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: 'rgba(201,168,108,0.12)',
                    border: '1px solid rgba(201,168,108,0.3)',
                    color: '#C9A86C',
                  }}
                >
                  {(tag ?? '').replace(/_/g, ' ')}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Stat chips */}
        <div className="grid grid-cols-4 gap-2 px-4 py-4">
          {stats.map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center py-2.5 rounded-xl"
              style={{ background: 'rgba(201,168,108,0.07)', border: '1px solid rgba(201,168,108,0.12)' }}
            >
              <span className="text-base mb-0.5">{icon}</span>
              <span className="font-garamond text-ivory/55 text-[10px] text-center leading-tight capitalize">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        {session.description && (
          <div className="px-4 pb-5">
            <p className="font-garamond italic text-ivory/60 text-sm leading-relaxed">
              {session.description}
            </p>
          </div>
        )}

        {/* Exercise list */}
        <div className="pb-4">
          <p className="font-cinzel text-ivory/35 text-[10px] tracking-widest uppercase px-4 pb-2">
            {sessionExercises.length} Exercise{sessionExercises.length !== 1 ? 's' : ''}
            {sessionExercises.length > 0 && ' — tap to expand form cue'}
          </p>
          <div
            className="mx-4 rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(244,239,230,0.07)' }}
          >
            {sessionExercises.length > 0 ? sessionExercises.map((ex, i) => (
              <ExerciseRow key={ex.id ?? i} exercise={ex} index={i} />
            )) : (
              <p className="font-garamond text-ivory/25 text-sm px-4 py-5 text-center">
                Exercise list loading…
              </p>
            )}
          </div>
        </div>

        <div className="h-28" />
      </div>

      {/* ── Start button (sticky bottom) ─────────────────────────────────── */}
      <div
        className="shrink-0 px-4 pt-5"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          background: 'linear-gradient(to top, rgba(6,4,4,1) 55%, transparent)',
        }}
      >
        <button
          onClick={() => onStart?.(session, sessionExercises)}
          className="w-full py-4 rounded-xl font-cinzel tracking-widest text-sm"
          style={{
            background: 'linear-gradient(90deg, rgba(201,168,108,0.2) 0%, rgba(201,168,108,0.4) 50%, rgba(201,168,108,0.2) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 2.5s infinite',
            border: '1px solid rgba(201,168,108,0.55)',
            color: '#C9A86C',
          }}
        >
          START SESSION
        </button>
      </div>
    </div>
  )
}
