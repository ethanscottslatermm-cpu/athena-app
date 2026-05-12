import { useMemo, useState } from 'react'
import { format, subDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import BodyHeatmap from './components/BodyHeatmap'

const PHASE_COLORS = {
  menstrual: '#8B1A1A',
  follicular: '#8FAF8A',
  ovulation: '#C9A86C',
  luteal: '#6B4F6B',
}

function StatTile({ icon, value, label }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-4 rounded-xl"
      style={{ background: 'rgba(201,168,108,0.07)', border: '1px solid rgba(201,168,108,0.15)' }}
    >
      <span className="text-lg mb-1">{icon}</span>
      <span className="font-cinzel text-gold text-xl leading-none">{value ?? '—'}</span>
      <span className="font-garamond text-ivory/40 text-[10px] mt-1 text-center leading-tight">
        {label}
      </span>
    </div>
  )
}

// Simple 7-bar chart (SVG)
function WeeklyBarChart({ data }) {
  const W = 280
  const H = 80
  const n = data.length
  const barW = Math.floor((W - (n + 1) * 6) / n)
  const maxVal = Math.max(...data.map(d => d.minutes), 5)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 22}`} className="overflow-visible">
      {data.map((d, i) => {
        const bH  = Math.max(2, (d.minutes / maxVal) * H)
        const x   = 6 + i * (barW + 6)
        const y   = H - bH
        const isToday = isSameDay(d.date, new Date())
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={bH}
              fill={d.minutes > 0 ? '#C9A86C' : 'rgba(244,239,230,0.06)'}
              rx={3}
              opacity={isToday ? 1 : 0.75}
            />
            <text
              x={x + barW / 2} y={H + 14}
              textAnchor="middle"
              fill={isToday ? 'rgba(201,168,108,0.7)' : 'rgba(244,239,230,0.3)'}
              fontSize={9}
              fontFamily="Cormorant Garamond, serif"
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Phase donut chart (SVG)
function PhaseDonut({ data, total }) {
  const R = 44
  const circ = 2 * Math.PI * R
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <svg width={100} height={100} viewBox="0 0 100 100">
        {data.map(({ phase, count }) => {
          const pct = total > 0 ? count / total : 0
          const dash = pct * circ
          const seg = (
            <circle
              key={phase}
              cx="50" cy="50" r={R}
              fill="none"
              stroke={PHASE_COLORS[phase]}
              strokeWidth={10}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
            />
          )
          offset += dash
          return seg
        })}
        {total === 0 && (
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(244,239,230,0.06)" strokeWidth={10} />
        )}
      </svg>
      <div className="space-y-1.5 flex-1">
        {data.map(({ phase, count }) => (
          <div key={phase} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PHASE_COLORS[phase] }} />
            <span className="font-garamond text-ivory/55 text-xs capitalize flex-1">{phase}</span>
            <span className="font-garamond text-ivory/35 text-xs">
              {total > 0 ? Math.round((count / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Monthly heatmap calendar
function MonthHeatmap({ completions }) {
  const today     = new Date()
  const monthDays = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) })
  const firstDow  = (startOfMonth(today).getDay() + 6) % 7 // Mon=0

  const counts = {}
  completions.forEach(c => {
    const key = format(new Date(c.completed_at), 'yyyy-MM-dd')
    counts[key] = (counts[key] || 0) + 1
  })

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayLabels.map((d, i) => (
          <span key={i} className="font-garamond text-[9px] text-ivory/25 text-center">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array(firstDow).fill(null).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {monthDays.map(day => {
          const key   = format(day, 'yyyy-MM-dd')
          const count = counts[key] || 0
          const isToday = isSameDay(day, today)
          return (
            <div
              key={key}
              className="aspect-square rounded-sm flex items-center justify-center"
              style={{
                background: count >= 2
                  ? 'rgba(201,168,108,0.8)'
                  : count === 1
                  ? 'rgba(201,168,108,0.35)'
                  : 'rgba(244,239,230,0.05)',
                border: isToday ? '1px solid rgba(201,168,108,0.5)' : 'none',
              }}
            >
              <span
                className="font-garamond text-[8px]"
                style={{ color: count > 0 ? '#060404' : 'rgba(244,239,230,0.2)' }}
              >
                {format(day, 'd')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProgressTab({
  sessions = [],
  completions = [],
  loading = false,
  onSelectSession,
}) {
  const today = new Date()

  const stats = useMemo(() => {
    if (!completions.length) return null

    // Streak
    let streak = 0
    let check  = new Date(today)
    check.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const key = format(check, 'yyyy-MM-dd')
      const has = completions.some(c => format(new Date(c.completed_at), 'yyyy-MM-dd') === key)
      if (has) { streak++; check.setDate(check.getDate() - 1) }
      else if (i === 0) { check.setDate(check.getDate() - 1) } // skip today if no session yet
      else break
    }

    const totalSessions = completions.length
    const totalMinutes  = completions.reduce((sum, c) => sum + (c.duration_min ?? 30), 0)

    // Favorite focus
    const focusCount = {}
    completions.forEach(c => {
      const s = sessions.find(x => x.id === c.session_id)
      if (s?.focus_area) focusCount[s.focus_area] = (focusCount[s.focus_area] || 0) + 1
    })
    const favFocus = Object.entries(focusCount).sort((a, b) => b[1] - a[1])[0]?.[0]
      ?.replace(/_/g, ' ') ?? null

    // Phase distribution
    const phases = ['menstrual', 'follicular', 'ovulation', 'luteal']
    const phaseData = phases.map(phase => ({
      phase,
      count: completions.filter(c => c.phase_at_time === phase).length,
    }))

    return { streak, totalSessions, totalMinutes, favFocus, phaseData }
  }, [completions, sessions])

  // Weekly chart data (last 7 days)
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const dayCompletions = completions.filter(c =>
        format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr
      )
      const minutes = dayCompletions.reduce((sum, c) => sum + (c.duration_min ?? 30), 0)
      return { date: d, minutes, label: format(d, 'EEEEE') }
    })
  }, [completions])

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 rounded-xl"
            style={{ background: 'rgba(201,168,108,0.05)', animation: 'shimmerSlide 1.4s infinite' }}
          />
        ))}
      </div>
    )
  }

  if (!completions.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-2xl text-center"
        style={{ background: 'rgba(201,168,108,0.04)', border: '1px solid rgba(201,168,108,0.1)' }}
      >
        <span className="text-3xl mb-3">✦</span>
        <p className="font-cinzel text-ivory/40 text-sm mb-2">No sessions completed yet</p>
        <p className="font-garamond italic text-ivory/25 text-sm">
          Complete your first session to see progress here.
        </p>
      </div>
    )
  }

  const phaseTotal = stats?.phaseData?.reduce((sum, d) => sum + d.count, 0) ?? 0

  return (
    <div className="space-y-5 pb-4">

      {/* ── Stat tiles ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile icon="🔥" value={stats?.streak ? `${stats.streak}d` : '0d'}  label="Current Streak" />
        <StatTile icon="🏆" value={stats?.totalSessions}                         label="Total Sessions" />
        <StatTile icon="⏱" value={stats?.totalMinutes ? `${stats.totalMinutes}m` : null} label="Total Minutes" />
        <StatTile icon="💪" value={stats?.favFocus}                               label="Favorite Focus" />
      </div>

      {/* ── Weekly activity ─────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(201,168,108,0.06)', border: '1px solid rgba(201,168,108,0.12)' }}
      >
        <p className="font-cinzel text-ivory/40 text-[10px] tracking-widest uppercase mb-3">
          Last 7 Days
        </p>
        <WeeklyBarChart data={weeklyData} />
      </div>

      {/* ── Monthly heatmap ─────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(201,168,108,0.05)', border: '1px solid rgba(201,168,108,0.1)' }}
      >
        <p className="font-cinzel text-ivory/40 text-[10px] tracking-widest uppercase mb-3">
          {format(today, 'MMMM yyyy')}
        </p>
        <MonthHeatmap completions={completions} />
      </div>

      {/* ── Body heatmap ────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(107,79,107,0.08)', border: '1px solid rgba(107,79,107,0.18)' }}
      >
        <p className="font-cinzel text-ivory/40 text-[10px] tracking-widest uppercase mb-3">
          Body Area Focus
        </p>
        <BodyHeatmap completions={completions} sessions={sessions} />
      </div>

      {/* ── Phase distribution ──────────────────────────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(143,175,138,0.07)', border: '1px solid rgba(143,175,138,0.15)' }}
      >
        <p className="font-cinzel text-ivory/40 text-[10px] tracking-widest uppercase mb-3">
          Phase Training
        </p>
        <PhaseDonut
          data={stats?.phaseData ?? []}
          total={phaseTotal}
        />
        {phaseTotal === 0 && (
          <p className="font-garamond italic text-ivory/25 text-xs text-center mt-2">
            Phase data appears after cycle tracking is set up
          </p>
        )}
      </div>

      {/* ── Session history ─────────────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(244,239,230,0.08)' }}
      >
        <p className="font-cinzel text-ivory/40 text-[10px] tracking-widest uppercase px-4 pt-4 pb-2">
          History
        </p>
        {completions.slice(0, 20).map((c, i) => {
          const s = sessions.find(x => x.id === c.session_id)
          return (
            <button
              key={c.id ?? i}
              onClick={() => s && onSelectSession(s)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
              style={{ borderTop: i > 0 ? '1px solid rgba(244,239,230,0.05)' : 'none', minHeight: 44 }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-garamond text-ivory/65 text-sm truncate">
                  {s?.title ?? 'Session'}
                </p>
                <p className="font-garamond text-ivory/30 text-xs">
                  {format(new Date(c.completed_at), 'MMM d, yyyy')} · {c.duration_min ?? 30} min
                </p>
              </div>
              {c.rating > 0 && (
                <span className="font-garamond text-gold/60 text-xs ml-3 shrink-0">
                  {'★'.repeat(c.rating)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
