import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Droplets, Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' }
const TOTAL_GLASSES = 8
const GOAL_CAL = 2000

// ── Macro ring ────────────────────────────────────────────────────────────────

function MacroRing({ totalCal, protein, carbs, fat }) {
  const R    = 46
  const CIRC = 2 * Math.PI * R
  const pct  = Math.min(totalCal / GOAL_CAL, 1)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 20,
      padding: '16px 16px 14px',
      border: '1px solid rgba(196,175,168,0.35)',
      marginBottom: 14,
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: '#7A6A65' }}>
        Today's Macros
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Ring */}
        <svg width={108} height={108} viewBox="0 0 108 108" style={{ flexShrink: 0 }}>
          <circle cx={54} cy={54} r={R} fill="none"
            stroke="rgba(196,175,168,0.28)" strokeWidth={9} />
          <circle cx={54} cy={54} r={R} fill="none"
            stroke="#8FA58C"
            strokeWidth={9}
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC - pct * CIRC}
            strokeLinecap="round"
            transform="rotate(-90 54 54)"
            style={{ transition: 'stroke-dashoffset 0.9s ease' }}
          />
          <text x={54} y={50} textAnchor="middle"
            style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 700, fill: '#3B3330' }}>
            {totalCal}
          </text>
          <text x={54} y={64} textAnchor="middle"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 10, fill: '#7A6A65' }}>
            of {GOAL_CAL} cal
          </text>
        </svg>

        {/* Macro pills */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Protein', value: protein, color: '#8FA58C', bg: 'rgba(143,165,140,0.18)' },
            { label: 'Carbs',   value: carbs,   color: '#C9A84C', bg: 'rgba(201,168,76,0.15)'  },
            { label: 'Fat',     value: fat,     color: '#C4859A', bg: 'rgba(196,133,154,0.18)' },
          ].map(m => (
            <div key={m.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: m.bg, borderRadius: 10,
              padding: '5px 10px',
              border: `1px solid ${m.color}44`,
            }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: m.color }}>
                {m.label}
              </span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontWeight: 600, color: '#3B3330' }}>
                {Math.round(m.value)}g
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Phase banner ──────────────────────────────────────────────────────────────

function PhaseBanner({ label, dayOfCycle, tip, loading }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(143,165,140,0.28) 0%, rgba(143,165,140,0.08) 100%)',
      border: '1px solid rgba(143,165,140,0.4)',
      borderRadius: 16, padding: '12px 14px', marginBottom: 14,
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.25em] uppercase mb-1.5" style={{ color: '#8FA58C' }}>
        {label ? `${label} · Day ${dayOfCycle ?? '—'}` : 'Cycle Phase'}
      </p>
      <p className="font-garamond text-sm leading-snug"
        style={{ color: loading ? 'rgba(59,51,48,0.35)' : '#3B3330', fontStyle: loading ? 'italic' : 'normal', transition: 'color 0.3s' }}>
        {loading ? 'Gathering your phase insight…' : (tip || 'Nourish yourself with intention today.')}
      </p>
    </div>
  )
}

// ── Meal section ──────────────────────────────────────────────────────────────

function MealSection({ type, items }) {
  const [open, setOpen] = useState(true)

  const subtotalCal     = items.reduce((s, i) => s + (i.calories  || 0), 0)
  const subtotalProtein = items.reduce((s, i) => s + (i.protein_g || 0), 0)
  const subtotalCarbs   = items.reduce((s, i) => s + (i.carbs_g   || 0), 0)
  const subtotalFat     = items.reduce((s, i) => s + (i.fat_g     || 0), 0)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16,
      border: '1px solid rgba(196,175,168,0.35)',
      marginBottom: 10, overflow: 'hidden',
    }}>
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 14px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {open
            ? <ChevronDown  size={13} color="#7A6A65" strokeWidth={1.5} />
            : <ChevronRight size={13} color="#7A6A65" strokeWidth={1.5} />}
          <span className="font-cinzel text-[9px] tracking-[0.22em] uppercase" style={{ color: '#3B3330' }}>
            {MEAL_LABELS[type]}
          </span>
        </div>
        {subtotalCal > 0 && (
          <span className="font-garamond text-xs" style={{ color: '#7A6A65' }}>
            {Math.round(subtotalCal)} cal
          </span>
        )}
      </button>

      {open && (
        <div style={{ paddingBottom: 10 }}>
          {items.length === 0 ? (
            <p className="font-garamond text-xs italic px-4 pb-2" style={{ color: 'rgba(122,106,101,0.5)' }}>
              Nothing logged yet
            </p>
          ) : (
            <>
              {items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '5px 14px',
                  borderTop: i === 0 ? '1px solid rgba(196,175,168,0.2)' : 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-garamond text-sm" style={{ color: '#3B3330', marginBottom: 1 }}>
                      {item.food_name}
                    </p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 10, color: '#7A6A65' }}>
                      {item.serving_size} {item.serving_unit} · P {Math.round(item.protein_g)}g · C {Math.round(item.carbs_g)}g · F {Math.round(item.fat_g)}g
                    </p>
                  </div>
                  <span className="font-garamond text-sm" style={{ color: '#3B3330', flexShrink: 0, marginLeft: 8 }}>
                    {Math.round(item.calories)}
                  </span>
                </div>
              ))}
              {/* Subtotal row */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '7px 14px 0',
                borderTop: '1px solid rgba(196,175,168,0.25)',
                marginTop: 4,
              }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A6A65' }}>
                  Subtotal · P {Math.round(subtotalProtein)}g · C {Math.round(subtotalCarbs)}g · F {Math.round(subtotalFat)}g
                </span>
                <span className="font-garamond text-xs font-semibold" style={{ color: '#3B3330' }}>
                  {Math.round(subtotalCal)}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Hydration ─────────────────────────────────────────────────────────────────

function HydrationRow({ glasses, onTap }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16,
      border: '1px solid rgba(196,175,168,0.35)',
      padding: '12px 14px',
      marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase" style={{ color: '#7A6A65' }}>
          Hydration
        </p>
        <span className="font-garamond text-xs" style={{ color: '#7A6A65' }}>
          {glasses} / {TOTAL_GLASSES} glasses
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: TOTAL_GLASSES }, (_, i) => {
          const filled = i < glasses
          return (
            <button
              key={i}
              onClick={() => onTap(i + 1)}
              style={{
                flex: 1, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: filled ? 'rgba(143,165,140,0.25)' : 'rgba(196,175,168,0.15)',
                transition: 'background 0.2s',
              }}
            >
              <Droplets
                size={16}
                strokeWidth={1.4}
                color={filled ? '#8FA58C' : 'rgba(122,106,101,0.3)'}
                fill={filled ? 'rgba(143,165,140,0.35)' : 'none'}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function NourishToday({ onOpenSearch }) {
  const { user }                    = useAuth()
  const { phase, label, dayOfCycle } = usePhase()

  const [logs,    setLogs]    = useState([])
  const [glasses, setGlasses] = useState(0)
  const [tip,     setTip]     = useState('')
  const [tipLoading, setTipLoading] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Load today's food log
  useEffect(() => {
    if (!user) return
    supabase
      .from('food_log')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .order('created_at')
      .then(({ data }) => setLogs(data || []))
  }, [user, today])

  // Load today's water count
  useEffect(() => {
    if (!user) return
    supabase
      .from('water_log')
      .select('glasses_count')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle()
      .then(({ data }) => setGlasses(data?.glasses_count ?? 0))
  }, [user, today])

  // Fetch phase tip when phase is available
  useEffect(() => {
    if (!phase) return
    setTipLoading(true)
    fetch('/.netlify/functions/ai-nourish', {
      method: 'POST',
      body: JSON.stringify({ type: 'phase_tip', phase, label, dayOfCycle }),
    })
      .then(r => r.json())
      .then(d => setTip(d.tip || ''))
      .catch(() => {})
      .finally(() => setTipLoading(false))
  }, [phase])

  async function handleWaterTap(glassIndex) {
    if (!user) return
    // Tap filled glass: reset to 0; tap unfilled glass: fill up to that index
    const newCount = glassIndex === glasses ? 0 : glassIndex
    setGlasses(newCount)
    await supabase
      .from('water_log')
      .upsert(
        { user_id: user.id, log_date: today, glasses_count: newCount, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,log_date' }
      )
  }

  // Aggregate macros
  const totalCal     = logs.reduce((s, l) => s + (l.calories  || 0), 0)
  const totalProtein = logs.reduce((s, l) => s + (l.protein_g || 0), 0)
  const totalCarbs   = logs.reduce((s, l) => s + (l.carbs_g   || 0), 0)
  const totalFat     = logs.reduce((s, l) => s + (l.fat_g     || 0), 0)

  // Group logs by meal type
  const byMeal = {}
  MEAL_TYPES.forEach(t => { byMeal[t] = [] })
  logs.forEach(l => { if (byMeal[l.meal_type]) byMeal[l.meal_type].push(l) })

  return (
    <div style={{ position: 'relative' }}>
      <PhaseBanner label={label} dayOfCycle={dayOfCycle} tip={tip} loading={tipLoading} />
      <MacroRing totalCal={Math.round(totalCal)} protein={totalProtein} carbs={totalCarbs} fat={totalFat} />
      <HydrationRow glasses={glasses} onTap={handleWaterTap} />

      {/* Meal sections */}
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: '#7A6A65' }}>
        Meals
      </p>
      {MEAL_TYPES.map(type => (
        <MealSection key={type} type={type} items={byMeal[type]} />
      ))}

      {/* Floating + button — sticky within scroll container */}
      <div style={{ position: 'sticky', bottom: 16, display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
        <button
          onClick={onOpenSearch}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: '#8FA58C', border: 'none', cursor: 'pointer',
            color: '#F2EDE8', fontSize: 22, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(143,165,140,0.45)',
          }}
          aria-label="Log food"
        >
          <Plus size={20} strokeWidth={2} />
        </button>
      </div>

      <div style={{ height: 8 }} />
    </div>
  )
}
