import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'
import { ChevronRight } from 'lucide-react'
import settingsIcon from '../assets/icons/settings-icon.png'
import WellnessWeatherWidget from '../components/WellnessWeatherWidget'

import pilatesIcon   from '../assets/icons/nav-pilates.png'
import cycleIcon     from '../assets/icons/nav-cycle.png'
import moodIcon      from '../assets/icons/nav-mood.png'
import nourishIcon   from '../assets/icons/nav-nourish.png'
import sleepIcon     from '../assets/icons/nav-sleep.png'
import skinIcon      from '../assets/icons/nav-skin.png'
import communityIcon from '../assets/icons/nav-community.png'

// Phase Guidance cards still use images — module tiles do not
const MODULE_IMAGES = {
  Pilates:    '/images/dashboard/pilates.webp',
  'Body Fuel': '/images/dashboard/nourish.webp',
  Skin:       '/images/dashboard/skin.webp',
  Sleep:      '/images/dashboard/sleep.webp',
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
        backgroundColor: '#E8E8F0',
        filter: 'drop-shadow(0 0 4px rgba(220,220,240,0.7))',
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
  menstrual:  { color: '#C4859A', label: 'Menstrual',  days: 5  },
  follicular: { color: '#8FA58C', label: 'Follicular', days: 8  },
  ovulation:  { color: '#C4859A', label: 'Ovulation',  days: 3  },
  luteal:     { color: '#C4AFA8', label: 'Luteal',     days: 12 },
}

const PHASE_CONTENT = {
  menstrual: {
    headline: 'Rest & Restore',
    sub: 'Honor your body\'s call to slow down.',
    gradient: 'linear-gradient(135deg, rgba(196,133,154,0.28) 0%, rgba(196,133,154,0.10) 100%)',
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
    gradient: 'linear-gradient(135deg, rgba(196,133,154,0.28) 0%, rgba(196,133,154,0.10) 100%)',
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

const MODULE_NAV = [
  { key: 'pilates',   label: 'Pilates',   icon: pilatesIcon,   to: '/pilates'   },
  { key: 'cycle',     label: 'Cycle',     icon: cycleIcon,     to: '/cycle'     },
  { key: 'mood',      label: 'Mood',      icon: moodIcon,      to: '/mood'      },
  { key: 'nourish',   label: 'Body Fuel', icon: nourishIcon,   to: '/nourish'   },
  { key: 'sleep',     label: 'Sleep',     icon: sleepIcon,     to: '/sleep'     },
  { key: 'skin',      label: 'Skin',      icon: skinIcon,      to: '/skin'      },
  { key: 'community', label: 'Community', icon: communityIcon, to: '/community' },
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
      <span className="font-cinzel text-[9px] tracking-[0.28em] uppercase whitespace-nowrap"
        style={{ color: '#7A6A65' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(122,106,101,0.25), transparent)' }} />
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { phase, color } = usePhase()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [weather, setWeather] = useState(null)

  const cycleLength = profile?.cycle_length ?? 28
  const dayOfCycle = profile?.last_period_date
    ? ((differenceInDays(new Date(), new Date(profile.last_period_date)) % cycleLength) + 1)
    : null

  const content = PHASE_CONTENT[phase] ?? null
  const phaseMeta = PHASE_META[phase] ?? null
  const firstName = profile?.full_name?.split(' ')[0] ?? null
  const activeColor = color ?? '#C4859A'

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,uv_index,relative_humidity_2m&temperature_unit=fahrenheit&timezone=auto`
          )
          const { current } = await res.json()
          setWeather({
            temp:     Math.round(current.temperature_2m),
            uv:       Math.round(current.uv_index ?? 0),
            humidity: Math.round(current.relative_humidity_2m ?? 58),
          })
        } catch (_) {}
      },
      () => {}
    )
  }, [])

  return (
    <div className="flex-1 min-h-0 bg-[#F2EDE8] pb-nav overflow-y-auto">
      <style>{`
        @keyframes dashUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
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
        @media (prefers-reduced-motion: reduce) {
          .srim-spin-el  { animation: none !important; }
          .icon-sweep-el { animation: none !important; }
          .header-shimmer { animation: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 pt-10 pb-4 max-w-md mx-auto" style={anim(0)}>
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
        <button onClick={() => navigate('/settings')}
          className="mt-1 p-2 rounded-xl transition-all"
          style={{ background: 'rgba(196,175,168,0.25)', border: '1px solid #C4AFA8' }}>
          <span style={{
            display: 'block', width: '22px', height: '22px',
            WebkitMask: `url(${settingsIcon}) no-repeat center / contain`,
            mask: `url(${settingsIcon}) no-repeat center / contain`,
            backgroundColor: '#7A6A65',
          }} />
        </button>
      </div>

      {/* ── Phase Hero ── */}
      <div className="px-4 max-w-md mx-auto mb-5" style={anim(0.07)}>
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: content?.gradient ?? 'rgba(143,165,140,0.15)',
            border: `1px solid ${activeColor}50`,
          }}
        >
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 80% 70% at 80% 50%, ${activeColor}18 0%, transparent 65%)`,
          }} />
          <div className="relative flex items-center gap-2 p-5">
            <PhaseRing phase={phase} day={dayOfCycle} cycleLength={cycleLength} />
            <div className="flex-1 min-w-0 pl-1">
              {phaseMeta && (
                <span className="font-cinzel text-[9px] tracking-[0.3em] uppercase px-2 py-1 rounded-full mb-3 inline-block"
                  style={{ background: `${activeColor}28`, color: activeColor }}>
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
                style={{ color: activeColor, opacity: 0.6 }}>
                {content ? 'Cycle Guide' : 'Set Up'} <ChevronRight size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Modules (horizontal scroll) ── */}
      <SectionHeader title="My Modules" delay={0.12} />
      <div className="module-scroll overflow-x-auto mb-6" style={anim(0.15)}>
        <div className="flex gap-4 px-5" style={{ width: 'max-content', paddingBottom: '4px' }}>
          {MODULE_NAV.map(({ key, label, icon, to }, i) => (
            <button
              key={key}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2"
              style={{ minWidth: '56px' }}
            >
              {/* Shimmer rim tile — overflow:hidden clips the rotating gradient */}
              <div style={{ position: 'relative', width: 56, height: 56, borderRadius: 16, overflow: 'hidden' }}>
                <RimSpin duration="3s" delay={i * 0.2} />
                {/* Inner tile — inset 1px so 1px of rim shows */}
                <div style={{
                  position: 'absolute', inset: 1,
                  borderRadius: 15,
                  background: '#C4AFA8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShimmerIcon src={icon} delay={i * 0.2} />
                </div>
              </div>
              <span className="font-garamond text-[10px] tracking-wide" style={{ color: '#7A6A65' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Today's Check-ins ── */}
      <SectionHeader title="Today" delay={0.17} />
      <div className="grid grid-cols-2 gap-3 px-4 max-w-md mx-auto mb-6" style={anim(0.19)}>

        {/* Mood — shimmer rim wrapper */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
          <RimSpin duration="3.5s" delay={0} />
          <button
            onClick={() => navigate('/mood')}
            style={{
              position: 'relative', zIndex: 1,
              display: 'block', width: 'calc(100% - 2px)', margin: 1,
              backgroundImage: 'url("/images/dashboard/mood.png")',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: 'none', cursor: 'pointer',
              borderRadius: 15, padding: 16, textAlign: 'left',
              minHeight: 120,
            }}
          >
            <div className="absolute inset-0" style={{ borderRadius: 15, background: 'linear-gradient(to top, rgba(59,51,48,0.80) 0%, rgba(59,51,48,0.30) 55%, rgba(59,51,48,0.05) 100%)' }} />
            <div className="relative z-10">
              <ShimmerIcon src={moodIcon} delay={0} />
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-1 mt-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Mood</p>
              <p className="font-garamond text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                How are you feeling today?
              </p>
            </div>
          </button>
        </div>

        {/* Sleep — shimmer rim wrapper */}
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
          <RimSpin duration="3.5s" delay={0.5} />
          <button
            onClick={() => navigate('/sleep')}
            style={{
              position: 'relative', zIndex: 1,
              display: 'block', width: 'calc(100% - 2px)', margin: 1,
              backgroundImage: 'url("/images/dashboard/sleep.png")',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: 'none', cursor: 'pointer',
              borderRadius: 15, padding: 16, textAlign: 'left',
              minHeight: 120,
            }}
          >
            <div className="absolute inset-0" style={{ borderRadius: 15, background: 'linear-gradient(to top, rgba(59,51,48,0.80) 0%, rgba(59,51,48,0.30) 55%, rgba(59,51,48,0.05) 100%)' }} />
            <div className="relative z-10">
              <ShimmerIcon src={sleepIcon} delay={0.5} />
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-1 mt-2" style={{ color: 'rgba(255,255,255,0.95)' }}>Sleep</p>
              <p className="font-garamond text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                How did you sleep last night?
              </p>
            </div>
          </button>
        </div>

      </div>

      {/* ── Phase Guidance (horizontal scroll) — images unchanged ── */}
      {content && (
        <>
          <SectionHeader title="Phase Guidance" delay={0.21} />
          <div className="module-scroll overflow-x-auto mb-6" style={anim(0.23)}>
            <div className="flex gap-3 px-5" style={{ width: 'max-content', paddingBottom: '4px' }}>
              {content.cards.map(({ module, tip, to }) => {
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
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(59,51,48,0.82) 0%, rgba(59,51,48,0.35) 55%, rgba(59,51,48,0.05) 100%)' }} />
                    )}
                    <div className="relative z-10 p-4 flex flex-col h-full">
                      <p className="font-cinzel text-[10px] tracking-widest uppercase mb-2"
                        style={{ color: activeColor, opacity: 0.9 }}>
                        {module}
                      </p>
                      <p className="font-garamond text-sm leading-snug flex-1"
                        style={{ color: 'rgba(255,255,255,0.9)' }}>
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
  )
}
