import { useState, useEffect } from 'react'
import { Droplets } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const GOAL_CAL = 2000
const PHASE_KEY = 'athena_nourish_last_phase'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function shortDay(dateStr) {
  const [,, dd] = dateStr.split('-')
  const day = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
  return day.slice(0, 2)
}

// ── SVG bar chart ─────────────────────────────────────────────────────────────

function CalorieChart({ days, dayData }) {
  const W = 280
  const H = 100
  const barW = 28
  const gap  = (W - 7 * barW) / 8
  const maxH = H - 20  // leave room for labels

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 18, padding: '14px 12px 10px',
      border: '1px solid rgba(196,175,168,0.35)',
      marginBottom: 12,
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: '#7A6A65' }}>
        Daily Calories — 7 Days
      </p>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Goal line */}
        <line
          x1={0} y1={H - maxH - 4} x2={W} y2={H - maxH - 4}
          stroke="rgba(196,175,168,0.5)" strokeWidth={1} strokeDasharray="3 3"
        />
        <text x={W - 2} y={H - maxH - 7}
          textAnchor="end"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 9, fill: 'rgba(122,106,101,0.5)' }}>
          {GOAL_CAL}
        </text>

        {days.map((date, i) => {
          const dd = dayData[date]
          const cal     = dd?.calories  || 0
          const protein = dd?.protein_g || 0
          const carbs   = dd?.carbs_g   || 0
          const fat     = dd?.fat_g     || 0
          const totalMacroCal = protein * 4 + carbs * 4 + fat * 9

          const x = gap + i * (barW + gap)
          const totalH = Math.min(cal / GOAL_CAL, 1.2) * maxH
          const isToday = i === 6

          // Stacked macro proportions (when cal > 0)
          const proteinH = totalMacroCal > 0 ? (protein * 4 / totalMacroCal) * totalH : totalH / 3
          const carbsH   = totalMacroCal > 0 ? (carbs   * 4 / totalMacroCal) * totalH : totalH / 3
          const fatH     = totalMacroCal > 0 ? (fat     * 9 / totalMacroCal) * totalH : totalH / 3

          const baseY = H - 14  // bottom of bar area

          return (
            <g key={date}>
              {cal > 0 ? (
                <>
                  {/* Fat — bottom */}
                  <rect
                    x={x} y={baseY - fatH}
                    width={barW} height={fatH}
                    fill="rgba(212,160,160,0.5)" rx={cal > 0 ? 0 : 4}
                  />
                  {/* Carbs — middle */}
                  <rect
                    x={x} y={baseY - fatH - carbsH}
                    width={barW} height={carbsH}
                    fill="rgba(201,168,76,0.5)"
                  />
                  {/* Protein — top */}
                  <rect
                    x={x} y={baseY - totalH}
                    width={barW} height={proteinH}
                    fill="rgba(143,165,140,0.65)"
                    rx={4} ry={4}
                    style={{ clipPath: `inset(0 0 ${fatH + carbsH}px 0 round 4px 4px 0 0)` }}
                  />
                  {/* Top rounded cap */}
                  <rect
                    x={x} y={baseY - totalH}
                    width={barW} height={Math.min(proteinH, 4)}
                    fill="rgba(143,165,140,0.65)"
                    rx={3}
                  />
                </>
              ) : (
                <rect
                  x={x} y={baseY - 4}
                  width={barW} height={4}
                  fill="rgba(196,175,168,0.25)" rx={2}
                />
              )}

              {/* Today indicator */}
              {isToday && (
                <rect
                  x={x - 1} y={H - 13}
                  width={barW + 2} height={2}
                  fill="#8FA58C" rx={1}
                />
              )}

              {/* Day label */}
              <text
                x={x + barW / 2} y={H}
                textAnchor="middle"
                style={{
                  fontFamily: 'Cinzel, serif', fontSize: 8,
                  fill: isToday ? '#8FA58C' : '#7A6A65',
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
          { label: 'Protein', color: 'rgba(143,165,140,0.7)' },
          { label: 'Carbs',   color: 'rgba(201,168,76,0.6)'  },
          { label: 'Fat',     color: 'rgba(212,160,160,0.6)' },
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

// ── 7-day averages ────────────────────────────────────────────────────────────

function MacroAverages({ dayData, days }) {
  const logged = days.filter(d => dayData[d]?.calories > 0)
  if (!logged.length) return null

  const avg = (key) => {
    const sum = logged.reduce((s, d) => s + (dayData[d]?.[key] || 0), 0)
    return Math.round(sum / logged.length)
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16, padding: '12px 14px',
      border: '1px solid rgba(196,175,168,0.35)',
      marginBottom: 12,
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: '#7A6A65' }}>
        7-Day Averages
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
        {[
          { label: 'Cal',     value: avg('calories'),  color: '#3B3330', bg: 'rgba(196,175,168,0.2)' },
          { label: 'Protein', value: `${avg('protein_g')}g`, color: '#8FA58C', bg: 'rgba(143,165,140,0.15)' },
          { label: 'Carbs',   value: `${avg('carbs_g')}g`,   color: '#C9A84C', bg: 'rgba(201,168,76,0.13)'  },
          { label: 'Fat',     value: `${avg('fat_g')}g`,     color: '#D4A0A0', bg: 'rgba(212,160,160,0.15)' },
        ].map(m => (
          <div key={m.label} style={{
            background: m.bg, borderRadius: 10,
            padding: '8px 6px', textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, fontWeight: 700, color: m.color, margin: 0 }}>
              {m.value}
            </p>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7A6A65', marginTop: 2 }}>
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Hydration streak ──────────────────────────────────────────────────────────

function HydrationStreak({ days, waterData }) {
  const GOAL = 6  // 6+ glasses = good day
  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16, padding: '12px 14px',
      border: '1px solid rgba(196,175,168,0.35)',
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase" style={{ color: '#7A6A65' }}>
          Hydration Streak
        </p>
        <Droplets size={13} color="#8FA58C" strokeWidth={1.5} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {days.map((date, i) => {
          const count  = waterData[date] || 0
          const met    = count >= GOAL
          const isToday = i === 6
          return (
            <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: met ? 'rgba(143,165,140,0.25)' : 'transparent',
                border: `2px solid ${met ? '#8FA58C' : isToday ? 'rgba(143,165,140,0.4)' : 'rgba(196,175,168,0.4)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {met && <Droplets size={12} color="#8FA58C" fill="rgba(143,165,140,0.5)" strokeWidth={1.4} />}
              </div>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: 7,
                color: isToday ? '#8FA58C' : '#7A6A65',
              }}>
                {shortDay(date)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Phase reflection card ─────────────────────────────────────────────────────

function ReflectionCard({ reflection }) {
  if (!reflection) return null
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(143,165,140,0.18) 0%, rgba(255,255,255,0.5) 100%)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(143,165,140,0.35)',
      borderRadius: 18, padding: '16px 16px 14px',
      marginBottom: 14,
      animation: 'nrFadeUp 0.4s ease both',
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-2" style={{ color: '#8FA58C' }}>
        Phase Transition
      </p>
      <p className="font-cinzel text-sm mb-2" style={{ color: '#3B3330' }}>
        {reflection.title}
      </p>
      <p className="font-garamond text-sm leading-relaxed italic" style={{ color: '#7A6A65' }}>
        {reflection.body}
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function NourishInsights() {
  const { user }            = useAuth()
  const { phase, label }    = usePhase()

  const [dayData,     setDayData]     = useState({})
  const [waterData,   setWaterData]   = useState({})
  const [reflection,  setReflection]  = useState(null)
  const [loading,     setLoading]     = useState(true)

  const days = getLast7Days()

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  // Phase change detection — runs after phase resolves
  useEffect(() => {
    if (!phase) return
    const lastPhase = localStorage.getItem(PHASE_KEY)
    if (lastPhase && lastPhase !== phase) {
      fetchReflection(lastPhase)
    }
    localStorage.setItem(PHASE_KEY, phase)
  }, [phase])

  async function loadData() {
    setLoading(true)
    const start = days[0]
    const end   = days[6]

    const [{ data: foodRows }, { data: waterRows }] = await Promise.all([
      supabase
        .from('food_log')
        .select('log_date, calories, protein_g, carbs_g, fat_g')
        .eq('user_id', user.id)
        .gte('log_date', start)
        .lte('log_date', end),
      supabase
        .from('water_log')
        .select('log_date, glasses_count')
        .eq('user_id', user.id)
        .gte('log_date', start)
        .lte('log_date', end),
    ])

    // Aggregate food by date
    const food = {}
    ;(foodRows || []).forEach(row => {
      if (!food[row.log_date]) food[row.log_date] = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
      food[row.log_date].calories  += row.calories  || 0
      food[row.log_date].protein_g += row.protein_g || 0
      food[row.log_date].carbs_g   += row.carbs_g   || 0
      food[row.log_date].fat_g     += row.fat_g     || 0
    })
    setDayData(food)

    // Water keyed by date
    const water = {}
    ;(waterRows || []).forEach(row => { water[row.log_date] = row.glasses_count })
    setWaterData(water)

    setLoading(false)
  }

  async function fetchReflection(prevPhase) {
    try {
      // Build a simple log summary from the last phase's data
      const logSummary = Object.values(dayData).length
        ? `avg ${Math.round(Object.values(dayData).reduce((s, d) => s + d.calories, 0) / Object.values(dayData).length)} cal/day`
        : 'varied eating'

      const r = await fetch('/.netlify/functions/ai-nourish', {
        method: 'POST',
        body: JSON.stringify({ type: 'phase_reflection', phase: prevPhase, label: prevPhase, logSummary }),
      })
      const d = await r.json()
      if (d.title) setReflection(d)
    } catch {}
  }

  if (loading) {
    return (
      <div style={{ paddingTop: 48, textAlign: 'center' }}>
        <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)', animation: 'nrLoad 1.5s ease-in-out infinite' }}>
          Loading your insights…
        </p>
        <style>{`
          @keyframes nrLoad { 0%,100%{opacity:.3} 50%{opacity:.7} }
          @keyframes nrFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
      </div>
    )
  }

  const hasAnyData = days.some(d => dayData[d]?.calories > 0)

  return (
    <>
      <style>{`
        @keyframes nrFadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {reflection && <ReflectionCard reflection={reflection} />}

      <CalorieChart days={days} dayData={dayData} />
      <MacroAverages dayData={dayData} days={days} />
      <HydrationStreak days={days} waterData={waterData} />

      {!hasAnyData && (
        <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 16 }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
            Log your first meal to see patterns emerge.
          </p>
        </div>
      )}

      <div style={{ height: 8 }} />
    </>
  )
}
