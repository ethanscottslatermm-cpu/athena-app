import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MUSCLE_COLORS, MUSCLE_NAMES, MUSCLE_ANATOMICAL, PHASE_MUSCLES, FOCUS_TO_MUSCLES,
} from '../constants/muscleMap'

const gold      = '#C9A86C'
const mutedText = 'rgba(242,237,232,0.45)'
const linen     = '#F2EDE8'
const fontSerif = "'Cormorant Garamond', serif"
const fontSans  = "'Tenor Sans', sans-serif"

function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Never trained'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
  if (diff === 0) return 'Trained today'
  if (diff === 1) return 'Last trained yesterday'
  if (diff < 7)  return `Last trained ${diff} days ago`
  if (diff < 30) return `Last trained ${Math.floor(diff / 7)} week${Math.floor(diff / 7) > 1 ? 's' : ''} ago`
  return `Last trained ${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? 's' : ''} ago`
}

export default function MuscleBottomSheet({
  pairKey,
  isOpen,
  inline         = false,
  onClose,
  currentPhase,
  sessionHistory = [],
  allSessions    = [],
  onNavigateToSession,
}) {
  const navigate = useNavigate()
  const color   = pairKey ? MUSCLE_COLORS[pairKey] : gold
  const name    = pairKey ? MUSCLE_NAMES[pairKey]  : ''
  const anatom  = pairKey ? MUSCLE_ANATOMICAL[pairKey] : ''

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
    const sorted = [...relevantSessions].sort(
      (a, b) => new Date(b.completed_at ?? b.date) - new Date(a.completed_at ?? a.date)
    )
    return sorted[0]?.completed_at ?? sorted[0]?.date ?? null
  }, [relevantSessions])

  const thisMonthCount = useMemo(() =>
    relevantSessions.filter(s => new Date(s.completed_at ?? s.date) >= monthStart).length,
    [relevantSessions, monthStart]
  )

  const MONTHLY_GOAL = 8
  const freqPct = Math.min(thisMonthCount / MONTHLY_GOAL, 1)

  const sessionCards = useMemo(() => {
    if (!pairKey) return []
    const pool = allSessions.length ? allSessions : sessionHistory
    return pool
      .filter(s => {
        const groups    = s.muscleGroups ?? s.muscle_groups ?? []
        const fromFocus = FOCUS_TO_MUSCLES[s.focus_area] ?? []
        return groups.includes(pairKey) || fromFocus.includes(pairKey)
      })
      .reduce((acc, s) => {
        if (!acc.find(x => x.id === s.id)) acc.push(s)
        return acc
      }, [])
      .slice(0, 6)
  }, [pairKey, allSessions, sessionHistory])

  // Shared inner content rendered in both inline and overlay modes
  const sheetContent = (
    <>
      {/* Header */}
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

      {/* Phase context */}
      {(isPrimary || isSecondary) && currentPhase && phaseRec && (
        <div style={{ background: `${currentPhase.phaseColor}10`, border: `1px solid ${currentPhase.phaseColor}30`, borderRadius: 10, padding: '8px 12px', marginBottom: '1rem' }}>
          <p style={{ fontFamily: fontSerif, fontSize: 12, color: currentPhase.phaseColor, margin: 0, lineHeight: 1.5 }}>
            <span style={{ textTransform: 'capitalize' }}>{currentPhase.name}</span> phase — {phaseRec.rationale}
          </p>
        </div>
      )}

      {/* Sessions label */}
      <p style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.14em', color: mutedText, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
        Pilates Sessions
      </p>

      {sessionCards.length > 0 ? (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: '1rem' }}>
          {sessionCards.map(s => (
            <button
              key={s.id}
              onClick={() => { onClose(); navigate('/pilates', { state: { openSessionId: s.id } }) }}
              style={{ flexShrink: 0, minWidth: 130, background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25`, borderRadius: 12, padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}
            >
              <p style={{ fontFamily: fontSerif, fontSize: 14, color: linen, margin: '0 0 4px', lineHeight: 1.3 }}>{s.title ?? s.name}</p>
              <p style={{ fontFamily: fontSans, fontSize: 10, color: mutedText, margin: 0 }}>{s.duration_min ?? s.duration} min</p>
              {(s.muscleGroups ?? []).slice(0, 2).map(m => (
                <span key={m} style={{ display: 'inline-block', marginTop: 4, marginRight: 4, fontSize: 9, fontFamily: fontSans, letterSpacing: '0.06em', color: MUSCLE_COLORS[m] ?? mutedText, border: `1px solid ${MUSCLE_COLORS[m] ?? mutedText}40`, borderRadius: 10, padding: '1px 6px' }}>
                  {MUSCLE_NAMES[m]}
                </span>
              ))}
            </button>
          ))}
        </div>
      ) : (
        <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 13, color: mutedText, marginBottom: '1rem' }}>
          No sessions target {name} yet.
        </p>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
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

      {/* CTA */}
      <button
        onClick={() => { onClose(); navigate('/pilates', { state: sessionCards.length > 0 ? { openSessionId: sessionCards[0].id } : undefined }) }}
        style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #C9A86C, #A07B4C)', borderRadius: '12px', color: '#140A18', fontFamily: fontSans, fontSize: '13px', letterSpacing: '0.08em', border: 'none', cursor: 'pointer' }}
      >
        {sessionCards.length > 0 ? `Open in Pilates Studio →` : `Browse Pilates Sessions →`}
      </button>
    </>
  )

  // ── Inline mode (below model, no backdrop) ───────────────────────────────
  if (inline) {
    if (!isOpen || !pairKey) return null
    return (
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
    )
  }

  // ── Overlay mode (slide-up bottom sheet) ──────────────────────────────────
  return (
    <>
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
    </>
  )
}
