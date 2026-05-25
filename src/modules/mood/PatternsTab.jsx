import { useState, useEffect, useMemo } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { getPhaseForDate, phaseLabels } from '../../lib/phaseEngine'

const WEATHER_ICONS = {
  golden: '☀️', partly: '🌤', storm: '🌧',
  foggy: '🌫', heavy: '⛈', clearing: '🌈', night: '🌙',
}

const POSITIVE_EMOTIONS = new Set([
  'happy', 'calm', 'grateful', 'motivated',
  'Joyful', 'Hopeful', 'Playful', 'Content',
  'Peaceful', 'Grounded', 'Detached', 'Sleepy',
  'Moved', 'Appreciative', 'Warm', 'Blessed',
  'Focused', 'Ambitious', 'Energized', 'Determined',
])

function emotionFamily(e) {
  const el = e.toLowerCase()
  if (['happy', 'joyful', 'hopeful', 'playful', 'content', 'grateful', 'moved', 'appreciative', 'warm', 'blessed'].includes(el))
    return 'positive'
  if (['calm', 'peaceful', 'grounded', 'detached', 'sleepy'].includes(el))
    return 'calm'
  if (['motivated', 'focused', 'ambitious', 'energized', 'determined'].includes(el))
    return 'motivated'
  if (['anxious', 'overwhelmed', 'irritable', 'dread', 'overstimulated', 'uncertain', 'restless',
       'depleted', 'frozen', 'scattered', 'suffocated', 'frustrated', 'resentful', 'snappy', 'drained'].includes(el))
    return 'anxious'
  if (['sad', 'lonely', 'grieving', 'disappointed', 'numb'].includes(el))
    return 'sad'
  return 'neutral'
}

const FAMILY_COLORS = {
  positive:  'rgba(201,169,110,0.55)',
  calm:      'rgba(143,165,140,0.55)',
  motivated: 'rgba(201,169,110,0.65)',
  anxious:   'rgba(212,160,160,0.55)',
  sad:       'rgba(168,144,152,0.55)',
  neutral:   'rgba(196,175,168,0.45)',
}

function dominantColor(emotions) {
  if (!emotions?.length) return null
  const counts = { positive: 0, calm: 0, motivated: 0, anxious: 0, sad: 0, neutral: 0 }
  emotions.forEach(e => { counts[emotionFamily(e)]++ })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  return FAMILY_COLORS[top]
}

// ── Monthly Calendar ─────────────────────────────────────────────────────────

function MonthCalendar({ logs, showPhase, profile }) {
  const [popover, setPopover] = useState(null)
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth()
  const today = now.toISOString().split('T')[0]

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow    = new Date(year, month, 1).getDay()

  const logMap = useMemo(() => {
    const m = {}
    logs.forEach(l => { m[l.date] = l })
    return m
  }, [logs])

  const weeks = useMemo(() => {
    const all = []
    let week = new Array(startDow).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d)
      if (week.length === 7) { all.push(week); week = [] }
    }
    if (week.length) {
      while (week.length < 7) week.push(null)
      all.push(week)
    }
    return all
  }, [year, month])

  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  function weekPhaseLabel(wk) {
    const firstDay = wk.find(d => d != null)
    if (!firstDay || !profile?.last_period_date) return null
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(firstDay).padStart(2, '0')}`
    try {
      const p = getPhaseForDate(dateStr, profile.last_period_date, profile.cycle_length ?? 28, profile.period_duration ?? 5)
      return phaseLabels[p] || null
    } catch { return null }
  }

  const gridCols = showPhase ? '40px repeat(7, 1fr)' : 'repeat(7, 1fr)'

  return (
    <div className="mb-6">
      <p className="font-cinzel text-[9px] uppercase mb-4" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
        {monthName}
      </p>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 2, marginBottom: 5 }}>
        {showPhase && <div />}
        {dayLabels.map(d => (
          <div key={d} className="text-center font-cinzel" style={{ fontSize: 7, color: '#7A6A65', letterSpacing: '0.12em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((wk, wi) => {
        const phLabel = showPhase ? weekPhaseLabel(wk) : null
        return (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 2, marginBottom: 2, alignItems: 'center' }}>
            {showPhase && (
              <div style={{ fontSize: 6.5, color: '#7A6A65', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right', paddingRight: 4, lineHeight: 1.2 }}>
                {phLabel ? phLabel.slice(0, 4) : ''}
              </div>
            )}
            {wk.map((day, di) => {
              if (!day) return <div key={di} />
              const ds  = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const log = logMap[ds]
              const isToday = ds === today
              const bg = log ? (dominantColor(log.emotions) || 'rgba(196,175,168,0.4)') : 'transparent'
              return (
                <button
                  key={di}
                  onClick={() => log && setPopover(log)}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 6,
                    background: bg,
                    border: isToday
                      ? '1.5px solid rgba(143,165,140,0.7)'
                      : log
                        ? '1px solid rgba(59,51,48,0.05)'
                        : '1px solid rgba(59,51,48,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 11, color: log ? '#3B3330' : 'rgba(59,51,48,0.35)' }}>
                    {day}
                  </span>
                  {!log && (
                    <span style={{
                      position: 'absolute', bottom: 3,
                      left: '50%', transform: 'translateX(-50%)',
                      width: 2.5, height: 2.5, borderRadius: '50%',
                      background: 'rgba(59,51,48,0.15)',
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        )
      })}

      {/* Day popover */}
      {popover && (
        <div
          onClick={() => setPopover(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,51,48,0.18)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#F2EDE8', borderRadius: 16, padding: '18px 20px', width: 252, boxShadow: '0 8px 32px rgba(59,51,48,0.15)' }}
          >
            <p className="font-cinzel text-[8px] tracking-[0.2em] uppercase mb-2" style={{ color: '#7A6A65' }}>
              {popover.date}
            </p>
            {popover.moodWeather && (
              <p className="font-garamond text-sm mb-1" style={{ color: '#3B3330' }}>
                {WEATHER_ICONS[popover.moodWeather]} {WEATHER_ICONS[popover.moodWeather] ? popover.moodWeather : ''}
              </p>
            )}
            {popover.emotions?.length > 0 && (
              <p className="font-garamond text-sm mb-1.5" style={{ color: '#3B3330' }}>
                {popover.emotions.join(', ')}
              </p>
            )}
            <p className="font-garamond text-xs" style={{ color: '#7A6A65' }}>
              Mood {popover.moodScore}/10 · Energy {popover.energyScore}/10
            </p>
            {popover.gratitude && (
              <p className="font-garamond text-xs italic mt-2" style={{ color: '#7A6A65' }}>
                "{popover.gratitude}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Correlation Insight Cards ─────────────────────────────────────────────────

function computeInsights(monthLogs) {
  const results = []

  // Most common emotion
  const emotionCounts = {}
  monthLogs.forEach(log => {
    ;(log.emotions || []).forEach(e => { emotionCounts[e] = (emotionCounts[e] || 0) + 1 })
  })
  const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])
  if (sorted.length) {
    results.push(`Your most common emotion this month: ${sorted[0][0]}.`)
  }

  // Positive emotion → energy correlation
  const posEnergy = {}
  monthLogs.forEach(log => {
    ;(log.emotions || []).filter(e => POSITIVE_EMOTIONS.has(e)).forEach(e => {
      if (!posEnergy[e]) posEnergy[e] = { sum: 0, n: 0 }
      posEnergy[e].sum += log.energyScore || 5
      posEnergy[e].n++
    })
  })
  const posEntries = Object.entries(posEnergy).filter(([, v]) => v.n >= 2)
  if (posEntries.length) {
    const [em, data] = posEntries.sort((a, b) => b[1].n - a[1].n)[0]
    const avg = Math.round((data.sum / data.n) * 10) / 10
    results.push(`On days you logged ${em}, your energy averaged ${avg}/10.`)
  }

  // Phase → emotion pattern (2+ logs required)
  const phaseEmotions = {}
  monthLogs.forEach(log => {
    if (!log.phase) return
    if (!phaseEmotions[log.phase]) phaseEmotions[log.phase] = {}
    ;(log.emotions || []).forEach(e => {
      phaseEmotions[log.phase][e] = (phaseEmotions[log.phase][e] || 0) + 1
    })
  })
  const phaseEntries = Object.entries(phaseEmotions).filter(([, em]) =>
    Object.values(em).reduce((s, v) => s + v, 0) >= 2
  )
  if (phaseEntries.length) {
    const [ph, em] = phaseEntries[0]
    const topEm = Object.entries(em).sort((a, b) => b[1] - a[1])[0][0]
    const label = phaseLabels[ph] || ph
    results.push(`${label} phase tends to bring ${topEm} for you.`)
  }

  return results
}

// ── Bubble Chart ──────────────────────────────────────────────────────────────

function packBubbles(emotions, W, H) {
  if (!emotions.length) return []
  const sorted = [...emotions].sort((a, b) => b.count - a.count)
  const maxCount = sorted[0].count
  const minR = 14, maxR = 38

  const placed = []
  for (const em of sorted) {
    const r = minR + ((em.count - 1) / Math.max(maxCount - 1, 1)) * (maxR - minR)
    let best = null

    for (let attempt = 0; attempt < 60; attempt++) {
      const angle = attempt * 2.399 + (em.name.charCodeAt(0) || 0) * 0.05
      const dist  = attempt * (r * 0.55)
      const cx    = Math.max(r + 6, Math.min(W - r - 6, W / 2 + Math.cos(angle) * dist))
      const cy    = Math.max(r + 12, Math.min(H - r - 12, H / 2 + Math.sin(angle) * dist))
      const overlaps = placed.some(p => Math.hypot(cx - p.x, cy - p.y) < r + p.r + 6)
      if (!overlaps) { best = { x: cx, y: cy, r }; break }
    }
    if (!best) best = { x: W / 2, y: H / 2, r }
    placed.push({ ...em, ...best })
  }
  return placed
}

function BubbleChart({ monthLogs }) {
  const emotionCounts = useMemo(() => {
    const counts = {}
    monthLogs.forEach(log => {
      ;(log.emotions || []).forEach(e => { counts[e] = (counts[e] || 0) + 1 })
    })
    return Object.entries(counts).map(([name, count]) => ({
      name, count, color: FAMILY_COLORS[emotionFamily(name)] || FAMILY_COLORS.neutral,
    }))
  }, [monthLogs])

  const W = 320, H = 200
  const bubbles = packBubbles(emotionCounts, W, H)

  if (!bubbles.length) return null

  return (
    <div className="mb-6">
      <p className="font-cinzel text-[9px] uppercase mb-3" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
        Emotion Frequency
      </p>
      <div style={{ background: '#F2EDE8', borderRadius: 14, overflow: 'hidden' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
          {bubbles.map(b => (
            <g key={b.name}>
              <circle cx={b.x} cy={b.y} r={b.r} fill={b.color} />
              {b.r >= 16 && (
                <text
                  x={b.x} y={b.y + 4.5}
                  textAnchor="middle"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: Math.min(12, b.r * 0.55),
                    fill: '#3B3330',
                  }}
                >
                  {b.name}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

// ── Streak ────────────────────────────────────────────────────────────────────

function Streak({ logs }) {
  const now = new Date()
  const logDates = new Set(logs.map(l => l.date))
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })
  const count = days.filter(d => logDates.has(d)).length

  return (
    <div style={{ padding: '16px 18px', borderRadius: 14, background: 'rgba(196,175,168,0.15)', border: '1px solid rgba(196,175,168,0.25)' }}>
      <p className="font-garamond text-sm mb-3" style={{ color: '#3B3330' }}>
        You've shown up for yourself {count} of the last 14 days.
      </p>
      <div style={{ display: 'flex', gap: 5 }}>
        {days.map((d, i) => (
          <div
            key={i}
            style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              background: logDates.has(d) ? '#8FA58C' : 'transparent',
              border: logDates.has(d) ? 'none' : '1.5px solid rgba(143,165,140,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PatternsTab() {
  const { profile } = useProfile()
  const [logs, setLogs]         = useState([])
  const [showPhase, setShowPhase] = useState(false)

  useEffect(() => {
    try {
      setLogs(JSON.parse(localStorage.getItem('athena_mood_logs') || '[]'))
    } catch {}
  }, [])

  const now = new Date()
  const monthLogs = useMemo(() => {
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return logs.filter(l => l.date?.startsWith(`${y}-${m}`))
  }, [logs])

  const insights = useMemo(() => computeInsights(monthLogs), [monthLogs])

  if (logs.length < 3) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <p className="font-cinzel text-[8px] tracking-[0.3em] uppercase mb-4" style={{ color: '#8FA58C' }}>
          Patterns
        </p>
        <p className="font-garamond text-base leading-relaxed" style={{ color: 'rgba(59,51,48,0.55)', fontStyle: 'italic' }}>
          Check in a few more times and your patterns will begin to reveal themselves.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Phase toggle */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowPhase(v => !v)}
          style={{
            padding: '5px 14px', borderRadius: 18,
            fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.15em',
            textTransform: 'uppercase',
            background: showPhase ? 'rgba(143,165,140,0.18)' : 'rgba(196,175,168,0.18)',
            border: showPhase ? '1px solid rgba(143,165,140,0.4)' : '1px solid rgba(196,175,168,0.35)',
            color: showPhase ? '#3B3330' : '#7A6A65',
          }}
        >
          {showPhase ? 'Hide Phase' : 'Show Phase'}
        </button>
      </div>

      <MonthCalendar logs={logs} showPhase={showPhase} profile={profile} />

      {/* Insight cards */}
      {insights.length > 0 && (
        <div className="mb-6">
          <p className="font-cinzel text-[9px] uppercase mb-3" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
            What I'm noticing
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {insights.map((text, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(196,175,168,0.22)',
                  border: '1px solid rgba(196,175,168,0.38)',
                  borderRadius: 12, padding: '12px 14px',
                }}
              >
                <p className="font-garamond text-sm leading-relaxed" style={{ color: '#3B3330' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <BubbleChart monthLogs={monthLogs} />

      <Streak logs={logs} />
    </>
  )
}
