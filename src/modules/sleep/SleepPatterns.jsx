import { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const INDIGO       = '#9B97C4'
const PHASE_KEY    = 'athena_sleep_last_phase'
const INSIGHT_KEY  = 'athena_sleep_tag_insights'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function shortDay(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)
}

function qualityColor(q) {
  if (!q)       return 'rgba(196,175,168,0.25)'
  if (q <= 2)   return 'rgba(196,175,168,0.55)'
  if (q === 3)  return `rgba(155,151,196,0.55)`
  return 'rgba(143,165,140,0.75)'
}

function calcStreak(logs, days) {
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (logs[days[i]]?.total_hours > 0) streak++
    else break
  }
  return streak
}

// ── SVG bar chart ─────────────────────────────────────────────────────────────

function SleepChart({ days, dayData }) {
  const W   = 280
  const H   = 110
  const barW = 28
  const gap  = (W - 7 * barW) / 8
  const maxH = H - 20
  const GOAL = 8  // hours

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 18, padding: '14px 12px 10px',
      border: `1px solid rgba(155,151,196,0.3)`,
      marginBottom: 12,
    }}>
      <p className="font-cinzel text-[9px] uppercase mb-3" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
        Hours Per Night — 7 Days
      </p>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Goal line at 8h */}
        <line
          x1={0} y1={H - maxH * (GOAL / 10) - 4} x2={W} y2={H - maxH * (GOAL / 10) - 4}
          stroke={`rgba(155,151,196,0.4)`} strokeWidth={1} strokeDasharray="3 3"
        />
        <text x={W - 2} y={H - maxH * (GOAL / 10) - 7}
          textAnchor="end"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 9, fill: `rgba(155,151,196,0.5)` }}>
          8h
        </text>

        {days.map((date, i) => {
          const d       = dayData[date]
          const hours   = Math.min(d?.total_hours || 0, 12)
          const quality = d?.quality_rating || 0
          const barH    = (hours / 10) * maxH
          const x       = gap + i * (barW + gap)
          const baseY   = H - 14
          const isToday = i === 6

          return (
            <g key={date}>
              {hours > 0 ? (
                <rect
                  x={x} y={baseY - barH}
                  width={barW} height={barH}
                  fill={qualityColor(quality)}
                  rx={4}
                />
              ) : (
                <rect x={x} y={baseY - 4} width={barW} height={4}
                  fill="rgba(196,175,168,0.2)" rx={2} />
              )}

              {/* Hours label inside bar */}
              {hours > 0 && barH > 18 && (
                <text
                  x={x + barW / 2} y={baseY - barH + 13}
                  textAnchor="middle"
                  style={{ fontFamily: 'Cinzel, serif', fontSize: 8, fill: '#3B3330', opacity: 0.7 }}
                >
                  {hours}
                </text>
              )}

              {/* Today indicator */}
              {isToday && (
                <rect x={x - 1} y={H - 13} width={barW + 2} height={2}
                  fill={INDIGO} rx={1} />
              )}

              <text x={x + barW / 2} y={H}
                textAnchor="middle"
                style={{
                  fontFamily: 'Cinzel, serif', fontSize: 8,
                  fill: isToday ? INDIGO : '#7A6A65',
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {shortDay(date)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        {[
          { label: 'Restless',  color: 'rgba(196,175,168,0.55)' },
          { label: 'Okay',      color: `rgba(155,151,196,0.55)` },
          { label: 'Rested',    color: 'rgba(143,165,140,0.75)' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7A6A65' }}>
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Streak ────────────────────────────────────────────────────────────────────

function StreakCard({ streak }) {
  return (
    <div style={{
      background: streak > 0
        ? `linear-gradient(135deg, rgba(155,151,196,0.18) 0%, rgba(255,255,255,0.5) 100%)`
        : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16, padding: '12px 16px',
      border: `1px solid rgba(155,151,196,0.3)`,
      marginBottom: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <p className="font-cinzel text-[9px] uppercase mb-1" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
          Logging Streak
        </p>
        <p className="font-garamond text-xs italic" style={{ color: '#7A6A65' }}>
          {streak === 0
            ? 'Log tonight to start your streak'
            : streak === 1
              ? 'Great start — log again tomorrow'
              : `${streak} nights in a row — keep going`}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 30, fontWeight: 700, color: INDIGO }}>
          {streak}
        </span>
        <span className="font-garamond text-xs" style={{ color: '#7A6A65' }}>nights</span>
      </div>
    </div>
  )
}

// ── Tag insight card ──────────────────────────────────────────────────────────

function TagInsightCard({ tag, count, phase, label }) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage cache first
    const cacheKey = `${INSIGHT_KEY}_${phase}_${tag}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) { setInsight(cached); setLoading(false); return }

    fetch('/.netlify/functions/ai-sleep', {
      method: 'POST',
      body: JSON.stringify({ type: 'tag_insight', tag, phase, label, count }),
    })
      .then(r => r.json())
      .then(d => {
        const ins = d.insight || ''
        setInsight(ins)
        try { localStorage.setItem(cacheKey, ins) } catch {}
      })
      .catch(() => setInsight(''))
      .finally(() => setLoading(false))
  }, [tag, phase])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 14, padding: '11px 14px',
      border: '1px solid rgba(196,175,168,0.35)',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Zap size={11} color={INDIGO} strokeWidth={1.5} />
        <span className="font-cinzel text-[8.5px] tracking-[0.18em] uppercase" style={{ color: INDIGO }}>
          {tag}
        </span>
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: 7, color: '#7A6A65',
          background: 'rgba(196,175,168,0.2)', borderRadius: 6, padding: '1px 6px',
        }}>
          ×{count} this phase
        </span>
      </div>
      <p className="font-garamond text-sm italic leading-snug"
        style={{ color: loading ? 'rgba(59,51,48,0.35)' : '#3B3330', transition: 'color 0.3s' }}>
        {loading ? 'Reading your patterns…' : (insight || 'Your body is communicating something important.')}
      </p>
    </div>
  )
}

// ── Phase reflection card ─────────────────────────────────────────────────────

function ReflectionCard({ data }) {
  if (!data) return null
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(155,151,196,0.18) 0%, rgba(255,255,255,0.5) 100%)',
      backdropFilter: 'blur(12px)',
      border: `1px solid rgba(155,151,196,0.4)`,
      borderRadius: 18, padding: '16px 16px 14px',
      marginBottom: 14,
      animation: 'slFadeUp 0.4s ease both',
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-2" style={{ color: INDIGO }}>
        Phase Transition
      </p>
      <p className="font-cinzel text-sm mb-2" style={{ color: '#3B3330' }}>
        {data.title}
      </p>
      <p className="font-garamond text-sm leading-relaxed italic" style={{ color: '#7A6A65' }}>
        {data.body}
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SleepPatterns() {
  const { user }         = useAuth()
  const { phase, label } = usePhase()

  const [dayData,     setDayData]     = useState({})
  const [allLogs,     setAllLogs]     = useState([])
  const [reflection,  setReflection]  = useState(null)
  const [loading,     setLoading]     = useState(true)

  const days = getLast7Days()

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  useEffect(() => {
    if (!phase || allLogs.length === 0) return
    checkPhaseChange()
  }, [phase, allLogs])

  async function loadData() {
    setLoading(true)
    const { data: rows } = await supabase
      .from('sleep_logs')
      .select('log_date, total_hours, quality_rating, tags, phase_name')
      .eq('user_id', user.id)
      .gte('log_date', days[0])
      .lte('log_date', days[6])
      .order('log_date')

    const mapped = {}
    ;(rows || []).forEach(r => { mapped[r.log_date] = r })
    setDayData(mapped)
    setAllLogs(rows || [])
    setLoading(false)
  }

  function checkPhaseChange() {
    const lastPhase = localStorage.getItem(PHASE_KEY)
    if (lastPhase && lastPhase !== phase) {
      fetchReflection(lastPhase)
    }
    localStorage.setItem(PHASE_KEY, phase)
  }

  async function fetchReflection(prevPhase) {
    const phaseLogs = allLogs.filter(l => l.phase_name === prevPhase)
    if (!phaseLogs.length) return

    const avgHours = phaseLogs.reduce((s, l) => s + (l.total_hours || 0), 0) / phaseLogs.length
    const avgQuality = phaseLogs.reduce((s, l) => s + (l.quality_rating || 0), 0) / phaseLogs.length

    const tagCounts = {}
    phaseLogs.forEach(l => (l.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1 }))
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t)

    try {
      const r = await fetch('/.netlify/functions/ai-sleep', {
        method: 'POST',
        body: JSON.stringify({
          type: 'phase_reflection',
          prevPhase, prevLabel: prevPhase,
          avgHours: Math.round(avgHours * 10) / 10,
          avgQuality: Math.round(avgQuality * 10) / 10,
          topTags,
        }),
      })
      const d = await r.json()
      if (d.title) setReflection(d)
    } catch {}
  }

  // Compute tag frequency for current phase logs
  const phaseTagCounts = {}
  allLogs
    .filter(l => l.phase_name === phase)
    .forEach(l => (l.tags || []).forEach(t => { phaseTagCounts[t] = (phaseTagCounts[t] || 0) + 1 }))
  const topTags = Object.entries(phaseTagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)

  const streak = calcStreak(dayData, days)

  if (loading) {
    return (
      <div style={{ paddingTop: 48, textAlign: 'center' }}>
        <style>{`
          @keyframes slLoad{0%,100%{opacity:.3}50%{opacity:.7}}
          @keyframes slFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)', animation: 'slLoad 1.5s ease-in-out infinite' }}>
          Loading your sleep patterns…
        </p>
      </div>
    )
  }

  return (
    <>
      <style>{`@keyframes slFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {reflection && <ReflectionCard data={reflection} />}

      <SleepChart days={days} dayData={dayData} />
      <StreakCard streak={streak} />

      {/* Tag insights */}
      {topTags.length > 0 && (
        <>
          <p className="font-cinzel text-[9px] uppercase mb-3 mt-2" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
            Recurring This {label || 'Phase'}
          </p>
          {topTags.map(([tag, count]) => (
            <TagInsightCard key={tag} tag={tag} count={count} phase={phase} label={label} />
          ))}
        </>
      )}

      {allLogs.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
            Log your first night to see patterns emerge.
          </p>
        </div>
      )}

      <div style={{ height: 16 }} />
    </>
  )
}
