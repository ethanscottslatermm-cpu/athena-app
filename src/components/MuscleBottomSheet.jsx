import { useState, useMemo } from 'react'
import {
  MUSCLE_COLORS, MUSCLE_NAMES, MUSCLE_ANATOMICAL, PHASE_MUSCLES,
} from '../constants/muscleMap'
import { useExerciseVideos } from '../hooks/useExerciseVideos'
import LogWorkoutModal       from './LogWorkoutModal'

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
  if (!dateStr) return 'Never trained'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Trained today'
  if (diff === 1) return 'Last trained yesterday'
  if (diff < 7)  return `Last trained ${diff} days ago`
  if (diff < 30) return `Last trained ${Math.floor(diff / 7)} week${Math.floor(diff / 7) > 1 ? 's' : ''} ago`
  return `Last trained ${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? 's' : ''} ago`
}

// ── Video player overlay ───────────────────────────────────────────────────────
function VideoModal({ video, color, onClose, onLog }) {
  return (
    <div
      onClick={onClose}
      style={{
        position:             'fixed',
        inset:                0,
        zIndex:               200,
        background:           'rgba(8,3,14,0.88)',
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
          maxWidth:     480,
          background:   'rgba(20,8,28,0.96)',
          borderRadius: 16,
          overflow:     'hidden',
          border:       `1px solid ${color}30`,
        }}
      >
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div style={{ padding: '0.75rem 1rem 1rem' }}>
          <p style={{ fontFamily: fontSerif, fontSize: 14, color: linen, margin: '0 0 3px', lineHeight: 1.4 }}>
            {video.title}
          </p>
          <p style={{ fontFamily: fontSans, fontSize: 11, color: mutedText, margin: '0 0 0.75rem' }}>
            {video.channel}
          </p>
          <button
            onClick={() => onLog(video)}
            style={{
              width:         '100%',
              padding:       '10px',
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
  const [logOpen,         setLogOpen]         = useState(false)
  const [videoModal,      setVideoModal]      = useState(null)
  const [prefillExercise, setPrefillExercise] = useState('')

  const { videos, loading: videosLoading, error: videosError } =
    useExerciseVideos(isOpen ? pairKey : null)

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

  const handleLogFromVideo = (video) => {
    setPrefillExercise(video.title)
    setVideoModal(null)
    setLogOpen(true)
  }

  const handleLogClose = () => {
    setLogOpen(false)
    setPrefillExercise('')
  }

  // ── Staggered sheet content (key={pairKey} forces remount on muscle switch) ──
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

      {/* Video cards / skeleton / empty — 200ms */}
      <div style={anim(200)}>
        {videosLoading ? (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flexShrink: 0, width: 148, height: 120, background: 'rgba(242,237,232,0.06)', borderRadius: 12 }} />
            ))}
          </div>
        ) : (videosError || videos.length === 0) ? (
          <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 13, color: mutedText, marginBottom: '0.75rem' }}>
            {videosError ? 'No videos found — try again later.' : `No videos found for ${name}.`}
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: '0.75rem', scrollbarWidth: 'none' }}>
            {videos.map(video => (
              <button
                key={video.id}
                onClick={() => setVideoModal(video)}
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
                  src={video.thumbnail}
                  alt=""
                  style={{ width: '100%', height: 83, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '6px 8px 8px' }}>
                  <p style={{
                    fontFamily:      fontSerif,
                    fontSize:        12,
                    color:           linen,
                    margin:          '0 0 2px',
                    lineHeight:      1.35,
                    display:         '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow:        'hidden',
                  }}>
                    {video.title}
                  </p>
                  <p style={{ fontFamily: fontSans, fontSize: 10, color: mutedText, margin: 0 }}>
                    {video.channel}
                  </p>
                </div>
              </button>
            ))}
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

        {videoModal && (
          <VideoModal video={videoModal} color={color} onClose={() => setVideoModal(null)} onLog={handleLogFromVideo} />
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

      {videoModal && (
        <VideoModal video={videoModal} color={color} onClose={() => setVideoModal(null)} onLog={handleLogFromVideo} />
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
}
