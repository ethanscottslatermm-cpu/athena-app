import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../lib/supabase'
import { ChevronLeft, X } from 'lucide-react'

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  'name', 'goal', 'cycle', 'symptoms',
  'pilates', 'nourish', 'sleep', 'skin', 'mood', 'done',
]

const GOAL_OPTIONS = [
  { key: 'cycle',     label: 'Track my cycle',        emoji: '🌙' },
  { key: 'fitness',   label: 'Build strength',         emoji: '💪' },
  { key: 'nutrition', label: 'Eat better',             emoji: '🌿' },
  { key: 'sleep',     label: 'Sleep better',           emoji: '✨' },
  { key: 'skin',      label: 'Glow up my skin',        emoji: '🪷' },
  { key: 'mind',      label: 'Manage stress & mood',   emoji: '🧘' },
  { key: 'all',       label: 'All of the above',       emoji: '👑' },
]

const SYMPTOM_OPTIONS = [
  'Cramps', 'Bloating', 'Mood swings', 'Fatigue',
  'Headaches', 'Acne breakouts', 'Back pain', 'Food cravings',
  'Breast tenderness', 'Insomnia', 'Anxiety', 'Low energy',
  'Heavy flow', 'Irregular cycle', 'Spotting',
]

const FITNESS_LEVELS = [
  { key: 'beginner',     label: 'Beginner',     sub: 'New to pilates & structured workouts' },
  { key: 'intermediate', label: 'Intermediate', sub: 'Some experience, building consistency' },
  { key: 'advanced',     label: 'Advanced',     sub: 'Regular training, ready to push' },
]

const FITNESS_GOALS = [
  'Core strength', 'Flexibility', 'Posture', 'Weight management',
  'Endurance', 'Stress relief', 'Post-natal recovery', 'Injury rehab',
]

const FREQUENCY_OPTIONS = [
  { key: '1-2', label: '1–2×  week', sub: 'Light & steady' },
  { key: '3-4', label: '3–4×  week', sub: 'Building habits' },
  { key: '5+',  label: '5+×  week',  sub: 'Committed & consistent' },
]

const DIET_OPTIONS = [
  { key: 'none',        label: 'No restrictions' },
  { key: 'vegetarian',  label: 'Vegetarian' },
  { key: 'vegan',       label: 'Vegan' },
  { key: 'gluten_free', label: 'Gluten-free' },
  { key: 'dairy_free',  label: 'Dairy-free' },
  { key: 'paleo',       label: 'Paleo' },
  { key: 'other',       label: 'Other' },
]

const NUTRITION_GOALS = [
  'Hormone balance', 'More energy', 'Gut health',
  'Reduce inflammation', 'Weight management', 'Nutrient-dense eating',
]

const SLEEP_OPTIONS = [
  { key: 'under5', label: 'Under 5 hrs' },
  { key: '5-6',    label: '5–6 hrs'     },
  { key: '6-7',    label: '6–7 hrs'     },
  { key: '7-8',    label: '7–8 hrs'     },
  { key: '8plus',  label: '8+ hrs'      },
]

const SLEEP_GOALS = [
  'Fall asleep faster', 'Stay asleep longer', 'Wake refreshed',
  'Reduce screen time', 'Build a wind-down ritual', 'Track patterns',
]

const SKIN_TYPES = [
  { key: 'dry',         label: 'Dry',         sub: 'Tight, flaky, or dull' },
  { key: 'oily',        label: 'Oily',         sub: 'Shine-prone, enlarged pores' },
  { key: 'combination', label: 'Combination',  sub: 'Oily T-zone, dry elsewhere' },
  { key: 'sensitive',   label: 'Sensitive',    sub: 'Reactive, redness-prone' },
  { key: 'normal',      label: 'Normal',       sub: 'Balanced, generally clear' },
]

const SKIN_CONCERNS = [
  'Acne & breakouts', 'Dryness', 'Anti-aging', 'Redness',
  'Dark spots', 'Dullness', 'Large pores', 'Sensitivity',
  'Hormonal breakouts', 'Uneven texture',
]

const STRESS_LEVELS = [
  { key: 'low',    label: 'Low',      sub: 'Generally calm & balanced'       },
  { key: 'medium', label: 'Moderate', sub: 'Some daily stress to manage'     },
  { key: 'high',   label: 'High',     sub: 'Often overwhelmed or anxious'    },
]

const MINDFULNESS_OPTIONS = [
  'Meditation', 'Journaling', 'Breathwork', 'Affirmations',
  'Movement therapy', 'Nature walks', 'Digital detox', 'Therapy / coaching',
]

// ─── Component helpers ────────────────────────────────────────────────────────

function Chip({ label, selected, onClick, sub }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200 active:scale-[0.98]"
      style={{
        background: selected ? 'rgba(201,168,108,0.15)' : 'rgba(255,255,255,0.04)',
        borderColor: selected ? 'rgba(201,168,108,0.7)' : 'rgba(255,255,255,0.1)',
      }}
    >
      <span className="font-garamond text-sm" style={{ color: selected ? 'rgba(201,168,108,0.95)' : 'rgba(244,239,230,0.7)' }}>
        {label}
      </span>
      {sub && (
        <p className="font-garamond text-xs mt-0.5" style={{ color: 'rgba(244,239,230,0.35)' }}>{sub}</p>
      )}
    </button>
  )
}

function Tag({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-full border text-xs font-garamond transition-all duration-200 active:scale-95"
      style={{
        background: selected ? 'rgba(201,168,108,0.18)' : 'rgba(255,255,255,0.04)',
        borderColor: selected ? 'rgba(201,168,108,0.65)' : 'rgba(255,255,255,0.1)',
        color: selected ? 'rgba(201,168,108,0.95)' : 'rgba(244,239,230,0.55)',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </button>
  )
}

function EmojiCard({ emoji, label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all duration-200 active:scale-95"
      style={{
        background: selected ? 'rgba(201,168,108,0.15)' : 'rgba(255,255,255,0.04)',
        borderColor: selected ? 'rgba(201,168,108,0.65)' : 'rgba(255,255,255,0.1)',
      }}
    >
      <span style={{ fontSize: '24px' }}>{emoji}</span>
      <span className="font-garamond text-xs text-center px-2 leading-tight"
        style={{ color: selected ? 'rgba(201,168,108,0.9)' : 'rgba(244,239,230,0.6)' }}>
        {label}
      </span>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1) // 1 = forward, -1 = back
  const [data, setData] = useState({
    full_name: '',
    primary_goal: [],
    last_period_date: '',
    cycle_length: 28,
    period_duration: 5,
    symptoms: [],
    fitness_level: '',
    fitness_goals: [],
    workout_frequency: '',
    diet_type: '',
    nutrition_goals: [],
    sleep_hours: '',
    sleep_goals: [],
    skin_type: '',
    skin_concerns: [],
    stress_level: '',
    mindfulness_interests: [],
  })

  const { updateProfile } = useProfile()
  const navigate = useNavigate()
  const totalSteps = STEPS.length - 1 // exclude 'done'

  function toggle(field, value) {
    setData(d => ({
      ...d,
      [field]: d[field].includes(value)
        ? d[field].filter(v => v !== value)
        : [...d[field], value],
    }))
  }

  function set(field, value) {
    setData(d => ({ ...d, [field]: value }))
  }

  function next() {
    setDir(1)
    setStep(s => s + 1)
  }

  function back() {
    if (step === 0) return
    setDir(-1)
    setStep(s => s - 1)
  }

  async function finish() {
    const { full_name, last_period_date, cycle_length, primary_goal, ...rest } = data
    await updateProfile({
      full_name,
      last_period_date: last_period_date || null,
      cycle_length,
      goals: primary_goal,
      preferences: rest,
      onboarding_done: true,
    })
    navigate('/', { replace: true })
  }

  async function handleExit() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const current = STEPS[step]
  const progress = step / totalSteps

  return (
    <div className="min-h-screen bg-[#060404] flex flex-col">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(${dir > 0 ? '28px' : '-28px'}); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .step-in { animation: slideIn 0.3s ease both; }
      `}</style>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-safe-top pt-6 pb-4 flex-shrink-0">
        {step > 0 && current !== 'done' ? (
          <button onClick={back} className="p-1 -ml-1">
            <ChevronLeft size={22} strokeWidth={1.4} style={{ color: 'rgba(244,239,230,0.45)' }} />
          </button>
        ) : (
          <div style={{ width: 30 }} />
        )}

        {current !== 'done' && (
          <span className="font-garamond text-xs tracking-widest" style={{ color: 'rgba(244,239,230,0.3)' }}>
            {step + 1} of {totalSteps}
          </span>
        )}

        <button onClick={handleExit} className="p-1 -mr-1">
          <X size={18} strokeWidth={1.4} style={{ color: 'rgba(244,239,230,0.3)' }} />
        </button>
      </div>

      {/* ── Progress bar ── */}
      {current !== 'done' && (
        <div className="px-5 mb-6 flex-shrink-0">
          <div className="h-[2px] rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%`, background: 'rgba(201,168,108,0.75)' }}
            />
          </div>
        </div>
      )}

      {/* ── Step content ── */}
      <div key={step} className="step-in flex-1 overflow-y-auto px-5 pb-32 max-w-md mx-auto w-full">

        {/* STEP 0 — Name */}
        {current === 'name' && (
          <div className="space-y-6">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Welcome to Athena</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">What should we call you?</h2>
            </div>
            <input
              type="text"
              placeholder="Your name"
              value={data.full_name}
              onChange={e => set('full_name', e.target.value)}
              autoFocus
              className="w-full bg-transparent border-b py-3 text-ivory font-garamond text-base placeholder-white/25 focus:outline-none transition-colors"
              style={{ borderColor: data.full_name ? 'rgba(201,168,108,0.7)' : 'rgba(255,255,255,0.15)', caretColor: '#C9A86C' }}
            />
          </div>
        )}

        {/* STEP 1 — Primary goal */}
        {current === 'goal' && (
          <div className="space-y-5">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Your goals</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">What brings you to Athena?</h2>
              <p className="font-garamond text-sm mt-2" style={{ color: 'rgba(244,239,230,0.4)' }}>Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map(g => (
                <EmojiCard
                  key={g.key}
                  emoji={g.emoji}
                  label={g.label}
                  selected={data.primary_goal.includes(g.key)}
                  onClick={() => toggle('primary_goal', g.key)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Cycle */}
        {current === 'cycle' && (
          <div className="space-y-6">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Your cycle</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">Tell us about your cycle</h2>
              <p className="font-garamond text-sm mt-2" style={{ color: 'rgba(244,239,230,0.4)' }}>This powers everything phase-aware in Athena</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="font-cinzel text-[10px] tracking-widest uppercase mb-2 block" style={{ color: 'rgba(244,239,230,0.4)' }}>
                  First day of last period
                </label>
                <input
                  type="date"
                  value={data.last_period_date}
                  onChange={e => set('last_period_date', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory font-garamond focus:outline-none focus:border-gold/60"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="font-cinzel text-[10px] tracking-widest uppercase mb-3 block" style={{ color: 'rgba(244,239,230,0.4)' }}>
                  Cycle length — {data.cycle_length} days
                </label>
                <input type="range" min="21" max="40" value={data.cycle_length}
                  onChange={e => set('cycle_length', Number(e.target.value))}
                  className="w-full accent-gold" />
                <div className="flex justify-between mt-1">
                  <span className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.25)' }}>21 days</span>
                  <span className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.25)' }}>40 days</span>
                </div>
              </div>

              <div>
                <label className="font-cinzel text-[10px] tracking-widest uppercase mb-3 block" style={{ color: 'rgba(244,239,230,0.4)' }}>
                  Period duration — {data.period_duration} days
                </label>
                <input type="range" min="2" max="10" value={data.period_duration}
                  onChange={e => set('period_duration', Number(e.target.value))}
                  className="w-full accent-gold" />
                <div className="flex justify-between mt-1">
                  <span className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.25)' }}>2 days</span>
                  <span className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.25)' }}>10 days</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Symptoms */}
        {current === 'symptoms' && (
          <div className="space-y-5">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Cycle symptoms</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">What do you typically experience?</h2>
              <p className="font-garamond text-sm mt-2" style={{ color: 'rgba(244,239,230,0.4)' }}>Select all that apply — we'll use this to personalise your guidance</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map(s => (
                <Tag key={s} label={s} selected={data.symptoms.includes(s)} onClick={() => toggle('symptoms', s)} />
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 — Pilates */}
        {current === 'pilates' && (
          <div className="space-y-6">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Movement & pilates</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">Your fitness profile</h2>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Experience level</p>
              <div className="space-y-2">
                {FITNESS_LEVELS.map(l => (
                  <Chip key={l.key} label={l.label} sub={l.sub}
                    selected={data.fitness_level === l.key}
                    onClick={() => set('fitness_level', l.key)} />
                ))}
              </div>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Your goals</p>
              <div className="flex flex-wrap gap-2">
                {FITNESS_GOALS.map(g => (
                  <Tag key={g} label={g} selected={data.fitness_goals.includes(g)} onClick={() => toggle('fitness_goals', g)} />
                ))}
              </div>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Ideal frequency</p>
              <div className="space-y-2">
                {FREQUENCY_OPTIONS.map(f => (
                  <Chip key={f.key} label={f.label} sub={f.sub}
                    selected={data.workout_frequency === f.key}
                    onClick={() => set('workout_frequency', f.key)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 — Nourish */}
        {current === 'nourish' && (
          <div className="space-y-6">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Nourishment</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">Your relationship with food</h2>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Dietary preference</p>
              <div className="grid grid-cols-2 gap-2">
                {DIET_OPTIONS.map(d => (
                  <Chip key={d.key} label={d.label}
                    selected={data.diet_type === d.key}
                    onClick={() => set('diet_type', d.key)} />
                ))}
              </div>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Nutrition goals</p>
              <div className="flex flex-wrap gap-2">
                {NUTRITION_GOALS.map(g => (
                  <Tag key={g} label={g} selected={data.nutrition_goals.includes(g)} onClick={() => toggle('nutrition_goals', g)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 — Sleep */}
        {current === 'sleep' && (
          <div className="space-y-6">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Rest & recovery</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">How's your sleep?</h2>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Average nightly sleep</p>
              <div className="grid grid-cols-2 gap-2">
                {SLEEP_OPTIONS.map(o => (
                  <Chip key={o.key} label={o.label}
                    selected={data.sleep_hours === o.key}
                    onClick={() => set('sleep_hours', o.key)} />
                ))}
              </div>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Sleep goals</p>
              <div className="flex flex-wrap gap-2">
                {SLEEP_GOALS.map(g => (
                  <Tag key={g} label={g} selected={data.sleep_goals.includes(g)} onClick={() => toggle('sleep_goals', g)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7 — Skin */}
        {current === 'skin' && (
          <div className="space-y-6">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Skin & glow</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">Your skin profile</h2>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Skin type</p>
              <div className="space-y-2">
                {SKIN_TYPES.map(t => (
                  <Chip key={t.key} label={t.label} sub={t.sub}
                    selected={data.skin_type === t.key}
                    onClick={() => set('skin_type', t.key)} />
                ))}
              </div>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Skin concerns</p>
              <div className="flex flex-wrap gap-2">
                {SKIN_CONCERNS.map(c => (
                  <Tag key={c} label={c} selected={data.skin_concerns.includes(c)} onClick={() => toggle('skin_concerns', c)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 8 — Mood */}
        {current === 'mood' && (
          <div className="space-y-6">
            <div>
              <p className="font-garamond italic text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,108,0.6)' }}>Mind & mood</p>
              <h2 className="font-cinzel text-2xl text-ivory leading-snug">Your mental wellness</h2>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>Current stress level</p>
              <div className="space-y-2">
                {STRESS_LEVELS.map(l => (
                  <Chip key={l.key} label={l.label} sub={l.sub}
                    selected={data.stress_level === l.key}
                    onClick={() => set('stress_level', l.key)} />
                ))}
              </div>
            </div>

            <div>
              <p className="font-cinzel text-[10px] tracking-widest uppercase mb-3" style={{ color: 'rgba(244,239,230,0.38)' }}>What resonates with you?</p>
              <div className="flex flex-wrap gap-2">
                {MINDFULNESS_OPTIONS.map(o => (
                  <Tag key={o} label={o} selected={data.mindfulness_interests.includes(o)} onClick={() => toggle('mindfulness_interests', o)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 9 — Done */}
        {current === 'done' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 px-4">
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(201,168,108,0.12)',
              border: '1px solid rgba(201,168,108,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px',
            }}>
              👑
            </div>
            <div>
              <h2 className="font-cinzel text-3xl text-gold mb-3">
                {data.full_name ? `You're ready, ${data.full_name.split(' ')[0]}.` : 'You\'re ready.'}
              </h2>
              <p className="font-garamond text-ivory/50 text-base leading-relaxed">
                Athena will guide you through every phase — movement, nourishment, skin, sleep, and mind.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ── Bottom nav ── */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 max-w-md mx-auto"
        style={{ background: 'linear-gradient(to top, #060404 70%, transparent)' }}>
        <div className="flex gap-3">
          {step > 0 && current !== 'done' && (
            <button
              onClick={back}
              className="flex-1 border border-white/10 font-cinzel text-[11px] tracking-widest uppercase py-4 rounded-2xl transition-colors"
              style={{ color: 'rgba(244,239,230,0.4)' }}
            >
              Back
            </button>
          )}
          <button
            onClick={current === 'done' ? finish : next}
            className="flex-1 font-cinzel text-[11px] tracking-widest uppercase py-4 rounded-2xl transition-all active:scale-[0.98]"
            style={{ background: 'rgba(201,168,108,0.9)', color: '#060404' }}
          >
            {current === 'done' ? 'Enter Athena' : step === 0 && !data.full_name ? 'Skip' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
