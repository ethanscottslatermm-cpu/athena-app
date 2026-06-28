import { useState, useMemo } from 'react'
import {
  MUSCLE_COLORS, MUSCLE_NAMES, MUSCLE_ANATOMICAL, PHASE_MUSCLES,
} from '../constants/muscleMap'
import { useExerciseData } from '../hooks/useExerciseData'
import ExerciseCard from './ExerciseCard'
import LogWorkoutModal from './LogWorkoutModal'

const gold      = '#C9A86C'
const mutedText = 'rgba(242,237,232,0.45)'
const linen     = '#F2EDE8'
const fontSerif = "'Cormorant Garamond', serif"
const fontSans  = "'Tenor Sans', sans-serif"

const SHEET_STYLE = `
@keyframes sheetItemIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

// Returns animation style for a staggered section
const anim = (delayMs) => ({
  animation: `sheetItemIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms both`,
})

function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Never'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff}d ago`
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`
  return `${Math.floor(diff / 30)}mo ago`
}


// ── Main component ────────────────────────────────────────────────────────────
export default function MuscleBottomSheet({
  pairKey,
  isOpen,
  inline         = false,
  onClose,
  currentPhase,
  sessionHistory = [],
}) {
  const [logOpen,           setLogOpen]           = useState(false)
  const [prefillExercise,   setPrefillExercise]   = useState('')
  const [shuffledExercises, setShuffledExercises] = useState([])

  const { exercises, loading, error, isDecorative, refresh } =
    useExerciseData(isOpen ? pairKey : null)

  const color  = pairKey ? MUSCLE_COLORS[pairKey] : gold
  const name   = pairKey ? MUSCLE_NAMES[pairKey]  : ''
  const anatom = pairKey ? MUSCLE_ANATOMICAL[pairKey] : ''

  const phaseRec    = currentPhase?.name ? PHASE_MUSCLES[currentPhase.name] : null
  const isPrimary   = phaseRec?.primary?.includes(pairKey)
  const isSecondary = phaseRec?.secondary?.includes(pairKey)
  const isAvoid     = phaseRec?.avoid?.includes(pairKey)

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const relevantSessions = useMemo(() => {
    if (!pairKey) return []
    return sessionHistory.filter(s => (s.muscleGroups ?? []).includes(pairKey))
  }, [pairKey, sessionHistory])

  const lastTrained = useMemo(() => {
    if (!relevantSessions.length) return null
    return [...relevantSessions]
      .sort((a, b) => new Date(b.completed_at ?? b.date) - new Date(a.completed_at ?? a.date))[0]
      ?.completed_at ?? null
  }, [relevantSessions])

  const thisMonthCount = useMemo(() =>
    relevantSessions.filter(s => new Date(s.completed_at ?? s.date) >= monthStart).length,
    [relevantSessions, monthStart]
  )

  const MONTHLY_GOAL = 8
  const freqPct = Math.min(thisMonthCount / MONTHLY_GOAL, 1)

  const handleLogExercise = (exercise) => {
    setPrefillExercise(exercise.name)
    setLogOpen(true)
  }

  const handleLogClose = () => {
    setLogOpen(false)
    setPrefillExercise('')
  }

  const handleShuffle = () => {
    const toShuffle = shuffledExercises.length > 0 ? shuffledExercises : exercises
    const shuffled = [...toShuffle].sort(() => Math.random() - 0.5)
    setShuffledExercises(shuffled)
  }

  const displayedExercises = shuffledExercises.length > 0 ? shuffledExercises : exercises

  // ── Staggered sheet content (key={pairKey} forces remount on muscle switch) ──
  const sheetContent = (
    <div key={pairKey}>

      {/* Header — 80ms */}
      <div style={anim(80)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0, marginTop: 4 }} />
            <div>
              <p style={{ fontFamily: fontSerif, fontSize: 20, color: linen, margin: 0, lineHeight: 1.1 }}>{name}</p>
              <p style={{ fontFamily: fontSans, fontSize: 11, color: mutedText, margin: '2px 0 0', letterSpacing: '0.04em' }}>{anatom}</p>
              {lastTrained && (
                <p style={{ fontFamily: fontSans, fontSize: 10, color: mutedText, margin: '4px 0 0', letterSpacing: '0.02em' }}>
                  Last trained: {formatRelativeDate(lastTrained)}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {isPrimary && currentPhase && (
              <span style={{ fontFamily: fontSans, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: currentPhase.phaseColor, border: `1px solid ${currentPhase.phaseColor}50`, borderRadius: 20, padding: '3px 10px', background: `${currentPhase.phaseColor}15` }}>
                ✦ Recommended
              </span>
            )}
            {isSecondary && currentPhase && (
              <span style={{ fontFamily: fontSans, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: mutedText, border: '1px solid rgba(242,237,232,0.15)', borderRadius: 20, padding: '3px 10px' }}>
                Secondary
              </span>
            )}
            {isAvoid && currentPhase && (
              <span style={{ fontFamily: fontSans, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C4606A', border: '1px solid rgba(196,96,106,0.35)', borderRadius: 20, padding: '3px 10px', background: 'rgba(196,96,106,0.08)' }}>
                Rest Today
              </span>
            )}
            {inline && (
              <button onClick={onClose} style={{ color: mutedText, fontSize: 20, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>×</button>
            )}
          </div>
        </div>
      </div>

      {/* Phase context — 130ms */}
      {(isPrimary || isSecondary) && currentPhase && phaseRec && (
        <div style={anim(130)}>
          <div style={{ background: `${currentPhase.phaseColor}10`, border: `1px solid ${currentPhase.phaseColor}30`, borderRadius: 10, padding: '8px 12px', marginBottom: '1rem' }}>
            <p style={{ fontFamily: fontSerif, fontSize: 12, color: currentPhase.phaseColor, margin: 0, lineHeight: 1.5 }}>
              <span style={{ textTransform: 'capitalize' }}>{currentPhase.name}</span> phase — {phaseRec.rationale}
            </p>
          </div>
        </div>
      )}

      {/* Decorative muscle message */}
      {isDecorative && (
        <div style={anim(160)}>
          <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 13, color: mutedText, margin: '0 0 1rem' }}>
            This is a joint, not a muscle group — try tapping a nearby muscle instead.
          </p>
        </div>
      )}

      {/* Section label + Shuffle + Refresh — 160ms */}
      {!isDecorative && (
        <div style={anim(160)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <p style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.14em', color: mutedText, textTransform: 'uppercase', margin: 0 }}>
              Exercises for this group
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={handleShuffle}
                style={{
                  fontFamily: fontSans,
                  fontSize: 11,
                  color: color,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Shuffle exercises"
              >
                ↻ Shuffle
              </button>
              <button
                onClick={refresh}
                disabled={loading}
                style={{
                  fontFamily: fontSans,
                  fontSize: 11,
                  color: loading ? mutedText : color,
                  background: 'transparent',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  opacity: loading ? 0.5 : 1,
                }}
                title="Refresh exercises"
              >
                ⟳ Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise cards / skeleton / empty — 200ms */}
      {!isDecorative && (
        <div style={anim(200)}>
          {loading ? (
            <>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    height: 60,
                    background: 'rgba(242,237,232,0.06)',
                    borderRadius: 12,
                    marginBottom: '0.75rem',
                  }}
                />
              ))}
            </>
          ) : error || displayedExercises.length === 0 ? (
            <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 13, color: mutedText, margin: '0 0 1rem' }}>
              {error ? 'No exercises found — try again later.' : `No exercises found for ${name} yet.`}
            </p>
          ) : (
            displayedExercises.map(exercise => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                color={color}
                onLog={handleLogExercise}
                onWatch={() => {}}
              />
            ))
          )}
        </div>
      )}

    </div>
  )

  // ── Inline mode ───────────────────────────────────────────────────────────
  if (inline) {
    if (!isOpen || !pairKey) return null
    return (
      <>
        <style>{SHEET_STYLE}</style>
        <div style={{
          background:           'rgba(18,6,26,0.92)',
          backdropFilter:       'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius:         '0 0 16px 16px',
          border:               `1px solid ${color}22`,
          borderTop:            'none',
          overflowY:            'auto',
          maxHeight:            '44svh',
          padding:              '1rem 1.25rem 1.25rem',
        }}>
          {sheetContent}
        </div>

        <LogWorkoutModal
          isOpen={logOpen}
          onClose={handleLogClose}
          muscleId={pairKey}
          muscleName={name}
          prefillExerciseName={prefillExercise}
        />
      </>
    )
  }

  // ── Overlay mode ──────────────────────────────────────────────────────────
  return (
    <>
      <style>{SHEET_STYLE}</style>
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,10,24,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 99 }}
        />
      )}
      <div style={{
        position:             'fixed',
        bottom:               0,
        left:                 0,
        right:                0,
        maxHeight:            '72vh',
        background:           'rgba(20,8,28,0.88)',
        backdropFilter:       'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderRadius:         '20px 20px 0 0',
        border:               '1px solid rgba(201,168,108,0.15)',
        borderBottom:         'none',
        overflowY:            'auto',
        padding:              '0 1.25rem 2rem',
        zIndex:               100,
        transform:            isOpen ? 'translateY(0)' : 'translateY(100%)',
        transition:           'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(201,168,108,0.2)', margin: '12px auto 1.25rem' }} />
        {sheetContent}
      </div>

      <LogWorkoutModal
        isOpen={logOpen}
        onClose={handleLogClose}
        muscleId={pairKey}
        muscleName={name}
        prefillExerciseName={prefillExercise}
      />
    </>
  )
}
