import { useState, useEffect, useMemo } from 'react'
import { format, startOfWeek, isSameDay, subDays } from 'date-fns'
import SessionCard from './components/SessionCard'
import ProgressRing from './components/ProgressRing'

function Shimmer({ className = '' }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(201,168,108,0.05) 25%, rgba(201,168,108,0.1) 50%, rgba(201,168,108,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerSlide 1.4s infinite',
      }}
    />
  )
}

function weekDates() {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))
}

export default function HomeTab({
  sessions = [],
  exercises = [],
  completions = [],
  favorites,
  phaseData,
  profile,
  onSelectSession,
  onFavoriteToggle,
  onSeeAll,
}) {
  const [insight,     setInsight]     = useState(null)
  const [insightLoad, setInsightLoad] = useState(false)
  const today = new Date()
  const pc = {
    menstrual: '#8B1A1A',
    follicular: '#8FAF8A',
    ovulation: '#C9A86C',
    luteal: '#6B4F6B',
  }[phaseData?.phase] ?? '#C9A86C'

  // ── AI phase insight ──────────────────────────────────────────────────────
  async function fetchInsight() {
    if (!phaseData?.phase) return
    setInsightLoad(true)
    try {
      const res = await fetch('/.netlify/functions/ai-phase-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: phaseData.phase, context: 'pilates' }),
      })
      const data = await res.json()
      setInsight(data)
    } catch (_) {}
    setInsightLoad(false)
  }

  useEffect(() => { fetchInsight() }, [phaseData?.phase])

  // ── Featured session (best match for phase) ───────────────────────────────
  const featured = useMemo(() => {
    const phase = phaseData?.phase
    const byPhase = sessions.filter(s => s.phase === phase || s.phase === 'all')
    return byPhase[0] ?? sessions[0] ?? null
  }, [sessions, phaseData?.phase])

  // ── Recommended (phase + experience level) ───────────────────────────────
  const recommended = useMemo(() => {
    const phase = phaseData?.phase
    const level = profile?.level ?? 'beginner'
    const dur   = profile?.preferred_duration ?? 30
    return sessions
      .filter(s => s.id !== featured?.id)
      .sort((a, b) => {
        let scoreA = 0, scoreB = 0
        if (a.phase === phase || a.phase === 'all') scoreA += 2
        if (b.phase === phase || b.phase === 'all') scoreB += 2
        if (a.difficulty === level) scoreA += 1
        if (b.difficulty === level) scoreB += 1
        if (a.duration_min === dur) scoreA += 1
        if (b.duration_min === dur) scoreB += 1
        return scoreB - scoreA
      })
      .slice(0, 8)
  }, [sessions, featured, phaseData?.phase, profile])

  // ── Continue where you left off ──────────────────────────────────────────
  const recentCompletion = useMemo(() => {
    if (!completions.length) return null
    const last = completions[0]
    const cutoff = subDays(today, 7)
    if (new Date(last.completed_at) < cutoff) return null
    return sessions.find(s => s.id === last.session_id) ?? null
  }, [completions, sessions])

  // ── Weekly progress ──────────────────────────────────────────────────────
  const weekTarget = profile?.weekly_session_target ?? 3
  const weekStart  = startOfWeek(today, { weekStartsOn: 1 })
  const weekDone   = completions.filter(c => new Date(c.completed_at) >= weekStart).length
  const last7      = weekDates()
  const activeDays = last7.map(d =>
    completions.some(c => isSameDay(new Date(c.completed_at), d))
  )

  const phaseLabel  = phaseData?.label ?? 'Your Phase'
  const phaseEmojis = { menstrual: '🌑', follicular: '🌱', ovulation: '✨', luteal: '🍂' }
  const phaseEmoji  = phaseEmojis[phaseData?.phase] ?? '◯'

  return (
    <div className="space-y-5 pb-4">

      {/* ── Phase recommendation banner ───────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: `linear-gradient(135deg, ${pc}18 0%, rgba(8,5,4,0.5) 100%)`,
          border: `1px solid ${pc}35`,
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span style={{ color: pc }}>{phaseEmoji}</span>
          <span
            className="font-cinzel text-[10px] tracking-widest uppercase"
            style={{ color: pc }}
          >
            {phaseLabel} Phase
          </span>
        </div>
        <p className="font-cinzel text-ivory/80 text-sm mb-2">What your body needs today</p>

        {insightLoad ? (
          <div className="space-y-1.5">
            <Shimmer className="h-3.5 w-full" />
            <Shimmer className="h-3 w-4/5" />
          </div>
        ) : insight?.body ? (
          <>
            <p className="font-garamond italic text-ivory/60 text-sm leading-relaxed">
              {insight.body}
            </p>
            <button
              onClick={fetchInsight}
              className="font-garamond text-xs mt-2"
              style={{ color: `${pc}90` }}
            >
              Refresh →
            </button>
          </>
        ) : !phaseData?.phase ? (
          <p className="font-garamond text-ivory/35 text-sm italic">
            Set up your cycle to unlock phase guidance.
          </p>
        ) : (
          <button
            onClick={fetchInsight}
            className="font-garamond text-sm italic"
            style={{ color: 'rgba(244,239,230,0.4)' }}
          >
            Tap to load today's guidance →
          </button>
        )}
      </div>

      {/* ── Today's featured session ──────────────────────────────────── */}
      {featured ? (
        <div>
          <p className="font-cinzel text-ivory/35 text-[10px] tracking-widest uppercase mb-2">
            Featured Today
          </p>
          <SessionCard
            session={featured}
            variant="featured"
            isFavorite={favorites?.has(featured.id)}
            onTap={() => onSelectSession(featured)}
            onFavorite={onFavoriteToggle}
          />
        </div>
      ) : (
        <div
          className="h-48 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(201,168,108,0.05)', border: '1px solid rgba(201,168,108,0.12)' }}
        >
          <p className="font-garamond text-ivory/25 text-sm">Sessions loading…</p>
        </div>
      )}

      {/* ── Continue where you left off ───────────────────────────────── */}
      {recentCompletion && (
        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: 'rgba(201,168,108,0.07)', border: '1px solid rgba(201,168,108,0.15)' }}
        >
          <div className="flex-1 min-w-0">
            <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase mb-0.5">
              Recently Completed
            </p>
            <p className="font-garamond text-ivory/75 text-sm truncate">
              {recentCompletion.title}
            </p>
          </div>
          <button
            onClick={() => onSelectSession(recentCompletion)}
            className="font-garamond text-gold text-sm ml-4 shrink-0"
          >
            Revisit →
          </button>
        </div>
      )}

      {/* ── Weekly progress ring ──────────────────────────────────────── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'rgba(201,168,108,0.06)', border: '1px solid rgba(201,168,108,0.12)' }}
      >
        <p className="font-cinzel text-ivory/40 text-[10px] tracking-widest uppercase mb-4">
          This Week
        </p>
        <div className="flex items-center gap-6">
          <ProgressRing value={weekDone} max={weekTarget} size={88} />
          <div className="flex-1">
            <p className="font-garamond text-ivory/60 text-sm mb-1">
              {weekDone} of {weekTarget} sessions
            </p>
            <p className="font-garamond italic text-ivory/35 text-xs mb-3">
              {weekDone >= weekTarget ? 'Weekly goal met ✦' : `${weekTarget - weekDone} more to reach your goal`}
            </p>
            {/* 7-day dots */}
            <div className="flex gap-1.5">
              {last7.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{
                      background: activeDays[i]
                        ? '#C9A86C'
                        : isSameDay(d, today)
                        ? 'rgba(201,168,108,0.25)'
                        : 'rgba(244,239,230,0.06)',
                      border: isSameDay(d, today) ? '1px solid rgba(201,168,108,0.5)' : 'none',
                    }}
                  />
                  <span className="font-garamond text-[8px] text-ivory/25">
                    {format(d, 'EEEEE')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommended for you ───────────────────────────────────────── */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-cinzel text-ivory/40 text-[10px] tracking-widest uppercase">
              Recommended
            </p>
            <button onClick={onSeeAll} className="font-garamond text-gold text-xs">
              See all →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            {recommended.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                variant="scroll"
                isFavorite={favorites?.has(s.id)}
                onTap={() => onSelectSession(s)}
                onFavorite={onFavoriteToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
