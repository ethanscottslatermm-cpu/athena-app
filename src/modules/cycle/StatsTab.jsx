import { useState, useEffect, useMemo } from 'react'
import { differenceInDays, format } from 'date-fns'

const MOOD_COLORS  = ['#8B1A1A', '#6B4F6B', 'rgba(244,239,230,0.4)', '#8FAF8A', '#C9A86C']
const MOOD_LABELS  = ['Low', 'Anxious', 'Neutral', 'Good', 'Great']

// ── SVG bar chart ─────────────────────────────────────────────────────────────
function BarChart({ values, barColor, labels }) {
  if (!values || values.length === 0) {
    return <p className="font-garamond text-ivory/30 text-sm text-center py-6">Not enough data yet.</p>
  }
  const W       = 280
  const H       = 90
  const barW    = Math.floor((W - (values.length + 1) * 8) / values.length)
  const maxVal  = Math.max(...values, 30)
  const avg     = values.reduce((a, b) => a + b, 0) / values.length
  const avgY    = H - (avg / maxVal) * H

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 22}`} className="overflow-visible">
      {values.map((v, i) => {
        const bH = (v / maxVal) * H
        const x  = 8 + i * (barW + 8)
        const y  = H - bH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bH} fill={barColor} rx={3} opacity={0.8} />
            <text
              x={x + barW / 2} y={H + 14}
              textAnchor="middle" fill="rgba(244,239,230,0.3)"
              fontSize={9} fontFamily="Cormorant Garamond, serif"
            >
              {labels ? labels[i] : `C${i + 1}`}
            </text>
            <text
              x={x + barW / 2} y={y - 3}
              textAnchor="middle" fill="rgba(244,239,230,0.45)"
              fontSize={8} fontFamily="Cormorant Garamond, serif"
            >
              {v}
            </text>
          </g>
        )
      })}
      {/* Avg dashed line */}
      <line
        x1={0} y1={avgY} x2={W} y2={avgY}
        stroke="rgba(244,239,230,0.25)" strokeWidth={1} strokeDasharray="4 4"
      />
      <text x={W - 4} y={avgY - 3} textAnchor="end" fill="rgba(244,239,230,0.25)" fontSize={8}>
        avg
      </text>
    </svg>
  )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ icon, value, label }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-4 rounded-xl"
      style={{ background: 'rgba(201,168,108,0.07)', border: '1px solid rgba(201,168,108,0.15)' }}
    >
      <span className="text-lg mb-1">{icon}</span>
      <span className="font-cinzel text-gold text-xl leading-none">{value ?? '—'}</span>
      <span className="font-garamond text-ivory/45 text-xs mt-1 text-center leading-tight">{label}</span>
    </div>
  )
}

// ── Shimmer skeleton ──────────────────────────────────────────────────────────
function Shimmer({ className = '' }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(201,168,108,0.06) 25%, rgba(201,168,108,0.12) 50%, rgba(201,168,108,0.06) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmerSlide 1.4s infinite',
      }}
    />
  )
}

export default function StatsTab({ profile, phaseData, symptoms, cycles, loading }) {
  const [expanded,    setExpanded]    = useState(null)
  const [insight,     setInsight]     = useState(null)
  const [insightLoad, setInsightLoad] = useState(false)

  // ── Computed stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const completeCycles = cycles.filter(c => c.start_date && c.end_date)
    const cycleLengths   = completeCycles.map(c => differenceInDays(new Date(c.end_date), new Date(c.start_date)) + 1)

    // Count symptom days per cycle as period length proxy
    const periodLengths = completeCycles.map(c => {
      const start = c.start_date
      const end   = c.end_date
      return symptoms.filter(s => {
        const d = s.logged_date
        return s.flow_level > 0 && d >= start && d <= end
      }).length
    }).filter(l => l > 0)

    const avgCycle  = cycleLengths.length ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : null
    const avgPeriod = periodLengths.length ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) : null

    const stdDev = cycleLengths.length >= 2
      ? Math.sqrt(cycleLengths.reduce((sum, l) => sum + (l - (avgCycle ?? 0)) ** 2, 0) / cycleLengths.length)
      : null

    const regularity = stdDev === null ? '—' : stdDev < 3 ? 'Regular' : 'Irregular'

    // Symptom frequency from boolean cols + symptoms_raw
    const symCount = {}
    const increment = s => { symCount[s] = (symCount[s] || 0) + 1 }
    symptoms.forEach(row => {
      if (row.cramps)            increment('Cramps')
      if (row.bloating)          increment('Bloating')
      if (row.headache)          increment('Headache')
      if (row.fatigue)           increment('Fatigue')
      if (row.breast_tenderness) increment('Breast Tenderness')
      if (Array.isArray(row.symptoms_raw)) {
        row.symptoms_raw.forEach(s => {
          const norm = s.charAt(0).toUpperCase() + s.slice(1)
          increment(norm)
        })
      }
    })
    const topSymptoms = Object.entries(symCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        pct: symptoms.length ? Math.round((count / symptoms.length) * 100) : 0,
      }))

    // Mood distribution — last 30 days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const recentMoods   = symptoms.filter(s => s.mood && new Date(s.logged_date) >= cutoff).map(s => s.mood)
    const moodDist      = [1, 2, 3, 4, 5].map(v => recentMoods.filter(m => m === v).length)

    return {
      avgCycle,
      avgPeriod,
      cycleCount: cycles.length,
      regularity,
      cycleLengths: cycleLengths.slice(-6),
      periodLengths: periodLengths.slice(-6),
      topSymptoms,
      moodDist,
    }
  }, [cycles, symptoms])

  // ── AI insight (fires once on mount) ───────────────────────────────────────
  async function fetchInsight() {
    if (!phaseData?.phase) return
    setInsightLoad(true)
    try {
      const res = await fetch('/.netlify/functions/ai-phase-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase:     phaseData.phase,
          symptoms:  stats.topSymptoms.map(s => s.name),
          moods:     stats.moodDist,
          sleepAvg:  null,
          cycleData: {
            avgCycle:    stats.avgCycle,
            avgPeriod:   stats.avgPeriod,
            cycleCount:  stats.cycleCount,
            regularity:  stats.regularity,
          },
        }),
      })
      const data = await res.json()
      setInsight(data)
    } catch (_) {}
    setInsightLoad(false)
  }

  useEffect(() => { fetchInsight() }, [])   // only on tab mount

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <Shimmer className="h-28" />
        <Shimmer className="h-36" />
        <Shimmer className="h-24" />
      </div>
    )
  }

  const moodTotal = stats.moodDist.reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-5 pb-4">

      {/* ── Summary grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile icon="◯"  value={stats.avgCycle  ? `${stats.avgCycle} days`  : null} label="Avg Cycle Length" />
        <StatTile icon="🩸" value={stats.avgPeriod ? `${stats.avgPeriod} days` : null} label="Avg Period Length" />
        <StatTile icon="📅" value={stats.cycleCount || null} label="Cycles Tracked" />
        <StatTile icon="✦"  value={stats.regularity !== '—' ? stats.regularity : null} label="Cycle Regularity" />
      </div>

      {/* ── Cycle length chart ───────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(201,168,108,0.06)', border: '1px solid rgba(201,168,108,0.12)' }}
      >
        <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase mb-3">Cycle Length</p>
        <BarChart values={stats.cycleLengths} barColor="rgba(201,168,108,0.75)" />
      </div>

      {/* ── Period length chart ──────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(139,26,26,0.08)', border: '1px solid rgba(139,26,26,0.2)' }}
      >
        <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase mb-3">Period Length</p>
        <BarChart values={stats.periodLengths} barColor="rgba(139,26,26,0.7)" />
      </div>

      {/* ── Top symptoms ─────────────────────────────────────────────────────── */}
      {stats.topSymptoms.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(107,79,107,0.08)', border: '1px solid rgba(107,79,107,0.2)' }}
        >
          <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase mb-3">Most Logged Symptoms</p>
          <div className="space-y-2.5">
            {stats.topSymptoms.map(({ name, pct }) => (
              <div key={name}>
                <div className="flex justify-between mb-1">
                  <span className="font-garamond text-ivory/70 text-sm">{name}</span>
                  <span className="font-garamond text-ivory/40 text-xs">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(244,239,230,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: 'rgba(201,168,108,0.65)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mood patterns ────────────────────────────────────────────────────── */}
      {moodTotal > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(143,175,138,0.07)', border: '1px solid rgba(143,175,138,0.15)' }}
        >
          <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase mb-3">Mood — Last 30 Days</p>
          <div className="flex rounded-full overflow-hidden h-3.5 mb-2">
            {stats.moodDist.map((count, i) => {
              const pct = (count / moodTotal) * 100
              return pct > 0 ? (
                <div key={i} style={{ width: `${pct}%`, background: MOOD_COLORS[i] }} />
              ) : null
            })}
          </div>
          <div className="flex justify-between">
            {MOOD_LABELS.map((l, i) => (
              <span key={l} className="font-garamond text-[9px]" style={{ color: MOOD_COLORS[i] }}>
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Cycle history ────────────────────────────────────────────────────── */}
      {cycles.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(244,239,230,0.08)' }}
        >
          <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase px-4 pt-4 pb-2">
            Cycle History
          </p>
          {cycles.slice(0, 12).map((c, i) => {
            const len = c.end_date
              ? differenceInDays(new Date(c.end_date), new Date(c.start_date)) + 1
              : null
            const isOpen = expanded === i

            // Average flow for this cycle
            const cycleSym = symptoms.filter(s => s.logged_date >= c.start_date && (!c.end_date || s.logged_date <= c.end_date))
            const flowVals  = cycleSym.filter(s => s.flow_level > 0).map(s => s.flow_level)
            const avgFlow   = flowVals.length ? Math.round(flowVals.reduce((a, b) => a + b, 0) / flowVals.length) : null

            return (
              <div key={c.id ?? i}>
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5 text-left"
                  style={{ borderTop: i > 0 ? '1px solid rgba(244,239,230,0.06)' : 'none' }}
                >
                  <div>
                    <span className="font-cinzel text-ivory/60 text-[10px] tracking-widest mr-2">
                      #{cycles.length - i}
                    </span>
                    <span className="font-garamond text-ivory/55 text-sm">
                      {format(new Date(c.start_date), 'MMM d')}
                      {c.end_date ? ` → ${format(new Date(c.end_date), 'MMM d')}` : ' →  ongoing'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {len && (
                      <span className="font-garamond text-gold/70 text-xs">{len}d</span>
                    )}
                    <span className="text-ivory/30 text-xs">{isOpen ? '▾' : '›'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-3" style={{ background: 'rgba(201,168,108,0.04)' }}>
                    <div className="flex gap-4 mb-2">
                      {len     && <span className="font-garamond text-ivory/50 text-xs">Length: {len} days</span>}
                      {avgFlow && <span className="font-garamond text-ivory/50 text-xs">Avg flow: {'💧'.repeat(avgFlow)}</span>}
                    </div>
                    {cycleSym.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {Array.from(new Set(cycleSym.flatMap(s => {
                          const l = []
                          if (s.cramps)  l.push('Cramps')
                          if (s.fatigue) l.push('Fatigue')
                          if (s.bloating) l.push('Bloating')
                          if (Array.isArray(s.symptoms_raw)) l.push(...s.symptoms_raw)
                          return l
                        }))).slice(0, 8).map(sym => (
                          <span key={sym} className="font-garamond text-ivory/35 text-[10px] border border-ivory/10 px-1.5 py-0.5 rounded-full">
                            {sym}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── AI Insight card ──────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'rgba(201,168,108,0.07)', border: '1px solid rgba(201,168,108,0.28)' }}
      >
        <p className="font-cinzel text-gold tracking-widest text-sm mb-3">Your Pattern</p>

        {insightLoad ? (
          <div className="space-y-2">
            <Shimmer className="h-4 w-3/4" />
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-5/6" />
          </div>
        ) : insight ? (
          <>
            {insight.headline && (
              <p className="font-cinzel text-ivory/80 text-sm mb-2">{insight.headline}</p>
            )}
            <p className="font-garamond italic text-ivory/65 text-sm leading-relaxed mb-3">
              {insight.body}
            </p>
            {insight.tip && (
              <p className="font-garamond text-ivory/50 text-xs border-t border-ivory/10 pt-3">
                ✦ {insight.tip}
              </p>
            )}
            <button
              onClick={fetchInsight}
              className="font-garamond text-gold/60 text-xs mt-3 hover:text-gold transition-colors"
            >
              Refresh insight
            </button>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="font-garamond text-ivory/35 text-sm mb-3">
              {phaseData?.phase ? 'Unable to load insight.' : 'Set up your cycle to get personalized insights.'}
            </p>
            {phaseData?.phase && (
              <button
                onClick={fetchInsight}
                className="font-cinzel text-gold/60 text-[10px] tracking-widest uppercase border border-gold/25 px-4 py-2 rounded-xl hover:bg-gold/10 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
