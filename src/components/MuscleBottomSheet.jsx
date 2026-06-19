import { useState, useMemo } from 'react'
import {
  MUSCLE_COLORS, MUSCLE_NAMES, MUSCLE_ANATOMICAL, PHASE_MUSCLES,
} from '../constants/muscleMap'
import { useExerciseData }  from '../hooks/useExerciseData'
import LogWorkoutModal      from './LogWorkoutModal'

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

const anim = (delayMs) => ({
  animation: `sheetItemIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms both`,
})

const difficultyColor = (d) => {
  if (!d) return mutedText
  const s = d.toLowerCase()
  if (s === 'beginner')     return '#8FAF8A'
  if (s === 'advanced')     return '#C4859A'
  return gold // intermediate
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Never trained'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Trained today'
  if (diff === 1) return 'Last trained yesterday'
  if (diff < 7)  return `Last trained ${diff} days ago`
  if (diff < 30) return `Last trained ${Math.floor(diff / 7)} week${Math.floor(diff / 7) > 1 ? 's' : ''} ago`
  return `Last trained ${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? 's' : ''} ago`
}

// ── Exercise detail modal ──────────────────────────────────────────────────────
function ExerciseModal({ initialExercise, allExercises, color, onClose, onLog }) {
  const [exercise,  setExercise]  = useState(initialExercise)
  const [showAlts,  setShowAlts]  = useState(false)

  const alternatives = allExercises.filter(e => e.id !== exercise.id).slice(0, 5)
  const dc = difficultyColor(exercise.difficulty)

  return (
    <div
      onClick={onClose}
      style={{
        position:             'fixed',
        inset:                0,
        zIndex:               200,
        background:           'rgba(8,3,14,0.9)',
        backdropFilter:       'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display:              'flex',
        alignItems:           'center',
        justifyContent:       'center',
        padding:              '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:        '100%',
          maxWidth:     460,
          background:   'rgba(20,8,28,0.97)',
          borderRadius: 16,
          overflow:     'hidden',
          border:       `1px solid ${color}30`,
          maxHeight:    '88svh',
          display:      'flex',
          flexDirection:'column',
        }}
      >
        {/* GIF header */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={exercise.gifUrl}
            alt={exercise.name}
            style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
          />
          <button
            onClick={onClose}
            style={{
              position:   'absolute',
              top:        10,
              right:      10,
              background: 'rgba(20,8,28,0.7)',
              border:     'none',
              borderRadius: '50%',
              color:      mutedText,
              fontSize:   18,
              width:      32,
              height:     32,
              cursor:     'pointer',
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', padding: '0.875rem 1rem 1.25rem' }}>

          {/* Name + tags */}
          <p style={{ fontFamily: fontSerif, fontSize: 18, color: linen, margin: '0 0 0.5rem', lineHeight: 1.25 }}>
            {exercise.name}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' }}>
            {exercise.equipment && (
              <span style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.06em', color: mutedText, border: '1px solid rgba(242,237,232,0.15)', borderRadius: 20, padding: '3px 10px' }}>
                {exercise.equipment}
              </span>
            )}
            {exercise.difficulty && (
              <span style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.06em', color: dc, border: `1px solid ${dc}50`, borderRadius: 20, padding: '3px 10px', background: `${dc}12` }}>
                {exercise.difficulty}
              </span>
            )}
            {(exercise.recommendedSets || exercise.recommendedReps) && (
              <span style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.06em', color: gold, border: `1px solid ${gold}40`, borderRadius: 20, padding: '3px 10px' }}>
                {[exercise.recommendedSets && `${exercise.recommendedSets} sets`, exercise.recommendedReps && `${exercise.recommendedReps} reps`].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>

          {/* Instructions */}
          {exercise.instructions.length > 0 && (
            <>
              <p style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.12em', color: mutedText, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
                Instructions
              </p>
              <ol style={{ margin: '0 0 1rem', paddingLeft: '1.1rem' }}>
                {exercise.instructions.map((step, i) => (
                  <li key={i} style={{ fontFamily: fontSerif, fontSize: 13, color: linen, lineHeight: 1.6, marginBottom: '0.35rem', opacity: 0.9 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </>
          )}

          {/* Secondary muscles */}
          {exercise.secondaryMuscles.length > 0 && (
            <p style={{ fontFamily: fontSans, fontSize: 11, color: mutedText, marginBottom: '1rem' }}>
              Also works: {exercise.secondaryMuscles.join(', ')}
            </p>
          )}

          {/* Alternatives toggle */}
          {alternatives.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => setShowAlts(v => !v)}
                style={{
                  fontFamily:    fontSans,
                  fontSize:      11,
                  color:         gold,
                  letterSpacing: '0.06em',
                  background:    `${gold}10`,
                  border:        `1px solid ${gold}35`,
                  borderRadius:  20,
                  padding:       '5px 14px',
                  cursor:        'pointer',
                  marginBottom:  showAlts ? '0.75rem' : 0,
                }}
              >
                {showAlts ? '▲ Hide Alternatives' : `▾ See Alternatives (${alternatives.length})`}
              </button>

              {showAlts && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                  {alternatives.map(alt => (
                    <button
                      key={alt.id}
                      onClick={() => { setExercise(alt); setShowAlts(false) }}
                      style={{
                        flexShrink:   0,
                        width:        110,
                        background:   'rgba(255,255,255,0.04)',
                        border:       `1px solid ${color}20`,
                        borderRadius: 10,
                        padding:      0,
                        overflow:     'hidden',
                        cursor:       'pointer',
                        textAlign:    'left',
                      }}
                    >
                      <img
                        src={alt.gifUrl}
                        alt=""
                        loading="lazy"
                        style={{ width: '100%', height: 64, objectFit: 'cover', display: 'block' }}
                      />
                      <p style={{
                        fontFamily:      fontSerif,
                        fontSize:        11,
                        color:           linen,
                        margin:          0,
                        padding:         '4px 6px 6px',
                        lineHeight:      1.3,
                        display:         '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow:        'hidden',
                      }}>
                        {alt.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Log CTA */}
          <button
            onClick={() => onLog(exercise)}
            style={{
              width:         '100%',
              padding:       '11px',
              background:    `${color}18`,
              border:        `1px solid ${color}55`,
              borderRadius:  10,
              color:         gold,
              fontFamily:    fontSans,
              fontSize:      12,
              letterSpacing: '0.06em',
              cursor:        'pointer',
            }}
          >
            Log this exercise →
          </button>
        </div>
      </div>
    </div>
  )
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
  const [logOpen,          setLogOpen]          = useState(false)
  const [exerciseModal,    setExerciseModal]    = useState(null)
  const [prefillExercise,  setPrefillExercise]  = useState('')

  const { exercises, loading: exLoading, error: exError } =
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

  const handleLogFromExercise = (exercise) => {
    setPrefillExercise(exercise.name)
    setExerciseModal(null)
    setLogOpen(true)
  }

  const handleLogClose = () => {
    setLogOpen(false)
    setPrefillExercise('')
  }

  // ── Staggered sheet content ───────────────────────────────────────────────
  const sheetContent = (
    <div key={pairKey}>

      {/* Header — 80ms */}
      <div style={anim(80)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: fontSerif, fontSize: 20, color: linen, margin: 0, lineHeight: 1.1 }}>{name}</p>
              <p style={{ fontFamily: fontSans, fontSize: 11, color: mutedText, margin: '2px 0 0', letterSpacing: '0.04em' }}>{anatom}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

      {/* Section label — 160ms */}
      <div style={anim(160)}>
        <p style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.14em', color: mutedText, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
          Exercises for this group
        </p>
      </div>

      {/* Exercise cards — 200ms */}
      <div style={anim(200)}>
        {exLoading ? (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flexShrink: 0, width: 148, height: 128, background: 'rgba(242,237,232,0.06)', borderRadius: 12 }} />
            ))}
          </div>
        ) : (exError || exercises.length === 0) ? (
          <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 13, color: mutedText, marginBottom: '0.75rem' }}>
            {exError ? 'No exercises found — try again later.' : `No exercises found for ${name}.`}
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: '0.75rem', scrollbarWidth: 'none' }}>
            {exercises.map(ex => {
              const dc = difficultyColor(ex.difficulty)
              return (
                <button
                  key={ex.id}
                  onClick={() => setExerciseModal(ex)}
                  style={{
                    flexShrink:   0,
                    width:        148,
                    background:   'rgba(255,255,255,0.04)',
                    border:       `1px solid ${color}25`,
                    borderRadius: 12,
                    padding:      0,
                    overflow:     'hidden',
                    cursor:       'pointer',
                    textAlign:    'left',
                  }}
                >
                  <img
                    src={ex.gifUrl}
                    alt=""
                    loading="lazy"
                    style={{ width: '100%', height: 83, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '6px 8px 8px' }}>
                    <p style={{
                      fontFamily:      fontSerif,
                      fontSize:        12,
                      color:           linen,
                      margin:          '0 0 4px',
                      lineHeight:      1.3,
                      display:         '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow:        'hidden',
                    }}>
                      {ex.name}
                    </p>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ex.equipment && (
                        <span style={{ fontSize: 9, fontFamily: fontSans, color: mutedText, border: '1px solid rgba(242,237,232,0.12)', borderRadius: 8, padding: '1px 6px' }}>
                          {ex.equipment}
                        </span>
                      )}
                      {ex.difficulty && (
                        <span style={{ fontSize: 9, fontFamily: fontSans, color: dc, border: `1px solid ${dc}45`, borderRadius: 8, padding: '1px 6px' }}>
                          {ex.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Log Workout CTA — 260ms */}
      <div style={anim(260)}>
        <button
          onClick={() => { setPrefillExercise(''); setLogOpen(true) }}
          style={{
            width:         '100%',
            padding:       '12px',
            background:    'linear-gradient(135deg, #C9A86C, #A07B4C)',
            borderRadius:  '12px',
            color:         '#140A18',
            fontFamily:    fontSans,
            fontSize:      '13px',
            letterSpacing: '0.08em',
            border:        'none',
            cursor:        'pointer',
            marginBottom:  '1rem',
          }}
        >
          Log Workout
        </button>
      </div>

      {/* Stats row — 310ms */}
      <div style={anim(310)}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontFamily: fontSans, fontSize: 10, color: mutedText, margin: '0 0 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Last Trained</p>
            <p style={{ fontFamily: fontSerif, fontSize: 13, color: linen, margin: 0 }}>{formatRelativeDate(lastTrained)}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
            <p style={{ fontFamily: fontSans, fontSize: 10, color: mutedText, margin: '0 0 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>This Month</p>
            <p style={{ fontFamily: fontSerif, fontSize: 13, color: linen, margin: '0 0 6px' }}>{thisMonthCount} / {MONTHLY_GOAL} sessions</p>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${freqPct * 100}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  )

  // ── Shared modals (rendered outside the sheet to avoid stacking context issues)
  const modals = (
    <>
      {exerciseModal && (
        <ExerciseModal
          key={exerciseModal.id}
          initialExercise={exerciseModal}
          allExercises={exercises}
          color={color}
          onClose={() => setExerciseModal(null)}
          onLog={handleLogFromExercise}
        />
      )}
      <LogWorkoutModal
        isOpen={logOpen}
        onClose={handleLogClose}
        muscleId={pairKey}
        muscleName={name}
        prefillExerciseName={prefillExercise}
      />
    </>
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
        {modals}
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
      {modals}
    </>
  )
}
