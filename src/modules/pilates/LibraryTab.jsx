import { useState, useMemo } from 'react'
import PhaseFilter from './components/PhaseFilter'
import SessionCard from './components/SessionCard'

const PHASE_COLORS = {
  menstrual: '#8B1A1A',
  follicular: '#8FAF8A',
  ovulation: '#C9A86C',
  luteal: '#6B4F6B',
}

const PROGRAMS = [
  {
    id: 'foundations',
    name: '28-Day Foundations',
    description: 'Beginner mat series',
    sessions: 28,
    weeks: 4,
    difficulty: 'beginner',
    phase: null,
    color: '#8FAF8A',
  },
  {
    id: 'phase-power',
    name: 'Phase Power',
    description: 'Phase-synced training',
    sessions: 24,
    weeks: 4,
    difficulty: 'intermediate',
    phase: null,
    color: '#C9A86C',
  },
  {
    id: 'core-restore',
    name: 'Core & Restore',
    description: 'Core focus + recovery',
    sessions: 21,
    weeks: 3,
    difficulty: 'all',
    phase: null,
    color: '#8B1A1A',
  },
  {
    id: 'strength-flow',
    name: 'Strength & Flow',
    description: 'Advanced full body',
    sessions: 20,
    weeks: 4,
    difficulty: 'advanced',
    phase: null,
    color: '#6B4F6B',
  },
]

function ProgramCard({ program, enrolled, onEnroll }) {
  return (
    <div
      className="shrink-0 rounded-xl overflow-hidden"
      style={{
        width: 180,
        background: `linear-gradient(160deg, ${program.color}22 0%, rgba(8,5,4,0.88) 100%)`,
        border: `1px solid ${program.color}30`,
      }}
    >
      <div className="p-3">
        <h4 className="font-cinzel text-ivory text-[13px] leading-tight mb-1">{program.name}</h4>
        <p className="font-garamond text-ivory/45 text-xs mb-2">
          {program.sessions} sessions · {program.weeks} weeks
        </p>
        <button
          onClick={() => onEnroll(program.id)}
          className="font-garamond text-xs px-3 py-1.5 rounded-lg transition-all w-full text-center"
          style={{
            background: enrolled ? `${program.color}25` : 'transparent',
            border: `1px solid ${program.color}50`,
            color: enrolled ? program.color : `${program.color}90`,
          }}
        >
          {enrolled ? 'Enrolled ✓' : 'Enroll'}
        </button>
      </div>
    </div>
  )
}

export default function LibraryTab({
  sessions = [],
  favorites,
  onSelectSession,
  onFavoriteToggle,
}) {
  const CLEAR = { id: 'all', key: null, val: null }
  const [activeChip, setActiveChip] = useState(CLEAR)
  const [enrolled, setEnrolled] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('athena_enrolled_programs') ?? '[]'))
    } catch { return new Set() }
  })

  function clearFilters() {
    setActiveChip(CLEAR)
  }

  function handleEnroll(programId) {
    setEnrolled(prev => {
      const next = new Set(prev)
      next.has(programId) ? next.delete(programId) : next.add(programId)
      try { localStorage.setItem('athena_enrolled_programs', JSON.stringify([...next])) } catch {}
      return next
    })
  }

  const filtered = useMemo(() => {
    if (!activeChip.key) return sessions
    return sessions.filter(s => {
      if (activeChip.key === 'difficulty') return s.difficulty === activeChip.val
      if (activeChip.key === 'focus')      return s.focus_area === activeChip.val
      if (activeChip.key === 'duration')   return Math.abs(s.duration_min - parseInt(activeChip.val, 10)) <= 5
      return true
    })
  }, [sessions, activeChip])

  const hasFilters = activeChip.id !== 'all'

  return (
    <div className="space-y-4 pb-4">
      {/* ── Filter bar (sticky) ──────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 -mx-4 px-4 pb-1"
        style={{ background: 'rgba(8,5,4,0.88)', backdropFilter: 'blur(16px)' }}
      >
        <PhaseFilter activeId={activeChip.id} onChange={setActiveChip} />
      </div>

      {/* ── Program strips ───────────────────────────────────────────── */}
      {!hasFilters && (
        <div>
          <p className="font-cinzel text-ivory/35 text-[10px] tracking-widest uppercase mb-2">
            Programs
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            {PROGRAMS.map(p => (
              <ProgramCard
                key={p.id}
                program={p}
                enrolled={enrolled.has(p.id)}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Session grid ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-cinzel text-ivory/35 text-[10px] tracking-widest uppercase">
            {hasFilters ? `${filtered.length} Result${filtered.length !== 1 ? 's' : ''}` : 'All Sessions'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="font-garamond text-gold text-xs">
              Clear filters
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                variant="grid"
                isFavorite={favorites?.has(s.id)}
                onTap={() => onSelectSession(s)}
                onFavorite={onFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div
            className="py-10 flex flex-col items-center gap-3 rounded-2xl"
            style={{ background: 'rgba(201,168,108,0.04)', border: '1px solid rgba(201,168,108,0.1)' }}
          >
            <p className="font-garamond text-ivory/35 text-sm text-center">
              No sessions match those filters
            </p>
            <button
              onClick={clearFilters}
              className="font-garamond text-gold text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
