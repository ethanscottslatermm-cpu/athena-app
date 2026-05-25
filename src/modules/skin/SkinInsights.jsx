import { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const ROSE          = '#D4A0A0'
const PHASE_KEY     = 'athena_skin_last_phase'
const INSIGHT_KEY   = 'athena_skin_concern_insights'

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

function conditionColor(r) {
  if (!r)    return 'rgba(196,175,168,0.2)'
  if (r <= 1) return 'rgba(212,160,160,0.65)'   // Flare-Up — rose
  if (r === 2) return 'rgba(196,175,168,0.5)'   // Dull — taupe
  if (r === 3) return 'rgba(201,168,76,0.45)'   // Normal — gold
  if (r === 4) return 'rgba(143,165,140,0.6)'   // Clear — sage
  return 'rgba(143,165,140,0.88)'               // Glowing — full sage
}

function conditionLabel(r) {
  return ['', 'Flare-Up', 'Dull', 'Normal', 'Clear', 'Glowing'][r] || ''
}

function calcStreak(dayData, days) {
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (dayData[days[i]]?.condition_rating) streak++
    else break
  }
  return streak
}

// ── SVG condition chart ───────────────────────────────────────────────────────

function ConditionChart({ days, dayData }) {
  const W   = 280
  const H   = 110
  const barW = 28
  const gap  = (W - 7 * barW) / 8
  const maxH = H - 20
  const SCALE = 5  // max rating

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 18, padding: '14px 12px 10px',
      border: '1px solid rgba(212,160,160,0.25)',
      marginBottom: 12,
    }}>
      <p className="font-cinzel text-[9px] uppercase mb-3" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
        Skin Condition — 7 Days
      </p>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Midline at rating 3 (Normal) */}
        <line
          x1={0} y1={H - maxH * (3 / SCALE) - 4} x2={W} y2={H - maxH * (3 / SCALE) - 4}
          stroke="rgba(212,160,160,0.25)" strokeWidth={1} strokeDasharray="3 3"
        />

        {days.map((date, i) => {
          const d       = dayData[date]
          const rating  = d?.condition_rating || 0
          const barH    = (rating / SCALE) * maxH
          const x       = gap + i * (barW + gap)
          const baseY   = H - 14
          const isToday = i === 6

          return (
            <g key={date}>
              {rating > 0 ? (
                <>
                  <rect
                    x={x} y={baseY - barH}
                    width={barW} height={barH}
                    fill={conditionColor(rating)} rx={4}
                  />
                  {barH > 16 && (
                    <text x={x + barW / 2} y={baseY - barH + 12}
                      textAnchor="middle"
                      style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, fill: '#3B3330', opacity: 0.65 }}>
                      {conditionLabel(rating)}
                    </text>
                  )}
                </>
              ) : (
                <rect x={x} y={baseY - 4} width={barW} height={4}
                  fill="rgba(196,175,168,0.2)" rx={2} />
              )}

              {isToday && (
                <rect x={x - 1} y={H - 13} width={barW + 2} height={2} fill={ROSE} rx={1} />
              )}

              <text x={x + barW / 2} y={H} textAnchor="middle"
                style={{ fontFamily: 'Cinzel, serif', fontSize: 8, fill: isToday ? ROSE : '#7A6A65', fontWeight: isToday ? 600 : 400 }}>
                {shortDay(date)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        {[
          { label: 'Flare-Up', color: 'rgba(212,160,160,0.65)' },
          { label: 'Normal',   color: 'rgba(201,168,76,0.5)'   },
          { label: 'Glowing',  color: 'rgba(143,165,140,0.88)' },
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

// ── Streak card ───────────────────────────────────────────────────────────────

function StreakCard({ streak, avgRating }) {
  const avgLabel = avgRating ? conditionLabel(Math.round(avgRating)) : null
  return (
    <div style={{
      background: streak > 0
        ? 'linear-gradient(135deg, rgba(212,160,160,0.15) 0%, rgba(255,255,255,0.5) 100%)'
        : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16, padding: '12px 16px',
      border: '1px solid rgba(212,160,160,0.28)',
      marginBottom: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <p className="font-cinzel text-[9px] uppercase mb-1" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
          Logging Streak
        </p>
        {avgLabel && (
          <p className="font-garamond text-xs italic" style={{ color: '#7A6A65' }}>
            Avg this week: {avgLabel}
          </p>
        )}
        {!avgLabel && (
          <p className="font-garamond text-xs italic" style={{ color: '#7A6A65' }}>
            {streak === 0 ? 'Log today to start your streak' : `${streak} day${streak > 1 ? 's' : ''} in a row`}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 30, fontWeight: 700, color: ROSE }}>{streak}</span>
        <span className="font-garamond text-xs" style={{ color: '#7A6A65' }}>days</span>
      </div>
    </div>
  )
}

// ── Concern insight card ──────────────────────────────────────────────────────

function ConcernInsightCard({ concern, count, phase, label }) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const key = `${INSIGHT_KEY}_${phase}_${concern}`
    const cached = localStorage.getItem(key)
    if (cached) { setInsight(cached); setLoading(false); return }

    fetch('/.netlify/functions/ai-skin', {
      method: 'POST',
      body: JSON.stringify({ type: 'concern_insight', concern, phase, label, count }),
    })
      .then(r => r.json())
      .then(d => {
        const ins = d.insight || ''
        setInsight(ins)
        try { localStorage.setItem(key, ins) } catch {}
      })
      .catch(() => setInsight(''))
      .finally(() => setLoading(false))
  }, [concern, phase])

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 14, padding: '11px 14px',
      border: '1px solid rgba(196,175,168,0.35)',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Sparkles size={11} color={ROSE} strokeWidth={1.5} />
        <span className="font-cinzel text-[8.5px] tracking-[0.18em] uppercase" style={{ color: ROSE }}>
          {concern}
        </span>
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: 7, color: '#7A6A65',
          background: 'rgba(212,160,160,0.1)', borderRadius: 6, padding: '1px 6px',
          border: '1px solid rgba(212,160,160,0.2)',
        }}>
          ×{count} this phase
        </span>
      </div>
      <p className="font-garamond text-sm italic leading-snug"
        style={{ color: loading ? 'rgba(59,51,48,0.35)' : '#3B3330', transition: 'color 0.3s' }}>
        {loading ? 'Reading your skin story…' : (insight || 'Your skin is responding to your hormonal environment.')}
      </p>
    </div>
  )
}

// ── Phase reflection card ─────────────────────────────────────────────────────

function ReflectionCard({ data }) {
  if (!data) return null
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(212,160,160,0.15) 0%, rgba(255,255,255,0.5) 100%)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(212,160,160,0.38)',
      borderRadius: 18, padding: '16px 16px 14px',
      marginBottom: 14,
      animation: 'skFadeUp 0.4s ease both',
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-2" style={{ color: ROSE }}>
        Phase Transition
      </p>
      <p className="font-cinzel text-sm mb-2" style={{ color: '#3B3330' }}>{data.title}</p>
      <p className="font-garamond text-sm leading-relaxed italic" style={{ color: '#7A6A65' }}>{data.body}</p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SkinInsights() {
  const { user }         = useAuth()
  const { phase, label } = usePhase()

  const [dayData,    setDayData]    = useState({})
  const [allLogs,    setAllLogs]    = useState([])
  const [reflection, setReflection] = useState(null)
  const [loading,    setLoading]    = useState(true)

  const days = getLast7Days()

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  useEffect(() => {
    if (!phase || allLogs.length === 0) return
    const lastPhase = localStorage.getItem(PHASE_KEY)
    if (lastPhase && lastPhase !== phase) fetchReflection(lastPhase)
    localStorage.setItem(PHASE_KEY, phase)
  }, [phase, allLogs])

  async function loadData() {
    setLoading(true)
    const { data: rows } = await supabase
      .from('skin_logs')
      .select('log_date, condition_rating, concerns, phase_name')
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

  async function fetchReflection(prevPhase) {
    const phaseLogs = allLogs.filter(l => l.phase_name === prevPhase)
    if (!phaseLogs.length) return

    const rated = phaseLogs.filter(l => l.condition_rating)
    const avgRating = rated.length
      ? rated.reduce((s, l) => s + l.condition_rating, 0) / rated.length
      : null

    const concCounts = {}
    phaseLogs.forEach(l => (l.concerns || []).forEach(c => { concCounts[c] = (concCounts[c] || 0) + 1 }))
    const topConcerns = Object.entries(concCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c)

    try {
      const r = await fetch('/.netlify/functions/ai-skin', {
        method: 'POST',
        body: JSON.stringify({ type: 'phase_reflection', prevPhase, prevLabel: prevPhase, avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null, topConcerns }),
      })
      const d = await r.json()
      if (d.title) setReflection(d)
    } catch {}
  }

  // Concern frequency for current phase
  const concCounts = {}
  allLogs.filter(l => l.phase_name === phase).forEach(l => (l.concerns || []).forEach(c => { concCounts[c] = (concCounts[c] || 0) + 1 }))
  const topConcerns = Object.entries(concCounts).sort((a, b) => b[1] - a[1]).slice(0, 2)

  const streak = calcStreak(dayData, days)
  const ratedDays = days.filter(d => dayData[d]?.condition_rating)
  const avgRating = ratedDays.length
    ? ratedDays.reduce((s, d) => s + dayData[d].condition_rating, 0) / ratedDays.length
    : null

  if (loading) {
    return (
      <div style={{ paddingTop: 48, textAlign: 'center' }}>
        <style>{`
          @keyframes skLoad{0%,100%{opacity:.3}50%{opacity:.7}}
          @keyframes skFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)', animation: 'skLoad 1.5s ease-in-out infinite' }}>
          Loading your skin insights…
        </p>
      </div>
    )
  }

  return (
    <>
      <style>{`@keyframes skFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {reflection && <ReflectionCard data={reflection} />}

      <ConditionChart days={days} dayData={dayData} />
      <StreakCard streak={streak} avgRating={avgRating} />

      {topConcerns.length > 0 && (
        <>
          <p className="font-cinzel text-[9px] uppercase mb-3 mt-2" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
            Recurring This {label || 'Phase'}
          </p>
          {topConcerns.map(([concern, count]) => (
            <ConcernInsightCard key={concern} concern={concern} count={count} phase={phase} label={label} />
          ))}
        </>
      )}

      {allLogs.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 16 }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
            Log your skin today to start seeing patterns.
          </p>
        </div>
      )}

      <div style={{ height: 16 }} />
    </>
  )
}
