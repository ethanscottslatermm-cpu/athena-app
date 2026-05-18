import { useState, useEffect } from 'react'
import { Check, Sun, Moon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { usePhase } from '../../hooks/usePhase'

const ROSE          = '#C4859A'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

const FALLBACK = {
  am: {
    menstrual: [
      { emoji: '💧', step: '1', product_type: 'Gentle Cleanser',  instruction: 'Use a milky or oil cleanser — your skin is sensitised. Avoid foaming formulas that strip the barrier.', duration: '60 sec' },
      { emoji: '🌿', step: '2', product_type: 'Soothing Toner',   instruction: 'Apply a centella or chamomile toner with your palms. No rubbing — press gently until absorbed.', duration: '30 sec' },
      { emoji: '✨', step: '3', product_type: 'Calming Serum',    instruction: 'Use niacinamide or aloe vera to soothe any reactive patches. Avoid retinol or strong acids today.', duration: '1 min' },
      { emoji: '🧴', step: '4', product_type: 'Rich Moisturiser', instruction: 'Reach for something heavier than usual — progesterone is low and your barrier needs backup.', duration: '1 min' },
      { emoji: '☀️', step: '5', product_type: 'Mineral SPF 50',   instruction: 'Choose mineral (zinc-based) SPF to avoid irritating sensitised skin. Apply generously to face and neck.', duration: '30 sec' },
    ],
    follicular: [
      { emoji: '🫧', step: '1', product_type: 'Gel Cleanser',     instruction: 'Rising estrogen makes your skin more resilient. A gentle gel cleanser works beautifully now.', duration: '60 sec' },
      { emoji: '🌸', step: '2', product_type: 'Exfoliating Toner', instruction: 'This is the phase for light AHAs. A glycolic or lactic acid toner refines texture while your skin can handle it.', duration: '30 sec' },
      { emoji: '💊', step: '3', product_type: 'Vitamin C Serum',  instruction: 'Your skin is bright and ready to absorb actives. Vitamin C boosts collagen and fights free radicals.', duration: '1 min' },
      { emoji: '🧴', step: '4', product_type: 'Light Moisturiser', instruction: 'Your skin needs less support now — a gel or fluid moisturiser keeps things balanced without clogging.', duration: '30 sec' },
      { emoji: '☀️', step: '5', product_type: 'SPF 50',           instruction: 'Don\'t let your Vitamin C go to waste — always follow with broad-spectrum SPF. Reapply every 2 hours outdoors.', duration: '30 sec' },
    ],
    ovulation: [
      { emoji: '💧', step: '1', product_type: 'Balancing Cleanser', instruction: 'Estrogen peaks around ovulation, which can increase oil. Use a gentle balancing cleanser to keep pores clear.', duration: '60 sec' },
      { emoji: '🌿', step: '2', product_type: 'BHA Toner',         instruction: 'A salicylic acid toner helps manage increased sebum without over-stripping. Use 3-4x per week.', duration: '30 sec' },
      { emoji: '✨', step: '3', product_type: 'Antioxidant Serum', instruction: 'Your skin is luminous right now — protect it. A vitamin C or resveratrol serum locks in the glow.', duration: '1 min' },
      { emoji: '🧴', step: '4', product_type: 'Lightweight Lotion', instruction: 'Keep moisture light. A water-gel or hyaluronic acid lotion hydrates without adding shine.', duration: '30 sec' },
      { emoji: '☀️', step: '5', product_type: 'SPF 50+',           instruction: 'Peak UV activity pairs with peak skin exposure. Apply liberally and touch up midday.', duration: '30 sec' },
    ],
    luteal: [
      { emoji: '🫧', step: '1', product_type: 'Gentle Cleanser',  instruction: 'Progesterone rises and may trigger breakouts. Use a gentle, non-stripping cleanser morning and night.', duration: '60 sec' },
      { emoji: '🌿', step: '2', product_type: 'Niacinamide Toner', instruction: 'Niacinamide regulates oil and calms inflammation — both luteal-phase priorities.', duration: '30 sec' },
      { emoji: '💊', step: '3', product_type: 'Salicylic Serum',  instruction: 'A low-dose BHA serum clears congestion before it surfaces. Use every other morning if sensitised.', duration: '1 min' },
      { emoji: '🧴', step: '4', product_type: 'Oil-Free Moisturiser', instruction: 'Avoid heavy creams this week. A mattifying or oil-free moisturiser keeps balance without feeding congestion.', duration: '30 sec' },
      { emoji: '☀️', step: '5', product_type: 'Non-Comedogenic SPF', instruction: 'Choose a non-comedogenic formula. Tinted mineral SPF is ideal — it evens skin tone while protecting.', duration: '30 sec' },
    ],
  },
  pm: {
    menstrual: [
      { emoji: '💆', step: '1', product_type: 'Oil Cleanser',      instruction: 'Double cleanse if you wore SPF. Start with an oil or balm to melt makeup, then follow with your gentle cleanser.', duration: '2 min' },
      { emoji: '💧', step: '2', product_type: 'Hydrating Toner',   instruction: 'Skip any exfoliating acids tonight. A hydrating toner with hyaluronic acid or rose water is enough.', duration: '30 sec' },
      { emoji: '🌙', step: '3', product_type: 'Recovery Serum',    instruction: 'Peptides or ceramides overnight help restore the barrier that menstruation depletes. Avoid retinol this week.', duration: '1 min' },
      { emoji: '🧴', step: '4', product_type: 'Rich Night Cream',  instruction: 'Night is your repair window. A nourishing cream with shea, squalane, or marula oil seals everything in.', duration: '1 min' },
      { emoji: '🫦', step: '5', product_type: 'Lip & Eye Balm',    instruction: 'Don\'t forget the delicate zones. Apply an occlusive balm to lips and an eye cream to prevent overnight dehydration.', duration: '30 sec' },
    ],
    follicular: [
      { emoji: '🫧', step: '1', product_type: 'Gentle Cleanser',   instruction: 'A clean canvas is essential for actives. Use your cleanser with slightly warm water to open pores.', duration: '60 sec' },
      { emoji: '🌸', step: '2', product_type: 'Retinol or AHA',    instruction: 'Follicular phase is the best time to introduce or increase actives. Apply retinol or a glycolic treatment to clean skin.', duration: '2 min' },
      { emoji: '💊', step: '3', product_type: 'Peptide Serum',     instruction: 'Layer a peptide serum over your active to support collagen while retinol works overnight.', duration: '1 min' },
      { emoji: '🧴', step: '4', product_type: 'Barrier Cream',     instruction: 'Finish with a barrier-supporting moisturiser. Ceramides and fatty acids lock in actives and prevent irritation.', duration: '1 min' },
      { emoji: '🌿', step: '5', product_type: 'Facial Oil',        instruction: 'Press 2-3 drops of rosehip or squalane oil over your moisturiser. The follicular phase\'s resilience handles it beautifully.', duration: '30 sec' },
    ],
    ovulation: [
      { emoji: '🫧', step: '1', product_type: 'Purifying Cleanser', instruction: 'A slightly more thorough cleanse tonight — peak estrogen can mean a slightly oilier T-zone.', duration: '60 sec' },
      { emoji: '✨', step: '2', product_type: 'Exfoliating Toner', instruction: 'Use a BHA or PHA toner to keep pores clear. Salicylic acid is especially effective at ovulation.', duration: '30 sec' },
      { emoji: '🌙', step: '3', product_type: 'Brightening Serum', instruction: 'Your skin is receptive at ovulation. A vitamin C or azelaic acid serum brightens and prevents pigmentation.', duration: '1 min' },
      { emoji: '🧴', step: '4', product_type: 'Balancing Moisturiser', instruction: 'Use a gel-cream that hydrates without adding weight. Your skin is at its best right now — let it breathe.', duration: '1 min' },
      { emoji: '💧', step: '5', product_type: 'Eye Cream',         instruction: 'Tap on an eye cream with caffeine or vitamin K. The ovulatory phase can bring mild puffiness in some women.', duration: '30 sec' },
    ],
    luteal: [
      { emoji: '💆', step: '1', product_type: 'Calming Cleanser',  instruction: 'Use a calming cleanser that won\'t aggravate any congestion. Massage gently with fingertips only.', duration: '60 sec' },
      { emoji: '🌿', step: '2', product_type: 'Clarifying Toner',  instruction: 'A niacinamide or tea tree toner targets luteal-phase breakouts without overdrying.', duration: '30 sec' },
      { emoji: '💊', step: '3', product_type: 'Spot Treatment',    instruction: 'Apply a targeted salicylic or benzoyl peroxide spot treatment to any active congestion. Less is more.', duration: '1 min' },
      { emoji: '🧴', step: '4', product_type: 'Lightweight Night Cream', instruction: 'Choose something that nourishes without clogging. Look for non-comedogenic labels and avoid heavy oils.', duration: '1 min' },
      { emoji: '🌙', step: '5', product_type: 'Jade Roller',       instruction: 'End with a cold jade roller over your moisturiser to depuff and drain lymph. 2-3 minutes, always upward.', duration: '3 min' },
    ],
  },
}

// ── Routine step card ─────────────────────────────────────────────────────────

function StepCard({ step, index, done, onToggle }) {
  return (
    <button
      onClick={() => onToggle(index)}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 14,
        border: `1px solid ${done ? 'rgba(196,133,154,0.45)' : 'rgba(196,133,154,0.2)'}`,
        padding: '12px 13px',
        marginBottom: 8, textAlign: 'left',
        cursor: 'pointer',
        opacity: done ? 0.5 : 1,
        transition: 'opacity 0.3s, border-color 0.3s',
        display: 'flex', alignItems: 'flex-start', gap: 11,
      }}
    >
      <div style={{
        width: 38, height: 38, flexShrink: 0, borderRadius: 10,
        background: done ? 'rgba(196,133,154,0.18)' : 'rgba(196,133,154,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        {done ? <Check size={16} color={ROSE} strokeWidth={2.5} /> : step.emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span className="font-cinzel text-[11px]" style={{ color: done ? ROSE : '#3B3330' }}>
            {step.product_type}
          </span>
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: ROSE,
            background: 'rgba(196,133,154,0.12)',
            border: '1px solid rgba(196,133,154,0.28)',
            padding: '2px 7px', borderRadius: 7, flexShrink: 0, marginLeft: 8,
          }}>
            {step.duration}
          </span>
        </div>
        <p className="font-garamond text-sm leading-snug" style={{ color: '#7A6A65' }}>
          {step.instruction}
        </p>
      </div>
    </button>
  )
}

// ── Routine section (AM or PM) ────────────────────────────────────────────────

function RoutineSection({ timeOfDay, phase, label, steps, loading }) {
  const [done, setDone] = useState([])
  const isAM = timeOfDay === 'am'

  function toggle(i) {
    setDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
      }}>
        {isAM
          ? <Sun  size={14} color={ROSE} strokeWidth={1.5} />
          : <Moon size={14} color={ROSE} strokeWidth={1.5} />}
        <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase" style={{ color: '#7A6A65' }}>
          {isAM ? 'Morning Routine' : 'Evening Routine'}
        </p>
        {steps.length > 0 && (
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 7, color: ROSE,
            background: 'rgba(196,133,154,0.12)', borderRadius: 6,
            padding: '1px 7px', border: '1px solid rgba(196,133,154,0.25)',
          }}>
            {done.length}/{steps.length}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)', animation: 'skLoad 1.5s ease-in-out infinite' }}>
            Preparing your routine…
          </p>
        </div>
      ) : (
        steps.map((step, i) => (
          <StepCard key={i} step={step} index={i} done={done.includes(i)} onToggle={toggle} />
        ))
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SkinRoutine() {
  const { phase, label } = usePhase()

  const [amSteps,    setAmSteps]    = useState([])
  const [pmSteps,    setPmSteps]    = useState([])
  const [amLoading,  setAmLoading]  = useState(false)
  const [pmLoading,  setPmLoading]  = useState(false)

  useEffect(() => {
    if (!phase) return
    loadRoutine('am', setAmSteps, setAmLoading)
    loadRoutine('pm', setPmSteps, setPmLoading)
  }, [phase])

  async function loadRoutine(timeOfDay, setSteps, setLoading) {
    setLoading(true)
    try {
      const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString()
      const { data: cached } = await supabase
        .from('skin_routine_cache')
        .select('content')
        .eq('phase_name', phase)
        .eq('time_of_day', timeOfDay)
        .gte('generated_at', cutoff)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cached?.content?.steps?.length) {
        setSteps(cached.content.steps)
        setLoading(false)
        return
      }

      const r = await fetch('/.netlify/functions/ai-skin', {
        method: 'POST',
        body: JSON.stringify({ type: `${timeOfDay}_routine`, phase, label }),
      })
      const d = await r.json()
      const fetched = d.steps

      if (!Array.isArray(fetched) || !fetched.length) throw new Error('bad response')
      setSteps(fetched)
      supabase.from('skin_routine_cache').insert({ phase_name: phase, time_of_day: timeOfDay, content: { steps: fetched } }).then(() => {})
    } catch {
      const fb = FALLBACK[timeOfDay]?.[phase] || FALLBACK[timeOfDay]?.follicular || []
      setSteps(fb)
    }
    setLoading(false)
  }

  if (!phase) return (
    <div style={{ paddingTop: 40, textAlign: 'center' }}>
      <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
        Set your cycle start date to unlock your phase-aligned routine.
      </p>
    </div>
  )

  return (
    <>
      <style>{`@keyframes skLoad{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>

      {/* Phase chip */}
      <div style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 14, padding: '10px 14px', marginBottom: 16,
        border: '1px solid rgba(196,133,154,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p className="font-cinzel text-[9px] tracking-[0.25em] uppercase" style={{ color: ROSE }}>
          {label} Skincare Routine
        </p>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
          fontSize: 11, color: '#7A6A65',
        }}>
          Tap each step when done
        </span>
      </div>

      <RoutineSection timeOfDay="am" phase={phase} label={label} steps={amSteps} loading={amLoading} />
      <RoutineSection timeOfDay="pm" phase={phase} label={label} steps={pmSteps} loading={pmLoading} />

      <p style={{
        fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
        fontSize: 11, color: 'rgba(122,106,101,0.5)',
        textAlign: 'center', paddingBottom: 8,
      }}>
        Routine refreshes with each new phase.
      </p>
    </>
  )
}
