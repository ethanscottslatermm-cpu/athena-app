import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'
import { Dumbbell, Heart, Leaf, Moon, Sparkles, Users, Wind } from 'lucide-react'

const PHASE_CONTENT = {
  menstrual: {
    headline: 'Rest & Restore',
    description: 'Honor your body\'s rhythm. A sacred time of release and renewal.',
    gradient: 'linear-gradient(135deg, rgba(139,26,26,0.45) 0%, rgba(80,8,8,0.18) 100%)',
    pilates:   'Restorative movement & breathwork',
    mood:      'Turn inward — journal and reflect',
    nourish:   'Iron-rich foods, warming broths & dark chocolate',
    sleep:     'Extra rest is deeply healing right now',
    skin:      'Hydration focus & gentle cleansing',
    community: 'You are not alone in this phase',
  },
  follicular: {
    headline: 'Rise & Begin',
    description: 'Energy is building. The world opens up — lean into curiosity.',
    gradient: 'linear-gradient(135deg, rgba(143,175,138,0.38) 0%, rgba(60,100,55,0.12) 100%)',
    pilates:   'Light cardio, barre & core activation',
    mood:      'Try something that excites you today',
    nourish:   'Lean proteins, fresh greens & fermented foods',
    sleep:     'Consistent sleep fuels your rising energy',
    skin:      'Exfoliate and brighten — skin is ready',
    community: 'Share your fresh energy with others',
  },
  ovulation: {
    headline: 'Peak Power',
    description: 'You\'re radiant and magnetic. This is your most powerful phase.',
    gradient: 'linear-gradient(135deg, rgba(201,168,108,0.42) 0%, rgba(140,100,40,0.15) 100%)',
    pilates:   'HIIT, strength training & dance',
    mood:      'Connect, communicate and create freely',
    nourish:   'Antioxidants, zinc & whole foods',
    sleep:     'Recovery sleep matches your peak output',
    skin:      'Lightweight moisture & SPF — you\'re glowing',
    community: 'This is your moment to connect',
  },
  luteal: {
    headline: 'Turn Inward',
    description: 'Emotions deepen and wisdom rises. Slow down and listen.',
    gradient: 'linear-gradient(135deg, rgba(107,79,107,0.42) 0%, rgba(55,30,55,0.15) 100%)',
    pilates:   'Yoga, pilates & low-impact flow',
    mood:      'Notice your needs without judgment',
    nourish:   'Magnesium, complex carbs & warming foods',
    sleep:     'Wind-down rituals matter most tonight',
    skin:      'Nourishing masks & barrier support',
    community: 'Rest in community — you don\'t have to push',
  },
}

const MODULE_CARDS = [
  { key: 'pilates',   label: 'Pilates',     Icon: Dumbbell, to: '/pilates',   tipKey: 'pilates'   },
  { key: 'mood',      label: 'Mood & Mind', Icon: Heart,    to: '/mood',      tipKey: 'mood'      },
  { key: 'nourish',   label: 'Nourish',     Icon: Leaf,     to: '/nourish',   tipKey: 'nourish'   },
  { key: 'sleep',     label: 'Sleep',       Icon: Moon,     to: '/sleep',     tipKey: 'sleep'     },
  { key: 'skin',      label: 'Skin',        Icon: Sparkles, to: '/skin',      tipKey: 'skin'      },
  { key: 'community', label: 'Community',   Icon: Users,    to: '/community', tipKey: 'community' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function uvLabel(uv) {
  if (uv >= 8) return '— very high UV, SPF essential'
  if (uv >= 6) return '— high UV, wear SPF'
  if (uv >= 3) return '— moderate UV, SPF recommended'
  return '— low UV today'
}

function anim(delay) {
  return { animation: `dashFadeUp 0.55s ease ${delay}s both` }
}

function CycleArc({ day, total, color }) {
  const r = 28, c = 36
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.min(day / total, 1))
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ flexShrink: 0 }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease', opacity: 0.75 }} />
      <text x={c} y={c - 3} textAnchor="middle" fill="rgba(244,239,230,0.92)"
        fontSize="15" fontFamily="Cinzel, serif">{day}</text>
      <text x={c} y={c + 11} textAnchor="middle" fill="rgba(244,239,230,0.35)"
        fontSize="7" fontFamily="Cormorant Garamond, serif" letterSpacing="1.5">OF {total}</text>
    </svg>
  )
}

export default function Dashboard() {
  const { phase, label, color } = usePhase()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [weather, setWeather] = useState(null)

  const cycleLength = profile?.cycle_length ?? 28
  const dayOfCycle = profile?.last_period_date
    ? ((differenceInDays(new Date(), new Date(profile.last_period_date)) % cycleLength) + 1)
    : null

  const content = PHASE_CONTENT[phase] ?? null
  const firstName = profile?.full_name?.split(' ')[0] ?? null

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
    <div className="min-h-screen bg-[#060404] pb-nav">
      <style>{`
        @keyframes dashFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Greeting */}
      <div className="px-5 pt-10 pb-3 max-w-md mx-auto" style={anim(0)}>
        <p className="font-garamond text-xs tracking-[0.22em] uppercase" style={{ color: 'rgba(244,239,230,0.35)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-cinzel text-[22px] text-ivory tracking-wide mt-1 leading-tight">
          {getGreeting()}{firstName ? `, ${firstName}` : ''}
        </h1>
      </div>

      <div className="px-4 pb-6 space-y-3 max-w-md mx-auto">

        {/* Phase Hero */}
        <div style={{ ...anim(0.07), background: content?.gradient ?? 'rgba(255,255,255,0.04)', border: `1px solid ${color ? color + '28' : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          {color && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 75% 65% at 15% 50%, ${color}1a 0%, transparent 70%)` }} />
          )}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {label && (
                <p className="font-garamond text-[10px] tracking-[0.28em] uppercase mb-1" style={{ color: color + 'bb' }}>
                  {label} Phase
                </p>
              )}
              <h2 className="font-cinzel text-ivory leading-tight mb-2" style={{ fontSize: '20px' }}>
                {content?.headline ?? 'Your Wellness Journey'}
              </h2>
              <p className="font-garamond text-sm leading-relaxed" style={{ color: 'rgba(244,239,230,0.55)' }}>
                {content?.description ?? 'Set up your cycle in Settings to unlock phase-aware guidance.'}
              </p>
            </div>
            {dayOfCycle && color && (
              <CycleArc day={dayOfCycle} total={cycleLength} color={color} />
            )}
          </div>
          <button
            onClick={() => navigate(content ? '/cycle' : '/settings')}
            className="font-cinzel uppercase transition-opacity hover:opacity-100"
            style={{ marginTop: '16px', fontSize: '9px', letterSpacing: '0.3em', color, opacity: 0.55, borderBottom: `1px solid ${color ? color + '40' : 'transparent'}`, paddingBottom: '1px' }}
          >
            {content ? 'View Cycle Guide →' : 'Set Up Cycle →'}
          </button>
        </div>

        {/* Weather strip */}
        {weather && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10" style={anim(0.11)}>
            <Wind size={13} style={{ color: 'rgba(244,239,230,0.3)', flexShrink: 0 }} />
            <p className="font-garamond text-xs tracking-wide" style={{ color: 'rgba(244,239,230,0.45)' }}>
              {weather.temp}°F · UV {weather.uv} {uvLabel(weather.uv)}
            </p>
          </div>
        )}

        {/* Module grid */}
        <div className="grid grid-cols-2 gap-3">
          {MODULE_CARDS.map(({ key, label: mLabel, Icon, to, tipKey }, i) => (
            <button
              key={key}
              onClick={() => navigate(to)}
              className="text-left rounded-2xl p-4 bg-white/5 backdrop-blur-md border border-white/10 active:scale-[0.97] transition-transform"
              style={anim(0.14 + i * 0.055)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: color ? `${color}18` : 'rgba(255,255,255,0.06)' }}>
                  <Icon size={15} strokeWidth={1.5} style={{ color: color ?? 'rgba(244,239,230,0.5)' }} />
                </div>
                <span style={{ color: 'rgba(244,239,230,0.2)', fontSize: '16px', lineHeight: 1 }}>›</span>
              </div>
              <p className="font-cinzel text-[10px] text-ivory/80 tracking-widest uppercase mb-1">{mLabel}</p>
              <p className="font-garamond text-[11px] leading-snug" style={{ color: 'rgba(244,239,230,0.38)' }}>
                {content && tipKey ? content[tipKey] : 'Explore your journey'}
              </p>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
