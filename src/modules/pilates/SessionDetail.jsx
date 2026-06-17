import { useState } from 'react'
import ExerciseRow from './components/ExerciseRow'
import MuscleMap from '../../components/MuscleMap'
import { MUSCLE_NAMES } from '../../constants/muscleMap'

const SESSION_IMAGES = {
  'dynamic stretch & tone':   '/images/sessions/Dynamic Stretch & Tone.webp',
  'glute awakening':          '/images/sessions/Glute Awakening.webp',
  'grounding evening flow':   '/images/sessions/Grounding Evening Flow.webp',
  'pelvic floor reset':       '/images/sessions/Pelvic Floor Reset.webp',
  'restorative mat session':  '/images/sessions/Restorative Mat Session.webp',
  'rising energy core':       '/images/sessions/Rising Energy Core.webp',
  'spinal release & breathe': '/images/sessions/Spinal Release & Breathe.webp',
  'supine surrender flow':    '/images/sessions/Supine Surrender Flow.webp',
  'arm & shoulder sculpt':    '/images/sessions/Arm & Shoulder Sculpt.webp',
  'wind down restoration':    '/images/sessions/Wind Down Restoration.webp',
  'mindful core & breathe':   '/images/sessions/Mindful Core & Breathing.webp',
  'intuitive movement':       '/images/sessions/Intuitive Movement.webp',
  'peak power core':          '/images/sessions/Peak Power Core.webp',
  'strong arms & back':       '/images/sessions/Strong Arms & Back.webp',
  'athletic flow':            '/images/sessions/Athletic Flow.webp',
  'full body foundation':     '/images/sessions/Full Body Foundation.webp',
  'gentle restoration flow':  '/images/sessions/Gentle Restoration Flow.webp',
  'glute sculptor':           '/images/sessions/Glute Sculptor.webp',
  'total body burn':          '/images/sessions/Total Body Burn.webp',
  'hip & glute release':      '/images/sessions/Hip & Glute Release.webp',
}

const HERO_POSITION = {
  'gentle restoration flow': 'center 20%',
}

const PHASE_COLORS = {
  menstrual:  '#C4606A',
  follicular: '#8FAF8A',
  ovulation:  '#C9A86C',
  luteal:     '#9B7FA0',
  all:        '#C4859A',
}

const DIFFICULTY_LABEL = {
  beginner:     { label: 'Beginner',     color: '#8FAF8A' },
  intermediate: { label: 'Intermediate', color: '#C9A86C' },
  advanced:     { label: 'Advanced',     color: '#C4606A' },
}

function Heart({ filled }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24"
      fill={filled ? '#C9A86C' : 'none'}
      stroke={filled ? '#C9A86C' : 'rgba(242,237,232,0.45)'}
      strokeWidth={1.8}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function SessionDetail({ session, exercises = [], isFavorite, onFavoriteToggle, onStart, onClose }) {
  if (!session) return null

  const [expanded, setExpanded] = useState(false)

  const pc         = PHASE_COLORS[session.phase] ?? '#C4859A'
  const titleKey   = (session.title ?? '').toLowerCase()
  const heroImage  = SESSION_IMAGES[titleKey]
  const heroPos    = HERO_POSITION[titleKey] ?? 'center'
  const difficulty = DIFFICULTY_LABEL[session.difficulty] ?? { label: session.difficulty, color: '#C9A86C' }
  const phaseLabel = session.phase && session.phase !== 'all'
    ? session.phase.charAt(0).toUpperCase() + session.phase.slice(1)
    : 'All phases'

  const sessionExercises = exercises
    .filter(e => e.session_id === session.id)
    .sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0))

  const musclesToShow = session.muscleGroups ?? []

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a0d22 0%, #0E0A14 60%, #140A18 100%)',
        animation: 'sheetUp 0.32s ease-out',
      }}
    >
      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes shimmerGold {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,108,0.0); }
          50%       { box-shadow: 0 0 0 8px rgba(201,168,108,0.12); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: 260 }}>
        {heroImage ? (
          <>
            <img
              src={heroImage} alt=""
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: 'cover', objectPosition: heroPos }}
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, #0E0A14 0%, rgba(14,10,20,0.72) 45%, rgba(14,10,20,0.15) 100%)',
            }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{
            background: `linear-gradient(160deg, ${pc}30 0%, #1a0d22 60%, #0E0A14 100%)`,
          }} />
        )}

        {/* Back */}
        <button
          onClick={onClose}
          className="absolute z-10 flex items-center justify-center rounded-full"
          style={{ top: 52, left: 16, width: 40, height: 40, background: 'rgba(20,10,24,0.7)', border: '1px solid rgba(201,168,108,0.2)', backdropFilter: 'blur(8px)' }}
        >
          <span style={{ color: 'rgba(242,237,232,0.8)', fontSize: 22, lineHeight: 1 }}>‹</span>
        </button>

        {/* Fav */}
        <button
          onClick={() => onFavoriteToggle?.(session.id)}
          className="absolute z-10 flex items-center justify-center rounded-full"
          style={{ top: 52, right: 16, width: 40, height: 40, background: 'rgba(20,10,24,0.7)', border: '1px solid rgba(201,168,108,0.2)', backdropFilter: 'blur(8px)' }}
        >
          <Heart filled={isFavorite} />
        </button>

        {/* Title block */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span style={{
              fontFamily:    "'Tenor Sans', sans-serif",
              fontSize:      10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         pc,
              border:        `1px solid ${pc}50`,
              borderRadius:  20,
              padding:       '2px 10px',
              background:    `${pc}15`,
            }}>
              {phaseLabel}
            </span>
            <span style={{
              fontFamily:    "'Tenor Sans', sans-serif",
              fontSize:      10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         difficulty.color,
              border:        `1px solid ${difficulty.color}45`,
              borderRadius:  20,
              padding:       '2px 10px',
              background:    `${difficulty.color}12`,
            }}>
              {difficulty.label}
            </span>
          </div>
          <h2 style={{
            fontFamily:    "'Cinzel', serif",
            fontSize:      24,
            color:         '#F2EDE8',
            margin:        0,
            lineHeight:    1.1,
            letterSpacing: '0.02em',
            textShadow:    '0 2px 20px rgba(0,0,0,0.6)',
          }}>
            {session.title}
          </h2>
        </div>
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ paddingBottom: 120 }}>

        {/* Quick stats strip */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(201,168,108,0.08)', marginBottom: '1.25rem' }}>
          {[
            { value: `${session.duration_min}`, unit: 'min' },
            { value: (session.focus_area ?? '').replace(/_/g, ' '), unit: 'focus' },
            { value: session.equipment ?? 'mat', unit: 'gear' },
          ].filter(s => s.value).map((s, i) => (
            <div key={i} style={{
              flex:       1,
              padding:    '14px 0',
              textAlign:  'center',
              borderRight: i < 2 ? '1px solid rgba(201,168,108,0.08)' : 'none',
            }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: '#F2EDE8', margin: 0, lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 9, color: 'rgba(242,237,232,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '4px 0 0' }}>
                {s.unit}
              </p>
            </div>
          ))}
        </div>

        {/* Description */}
        {session.description && (
          <div style={{ padding: '0 1.25rem 1.25rem' }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle:  'italic',
              fontSize:   15,
              color:      'rgba(242,237,232,0.55)',
              lineHeight: 1.6,
              margin:     0,
            }}>
              {session.description}
            </p>
          </div>
        )}

        {/* ── Muscles targeted — compact side-by-side ─────────────────── */}
        {musclesToShow.length > 0 && (
          <div style={{ margin: '0 1rem 1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(201,168,108,0.1)' }}>
            <p style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(242,237,232,0.35)', margin: '0 0 0.75rem' }}>
              Muscles Targeted
            </p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Compact figure — 105px wide, full figure visible */}
              <div style={{ width: 105, flexShrink: 0 }}>
                <MuscleMap
                  activeMuscles={musclesToShow}
                  interactive={false}
                  showTooltip={false}
                  showLegend={false}
                />
              </div>
              {/* Chips beside the figure */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
                {musclesToShow.map(key => (
                  <span key={key} style={{
                    fontFamily:    "'Tenor Sans', sans-serif",
                    fontSize:      11,
                    letterSpacing: '0.04em',
                    color:         'rgba(242,237,232,0.75)',
                    padding:       '4px 0',
                    borderBottom:  '1px solid rgba(255,255,255,0.06)',
                    display:       'block',
                  }}>
                    {MUSCLE_NAMES[key] ?? key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Exercise list ────────────────────────────────────────────── */}
        <div style={{ margin: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <p style={{ fontFamily: "'Tenor Sans', sans-serif", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(242,237,232,0.35)', margin: 0 }}>
              {sessionExercises.length} Exercise{sessionExercises.length !== 1 ? 's' : ''}
            </p>
            {sessionExercises.length > 0 && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontStyle: 'italic', color: 'rgba(242,237,232,0.25)', margin: 0 }}>
                tap to expand form cue
              </p>
            )}
          </div>

          <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(201,168,108,0.1)' }}>
            {sessionExercises.length > 0 ? sessionExercises.map((ex, i) => (
              <ExerciseRow key={ex.id ?? i} exercise={ex} index={i} dark />
            )) : (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'rgba(242,237,232,0.25)', fontSize: 14, padding: '1.25rem', textAlign: 'center', margin: 0 }}>
                Exercise list loading…
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ── Start CTA — sticky bottom ────────────────────────────────── */}
      <div
        className="shrink-0 px-4"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)',
          paddingTop:    '1rem',
          background:    'linear-gradient(to top, #0E0A14 55%, transparent)',
          position:      'absolute',
          bottom:        0,
          left:          0,
          right:         0,
        }}
      >
        <button
          onClick={() => onStart?.(session, sessionExercises)}
          style={{
            width:          '100%',
            padding:        '16px',
            borderRadius:   14,
            border:         'none',
            background:     'linear-gradient(90deg, #A07B4C 0%, #C9A86C 40%, #E8C98A 60%, #C9A86C 80%, #A07B4C 100%)',
            backgroundSize: '200% 100%',
            animation:      'shimmerGold 3s ease-in-out infinite',
            color:          '#140A18',
            fontFamily:     "'Cinzel', serif",
            fontSize:       13,
            letterSpacing:  '0.22em',
            textTransform:  'uppercase',
            cursor:         'pointer',
            fontWeight:     600,
          }}
        >
          Begin Session
        </button>
      </div>
    </div>
  )
}
