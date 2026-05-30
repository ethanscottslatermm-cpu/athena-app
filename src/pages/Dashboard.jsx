import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'
import { ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import settingsIcon from '../assets/icons/settings-icon.png'
import exitIcon from '../assets/icons/nav-exit.png'
import WellnessWeatherWidget from '../components/WellnessWeatherWidget'
import HintBubble            from '../components/HintBubble'
import pilatesIcon   from '../assets/icons/nav-pilates.png'
import cycleIcon     from '../assets/icons/nav-cycle.png'
import moodIcon      from '../assets/icons/nav-mood.png'
import nourishIcon   from '../assets/icons/nav-nourish.png'
import sleepIcon     from '../assets/icons/nav-sleep.png'
import skinIcon      from '../assets/icons/nav-skin.png'
import communityIcon from '../assets/icons/nav-community.png'
import groceryIcon   from '../assets/icons/nav-grocery.png'

const DASHBOARD_HINTS = [
  'Tap any module card to jump straight in. Your cycle, skin, and mood are always one tap away.',
  'Your Phase Guidance card updates automatically as you move through your cycle — set up your cycle in Settings to unlock it.',
  'The Wellness Weather widget adapts your skin-care tips to today\'s UV index and humidity in real time.',
  'Use the rotating Today cards to stay consistent. Each pair changes daily to keep your routine fresh.',
]

// Phase Guidance cards still use images — module tiles do not
const MODULE_IMAGES = {
  Pilates:    '/images/dashboard/pilates.png',
  'Body Fuel': '/images/dashboard/nourish.png',
  Skin:       '/images/dashboard/skin.png',
  Sleep:      '/images/dashboard/sleep.png',
}

// ─── Daily rotation helpers ───────────────────────────────────────────────────
// Base date = May 20 2026 (day 0). Offset advances by 1 each calendar day.
function getDayOffset() {
  const base = new Date(2026, 4, 20)
  const now  = new Date(); now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((now - base) / 86400000))
}

// Today check-in pool — 5 cards, displayed 2 at a time, step-by-2 to avoid day-over-day repeats
// Day 0: [Mood, Sleep]  Day 1: [Skin, Cycle]  Day 2: [Body Fuel, Mood]  …
const TODAY_POOL = [
  { key: 'mood',    label: 'Mood',      sub: 'How are you feeling today?',   icon: moodIcon,    img: '/images/dashboard/mood.png',    to: '/mood'    },
  { key: 'sleep',   label: 'Sleep',     sub: 'How did you sleep last night?', icon: sleepIcon,   img: '/images/dashboard/sleep.png',   to: '/sleep'   },
  { key: 'skin',    label: 'Skin',      sub: 'How is your skin today?',       icon: skinIcon,    img: '/images/dashboard/skin.png',    to: '/skin'    },
  { key: 'cycle',   label: 'Cycle',     sub: 'Log your cycle today',          icon: cycleIcon,   img: '/images/dashboard/Cycle.png',   to: '/cycle'   },
  { key: 'nourish', label: 'Body Fuel', sub: 'Fuel your body today',          icon: nourishIcon, img: '/images/dashboard/nourish.png', to: '/nourish' },
]

// Phase Guidance rotations — 4 variants picking 3 of 4 phase cards each day.
// Index refers to position in content.cards: 0=Pilates 1=Body Fuel 2=Skin 3=Sleep
// Day 0: [0,2,1] = Pilates, Skin, Body Fuel  (required starting order)
const PHASE_GUIDANCE_ROTATIONS = [
  [0, 2, 1],  // Pilates · Skin · Body Fuel
  [1, 3, 2],  // Body Fuel · Sleep · Skin
  [2, 0, 3],  // Skin · Pilates · Sleep
  [3, 1, 0],  // Sleep · Body Fuel · Pilates
]

// ─── Header icon with nav-bar shimmer ────────────────────────────────────────

function HeaderShimmerIcon({ src }) {
  const maskVal = `url(${src}) no-repeat center / contain`
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 22, height: 22, flexShrink: 0 }}>
      <span style={{
        display: 'block', width: '100%', height: '100%',
        WebkitMask: maskVal, mask: maskVal,
        backgroundColor: '#7A6A65',
      }} />
      <span style={{
        position: 'absolute', inset: 0,
        WebkitMask: maskVal, mask: maskVal,
        background: 'linear-gradient(110deg, transparent 25%, rgba(245,240,225,0.7) 50%, transparent 75%)',
        backgroundSize: '250% 100%',
        animation: 'navShimmer 10s ease-in-out infinite',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />
    </span>
  )
}

// ─── Platinum shimmer icon ────────────────────────────────────────────────────
// Two stacked mask-spans: base platinum layer + animated sweep overlay

function ShimmerIcon({ src, delay = 0, size = 22 }) {
  const maskVal = `url(${src}) no-repeat center / contain`
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size, flexShrink: 0 }}>
      {/* Base — platinum silver with soft glow */}
      <span style={{
        position: 'absolute', inset: 0,
        WebkitMask: maskVal, mask: maskVal,
        backgroundColor: '#F0EAE4',
        filter: 'drop-shadow(0 0 4px rgba(240,234,228,0.8))',
      }} />
      {/* Sweep overlay */}
      <span
        className="icon-sweep-el"
        style={{
          position: 'absolute', inset: 0,
          WebkitMask: maskVal, mask: maskVal,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.82) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animationName: 'iconSweep',
          animationDuration: '2.5s',
          animationTimingFunction: 'ease-in-out',
          animationDelay: `${delay}s`,
          animationIterationCount: 'infinite',
        }}
      />
    </span>
  )
}

// ─── Shimmer rim rotating gradient — shared inner div ─────────────────────────

function RimSpin({ duration = '3s', delay = 0 }) {
  return (
    <div
      className="srim-spin-el"
      style={{
        position: 'absolute',
        width: '150%', height: '150%',
        top: '-25%', left: '-25%',
        background: 'conic-gradient(rgba(200,200,215,0.28) 0%, rgba(200,200,215,0.28) 36%, rgba(215,215,238,0.68) 45%, rgba(238,238,255,0.9) 50%, rgba(215,215,238,0.68) 55%, rgba(200,200,215,0.28) 64%, rgba(200,200,215,0.28) 100%)',
        animationName: 'srimRotate',
        animationDuration: duration,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationDelay: `${delay}s`,
        pointerEvents: 'none',
      }}
    />
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PHASE_META = {
  menstrual:  { color: '#D4A0A0', label: 'Menstrual',  days: 5  },
  follicular: { color: '#8FA58C', label: 'Follicular', days: 8  },
  ovulation:  { color: '#D4A0A0', label: 'Ovulation',  days: 3  },
  luteal:     { color: '#C4AFA8', label: 'Luteal',     days: 12 },
}

const PHASE_CONTENT = {
  menstrual: {
    headline: 'Rest & Restore',
    sub: 'Honor your body\'s call to slow down.',
    gradient: 'linear-gradient(135deg, rgba(212,160,160,0.28) 0%, rgba(212,160,160,0.10) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Restorative movement & breathwork', to: '/pilates'   },
      { module: 'Body Fuel', tip: 'Iron-rich foods & warming broths',  to: '/nourish'   },
      { module: 'Skin',      tip: 'Deep hydration & gentle cleansing', to: '/skin'      },
      { module: 'Sleep',     tip: 'Extra rest is healing right now',   to: '/sleep'     },
    ],
  },
  follicular: {
    headline: 'Rise & Begin',
    sub: 'Energy builds. Lean into curiosity.',
    gradient: 'linear-gradient(135deg, rgba(143,165,140,0.38) 0%, rgba(143,165,140,0.12) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Light cardio, barre & core work',       to: '/pilates'   },
      { module: 'Body Fuel', tip: 'Lean proteins & fresh greens',          to: '/nourish'   },
      { module: 'Skin',      tip: 'Exfoliate & brighten — skin is ready',  to: '/skin'      },
      { module: 'Sleep',     tip: 'Consistent sleep fuels your surge',     to: '/sleep'     },
    ],
  },
  ovulation: {
    headline: 'Peak Power',
    sub: 'Radiant and magnetic — your strongest phase.',
    gradient: 'linear-gradient(135deg, rgba(212,160,160,0.28) 0%, rgba(212,160,160,0.10) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'HIIT, strength training & dance',       to: '/pilates'   },
      { module: 'Body Fuel', tip: 'Antioxidants, zinc & whole foods',      to: '/nourish'   },
      { module: 'Skin',      tip: 'Lightweight moisture & SPF',            to: '/skin'      },
      { module: 'Sleep',     tip: 'Recovery sleep after peak output',      to: '/sleep'     },
    ],
  },
  luteal: {
    headline: 'Turn Inward',
    sub: 'Wisdom rises. Slow down and listen.',
    gradient: 'linear-gradient(135deg, rgba(196,175,168,0.38) 0%, rgba(196,175,168,0.12) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Yoga, pilates & low-impact flow',       to: '/pilates'   },
      { module: 'Body Fuel', tip: 'Magnesium, complex carbs & warmth',     to: '/nourish'   },
      { module: 'Skin',      tip: 'Nourishing masks & barrier support',    to: '/skin'      },
      { module: 'Sleep',     tip: 'Wind-down rituals are essential',       to: '/sleep'     },
    ],
  },
}

const MM = (name) => `/images/My%20Modules/${name}.png`

const SESSION_IMG = {
  'Dynamic Stretch & Tone':   '/images/sessions/Dynamic Stretch & Tone.webp',
  'Glute Awakening':          '/images/sessions/Glute Awakening.webp',
  'Grounding Evening Flow':   '/images/sessions/Grounding Evening Flow.webp',
  'Pelvic Floor Reset':       '/images/sessions/Pelvic Floor Reset.webp',
  'Restorative Mat Session':  '/images/sessions/Restorative Mat Session.webp',
  'Rising Energy Core':       '/images/sessions/Rising Energy Core.webp',
  'Spinal Release & Breathe': '/images/sessions/Spinal Release & Breathe.webp',
  'Supine Surrender Flow':    '/images/sessions/Supine Surrender Flow.webp',
  'Arm & Shoulder Sculpt':    '/images/sessions/Arm & Shoulder Sculpt.webp',
  'Wind Down Restoration':    '/images/sessions/Wind Down Restoration.webp',
  'Mindful Core & Breathe':   '/images/sessions/Mindful Core & Breathing.webp',
  'Intuitive Movement':       '/images/sessions/Intuitive Movement.webp',
  'Peak Power Core':          '/images/sessions/Peak Power Core.webp',
  'Strong Arms & Back':       '/images/sessions/Strong Arms & Back.webp',
  'Athletic Flow':            '/images/sessions/Athletic Flow.webp',
  'Full Body Foundation':     '/images/sessions/Full Body Foundation.webp',
  'Gentle Restoration Flow':  '/images/sessions/Gentle Restoration Flow.webp',
  'Glute Sculptor':           '/images/sessions/Glute Sculptor.webp',
  'Total Body Burn':          '/images/sessions/Total Body Burn.webp',
  'Hip & Glute Release':      '/images/sessions/Hip & Glute Release.webp',
}

const FEATURED_WORKOUTS = [
  { title: 'Dynamic Stretch & Tone',   duration: 30, focus: 'Full Body',   difficulty: 'Intermediate' },
  { title: 'Glute Awakening',          duration: 25, focus: 'Glutes',      difficulty: 'Beginner'     },
  { title: 'Grounding Evening Flow',   duration: 20, focus: 'Flexibility', difficulty: 'Beginner'     },
  { title: 'Peak Power Core',          duration: 35, focus: 'Core',        difficulty: 'Advanced'     },
  { title: 'Restorative Mat Session',  duration: 25, focus: 'Recovery',    difficulty: 'Beginner'     },
  { title: 'Rising Energy Core',       duration: 30, focus: 'Core',        difficulty: 'Intermediate' },
  { title: 'Spinal Release & Breathe', duration: 20, focus: 'Spine',       difficulty: 'Beginner'     },
  { title: 'Athletic Flow',            duration: 40, focus: 'Full Body',   difficulty: 'Advanced'     },
  { title: 'Wind Down Restoration',    duration: 20, focus: 'Recovery',    difficulty: 'Beginner'     },
  { title: 'Hip & Glute Release',      duration: 25, focus: 'Hips',        difficulty: 'Beginner'     },
  { title: 'Total Body Burn',          duration: 45, focus: 'Full Body',   difficulty: 'Advanced'     },
  { title: 'Gentle Restoration Flow',  duration: 20, focus: 'Recovery',    difficulty: 'Beginner'     },
  { title: 'Mindful Core & Breathe',   duration: 25, focus: 'Core',        difficulty: 'Intermediate' },
  { title: 'Arm & Shoulder Sculpt',    duration: 30, focus: 'Upper Body',  difficulty: 'Intermediate' },
  { title: 'Full Body Foundation',     duration: 35, focus: 'Full Body',   difficulty: 'Beginner'     },
  { title: 'Glute Sculptor',           duration: 30, focus: 'Glutes',      difficulty: 'Intermediate' },
  { title: 'Pelvic Floor Reset',       duration: 20, focus: 'Core',        difficulty: 'Beginner'     },
  { title: 'Supine Surrender Flow',    duration: 25, focus: 'Flexibility', difficulty: 'Beginner'     },
  { title: 'Strong Arms & Back',       duration: 30, focus: 'Upper Body',  difficulty: 'Intermediate' },
  { title: 'Intuitive Movement',       duration: 30, focus: 'Full Body',   difficulty: 'Beginner'     },
]

const MODULE_NAV = [
  { key: 'pilates',   label: 'Pilates',   icon: pilatesIcon,   img: MM('Pilates'),   to: '/pilates'   },
  { key: 'cycle',     label: 'Cycle',     icon: cycleIcon,     img: MM('Cycle'),     to: '/cycle'     },
  { key: 'mood',      label: 'Mood',      icon: moodIcon,      img: MM('Mood'),      to: '/mood'      },
  { key: 'sleep',     label: 'Sleep',     icon: sleepIcon,     img: MM('Sleep'),     to: '/sleep'     },
  { key: 'skin',      label: 'Skin',      icon: skinIcon,      img: MM('Skin'),      to: '/skin'      },
  { key: 'grocery',   label: 'Grocery',   icon: groceryIcon,   img: MM('Grocery'),   to: '/grocery'   },
  { key: 'community', label: 'Community', icon: communityIcon, img: MM('Community'), to: '/community' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function anim(delay = 0) {
  return { animation: `dashUp 0.5s ease ${delay}s both` }
}

// ─── Phase Ring SVG ───────────────────────────────────────────────────────────

function PhaseRing({ phase, day, cycleLength }) {
  const cx = 64, cy = 64, r = 52
  const C = 2 * Math.PI * r
  const quarterC = C / 4
  const segments = [
    { key: 'menstrual',  days: 5,  color: PHASE_META.menstrual.color  },
    { key: 'follicular', days: 8,  color: PHASE_META.follicular.color },
    { key: 'ovulation',  days: 3,  color: PHASE_META.ovulation.color  },
    { key: 'luteal',     days: cycleLength - 16, color: PHASE_META.luteal.color },
  ]

  let cumDays = 0
  const GAP = 5

  const dotAngleDeg = day != null ? ((day - 1) / cycleLength) * 360 - 90 : null
  const dotRad = dotAngleDeg != null ? dotAngleDeg * Math.PI / 180 : null
  const dotX = dotRad != null ? cx + r * Math.cos(dotRad) : null
  const dotY = dotRad != null ? cy + r * Math.sin(dotRad) : null

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(59,51,48,0.1)" strokeWidth="5" />
      {segments.map(seg => {
        const dash = Math.max(0, (seg.days / cycleLength) * C - GAP)
        const gap = C - dash
        const offset = quarterC - (cumDays / cycleLength) * C
        const isActive = seg.key === phase
        cumDays += seg.days
        return (
          <circle
            key={seg.key}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={isActive ? 7 : 4}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            opacity={isActive ? 0.95 : 0.2}
            style={{ transition: 'opacity 0.4s ease' }}
          />
        )
      })}
      {dotX != null && (
        <circle cx={dotX} cy={dotY} r={4.5} fill="rgba(59,51,48,0.9)"
          style={{ filter: 'drop-shadow(0 0 5px rgba(59,51,48,0.4))' }} />
      )}
      <text x={cx} y={cy - 7} textAnchor="middle" fill="rgba(59,51,48,0.88)"
        fontSize="26" fontFamily="Cinzel, serif">
        {day ?? '--'}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="rgba(59,51,48,0.4)"
        fontSize="7.5" fontFamily="Cormorant Garamond, serif" letterSpacing="2">
        {day ? `OF ${cycleLength}` : 'SET UP'}
      </text>
    </svg>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, delay }) {
  return (
    <div className="flex items-center gap-3 px-5 mb-3" style={anim(delay)}>
      <span className="font-cinzel text-[9px] uppercase whitespace-nowrap"
        style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(107,82,72,0.35), transparent)' }} />
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { phase, color } = usePhase()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [weather,    setWeather]    = useState(null)
  const [heroSlide,  setHeroSlide]  = useState(0)

  // ── Exit / sign-out ──────────────────────────────────────────────────────────
  const [exiting,   setExiting]   = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const videoRef = useRef(null)
  const doneRef  = useRef(false)

  function doSignOut() {
    if (doneRef.current) return
    doneRef.current = true
    navigate('/login', { replace: true })
    supabase.auth.signOut()
  }

  useEffect(() => {
    if (!exiting || !videoRef.current) return
    videoRef.current.muted = true
    videoRef.current.play().catch(() => doSignOut())
    const timer = setTimeout(doSignOut, 5000)
    return () => clearTimeout(timer)
  }, [exiting])

  function handleSignOut() { setExiting(true) }
  function handleVideoEnd() { setFadingOut(true); setTimeout(doSignOut, 650) }

  const cycleLength = profile?.cycle_length ?? 28
  const dayOfCycle = profile?.last_period_date
    ? ((differenceInDays(new Date(), new Date(profile.last_period_date)) % cycleLength) + 1)
    : null

  const content = PHASE_CONTENT[phase] ?? null
  const phaseMeta = PHASE_META[phase] ?? null
  const firstName = profile?.full_name?.split(' ')[0] ?? null
  const activeColor = color ?? '#D4A0A0'

  // ── Daily rotation ───────────────────────────────────────────────────────────
  const dayOffset     = getDayOffset()
  const poolSize      = TODAY_POOL.length
  const todayPair     = [TODAY_POOL[(dayOffset * 2) % poolSize], TODAY_POOL[(dayOffset * 2 + 1) % poolSize]]
  const phaseRotation = PHASE_GUIDANCE_ROTATIONS[dayOffset % PHASE_GUIDANCE_ROTATIONS.length]

  // ── Featured workout (daily rotation) ───────────────────────────────────────
  const featuredWorkout = FEATURED_WORKOUTS[dayOffset % FEATURED_WORKOUTS.length]
  const featuredImg     = SESSION_IMG[featuredWorkout.title] ?? null

  // Auto-transition hero from phase → featured after 3.5 s
  useEffect(() => {
    const t = setTimeout(() => setHeroSlide(1), 3500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const CACHE_KEY = 'athena_weather'
    const CACHE_TTL = 3_600_000

    const cached = (() => {
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const { data, ts } = JSON.parse(raw)
        if (Date.now() - ts < CACHE_TTL) return data
      } catch (_) {}
      return null
    })()

    if (cached) { setWeather(cached); return }

    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,uv_index,relative_humidity_2m&temperature_unit=fahrenheit&timezone=auto`
          )
          const { current } = await res.json()
          const data = {
            temp:     Math.round(current.temperature_2m),
            uv:       Math.round(current.uv_index ?? 0),
            humidity: Math.round(current.relative_humidity_2m ?? 58),
          }
          setWeather(data)
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
        } catch (_) {}
      },
      () => {}
    )
  }, [])

  return (
    <>
    {/* Exit video overlay */}
    {exiting && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: '#140E0C', animation: 'exitFadeIn 0.35s ease forwards' }}>
        <style>{`
          @keyframes exitFadeIn  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes exitDarkIn  { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
        <video ref={videoRef} src="/athena-exit.mp4" playsInline preload="auto"
          onEnded={handleVideoEnd} onError={handleVideoEnd}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )}
    {fadingOut && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 201, backgroundColor: '#140E0C', animation: 'exitDarkIn 0.65s ease forwards', pointerEvents: 'none' }} />
    )}
    <div className="flex-1 min-h-0 pb-nav overflow-y-auto" style={{ backgroundColor: '#F3EAE7' }}>
      <style>{`
        @keyframes dashUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes navShimmer {
          0%, 42%   { background-position: -250% 0; }
          78%, 100% { background-position:  250% 0; }
        }
        @keyframes dashShimmer {
          0%, 42%   { background-position: -250% 0; }
          78%, 100% { background-position:  250% 0; }
        }
        /* Shimmer rim rotation — used by dashboard + wellness widget */
        @keyframes srimRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Icon sweep — left-to-right highlight */
        @keyframes iconSweep {
          0%, 20%   { background-position: -150% 0; }
          80%, 100% { background-position:  250% 0; }
        }
        .module-scroll::-webkit-scrollbar { display: none; }
        .module-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .header-shimmer {
          background-size: 250% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: dashShimmer 10s ease-in-out infinite;
        }
        /* Reduced-motion overrides */
        @keyframes hintFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .srim-spin-el  { animation: none !important; }
          .icon-sweep-el { animation: none !important; }
          .header-shimmer { animation: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 pb-4 max-w-md mx-auto" style={{ ...anim(0), paddingTop: 'calc(2.5rem + env(safe-area-inset-top))' }}>
        <div>
          <p className="font-garamond text-[11px] font-medium tracking-[0.2em] uppercase header-shimmer"
            style={{ backgroundImage: 'linear-gradient(110deg, rgba(112,98,94,0.9) 0%, rgba(112,98,94,0.9) 25%, rgba(188,178,205,0.95) 44%, rgba(232,224,248,1) 50%, rgba(188,178,205,0.95) 56%, rgba(112,98,94,0.9) 75%, rgba(112,98,94,0.9) 100%)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-cinzel text-[21px] font-medium tracking-wide mt-0.5 leading-tight header-shimmer"
            style={{ backgroundImage: 'linear-gradient(110deg, rgba(59,51,48,0.92) 0%, rgba(59,51,48,0.92) 25%, rgba(168,155,185,0.95) 44%, rgba(232,224,248,1) 50%, rgba(168,155,185,0.95) 56%, rgba(59,51,48,0.92) 75%, rgba(59,51,48,0.92) 100%)' }}>
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button onClick={() => navigate('/settings')}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'rgba(196,175,168,0.25)', border: '1px solid #C4AFA8' }}>
            <HeaderShimmerIcon src={settingsIcon} />
          </button>
          <button onClick={handleSignOut}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'rgba(196,175,168,0.25)', border: '1px solid #C4AFA8' }}>
            <HeaderShimmerIcon src={exitIcon} />
          </button>
        </div>
      </div>

      {/* ── Phase Hero (two-slide: phase → featured workout) ── */}
      <div className="px-4 max-w-md mx-auto mb-5" style={anim(0.07)}>
        <div style={{ position: 'relative' }}>

          {/* Slide 0 — Phase ring (natural height anchors the container) */}
          <div style={{
            opacity: heroSlide === 0 ? 1 : 0,
            transition: 'opacity 0.7s ease',
            pointerEvents: heroSlide === 0 ? 'auto' : 'none',
          }}>
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{
                backgroundImage: 'url("/images/dashboard/phase-hero.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center 18%',
                border: `1px solid ${activeColor}50`,
              }}
            >
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(242,237,232,0.38) 0%, rgba(242,237,232,0.62) 55%, rgba(242,237,232,0.72) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 80% 70% at 80% 50%, ${activeColor}14 0%, transparent 65%)` }} />
              <div className="relative flex items-center gap-2 p-5">
                <PhaseRing phase={phase} day={dayOfCycle} cycleLength={cycleLength} />
                <div className="flex-1 min-w-0 pl-1">
                  {phaseMeta && (
                    <span className="font-cinzel text-[9px] tracking-[0.3em] uppercase px-2 py-1 rounded-full mb-3 inline-block"
                      style={{ background: 'rgba(59,51,48,0.12)', color: '#3B3330' }}>
                      {phaseMeta.label}
                    </span>
                  )}
                  <h2 className="font-cinzel text-[20px] text-brown leading-tight mt-2 mb-1">
                    {content?.headline ?? 'Your Journey'}
                  </h2>
                  <p className="font-garamond text-sm leading-relaxed" style={{ color: '#7A6A65' }}>
                    {content?.sub ?? 'Set up your cycle to unlock phase guidance.'}
                  </p>
                  <button
                    onClick={() => navigate(content ? '/cycle' : '/settings')}
                    className="flex items-center gap-1 mt-3 font-cinzel text-[9px] tracking-[0.25em] uppercase transition-opacity hover:opacity-100"
                    style={{ color: '#3B3330', opacity: 0.85 }}>
                    {content ? 'Cycle Guide' : 'Set Up'} <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 1 — Featured workout (absolutely fills the same space) */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: heroSlide === 1 ? 1 : 0,
            transition: 'opacity 0.7s ease',
            pointerEvents: heroSlide === 1 ? 'auto' : 'none',
          }}>
            <div
              className="rounded-2xl overflow-hidden relative cursor-pointer"
              style={{
                height: '100%',
                ...(featuredImg
                  ? { backgroundImage: `url("${featuredImg}")`, backgroundSize: 'cover', backgroundPosition: 'center top' }
                  : { background: `linear-gradient(135deg, ${activeColor}30, rgba(242,237,232,0.85))` }
                ),
                border: `1px solid ${activeColor}50`,
              }}
              onClick={() => navigate('/pilates')}
            >
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(59,51,48,0.04) 0%, rgba(59,51,48,0.48) 50%, rgba(59,51,48,0.9) 100%)' }} />
              <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                <span style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(42,28,20,0.55)', backdropFilter: 'blur(4px)',
                  borderRadius: 20, padding: '3px 12px',
                  color: '#F5EDE3', fontSize: '0.6rem',
                  letterSpacing: '0.14em', fontFamily: 'Cinzel, serif',
                  textTransform: 'uppercase',
                }}>Today's Studio</span>
                <div>
                  <h2 className="font-cinzel text-white leading-tight mb-2"
                    style={{ fontSize: '1.15rem', fontWeight: 500, textShadow: '0 1px 8px rgba(0,0,0,0.7)' }}>
                    {featuredWorkout.title}
                  </h2>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {[`${featuredWorkout.duration} min`, featuredWorkout.focus, featuredWorkout.difficulty].map(pill => (
                      <span key={pill} className="font-garamond text-[11px] px-2 py-0.5 rounded-full capitalize"
                        style={{ background: 'rgba(242,237,232,0.75)', border: '1px solid rgba(212,160,160,0.45)', color: '#C4859A' }}>
                        {pill}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center gap-1 font-cinzel text-[9px] tracking-[0.25em] uppercase"
                    style={{ color: '#F5EDE3', opacity: 0.88 }}>
                    Begin Session <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8 }}>
          {[0, 1].map(i => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              style={{
                width: heroSlide === i ? 18 : 6,
                height: 6,
                borderRadius: 3,
                background: heroSlide === i ? activeColor : 'rgba(107,82,72,0.22)',
                border: 'none', padding: 0, cursor: 'pointer',
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── My Modules (horizontal scroll) ── */}
      <SectionHeader title="My Modules" delay={0.12} />
      <div className="module-scroll overflow-x-auto mb-6" style={anim(0.15)}>
        <div className="flex gap-3 px-5" style={{ width: 'max-content', paddingBottom: '4px' }}>
          {MODULE_NAV.map(({ key, label, icon, img, to }, i) => (
            <button
              key={key}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2"
              style={{ minWidth: '72px' }}
            >
              <div style={{ position: 'relative', width: 72, height: 88, borderRadius: 18, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 18,
                  overflow: 'hidden',
                  backgroundImage: `url("${img}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  {/* Bottom gradient for label legibility */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(30,18,12,0.70) 100%)',
                  }} />
                  {/* Module label pinned to bottom */}
                  <span style={{
                    position: 'absolute', bottom: 7, left: 0, right: 0,
                    textAlign: 'center',
                    fontFamily: 'Cinzel, serif',
                    fontSize: 7.5,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#F5EDE3',
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  }}>
                    {label}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Today's Check-ins (daily rotation) ── */}
      <SectionHeader title="Today" delay={0.17} />
      <div className="grid grid-cols-2 gap-3 px-4 max-w-md mx-auto mb-6" style={anim(0.19)}>
        {todayPair.map(({ key, label, sub, icon, img, to }, i) => (
          <div key={key} style={{ borderRadius: 16, overflow: 'hidden' }}>
            <button
              onClick={() => navigate(to)}
              style={{
                position: 'relative',
                display: 'block', width: '100%',
                ...(img
                  ? { backgroundImage: `url("${img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: '#C4AFA8' }
                ),
                border: 'none', cursor: 'pointer',
                borderRadius: 16, padding: 16, textAlign: 'left',
                minHeight: 120,
              }}
            >
              {img && (
                <div className="absolute inset-0" style={{ borderRadius: 15, background: 'linear-gradient(to top, rgba(30,18,12,0.75) 0%, rgba(30,18,12,0.30) 55%, transparent 100%)' }} />
              )}
              <div className="relative z-10">
                {img ? (
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(42,28,20,0.55)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 20,
                    padding: '2px 10px',
                    color: '#F5EDE3',
                    fontSize: '0.65rem',
                    letterSpacing: '0.1em',
                    fontFamily: 'Cinzel, serif',
                    textTransform: 'uppercase',
                    marginBottom: 4, marginTop: 8,
                  }}>{label}</span>
                ) : (
                  <p className="font-cinzel text-[10px] tracking-widest uppercase mb-1 mt-2"
                    style={{ color: '#3B3330' }}>{label}</p>
                )}
                <p className="font-garamond text-xs"
                  style={{ color: img ? '#FFFFFF' : '#7A6A65', textShadow: img ? '0 1px 6px rgba(0,0,0,0.6)' : 'none' }}>{sub}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* ── Phase Guidance (3-card daily rotation) ── */}
      {content && (
        <>
          <SectionHeader title="Phase Guidance" delay={0.21} />
          <div className="module-scroll overflow-x-auto mb-6" style={anim(0.23)}>
            <div className="flex gap-3 px-5" style={{ width: 'max-content', paddingBottom: '4px' }}>
              {phaseRotation.map(cardIdx => {
                const { module, tip, to } = content.cards[cardIdx]
                const img = MODULE_IMAGES[module]
                return (
                  <button
                    key={module}
                    onClick={() => navigate(to)}
                    className="relative text-left rounded-2xl flex-shrink-0 overflow-hidden"
                    style={{
                      width: '172px', minHeight: '130px',
                      border: `1px solid ${img ? 'rgba(196,175,168,0.35)' : `${activeColor}40`}`,
                      ...(img
                        ? { backgroundImage: `url("${img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: `${activeColor}0e` }
                      ),
                    }}
                  >
                    {img && (
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30,18,12,0.75) 0%, rgba(30,18,12,0.32) 55%, transparent 100%)' }} />
                    )}
                    <div className="relative z-10 p-4 flex flex-col h-full">
                      {img ? (
                        <span style={{
                          display: 'inline-block',
                          background: 'rgba(42,28,20,0.55)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: 20,
                          padding: '2px 10px',
                          color: '#F5EDE3',
                          fontSize: '0.65rem',
                          letterSpacing: '0.1em',
                          fontFamily: 'Cinzel, serif',
                          textTransform: 'uppercase',
                          marginBottom: 8,
                        }}>{module}</span>
                      ) : (
                        <p className="font-cinzel text-[10px] tracking-widest uppercase mb-2"
                          style={{ color: activeColor, opacity: 0.9 }}>
                          {module}
                        </p>
                      )}
                      <p className="font-garamond text-sm leading-snug flex-1"
                        style={{ color: '#FFFFFF', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
                        {tip}
                      </p>
                      <div className="flex items-center gap-1 mt-3"
                        style={{ color: activeColor, opacity: 0.55 }}>
                        <span className="font-cinzel text-[8px] tracking-widest uppercase">Explore</span>
                        <ChevronRight size={9} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Wellness Weather ── */}
      <SectionHeader title="Wellness" delay={0.26} />
      <div className="px-4 max-w-md mx-auto mb-6" style={anim(0.28)}>
        <WellnessWeatherWidget weather={weather} phase={phase} />
      </div>

    </div>

      <HintBubble hintKey="dashboard" hints={DASHBOARD_HINTS} />
    </>
  )
}
