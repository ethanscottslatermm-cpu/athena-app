import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'
import {
  Dumbbell, Heart, Leaf, Moon, Sparkles, Users,
  Wind, Settings, CalendarDays, ChevronRight,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const PHASE_META = {
  menstrual:  { color: '#8B1A1A', label: 'Menstrual',  days: 5  },
  follicular: { color: '#8FAF8A', label: 'Follicular', days: 8  },
  ovulation:  { color: '#C9A86C', label: 'Ovulation',  days: 3  },
  luteal:     { color: '#6B4F6B', label: 'Luteal',     days: 12 },
}

const PHASE_CONTENT = {
  menstrual: {
    headline: 'Rest & Restore',
    sub: 'Honor your body\'s call to slow down.',
    gradient: 'linear-gradient(135deg, rgba(139,26,26,0.55) 0%, rgba(60,6,6,0.22) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Restorative movement & breathwork', to: '/pilates'   },
      { module: 'Nourish',   tip: 'Iron-rich foods & warming broths',  to: '/nourish'   },
      { module: 'Skin',      tip: 'Deep hydration & gentle cleansing', to: '/skin'      },
      { module: 'Sleep',     tip: 'Extra rest is healing right now',   to: '/sleep'     },
    ],
  },
  follicular: {
    headline: 'Rise & Begin',
    sub: 'Energy builds. Lean into curiosity.',
    gradient: 'linear-gradient(135deg, rgba(143,175,138,0.48) 0%, rgba(55,90,50,0.18) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Light cardio, barre & core work',        to: '/pilates'   },
      { module: 'Nourish',   tip: 'Lean proteins & fresh greens',           to: '/nourish'   },
      { module: 'Skin',      tip: 'Exfoliate & brighten — skin is ready',   to: '/skin'      },
      { module: 'Sleep',     tip: 'Consistent sleep fuels your surge',      to: '/sleep'     },
    ],
  },
  ovulation: {
    headline: 'Peak Power',
    sub: 'Radiant and magnetic — your strongest phase.',
    gradient: 'linear-gradient(135deg, rgba(201,168,108,0.52) 0%, rgba(130,90,20,0.2) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'HIIT, strength training & dance',        to: '/pilates'   },
      { module: 'Nourish',   tip: 'Antioxidants, zinc & whole foods',       to: '/nourish'   },
      { module: 'Skin',      tip: 'Lightweight moisture & SPF',             to: '/skin'      },
      { module: 'Sleep',     tip: 'Recovery sleep after peak output',       to: '/sleep'     },
    ],
  },
  luteal: {
    headline: 'Turn Inward',
    sub: 'Wisdom rises. Slow down and listen.',
    gradient: 'linear-gradient(135deg, rgba(107,79,107,0.52) 0%, rgba(45,22,45,0.2) 100%)',
    cards: [
      { module: 'Pilates',   tip: 'Yoga, pilates & low-impact flow',        to: '/pilates'   },
      { module: 'Nourish',   tip: 'Magnesium, complex carbs & warmth',      to: '/nourish'   },
      { module: 'Skin',      tip: 'Nourishing masks & barrier support',     to: '/skin'      },
      { module: 'Sleep',     tip: 'Wind-down rituals are essential',        to: '/sleep'     },
    ],
  },
}

const MODULE_NAV = [
  { key: 'pilates',   label: 'Pilates',     Icon: Dumbbell,     to: '/pilates'   },
  { key: 'cycle',     label: 'Cycle',       Icon: CalendarDays, to: '/cycle'     },
  { key: 'mood',      label: 'Mood',        Icon: Heart,        to: '/mood'      },
  { key: 'nourish',   label: 'Nourish',     Icon: Leaf,         to: '/nourish'   },
  { key: 'sleep',     label: 'Sleep',       Icon: Moon,         to: '/sleep'     },
  { key: 'skin',      label: 'Skin',        Icon: Sparkles,     to: '/skin'      },
  { key: 'community', label: 'Community',   Icon: Users,        to: '/community' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function uvNote(uv) {
  if (uv >= 8) return 'Very high UV — SPF essential'
  if (uv >= 6) return 'High UV — wear SPF'
  if (uv >= 3) return 'Moderate UV — SPF recommended'
  return 'Low UV today'
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

  // Day indicator dot position
  const dotAngleDeg = day != null ? ((day - 1) / cycleLength) * 360 - 90 : null
  const dotRad = dotAngleDeg != null ? dotAngleDeg * Math.PI / 180 : null
  const dotX = dotRad != null ? cx + r * Math.cos(dotRad) : null
  const dotY = dotRad != null ? cy + r * Math.sin(dotRad) : null

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />

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

      {/* Day dot */}
      {dotX != null && (
        <circle cx={dotX} cy={dotY} r={4.5} fill="rgba(244,239,230,0.95)"
          style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.9))' }} />
      )}

      {/* Center */}
      <text x={cx} y={cy - 7} textAnchor="middle" fill="rgba(244,239,230,0.92)"
        fontSize="26" fontFamily="Cinzel, serif">
        {day ?? '--'}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="rgba(244,239,230,0.3)"
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
        style={{ color: 'rgba(244,239,230,0.3)' }}>
        {title}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(244,239,230,0.1), transparent)' }} />
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
  const activeColor = color ?? '#C9A86C'

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,uv_index&temperature_unit=fahrenheit&timezone=auto`
          )
          const { current } = await res.json()
          setWeather({ temp: Math.round(current.temperature_2m), uv: Math.round(current.uv_index ?? 0) })
        } catch (_) {}
      },
      () => {}
    )
  }, [])

  return (
    <div className="min-h-screen bg-[#060404] pb-nav overflow-y-auto">
      <style>{`
        @keyframes dashUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .module-scroll::-webkit-scrollbar { display: none; }
        .module-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-5 pt-10 pb-4 max-w-md mx-auto" style={anim(0)}>
        <div>
          <p className="font-garamond text-[11px] tracking-[0.2em] uppercase"
            style={{ color: 'rgba(244,239,230,0.32)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="font-cinzel text-[21px] text-ivory tracking-wide mt-0.5 leading-tight">
            {greeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
        </div>
        <button onClick={() => navigate('/settings')}
          className="mt-1 p-2 rounded-xl transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Settings size={17} strokeWidth={1.4} style={{ color: 'rgba(244,239,230,0.45)' }} />
        </button>
      </div>

      {/* ── Phase Hero ── */}
      <div className="px-4 max-w-md mx-auto mb-5" style={anim(0.07)}>
        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: content?.gradient ?? 'rgba(255,255,255,0.04)',
            border: `1px solid ${activeColor}30`,
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 80% 70% at 80% 50%, ${activeColor}22 0%, transparent 65%)`,
          }} />

          <div className="relative flex items-center gap-2 p-5">
            {/* Ring */}
            <PhaseRing phase={phase} day={dayOfCycle} cycleLength={cycleLength} />

            {/* Text */}
            <div className="flex-1 min-w-0 pl-1">
              {phaseMeta && (
                <span className="font-cinzel text-[9px] tracking-[0.3em] uppercase px-2 py-1 rounded-full mb-3 inline-block"
                  style={{ background: `${activeColor}28`, color: activeColor }}>
                  {phaseMeta.label}
                </span>
              )}
              <h2 className="font-cinzel text-[20px] text-ivory leading-tight mt-2 mb-1">
                {content?.headline ?? 'Your Journey'}
              </h2>
              <p className="font-garamond text-sm leading-relaxed"
                style={{ color: 'rgba(244,239,230,0.52)' }}>
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
          {MODULE_NAV.map(({ key, label, Icon, to }) => (
            <button
              key={key}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2"
              style={{ minWidth: '56px' }}
            >
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: '56px', height: '56px',
                  background: `${activeColor}15`,
                  border: `1px solid ${activeColor}28`,
                  transition: 'background 0.2s',
                }}
              >
                <Icon size={22} strokeWidth={1.3} style={{ color: activeColor }} />
              </div>
              <span className="font-garamond text-[10px] tracking-wide"
                style={{ color: 'rgba(244,239,230,0.45)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Today's Check-ins ── */}
      <SectionHeader title="Today" delay={0.17} />
      <div className="grid grid-cols-2 gap-3 px-4 max-w-md mx-auto mb-6" style={anim(0.19)}>
        {/* Mood check-in */}
        <button
          onClick={() => navigate('/mood')}
          className="text-left rounded-2xl p-4"
          style={{ background: 'rgba(196,154,154,0.1)', border: '1px solid rgba(196,154,154,0.2)' }}
        >
          <Heart size={18} strokeWidth={1.4} style={{ color: '#C49A9A', marginBottom: '10px' }} />
          <p className="font-cinzel text-[10px] tracking-widest uppercase text-ivory/70 mb-1">Mood</p>
          <p className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.38)' }}>
            How are you feeling today?
          </p>
        </button>

        {/* Sleep check-in */}
        <button
          onClick={() => navigate('/sleep')}
          className="text-left rounded-2xl p-4"
          style={{ background: 'rgba(107,79,107,0.15)', border: '1px solid rgba(107,79,107,0.25)' }}
        >
          <Moon size={18} strokeWidth={1.4} style={{ color: '#9B8BB0', marginBottom: '10px' }} />
          <p className="font-cinzel text-[10px] tracking-widest uppercase text-ivory/70 mb-1">Sleep</p>
          <p className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.38)' }}>
            How did you sleep last night?
          </p>
        </button>
      </div>

      {/* ── Phase Guidance (horizontal scroll) ── */}
      {content && (
        <>
          <SectionHeader title="Phase Guidance" delay={0.21} />
          <div className="module-scroll overflow-x-auto mb-6" style={anim(0.23)}>
            <div className="flex gap-3 px-5" style={{ width: 'max-content', paddingBottom: '4px' }}>
              {content.cards.map(({ module, tip, to }) => (
                <button
                  key={module}
                  onClick={() => navigate(to)}
                  className="text-left rounded-2xl p-4 flex-shrink-0"
                  style={{
                    width: '172px',
                    background: `${activeColor}0e`,
                    border: `1px solid ${activeColor}22`,
                  }}
                >
                  <p className="font-cinzel text-[10px] tracking-widest uppercase mb-2"
                    style={{ color: activeColor, opacity: 0.8 }}>
                    {module}
                  </p>
                  <p className="font-garamond text-sm leading-snug"
                    style={{ color: 'rgba(244,239,230,0.6)' }}>
                    {tip}
                  </p>
                  <div className="flex items-center gap-1 mt-3"
                    style={{ color: activeColor, opacity: 0.45 }}>
                    <span className="font-cinzel text-[8px] tracking-widest uppercase">Explore</span>
                    <ChevronRight size={9} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Conditions (Open-Meteo) ── */}
      {weather && (
        <div className="px-4 max-w-md mx-auto mb-4" style={anim(0.26)}>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Wind size={13} style={{ color: 'rgba(244,239,230,0.28)', flexShrink: 0 }} />
            <div>
              <p className="font-cinzel text-[8px] tracking-widest uppercase mb-0.5"
                style={{ color: 'rgba(244,239,230,0.25)' }}>
                Conditions
              </p>
              <p className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.45)' }}>
                {weather.temp}°F · UV {weather.uv} · {uvNote(weather.uv)}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
