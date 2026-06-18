import { useState, useMemo, useEffect, useCallback } from 'react'
import { format, subDays, subMonths } from 'date-fns'
import { useAuth }    from '../hooks/useAuth'
import { usePhase }   from '../hooks/usePhase'
import { supabase }   from '../lib/supabase'
import MuscleMap          from '../components/MuscleMap'
import MuscleBottomSheet  from '../components/MuscleBottomSheet'
import {
  MUSCLE_PAIRS, MUSCLE_COLORS, MUSCLE_NAMES, ALL_MUSCLE_KEYS,
  PHASE_MUSCLES, PHASE_COLORS, FOCUS_TO_MUSCLES, HEATMAP_OPACITY,
} from '../constants/muscleMap'

const gold      = '#C9A86C'
const mutedText = 'rgba(242,237,232,0.45)'
const linen     = '#F2EDE8'
const fontSerif = "'Cormorant Garamond', serif"
const fontSans  = "'Tenor Sans', sans-serif"
const bgCard    = 'rgba(255,255,255,0.04)'

const TIME_RANGES = [
  { label: 'This Week',  days: 7  },
  { label: 'This Month', days: 30 },
  { label: '3 Months',   days: 90 },
]

// ── Insights generator ────────────────────────────────────────────────────────
function generateInsights(sessionHistory, currentPhase) {
  const insights = []
  const now      = new Date()
  const cutoff   = new Date(now - 30 * 24 * 60 * 60 * 1000)
  const recent   = sessionHistory.filter(s => new Date(s.date ?? s.completed_at) > cutoff)

  const freq = {}
  ALL_MUSCLE_KEYS.forEach(m => { freq[m] = 0 })
  recent.forEach(s => (s.muscleGroups ?? []).forEach(m => { freq[m] = (freq[m] ?? 0) + 1 }))

  const sorted    = Object.entries(freq).sort((a, b) => b[1] - a[1])
  const neglected = sorted.filter(([, f]) => f === 0).map(([m]) => m)

  if (sorted[0]?.[1] > 0) {
    insights.push({
      type: 'highlight', icon: '✦',
      text: `${MUSCLE_NAMES[sorted[0][0]]} is your most trained muscle this month with ${sorted[0][1]} session${sorted[0][1] !== 1 ? 's' : ''}.`,
      color: MUSCLE_COLORS[sorted[0][0]],
    })
  }
  if (neglected.length > 0) {
    insights.push({
      type: 'warning', icon: '○',
      text: `You haven't targeted ${MUSCLE_NAMES[neglected[0]]} in the last 30 days.`,
      color: mutedText,
    })
  }
  if (currentPhase) {
    const rec = PHASE_MUSCLES[currentPhase.name]
    insights.push({
      type: 'phase', icon: '◐',
      text: `In your ${currentPhase.name} phase, focus on ${rec.primary.map(m => MUSCLE_NAMES[m]).join(', ')}.`,
      color: currentPhase.phaseColor,
    })
  }
  if (recent.length >= 3) {
    insights.push({
      type: 'streak', icon: '▲',
      text: `${recent.length} session${recent.length !== 1 ? 's' : ''} this month. Keep the momentum going.`,
      color: gold,
    })
  }
  if (!insights.length) {
    insights.push({
      type: 'empty', icon: '○',
      text: 'Complete sessions to start seeing muscle insights here.',
      color: mutedText,
    })
  }
  return insights
}

// ── Heatmap legend ────────────────────────────────────────────────────────────
function HeatmapLegend() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0' }}>
      <span style={{ fontFamily: fontSans, fontSize: 10, color: mutedText }}>Less</span>
      {[0.06, 0.25, 0.45, 0.65, 0.82, 1.0].map((op, i) => (
        <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: gold, opacity: op }} />
      ))}
      <span style={{ fontFamily: fontSans, fontSize: 10, color: mutedText }}>More</span>
    </div>
  )
}

// ── Phase header bar ──────────────────────────────────────────────────────────
function PhaseBar({ currentPhase }) {
  if (!currentPhase) return null
  const rec = PHASE_MUSCLES[currentPhase.name]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px',
      background:   `${currentPhase.phaseColor}18`,
      border:       `1px solid ${currentPhase.phaseColor}40`,
      borderRadius: 10,
      marginBottom: '0.75rem',
      flexWrap: 'wrap',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: currentPhase.phaseColor,
        boxShadow: `0 0 6px ${currentPhase.phaseColor}`,
        flexShrink: 0,
      }} />
      <span style={{ fontFamily: fontSerif, fontSize: 12, color: currentPhase.phaseColor, letterSpacing: '0.05em', textTransform: 'capitalize' }}>
        {currentPhase.name} phase · Day {currentPhase.day}
      </span>
      <span style={{ fontFamily: fontSans, fontSize: 11, color: mutedText, marginLeft: 'auto' }}>
        {rec?.rationale}
      </span>
    </div>
  )
}

// ── Sub-view toggle ───────────────────────────────────────────────────────────
function ViewToggle({ view, setView }) {
  return (
    <div style={{
      display: 'flex',
      background: bgCard,
      borderRadius: 10,
      padding: 3,
      margin: '0.75rem 1rem',
      gap: 2,
    }}>
      {['map', 'history', 'insights'].map(v => (
        <button
          key={v}
          onClick={() => setView(v)}
          style={{
            flex:          1,
            padding:       '8px',
            borderRadius:  8,
            border:        'none',
            background:    view === v ? 'rgba(201,168,108,0.15)' : 'transparent',
            color:         view === v ? gold : mutedText,
            fontFamily:    fontSans,
            fontSize:      12,
            letterSpacing: '0.08em',
            textTransform: 'capitalize',
            cursor:        'pointer',
            transition:    'all 0.2s ease',
            borderBottom:  view === v ? `1px solid ${gold}` : '1px solid transparent',
          }}
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  )
}

// ── Map view ──────────────────────────────────────────────────────────────────
function MapView({ currentPhase, sessionHistory, onSelectSession }) {
  const [activeMuscles, setActiveMuscles] = useState([])
  const [activeSheet,   setActiveSheet]   = useState(null)

  const suggestedMuscles = currentPhase
    ? (PHASE_MUSCLES[currentPhase.name]?.primary ?? [])
    : []

  const toggleMuscle = (pairKey) => {
    setActiveMuscles(prev =>
      prev.includes(pairKey) ? prev.filter(k => k !== pairKey) : [...prev, pairKey]
    )
    setActiveSheet(pairKey)
  }

  return (
    <div style={{ padding: '0 1rem 2rem' }}>
      <div style={{
        background:   '#140A18',
        borderRadius: 16,
        border:       '1px solid rgba(201,168,108,0.12)',
        padding:      '1rem',
        overflow:     'visible',
      }}>
        <PhaseBar currentPhase={currentPhase} />
        <MuscleMap
          activeMuscles={activeMuscles}
          onMusclePress={toggleMuscle}
          interactive={true}
          showTooltip={true}
          showLegend={true}
          suggestedMuscles={suggestedMuscles}
          phaseColor={currentPhase?.phaseColor}
        />
      </div>
      <MuscleBottomSheet
        pairKey={activeSheet}
        isOpen={!!activeSheet}
        onClose={() => setActiveSheet(null)}
        currentPhase={currentPhase}
        sessionHistory={sessionHistory}
        onNavigateToSession={onSelectSession}
      />
    </div>
  )
}

// ── History view ──────────────────────────────────────────────────────────────
function HistoryView({ sessionHistory }) {
  const [rangeIdx, setRangeIdx] = useState(1)
  const range    = TIME_RANGES[rangeIdx]
  const cutoff   = useMemo(() => subDays(new Date(), range.days), [range.days])

  const filtered = useMemo(() =>
    sessionHistory.filter(s => new Date(s.date ?? s.completed_at) >= cutoff),
    [sessionHistory, cutoff]
  )

  const heatmap = useMemo(() => {
    const freq = {}
    ALL_MUSCLE_KEYS.forEach(m => { freq[m] = 0 })
    filtered.forEach(s => (s.muscleGroups ?? []).forEach(m => { freq[m] = (freq[m] ?? 0) + 1 }))
    const result = {}
    Object.entries(freq).forEach(([k, v]) => { result[k] = HEATMAP_OPACITY(v) })
    return result
  }, [filtered])

  // Group sessions by week for log
  const grouped = useMemo(() => {
    const weeks = {}
    filtered.forEach(s => {
      const d   = new Date(s.date ?? s.completed_at)
      const key = format(subDays(d, d.getDay()), 'MMM d')
      if (!weeks[key]) weeks[key] = []
      weeks[key].push(s)
    })
    return Object.entries(weeks)
  }, [filtered])

  return (
    <div style={{ padding: '0 1rem 2rem' }}>
      {/* Range toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {TIME_RANGES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setRangeIdx(i)}
            style={{
              flex:          1,
              padding:       '7px 4px',
              borderRadius:  20,
              border:        rangeIdx === i ? `1px solid ${gold}` : '1px solid rgba(201,168,108,0.2)',
              background:    rangeIdx === i ? 'rgba(201,168,108,0.12)' : 'transparent',
              color:         rangeIdx === i ? gold : mutedText,
              fontFamily:    fontSans,
              fontSize:      11,
              letterSpacing: '0.06em',
              cursor:        'pointer',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Heatmap */}
      <div style={{
        background:   '#140A18',
        borderRadius: 16,
        border:       '1px solid rgba(201,168,108,0.12)',
        padding:      '1rem',
        overflow:     'visible',
        marginBottom: '1rem',
      }}>
        <MuscleMap
          activeMuscles={[]}
          interactive={false}
          showTooltip={true}
          showLegend={false}
          heatmap={heatmap}
        />
        <HeatmapLegend />
      </div>

      {/* Training log */}
      <p style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.14em', color: mutedText, textTransform: 'uppercase', margin: '0 0 0.75rem' }}>
        Training Log
      </p>
      {grouped.length === 0 ? (
        <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 14, color: mutedText, textAlign: 'center', padding: '2rem 0' }}>
          No sessions in this time range.
        </p>
      ) : grouped.map(([week, sessions]) => (
        <div key={week} style={{ marginBottom: '1rem' }}>
          <p style={{ fontFamily: fontSans, fontSize: 10, color: mutedText, letterSpacing: '0.1em', margin: '0 0 6px' }}>
            Week of {week}
          </p>
          {sessions.map((s, i) => (
            <div key={i} style={{
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'space-between',
              padding:      '10px 12px',
              background:   bgCard,
              borderRadius: 10,
              marginBottom: 6,
              border:       '1px solid rgba(201,168,108,0.08)',
            }}>
              <div>
                <p style={{ fontFamily: fontSerif, fontSize: 14, color: linen, margin: '0 0 3px' }}>
                  {format(new Date(s.date ?? s.completed_at), 'MMM d')} · {s.title ?? s.name ?? 'Session'}
                </p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(s.muscleGroups ?? []).slice(0, 3).map(m => (
                    <span key={m} style={{
                      width:  8, height: 8,
                      borderRadius: '50%',
                      background: MUSCLE_COLORS[m] ?? mutedText,
                      display: 'inline-block',
                    }} />
                  ))}
                </div>
              </div>
              <span style={{ fontFamily: fontSans, fontSize: 11, color: mutedText }}>
                {s.duration_min ?? s.duration ?? 30} min
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Insights view ─────────────────────────────────────────────────────────────
function InsightsView({ sessionHistory, currentPhase }) {
  const insights = useMemo(
    () => generateInsights(sessionHistory, currentPhase),
    [sessionHistory, currentPhase]
  )
  return (
    <div style={{ padding: '0 1rem 2rem' }}>
      {insights.map((insight, i) => (
        <div key={i} style={{
          background:   `${insight.color}0F`,
          border:       `1px solid ${insight.color}30`,
          borderRadius: 12,
          padding:      '1rem',
          marginBottom: '0.75rem',
          display:      'flex',
          gap:          12,
          alignItems:   'flex-start',
        }}>
          <span style={{ fontSize: 16, color: insight.color, marginTop: 1, flexShrink: 0 }}>{insight.icon}</span>
          <p style={{ fontFamily: fontSerif, fontSize: 15, lineHeight: 1.5, color: linen, margin: 0 }}>
            {insight.text}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Main BodyTab page ─────────────────────────────────────────────────────────
export default function BodyTab({ embedded = false }) {
  const { user } = useAuth()
  const phaseHook = usePhase()

  const currentPhase = phaseHook.phase ? {
    name:         phaseHook.phase,
    day:          phaseHook.dayOfCycle ?? 1,
    daysRemaining: phaseHook.days ?? 0,
    phaseColor:   PHASE_COLORS[phaseHook.phase] ?? gold,
  } : null

  const [view,           setView]           = useState('map')
  const [sessionHistory, setSessionHistory] = useState([])
  const [sessions,       setSessions]       = useState([])
  const [loading,        setLoading]        = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return
    const [cRes, sRes] = await Promise.all([
      supabase
        .from('session_completions')
        .select('id, session_id, completed_at, duration_min')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(200),
      supabase
        .from('pilates_sessions')
        .select('id, title, focus_area, duration_min, muscle_groups'),
    ])

    const rawSessions = (sRes.data ?? []).map(s => ({
      ...s,
      muscleGroups: s.muscle_groups?.length
        ? s.muscle_groups
        : (FOCUS_TO_MUSCLES[s.focus_area] ?? []),
    }))
    setSessions(rawSessions)

    const history = (cRes.data ?? []).map(c => {
      const session = rawSessions.find(s => s.id === c.session_id)
      return {
        ...c,
        id:           c.session_id,
        title:        session?.title,
        duration_min: session?.duration_min,
        date:         c.completed_at,
        muscleGroups: session?.muscleGroups ?? [],
      }
    })
    setSessionHistory(history)
    setLoading(false)
  }, [user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  const content = loading ? (
    <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
      <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 14, color: mutedText }}>
        Loading…
      </p>
    </div>
  ) : (
    <>
      {view === 'map' && (
        <MapView
          currentPhase={currentPhase}
          sessionHistory={sessionHistory}
          onSelectSession={null}
        />
      )}
      {view === 'history' && (
        <HistoryView sessionHistory={sessionHistory} />
      )}
      {view === 'insights' && (
        <InsightsView sessionHistory={sessionHistory} currentPhase={currentPhase} />
      )}
    </>
  )

  if (embedded) {
    return (
      <div>
        <ViewToggle view={view} setView={setView} />
        {content}
      </div>
    )
  }

  return (
    <div style={{
      minHeight:  '100svh',
      background: 'linear-gradient(180deg, #1E1128 0%, #140A18 100%)',
      overflowY:  'auto',
      paddingBottom: 120,
    }}>
      {/* Header */}
      <div style={{ padding: 'max(env(safe-area-inset-top, 0px), 52px) 1rem 0' }}>
        <p style={{ fontFamily: fontSerif, fontSize: 28, color: linen, margin: 0, letterSpacing: '-0.01em' }}>
          Body Map
        </p>
        <p style={{ fontFamily: fontSans, fontSize: 12, color: mutedText, margin: '2px 0 0' }}>
          Tap any muscle to explore
        </p>
      </div>

      <ViewToggle view={view} setView={setView} />
      {content}
    </div>
  )
}
