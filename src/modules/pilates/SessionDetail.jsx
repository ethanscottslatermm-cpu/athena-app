import ExerciseRow from './components/ExerciseRow'
import BodyMuscleMap from '../../components/pilates/BodyMuscleMap'
import { mapFocusToMuscles } from '../../utils/muscleGroupMap'

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
  menstrual: '#D4A0A0',
  follicular: '#8FA58C',
  ovulation: '#D4A0A0',
  luteal: '#C4AFA8',
  all: '#D4A0A0',
}

function Heart({ filled }) {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24"
      fill={filled ? '#D4A0A0' : 'none'}
      stroke={filled ? '#D4A0A0' : 'rgba(59,51,48,0.5)'}
      strokeWidth={1.8}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

export default function SessionDetail({ session, exercises = [], isFavorite, onFavoriteToggle, onStart, onClose }) {
  if (!session) return null

  const pc = PHASE_COLORS[session.phase] ?? '#D4A0A0'
  const titleKey  = (session.title ?? '').toLowerCase()
  const heroImage = SESSION_IMAGES[titleKey]
  const heroPos   = HERO_POSITION[titleKey] ?? 'center'
  const phaseLabel = session.phase && session.phase !== 'all'
    ? session.phase.charAt(0).toUpperCase() + session.phase.slice(1)
    : 'All phases'

  const sessionExercises = exercises
    .filter(e => e.session_id === session.id)
    .sort((a, b) => (a.order_num ?? 0) - (b.order_num ?? 0))

  const stats = [
    { icon: '⏱', label: `${session.duration_min} min` },
    { icon: '🔥', label: (session.focus_area ?? '').replace(/_/g, ' ') },
    { icon: '💪', label: session.difficulty },
    { icon: '🎯', label: session.equipment },
  ]

  const { primary: musclePrimary, secondary: muscleSecondary } = mapFocusToMuscles(session.focus_area)

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: '#F2EDE8', animation: 'sheetUp 0.32s ease-out' }}
    >
      {/* ── Header area ──────────────────────────────────────────────────── */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          height: 240,
          background: heroImage ? 'transparent' : `linear-gradient(160deg, ${pc}40 0%, rgba(242,237,232,0.97) 100%)`,
        }}
      >
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', objectPosition: heroPos }}
          />
        )}
        {heroImage && (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(59,51,48,0.85) 0%, rgba(59,51,48,0.25) 55%, transparent 100%)' }}
          />
        )}
        <button
          onClick={onClose}
          className="absolute z-10 flex items-center justify-center rounded-full"
          style={{ top: 52, left: 16, width: 44, height: 44, background: 'rgba(242,237,232,0.85)', border: '1px solid rgba(196,175,168,0.5)' }}
        >
          <span className="text-brown text-2xl leading-none">‹</span>
        </button>
        <button
          onClick={() => onFavoriteToggle?.(session.id)}
          className="absolute z-10 flex items-center justify-center"
          style={{ top: 52, right: 16, width: 40, height: 40 }}
        >
          <Heart filled={isFavorite} />
        </button>
        <div className="absolute bottom-6 left-4 right-16">
          <span
            className="inline-block font-garamond text-xs px-2.5 py-0.5 rounded-full mb-2 capitalize"
            style={{ background: `${pc}28`, color: pc, border: `1px solid ${pc}45` }}
          >
            Best for {phaseLabel}
          </span>
          <h2 className={`font-cinzel text-[22px] leading-tight mb-2 ${heroImage ? 'text-white' : 'text-brown'}`}>
            {session.title}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {[`${session.duration_min} min`, session.focus_area, session.difficulty, session.equipment]
              .filter(Boolean)
              .map(tag => (
                <span
                  key={tag}
                  className="font-garamond text-[11px] px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: heroImage ? 'rgba(242,237,232,0.75)' : 'rgba(212,160,160,0.12)',
                    border: heroImage ? '1px solid rgba(212,160,160,0.4)' : '1px solid rgba(212,160,160,0.3)',
                    color: '#D4A0A0',
                  }}
                >
                  {(tag ?? '').replace(/_/g, ' ')}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Stat chips */}
        <div className="grid grid-cols-4 gap-2 px-4 py-4">
          {stats.map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center py-2.5 rounded-xl"
              style={{ background: 'rgba(196,175,168,0.2)', border: '1px solid rgba(196,175,168,0.65)' }}
            >
              <span className="font-garamond text-brown/55 text-[10px] text-center leading-tight capitalize">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        {session.description && (
          <div className="px-4 pb-5">
            <p className="font-garamond italic text-brown/60 text-sm leading-relaxed">
              {session.description}
            </p>
          </div>
        )}

        {/* Muscle map */}
        <div style={{ background: '#140A18', margin: '0 16px 20px', borderRadius: 16, padding: '16px 8px 8px', border: '1px solid rgba(201,168,108,0.12)' }}>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(242,237,232,0.4)', textAlign: 'center', marginBottom: 8 }}>
            Muscles Targeted
          </p>
          <BodyMuscleMap
            primaryMuscles={musclePrimary}
            secondaryMuscles={muscleSecondary}
            height={260}
            showLabels={true}
          />
        </div>

        {/* Exercise list */}
        <div className="pb-4">
          <p className="font-cinzel text-brown/35 text-[10px] tracking-widest uppercase px-4 pb-2">
            {sessionExercises.length} Exercise{sessionExercises.length !== 1 ? 's' : ''}
            {sessionExercises.length > 0 && ' — tap to expand form cue'}
          </p>
          <div
            className="mx-4 rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(196,175,168,0.65)' }}
          >
            {sessionExercises.length > 0 ? sessionExercises.map((ex, i) => (
              <ExerciseRow key={ex.id ?? i} exercise={ex} index={i} />
            )) : (
              <p className="font-garamond text-brown/30 text-sm px-4 py-5 text-center">
                Exercise list loading…
              </p>
            )}
          </div>
        </div>

        <div className="h-28" />
      </div>

      {/* ── Start button (sticky bottom) ─────────────────────────────────── */}
      <div
        className="shrink-0 px-4 pt-5"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
          background: 'linear-gradient(to top, rgba(242,237,232,1) 55%, transparent)',
        }}
      >
        <button
          onClick={() => onStart?.(session, sessionExercises)}
          className="w-full py-4 rounded-xl font-cinzel tracking-widest text-sm"
          style={{
            background: 'linear-gradient(90deg, rgba(212,160,160,0.15) 0%, rgba(212,160,160,0.35) 50%, rgba(212,160,160,0.15) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSlide 2.5s infinite',
            border: '1px solid rgba(212,160,160,0.55)',
            color: '#D4A0A0',
          }}
        >
          START SESSION
        </button>
      </div>
    </div>
  )
}
