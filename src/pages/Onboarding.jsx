import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import heroImg from '../assets/athena-hero.webp'

// ─── Static data ──────────────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  { key: 'pilates',   emoji: '🎯', label: 'Pilates & movement'          },
  { key: 'cycle',     emoji: '◯',  label: 'Cycle & hormone awareness'   },
  { key: 'mood',      emoji: '☽',  label: 'Mood & mental wellness'      },
  { key: 'nutrition', emoji: '🌿', label: 'Nutrition & nourishment'     },
  { key: 'sleep',     emoji: '✦',  label: 'Sleep optimization'          },
  { key: 'skin',      emoji: '✿',  label: 'Skin & glow'                 },
  { key: 'community', emoji: '👥', label: 'Community & accountability'  },
  { key: 'wellness',  emoji: '✦',  label: 'Overall wellness & balance'  },
]

const LIFE_STAGE_OPTIONS = [
  'Regular cycles',
  'Trying to conceive (TTC)',
  'Postpartum / new mom',
  'Perimenopause / irregular cycles',
  'On hormonal birth control',
  'Prefer not to say',
]

const PHASE_OPTIONS = [
  { key: 'menstrual',  label: 'Menstrual',  sub: 'Days 1–5'  },
  { key: 'follicular', label: 'Follicular', sub: 'Days 6–13' },
  { key: 'ovulation',  label: 'Ovulation',  sub: 'Days 14–16' },
  { key: 'luteal',     label: 'Luteal',     sub: 'Days 17–28' },
]

const SYMPTOM_OPTIONS = [
  'Cramps', 'Bloating', 'Headaches', 'Fatigue',
  'Mood swings', 'Breast tenderness', 'Acne & skin changes',
  'Anxiety', 'Insomnia', 'Food cravings', 'Brain fog', 'Back pain',
]

const PILATES_LEVELS = [
  { key: 'beginner',     label: 'Complete beginner',  sub: "I'm brand new to Pilates" },
  { key: 'some',         label: 'Some experience',    sub: "I've done a few classes"  },
  { key: 'intermediate', label: 'Intermediate',       sub: 'I practice regularly'     },
  { key: 'advanced',     label: 'Advanced',           sub: 'Pilates is part of my lifestyle' },
]

const MOVEMENT_GOALS = [
  'Core strength', 'Glute sculpting', 'Full body tone', 'Flexibility & mobility',
  'Posture improvement', 'Stress relief & recovery', 'Weight management', 'Rehabilitation & recovery',
]

const SESSION_DURATIONS = ['15 min', '30 min', '45 min', 'Mix it up']

const EQUIPMENT_OPTIONS = [
  'Just my mat', 'Pilates ring', 'Exercise ball', 'Resistance bands', 'Light dumbbells',
]

const MOOD_BASELINES = [
  { key: 'stable',    label: 'Generally stable and positive'                },
  { key: 'cyclical',  label: 'Some ups and downs through my cycle'          },
  { key: 'noticeable',label: 'Noticeable mood shifts — affects my daily life'},
  { key: 'struggling',label: 'Struggling — I need real support'             },
  { key: 'unsure',    label: "I'm not sure yet"                             },
]

const MOOD_TRIGGERS = [
  'My cycle & hormones', 'Sleep quality', 'Stress & work',
  'Food & nutrition', 'Exercise', 'Relationships', 'Seasonal changes',
]

const SLEEP_BASELINES = [
  { key: 'great',    label: 'I sleep well consistently'                  },
  { key: 'mixed',    label: 'Hit or miss — good nights and bad'          },
  { key: 'struggle', label: 'I struggle to fall or stay asleep'          },
  { key: 'cyclical', label: 'My sleep shifts a lot with my cycle'        },
  { key: 'exhausted',label: 'I wake exhausted most days'                 },
]

const NUTRITION_OPTIONS = [
  { key: 'balanced',     label: 'Balanced and intentional'                          },
  { key: 'mostly',       label: 'Fairly healthy but could be better'                },
  { key: 'inconsistent', label: 'Inconsistent — good and bad periods'               },
  { key: 'complicated',  label: 'I have a complicated relationship with food'       },
  { key: 'specific',     label: 'I follow a specific diet or approach'              },
]

const SKIN_OPTIONS = [
  'Generally clear', 'Oily or combination', 'Dry or sensitive',
  'Breakout-prone pre-period', 'Changes with my cycle', 'Glowing most of the time',
]

const THEMES = [
  { key: 'obsidian', name: 'Obsidian', swatch: ['#060404', '#1A1614', '#C9A86C'] },
  { key: 'ash',      name: 'Ash',      swatch: ['#1C1C1E', '#2C2C2E', '#8E9AAF'] },
  { key: 'sepia',    name: 'Sepia',    swatch: ['#1A1209', '#2C1F0F', '#C4956A'] },
  { key: 'crimson',  name: 'Crimson',  swatch: ['#0D0507', '#1A0810', '#B5472A'] },
]

const AFFIRMATIONS = [
  null, // placeholder — replaced with "Welcome, [Name]. This is your space."
  'Your cycle is your superpower. We\'ve got you.',
  'Your studio is ready.',
  'Athena knows you now.',
]

const STEP_TITLES = [
  'Let\'s meet you',
  'Your rhythm',
  'Your studio',
  'Your whole self',
  null, // "Almost there, [Name]" — built dynamically
]

// ─── Small helpers ────────────────────────────────────────────────────────────

const GOLD = '#C9A86C'
const IVORY = 'rgba(244,239,230,0.85)'
const DIM = 'rgba(244,239,230,0.62)'

function toggleArr(arr, val, limit) {
  if (arr.includes(val)) return arr.filter(v => v !== val)
  if (limit && arr.length >= limit) return arr
  return [...arr, val]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CornerBrackets() {
  const b = '1px solid rgba(201,168,108,0.28)'
  const size = 18
  const shared = { position: 'absolute', width: size, height: size, pointerEvents: 'none' }
  return (
    <>
      <div style={{ ...shared, top: 14, left: 14, borderTop: b, borderLeft: b }} />
      <div style={{ ...shared, top: 14, right: 14, borderTop: b, borderRight: b }} />
      <div style={{ ...shared, bottom: 14, left: 14, borderBottom: b, borderLeft: b }} />
      <div style={{ ...shared, bottom: 14, right: 14, borderBottom: b, borderRight: b }} />
    </>
  )
}

function ProgressDots({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: '7px', justifyContent: 'center', alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === step ? '18px' : '6px',
          height: '6px',
          borderRadius: '3px',
          background: i <= step ? GOLD : 'rgba(244,239,230,0.15)',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </div>
  )
}

function ChipTag({ label, selected, onClick, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        padding: '8px 14px',
        borderRadius: '100px',
        border: `1px solid ${selected ? GOLD : 'rgba(244,239,230,0.2)'}`,
        background: selected ? 'rgba(201,168,108,0.18)' : 'rgba(255,255,255,0.07)',
        color: selected ? GOLD : DIM,
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '13px',
        letterSpacing: '0.04em',
        cursor: disabled && !selected ? 'not-allowed' : 'pointer',
        opacity: disabled && !selected ? 0.45 : 1,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function CardOption({ label, sub, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 16px',
        borderRadius: '14px',
        border: `1px solid ${selected ? GOLD : 'rgba(244,239,230,0.12)'}`,
        background: selected ? 'rgba(201,168,108,0.14)' : 'rgba(255,255,255,0.07)',
        marginBottom: '8px',
        transition: 'all 0.2s',
        boxShadow: selected ? `0 0 12px rgba(201,168,108,0.15)` : 'none',
      }}
    >
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: selected ? IVORY : DIM, margin: 0 }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '12px', color: 'rgba(244,239,230,0.3)', margin: '2px 0 0' }}>
          {sub}
        </p>
      )}
    </button>
  )
}

function EmojiGoalCard({ emoji, label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 10px',
        borderRadius: '16px',
        border: `1px solid ${selected ? GOLD : 'rgba(244,239,230,0.12)'}`,
        background: selected ? 'rgba(201,168,108,0.15)' : 'rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        transition: 'all 0.2s',
        boxShadow: selected ? `0 0 14px rgba(201,168,108,0.18)` : 'none',
      }}
    >
      <span style={{ fontSize: '20px' }}>{emoji}</span>
      <span style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '11px',
        textAlign: 'center',
        color: selected ? GOLD : DIM,
        lineHeight: 1.3,
        letterSpacing: '0.02em',
      }}>
        {label}
      </span>
    </button>
  )
}

function GoldSlider({ min, max, value, onChange, label }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: GOLD, fontWeight: 400 }}>
          {value} <span style={{ fontSize: '9px', color: DIM }}>days</span>
        </p>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: GOLD }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '11px', color: 'rgba(244,239,230,0.22)' }}>{min}</span>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '11px', color: 'rgba(244,239,230,0.22)' }}>{max}</span>
      </div>
    </div>
  )
}

function Stepper({ value, min, max, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', padding: '12px 0' }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          border: `1px solid rgba(201,168,108,0.3)`,
          background: 'transparent', color: GOLD, fontSize: '22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >−</button>
      <span style={{ fontFamily: 'Cinzel, serif', fontSize: '40px', color: GOLD, minWidth: 48, textAlign: 'center' }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 44, height: 44, borderRadius: '50%',
          border: `1px solid rgba(201,168,108,0.3)`,
          background: 'transparent', color: GOLD, fontSize: '22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >+</button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [affirmation, setAffirmation] = useState(null) // null | string
  const [showEntrance, setShowEntrance] = useState(false)
  const [showExiting, setShowExiting] = useState(false)
  const [periodUnknown, setPeriodUnknown] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [answers, setAnswers] = useState({
    full_name: '',
    date_of_birth: '',
    goals: [],
    last_period_date: '',
    last_period_phase: '',
    cycle_length: 28,
    period_duration: 5,
    life_stage: '',
    symptoms: [],
    pilates_level: '',
    movement_goals: [],
    session_duration: '',
    equipment: [],
    weekly_sessions: 3,
    mood_baseline: '',
    mood_triggers: [],
    sleep_baseline: '',
    nutrition_approach: '',
    skin_baseline: [],
    notifications_on: false,
    notification_time: '08:00',
    theme: 'obsidian',
    intention: '',
  })

  const { updateProfile } = useProfile()
  const { user } = useAuth()
  const navigate = useNavigate()
  const contentRef = useRef(null)

  // Lock all movement outside the scroll area; at scroll boundaries, block leak-through
  useEffect(() => {
    let lastY = 0
    const onStart = (e) => { lastY = e.touches[0]?.clientY ?? 0 }
    const prevent = (e) => {
      const el = contentRef.current
      if (el && el.contains(e.target)) {
        const curY = e.touches[0]?.clientY ?? 0
        const atTop    = el.scrollTop <= 0
        const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
        const goingUp  = curY > lastY   // finger moving down = content scrolling up
        const goingDown = curY < lastY
        lastY = curY
        if ((atTop && goingUp) || (atBottom && goingDown)) e.preventDefault()
        return
      }
      e.preventDefault()
    }
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove',  prevent,  { passive: false })
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove',  prevent)
    }
  }, [])

  function set(field, value) {
    setAnswers(a => ({ ...a, [field]: value }))
  }

  function tog(field, value, limit) {
    setAnswers(a => ({ ...a, [field]: toggleArr(a[field], value, limit) }))
  }

  function scrollTop() {
    if (contentRef.current) contentRef.current.scrollTop = 0
  }

  function advance() {
    scrollTop()
    if (step < 4) {
      // show affirmation then advance
      const text = step === 0
        ? `Welcome${answers.full_name ? `, ${answers.full_name.split(' ')[0]}` : ''}. This is your space.`
        : AFFIRMATIONS[step]
      setAffirmation(text)
      setTimeout(() => {
        setAffirmation(null)
        setStep(s => s + 1)
      }, 1700)
    }
  }

  function goBack() {
    if (step > 0) { scrollTop(); setStep(s => s - 1) }
  }

  async function finish() {
    if (saving) return
    setSaving(true)
    // Everything stored in preferences JSONB — only id + preferences + updated_at
    // are required columns, avoiding assumptions about the schema.
    const prefs = {
      full_name: answers.full_name || null,
      date_of_birth: answers.date_of_birth,
      last_period_date: answers.last_period_date || null,
      cycle_length: answers.cycle_length,
      period_duration: answers.period_duration,
      last_period_phase: answers.last_period_phase,
      life_stage: answers.life_stage,
      goals: answers.goals,
      symptoms: answers.symptoms,
      pilates_level: answers.pilates_level,
      movement_goals: answers.movement_goals,
      session_duration: answers.session_duration,
      equipment: answers.equipment,
      weekly_sessions: answers.weekly_sessions,
      mood_baseline: answers.mood_baseline,
      mood_triggers: answers.mood_triggers,
      sleep_baseline: answers.sleep_baseline,
      nutrition_approach: answers.nutrition_approach,
      skin_baseline: answers.skin_baseline,
      notifications_on: answers.notifications_on,
      notification_time: answers.notification_time,
      theme: answers.theme,
      intention: answers.intention,
      onboarding_done: true,
    }
    setSaveError(null)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      preferences: prefs,
      updated_at: new Date().toISOString(),
    })
    if (error) {
      setSaveError(error.message)
      setSaving(false)
      return
    }
    setShowEntrance(true)
    setTimeout(() => navigate('/', { replace: true }), 1600)
  }

  function handleExit() {
    setShowExiting(true)
    setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    }, 900)
  }

  const stepTitle = step === 4
    ? `Almost there${answers.full_name ? `, ${answers.full_name.split(' ')[0]}` : ''}`
    : STEP_TITLES[step]

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes affirmIn {
          0%   { opacity: 0; transform: translateY(8px); }
          18%  { opacity: 1; transform: translateY(0); }
          82%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes entranceIn {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes exitFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .ob-scroll::-webkit-scrollbar { display: none; }
        .ob-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .athena-hero-img { filter: contrast(1.32) brightness(1.05) saturate(1.18); }
        @media (min-width: 769px) {
          .athena-hero-img { filter: contrast(1.06) brightness(1.02) saturate(1.06); }
        }
      `}</style>

      {/* ── Full-screen background ── */}
      <div style={{ position: 'fixed', inset: 0, background: '#060404', overflow: 'hidden' }}>
        <img src={heroImg} alt="" className="athena-hero-img" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'top',
        }} />
        {/* Top vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,4,4,0.62) 0%, transparent 40%)', pointerEvents: 'none' }} />
        {/* Bottom vignette — kept light so hero bleeds through the transparent card */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,4,4,0.45) 0%, rgba(6,4,4,0.22) 55%, transparent 100%)', pointerEvents: 'none' }} />

        {/* Corner brackets */}
        <CornerBrackets />

        {/* ── Top bar ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%', maxWidth: '430px',
            padding: 'calc(env(safe-area-inset-top) + 16px) 20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleExit}
                style={{
                  fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.3em',
                  color: 'rgba(244,239,230,0.28)', background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                EXIT
              </button>
            </div>
            <ProgressDots step={step} total={5} />
          </div>
        </div>

        {/* ── Affirmation overlay ── */}
        {affirmation && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(6,4,4,0.78)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            animation: 'affirmIn 1.7s ease forwards',
          }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: '20px',
              color: 'rgba(244,239,230,0.9)',
              textAlign: 'center',
              letterSpacing: '0.04em',
              lineHeight: 1.65,
              maxWidth: '270px',
              padding: '0 24px',
            }}>
              {affirmation}
            </p>
          </div>
        )}

        {/* ── Enter Athena screen ── */}
        {showEntrance && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 60,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: '#060404',
            animation: 'entranceIn 1.6s ease forwards',
          }}>
            <div style={{
              width: '44px', height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(201,168,108,0.6), transparent)',
              marginBottom: '16px',
            }} />
            <span style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(28px, 8vw, 50px)',
              letterSpacing: '0.26em',
              transform: 'scaleX(0.84)',
              display: 'block',
              backgroundImage: 'linear-gradient(90deg, rgba(205,198,186,0.82) 0%, rgba(205,198,186,0.82) 30%, rgba(255,255,255,1) 50%, rgba(205,198,186,0.82) 70%, rgba(205,198,186,0.82) 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              ATHENA
            </span>
          </div>
        )}

        {/* ── Glass card ── */}
        {!affirmation && !showEntrance && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%', maxWidth: '430px',
              maxHeight: '84svh',
              display: 'flex', flexDirection: 'column',
              background: 'rgba(6,4,4,0.12)',
              backdropFilter: 'blur(22px)',
              WebkitBackdropFilter: 'blur(22px)',
              borderTop: '1px solid rgba(201,168,108,0.32)',
              borderRadius: '28px 28px 0 0',
              animation: 'cardIn 0.35s ease both',
            }}
          >
            {/* Step header */}
            <div style={{ padding: '22px 22px 0', flexShrink: 0 }}>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.28em', color: 'rgba(201,168,108,0.55)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Step {step + 1} of 5
              </p>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: 'rgba(244,239,230,0.92)', letterSpacing: '0.06em', margin: 0 }}>
                {stepTitle}
              </h2>
            </div>

            {/* Scrollable questions */}
            <div key={step} ref={contentRef} className="ob-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '16px 22px 20px', animation: 'stepIn 0.28s ease both' }}>

              {/* ── STEP 0 ── */}
              {step === 0 && (
                <div>
                  {/* Q1 Name */}
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '8px' }}>
                      What's your name?
                    </p>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={answers.full_name}
                      onChange={e => set('full_name', e.target.value)}
                      style={{
                        width: '100%', background: 'transparent',
                        border: 'none', borderBottom: `1px solid ${answers.full_name ? 'rgba(201,168,108,0.65)' : 'rgba(255,255,255,0.15)'}`,
                        padding: '8px 0', color: 'rgba(244,239,230,0.9)',
                        fontFamily: 'Cormorant Garamond, serif', fontSize: '15px',
                        outline: 'none', caretColor: GOLD,
                        transition: 'border-color 0.3s',
                      }}
                    />
                  </div>

                  {/* Q2 DOB */}
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Date of birth
                    </p>
                    <input
                      type="date"
                      value={answers.date_of_birth}
                      onChange={e => set('date_of_birth', e.target.value)}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${answers.date_of_birth ? 'rgba(201,168,108,0.5)' : 'rgba(255,255,255,0.12)'}`,
                        borderRadius: '12px', padding: '11px 14px',
                        color: 'rgba(244,239,230,0.85)',
                        fontFamily: 'Cormorant Garamond, serif', fontSize: '14px',
                        outline: 'none', colorScheme: 'dark',
                      }}
                    />
                  </div>

                  {/* Q3 Goals */}
                  <div>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      What brings you to Athena? <span style={{ color: 'rgba(201,168,108,0.4)' }}>(select all that apply)</span>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {GOAL_OPTIONS.map(g => (
                        <EmojiGoalCard
                          key={g.key} emoji={g.emoji} label={g.label}
                          selected={answers.goals.includes(g.key)}
                          onClick={() => tog('goals', g.key)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div>
                  {/* Q4 Last period */}
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '4px' }}>
                      When did your last period start?
                    </p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '11px', color: 'rgba(201,168,108,0.45)', marginBottom: '10px' }}>
                      Required — used to calculate your current phase
                    </p>
                    {!periodUnknown ? (
                      <>
                        <input
                          type="date"
                          value={answers.last_period_date}
                          onChange={e => set('last_period_date', e.target.value)}
                          style={{
                            width: '100%', background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${answers.last_period_date ? 'rgba(201,168,108,0.5)' : 'rgba(255,255,255,0.12)'}`,
                            borderRadius: '12px', padding: '11px 14px',
                            color: 'rgba(244,239,230,0.85)',
                            fontFamily: 'Cormorant Garamond, serif', fontSize: '14px',
                            outline: 'none', colorScheme: 'dark',
                          }}
                        />
                        <button
                          onClick={() => setPeriodUnknown(true)}
                          style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '12px', color: 'rgba(244,239,230,0.3)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px', padding: 0 }}
                        >
                          I'm not sure — let me pick my phase instead
                        </button>
                      </>
                    ) : (
                      <>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '12px', color: DIM, marginBottom: '8px' }}>
                          Which phase are you likely in right now?
                        </p>
                        {PHASE_OPTIONS.map(p => (
                          <CardOption key={p.key} label={p.label} sub={p.sub}
                            selected={answers.last_period_phase === p.key}
                            onClick={() => set('last_period_phase', p.key)} />
                        ))}
                        <button
                          onClick={() => setPeriodUnknown(false)}
                          style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '12px', color: 'rgba(244,239,230,0.3)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px', padding: 0 }}
                        >
                          ← I know my last period date
                        </button>
                      </>
                    )}
                  </div>

                  {/* Q5 Cycle length */}
                  <GoldSlider min={21} max={35} value={answers.cycle_length}
                    onChange={v => set('cycle_length', v)} label="Typical cycle length" />

                  {/* Q6 Period duration */}
                  <GoldSlider min={2} max={8} value={answers.period_duration}
                    onChange={v => set('period_duration', v)} label="Period duration" />

                  {/* Q7 Life stage */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Current life stage
                    </p>
                    {LIFE_STAGE_OPTIONS.map(l => (
                      <CardOption key={l} label={l}
                        selected={answers.life_stage === l}
                        onClick={() => set('life_stage', l)} />
                    ))}
                  </div>

                  {/* Q8 Symptoms */}
                  <div>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '4px' }}>
                      Symptoms that affect you most
                    </p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '11px', color: 'rgba(201,168,108,0.4)', marginBottom: '10px' }}>
                      Select up to 5
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {SYMPTOM_OPTIONS.map(s => (
                        <ChipTag key={s} label={s}
                          selected={answers.symptoms.includes(s)}
                          disabled={answers.symptoms.length >= 5 && !answers.symptoms.includes(s)}
                          onClick={() => tog('symptoms', s, 5)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div>
                  {/* Q9 Pilates level */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Pilates experience level
                    </p>
                    {PILATES_LEVELS.map(l => (
                      <CardOption key={l.key} label={l.label} sub={l.sub}
                        selected={answers.pilates_level === l.key}
                        onClick={() => set('pilates_level', l.key)} />
                    ))}
                  </div>

                  {/* Q10 Movement goals */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '4px' }}>
                      Main movement goals
                    </p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '11px', color: 'rgba(201,168,108,0.4)', marginBottom: '10px' }}>
                      Select up to 3
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {MOVEMENT_GOALS.map(g => (
                        <ChipTag key={g} label={g}
                          selected={answers.movement_goals.includes(g)}
                          disabled={answers.movement_goals.length >= 3 && !answers.movement_goals.includes(g)}
                          onClick={() => tog('movement_goals', g, 3)} />
                      ))}
                    </div>
                  </div>

                  {/* Q11 Session duration */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Time per session
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {SESSION_DURATIONS.map(d => (
                        <ChipTag key={d} label={d}
                          selected={answers.session_duration === d}
                          onClick={() => set('session_duration', d)} />
                      ))}
                    </div>
                  </div>

                  {/* Q12 Equipment */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Equipment you have
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {EQUIPMENT_OPTIONS.map(e => (
                        <ChipTag key={e} label={e}
                          selected={answers.equipment.includes(e)}
                          onClick={() => tog('equipment', e)} />
                      ))}
                    </div>
                  </div>

                  {/* Q13 Weekly sessions */}
                  <div>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '4px' }}>
                      Days per week to move
                    </p>
                    <Stepper value={answers.weekly_sessions} min={1} max={7}
                      onChange={v => set('weekly_sessions', v)} />
                  </div>
                </div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <div>
                  {/* Q14 Mood baseline */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Typical mood patterns
                    </p>
                    {MOOD_BASELINES.map(m => (
                      <CardOption key={m.key} label={m.label}
                        selected={answers.mood_baseline === m.key}
                        onClick={() => set('mood_baseline', m.key)} />
                    ))}
                  </div>

                  {/* Q15 Mood triggers */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '4px' }}>
                      What affects your mood most?
                    </p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '11px', color: 'rgba(201,168,108,0.4)', marginBottom: '10px' }}>
                      Select up to 3
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {MOOD_TRIGGERS.map(t => (
                        <ChipTag key={t} label={t}
                          selected={answers.mood_triggers.includes(t)}
                          disabled={answers.mood_triggers.length >= 3 && !answers.mood_triggers.includes(t)}
                          onClick={() => tog('mood_triggers', t, 3)} />
                      ))}
                    </div>
                  </div>

                  {/* Q16 Sleep */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      How is your sleep right now?
                    </p>
                    {SLEEP_BASELINES.map(s => (
                      <CardOption key={s.key} label={s.label}
                        selected={answers.sleep_baseline === s.key}
                        onClick={() => set('sleep_baseline', s.key)} />
                    ))}
                  </div>

                  {/* Q17 Nutrition */}
                  <div style={{ marginBottom: '18px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Your eating habits
                    </p>
                    {NUTRITION_OPTIONS.map(n => (
                      <CardOption key={n.key} label={n.label}
                        selected={answers.nutrition_approach === n.key}
                        onClick={() => set('nutrition_approach', n.key)} />
                    ))}
                  </div>

                  {/* Q18 Skin */}
                  <div>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '10px' }}>
                      How is your skin generally?
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {SKIN_OPTIONS.map(s => (
                        <ChipTag key={s} label={s}
                          selected={answers.skin_baseline.includes(s)}
                          onClick={() => tog('skin_baseline', s)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 4 ── */}
              {step === 4 && (
                <div>
                  {/* Q19 Notifications */}
                  <div style={{ marginBottom: '22px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '12px' }}>
                      Daily check-in reminder
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: IVORY }}>
                        Enable reminders
                      </span>
                      {/* Toggle */}
                      <button
                        onClick={() => set('notifications_on', !answers.notifications_on)}
                        style={{
                          width: '44px', height: '24px', borderRadius: '12px',
                          background: answers.notifications_on ? 'rgba(201,168,108,0.7)' : 'rgba(255,255,255,0.1)',
                          border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: '3px',
                          left: answers.notifications_on ? '23px' : '3px',
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: 'rgba(244,239,230,0.9)',
                          transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }} />
                      </button>
                    </div>
                    {answers.notifications_on && (
                      <div>
                        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.2em', color: DIM, textTransform: 'uppercase', marginBottom: '8px' }}>
                          Reminder time
                        </p>
                        <input
                          type="time"
                          value={answers.notification_time}
                          onChange={e => set('notification_time', e.target.value)}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(201,168,108,0.35)',
                            borderRadius: '12px', padding: '10px 14px',
                            color: GOLD, fontFamily: 'Cinzel, serif', fontSize: '16px',
                            outline: 'none', colorScheme: 'dark',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Q20 Theme */}
                  <div style={{ marginBottom: '22px' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '12px' }}>
                      Choose your Athena theme
                    </p>
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {THEMES.map(t => (
                        <button
                          key={t.key}
                          onClick={() => set('theme', t.key)}
                          style={{
                            flexShrink: 0, width: '80px',
                            border: `1px solid ${answers.theme === t.key ? GOLD : 'rgba(255,255,255,0.12)'}`,
                            borderRadius: '14px', overflow: 'hidden', background: 'none',
                            boxShadow: answers.theme === t.key ? `0 0 16px rgba(201,168,108,0.3)` : 'none',
                            cursor: 'pointer', transition: 'all 0.25s',
                          }}
                        >
                          {/* Swatch */}
                          <div style={{ height: '48px', display: 'flex' }}>
                            {t.swatch.map((c, i) => (
                              <div key={i} style={{ flex: 1, background: c }} />
                            ))}
                          </div>
                          <div style={{ padding: '6px 4px', background: 'rgba(6,4,4,0.7)' }}>
                            <p style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', letterSpacing: '0.18em', color: answers.theme === t.key ? GOLD : DIM, textAlign: 'center' }}>
                              {t.name.toUpperCase()}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q21 Intention */}
                  <div>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: '9px', letterSpacing: '0.22em', color: DIM, textTransform: 'uppercase', marginBottom: '4px' }}>
                      What's one thing you want to feel in 30 days?
                    </p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '11px', color: 'rgba(201,168,108,0.4)', marginBottom: '10px' }}>
                      Optional — but powerful
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. stronger, calmer, more in tune with my body..."
                      value={answers.intention}
                      onChange={e => set('intention', e.target.value)}
                      style={{
                        width: '100%', background: 'transparent',
                        border: 'none', borderBottom: `1px solid ${answers.intention ? 'rgba(201,168,108,0.5)' : 'rgba(255,255,255,0.15)'}`,
                        padding: '8px 0', color: 'rgba(244,239,230,0.85)',
                        fontFamily: 'Cormorant Garamond, serif', fontSize: '14px',
                        outline: 'none', caretColor: GOLD, transition: 'border-color 0.3s',
                      }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* ── Bottom actions ── */}
            <div style={{
              padding: '14px 22px',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)',
              flexShrink: 0,
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              {/* Save error */}
              {saveError && (
                <p style={{
                  fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
                  fontSize: '12px', color: 'rgba(190,80,80,0.9)',
                  textAlign: 'center', marginBottom: '10px', letterSpacing: '0.02em',
                }}>
                  {saveError}
                </p>
              )}

              {/* CTA button — shimmer ACCESS style */}
              <button
                onClick={step === 4 ? finish : advance}
                disabled={saving}
                style={{
                  width: '100%', padding: '14px',
                  background: 'transparent',
                  border: '1px solid rgba(201,168,108,0.52)',
                  borderRadius: '2px', cursor: 'pointer',
                  marginBottom: '10px',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <span style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.38em',
                  backgroundImage: 'linear-gradient(90deg, rgba(205,198,186,0.82) 0%, rgba(205,198,186,0.82) 30%, rgba(255,255,255,1) 50%, rgba(205,198,186,0.82) 70%, rgba(205,198,186,0.82) 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 5s linear infinite',
                  display: 'inline-block',
                }}>
                  {saving ? 'SAVING...' : step === 4 ? 'ENTER ATHENA' : 'CONTINUE'}
                </span>
              </button>

              {/* Skip — not shown on step 1 (Q4 required) */}
              {step !== 1 && (
                <button
                  onClick={step === 4 ? finish : advance}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic', fontSize: '13px',
                    color: 'rgba(244,239,230,0.28)', cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}
                >
                  Skip
                </button>
              )}
            </div>
          </div>
          </div>
        )}

        {/* ── Exit fade overlay ── */}
        {showExiting && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: '#060404',
            animation: 'exitFade 0.9s ease forwards',
            pointerEvents: 'none',
          }} />
        )}
      </div>
    </>
  )
}
