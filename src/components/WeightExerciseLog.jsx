import { useState, useEffect, useMemo } from 'react'
import { isToday, isYesterday, isAfter, subDays } from 'date-fns'
import { useAuth }        from '../hooks/useAuth'
import { supabase }       from '../lib/supabase'
import { MUSCLE_COLORS, MUSCLE_NAMES } from '../constants/muscleMap'

const gold      = '#C9A86C'
const rose      = '#C4859A'
const mutedText = 'rgba(59,51,48,0.45)'
const brown     = '#3B3330'
const bgCard    = 'rgba(255,255,255,0.6)'
const fontSerif = "'Cormorant Garamond', serif"
const fontSans  = "'Tenor Sans', sans-serif"

// Parse a "YYYY-MM-DD" date string in local time (avoids UTC midnight offset issues)
function parseLocalDate(dateStr) {
  if (!dateStr) return new Date(NaN)
  const s = typeof dateStr === 'string' ? dateStr.slice(0, 10) : dateStr
  return new Date(`${s}T00:00:00`)
}

function dateGroupLabel(dateStr) {
  const d = parseLocalDate(dateStr)
  if (isToday(d))    return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  if (isAfter(d, subDays(new Date(), 7))) return 'This Week'
  return 'Earlier'
}

// ── SVG line chart ────────────────────────────────────────────────────────────
function WeightChart({ entries }) {
  if (entries.length < 2) return null

  const sorted = [...entries]
    .sort((a, b) => parseLocalDate(a.logged_at) - parseLocalDate(b.logged_at))
    .slice(-30) // cap at 30 data points

  const values = sorted.map(e => Number(e.weight))
  const lo     = Math.min(...values)
  const hi     = Math.max(...values)
  const span   = hi - lo || 1

  const W = 300, H = 90, PAD = 10
  const innerW = W - PAD * 2
  const innerH = H - PAD * 2
  const n      = sorted.length

  const px = i => PAD + (i / (n - 1)) * innerW
  const py = v => PAD + innerH - ((v - lo) / span) * innerH

  const pts   = sorted.map((e, i) => ({ x: px(i), y: py(Number(e.weight)) }))
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const areaD = `${lineD} L${pts[n - 1].x.toFixed(1)} ${H} L${pts[0].x.toFixed(1)} ${H} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={rose} stopOpacity="0.28" />
          <stop offset="100%" stopColor={rose} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Thin horizontal grid */}
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t}
          x1={PAD} y1={PAD + t * innerH}
          x2={W - PAD} y2={PAD + t * innerH}
          stroke="rgba(59,51,48,0.08)" strokeWidth={0.5}
        />
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#wGrad)" />

      {/* Line */}
      <path d={lineD} fill="none" stroke={rose} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Gold data-point dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={gold} />
      ))}
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WeightExerciseLog({ currentPhase }) {
  const { user } = useAuth()

  // Weight state
  const [weightLogs,   setWeightLogs]   = useState([])
  const [weightInput,  setWeightInput]  = useState('')
  const [unit,         setUnit]         = useState('lbs')
  const [savingWeight, setSavingWeight] = useState(false)

  // Exercise state
  const [workouts,        setWorkouts]        = useState([])
  const [showAddForm,     setShowAddForm]     = useState(false)
  const [exName,          setExName]          = useState('')
  const [exMuscle,        setExMuscle]        = useState('')
  const [exSets,          setExSets]          = useState('')
  const [exReps,          setExReps]          = useState('')
  const [exWeight,        setExWeight]        = useState('')
  const [savingExercise,  setSavingExercise]  = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase
        .from('weight_logs')
        .select('id, weight, unit, logged_at')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(60),
      supabase
        .from('muscle_workouts')
        .select('id, muscle_id, exercise_name, sets, reps, weight_kg, logged_at')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(100),
    ]).then(([wRes, mRes]) => {
      setWeightLogs(wRes.data ?? [])
      setWorkouts(mRes.data ?? [])
    })
  }, [user?.id])

  const handleSaveWeight = async () => {
    if (!user || !weightInput || savingWeight) return
    setSavingWeight(true)
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('weight_logs')
      .upsert(
        { user_id: user.id, weight: parseFloat(weightInput), unit, logged_at: today },
        { onConflict: 'user_id,logged_at' },
      )
      .select('id, weight, unit, logged_at')
      .single()
    if (data) {
      setWeightLogs(prev => [data, ...prev.filter(l => l.logged_at !== data.logged_at)])
    }
    setSavingWeight(false)
    setWeightInput('')
  }

  const handleSaveExercise = async () => {
    if (!user || !exName.trim() || savingExercise) return
    setSavingExercise(true)
    const { data } = await supabase
      .from('muscle_workouts')
      .insert({
        user_id:       user.id,
        muscle_id:     exMuscle || null,
        exercise_name: exName.trim(),
        sets:          exSets   ? parseInt(exSets,   10) : null,
        reps:          exReps   ? parseInt(exReps,   10) : null,
        weight_kg:     exWeight ? parseFloat(exWeight)  : null,
        logged_at:     new Date().toISOString().slice(0, 10),
      })
      .select('id, muscle_id, exercise_name, sets, reps, weight_kg, logged_at')
      .single()
    if (data) setWorkouts(prev => [data, ...prev])
    setSavingExercise(false)
    setShowAddForm(false)
    setExName(''); setExMuscle(''); setExSets(''); setExReps(''); setExWeight('')
  }

  const handleDeleteWorkout = async (id) => {
    await supabase.from('muscle_workouts').delete().eq('id', id).eq('user_id', user.id)
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  const groupedWorkouts = useMemo(() => {
    const groups = {}
    workouts.forEach(w => {
      const label = dateGroupLabel(w.logged_at)
      ;(groups[label] ??= []).push(w)
    })
    return ['Today', 'Yesterday', 'This Week', 'Earlier']
      .filter(l => groups[l])
      .map(l => [l, groups[l]])
  }, [workouts])

  const phaseNote = currentPhase?.name === 'luteal'
    ? 'Weight tends to fluctuate slightly during your luteal phase — this is normal.'
    : null

  const inputStyle = {
    background:       bgCard,
    border:           '1px solid rgba(59,51,48,0.12)',
    borderRadius:     10,
    color:            brown,
    fontFamily:       fontSerif,
    fontSize:         15,
    padding:          '10px 12px',
    outline:          'none',
    width:            '100%',
    boxSizing:        'border-box',
    WebkitAppearance: 'none',
  }

  const musclePairs = Object.entries(MUSCLE_NAMES)

  return (
    <div style={{ padding: '0 1rem 2rem' }}>

      {/* ══ Section A: Weight Log ══════════════════════════════════════════════ */}
      <p style={{ fontFamily: fontSerif, fontSize: 24, color: brown, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
        Weight
      </p>
      <p style={{ fontFamily: fontSans, fontSize: 11, color: mutedText, margin: '0 0 1rem', letterSpacing: '0.06em' }}>
        Track your weight over time
      </p>

      {/* Weight input row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem', alignItems: 'stretch' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          type="number"
          inputMode="decimal"
          placeholder={unit === 'lbs' ? 'e.g. 135' : 'e.g. 61'}
          value={weightInput}
          onChange={e => setWeightInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSaveWeight()}
        />
        {/* lbs / kg toggle */}
        <div style={{ display: 'flex', background: 'rgba(59,51,48,0.07)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
          {['lbs', 'kg'].map(u => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              style={{
                padding:    '0 14px',
                border:     'none',
                background: unit === u ? 'rgba(201,168,108,0.18)' : 'transparent',
                color:      unit === u ? gold : mutedText,
                fontFamily: fontSans,
                fontSize:   12,
                cursor:     'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {u}
            </button>
          ))}
        </div>
        <button
          onClick={handleSaveWeight}
          disabled={!weightInput || savingWeight}
          style={{
            padding:       '0 18px',
            background:    'linear-gradient(135deg, #C9A86C, #A07B4C)',
            borderRadius:  10,
            border:        'none',
            color:         '#F2EDE8',
            fontFamily:    fontSans,
            fontSize:      12,
            letterSpacing: '0.06em',
            cursor:        'pointer',
            flexShrink:    0,
            opacity:       (!weightInput || savingWeight) ? 0.5 : 1,
            transition:    'opacity 0.2s ease',
          }}
        >
          {savingWeight ? '…' : 'Log'}
        </button>
      </div>

      {/* Luteal phase note */}
      {phaseNote && (
        <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 13, color: mutedText, lineHeight: 1.6, marginBottom: '0.75rem' }}>
          {phaseNote}
        </p>
      )}

      {/* Weight chart */}
      {weightLogs.length >= 2 ? (
        <div style={{
          background:   bgCard,
          borderRadius: 14,
          padding:      '0.75rem 1rem',
          marginBottom: '1.75rem',
          border:       `1px solid rgba(196,133,154,0.18)`,
        }}>
          <WeightChart entries={weightLogs} />
        </div>
      ) : (
        <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 13, color: mutedText, textAlign: 'center', padding: '0.75rem 0', marginBottom: '1.5rem' }}>
          Log at least two entries to see your weight trend.
        </p>
      )}

      {/* ══ Section B: Exercise Log ════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
        <p style={{ fontFamily: fontSerif, fontSize: 24, color: brown, margin: 0, letterSpacing: '-0.01em' }}>
          Exercises
        </p>
        <button
          onClick={() => setShowAddForm(v => !v)}
          style={{
            fontFamily:    fontSans,
            fontSize:      12,
            color:         gold,
            letterSpacing: '0.06em',
            background:    'rgba(201,168,108,0.1)',
            border:        `1px solid rgba(201,168,108,0.35)`,
            borderRadius:  20,
            padding:       '6px 14px',
            cursor:        'pointer',
          }}
        >
          {showAddForm ? '− Cancel' : '+ Add Exercise'}
        </button>
      </div>
      <p style={{ fontFamily: fontSans, fontSize: 11, color: mutedText, margin: '0 0 1rem', letterSpacing: '0.06em' }}>
        Your personal exercise history
      </p>

      {/* Add exercise form */}
      {showAddForm && (
        <div style={{ background: bgCard, borderRadius: 14, padding: '1rem', marginBottom: '1rem', border: '1px solid rgba(201,168,108,0.15)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input
              style={inputStyle}
              placeholder="Exercise name *"
              value={exName}
              onChange={e => setExName(e.target.value)}
              autoFocus
            />
            <select
              style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }}
              value={exMuscle}
              onChange={e => setExMuscle(e.target.value)}
            >
              <option value="">Muscle group (optional)</option>
              {musclePairs.map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 6 }}>
              <input style={{ ...inputStyle, flex: 1 }} type="number" inputMode="numeric" placeholder="Sets"  value={exSets}   onChange={e => setExSets(e.target.value)}   />
              <input style={{ ...inputStyle, flex: 1 }} type="number" inputMode="numeric" placeholder="Reps"  value={exReps}   onChange={e => setExReps(e.target.value)}   />
              <input style={{ ...inputStyle, flex: 1 }} type="number" inputMode="decimal" placeholder="kg"   step="0.5" value={exWeight} onChange={e => setExWeight(e.target.value)} />
            </div>
          </div>
          <button
            onClick={handleSaveExercise}
            disabled={!exName.trim() || savingExercise}
            style={{
              marginTop:     '0.75rem',
              width:         '100%',
              padding:       '11px',
              borderRadius:  10,
              border:        'none',
              background:    'linear-gradient(135deg, #C9A86C, #A07B4C)',
              color:         '#F2EDE8',
              fontFamily:    fontSans,
              fontSize:      13,
              letterSpacing: '0.06em',
              cursor:        'pointer',
              opacity:       (!exName.trim() || savingExercise) ? 0.5 : 1,
            }}
          >
            {savingExercise ? 'Saving…' : 'Save Exercise'}
          </button>
        </div>
      )}

      {/* Exercise list */}
      {groupedWorkouts.length === 0 ? (
        <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 14, color: mutedText, textAlign: 'center', padding: '1.5rem 0' }}>
          No exercises logged yet.
        </p>
      ) : groupedWorkouts.map(([label, entries]) => (
        <div key={label} style={{ marginBottom: '1rem' }}>
          <p style={{ fontFamily: fontSans, fontSize: 10, color: mutedText, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            {label}
          </p>
          {entries.map(w => {
            const muscleColor = w.muscle_id ? (MUSCLE_COLORS[w.muscle_id] ?? mutedText) : null
            const detail = [
              w.sets   && `${w.sets} sets`,
              w.reps   && `${w.reps} reps`,
              w.weight_kg && `${w.weight_kg} kg`,
            ].filter(Boolean).join(' · ')
            return (
              <div
                key={w.id}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             10,
                  padding:         '10px 12px',
                  background:      bgCard,
                  borderRadius:    10,
                  marginBottom:    6,
                  border:          '1px solid rgba(201,168,108,0.08)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: fontSerif, fontSize: 14, color: brown, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {w.exercise_name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {muscleColor && (
                      <span style={{
                        fontSize:     10,
                        fontFamily:   fontSans,
                        color:        muscleColor,
                        border:       `1px solid ${muscleColor}50`,
                        borderRadius: 10,
                        padding:      '1px 8px',
                      }}>
                        {MUSCLE_NAMES[w.muscle_id]}
                      </span>
                    )}
                    {detail && (
                      <span style={{ fontSize: 11, fontFamily: fontSans, color: mutedText }}>
                        {detail}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteWorkout(w.id)}
                  style={{
                    background: 'none',
                    border:     'none',
                    color:      mutedText,
                    fontSize:   20,
                    lineHeight: 1,
                    cursor:     'pointer',
                    padding:    '0 4px',
                    flexShrink: 0,
                  }}
                  aria-label="Delete"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
