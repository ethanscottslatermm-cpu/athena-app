import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { usePhase } from '../../hooks/usePhase'
import { useProfile } from '../../hooks/useProfile'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const INDIGO = '#9B97C4'

const FALLBACK_ROUTINES = {
  menstrual: [
    { emoji: '🛁', title: 'Warm Salt Bath',       duration: '10 min', instruction: 'Add Epsom salts to ease cramping and muscle tension. Let the warmth signal your nervous system that it\'s safe to release.' },
    { emoji: '🌡️', title: 'Heat Therapy',          duration: '5 min',  instruction: 'Apply a warm compress to your lower belly. Heat reduces prostaglandins and allows your body to settle into rest.' },
    { emoji: '📖', title: 'Light Reading',         duration: '10 min', instruction: 'Choose something gentle — no screens. Let your eyes soften and your mind follow.' },
    { emoji: '🌬️', title: 'Slow Breathing',        duration: '5 min',  instruction: 'Inhale for 4 counts, exhale for 6. The longer exhale activates your parasympathetic nervous system.' },
    { emoji: '🧴', title: 'Magnesium Body Oil',    duration: '3 min',  instruction: 'Massage into your legs and feet. Magnesium supports muscle relaxation and deeper sleep during your period.' },
  ],
  follicular: [
    { emoji: '✍️', title: 'Journal Your Intentions', duration: '7 min',  instruction: 'Your follicular phase is for new beginnings. Write one thing you\'re curious about or excited to explore.' },
    { emoji: '🎵', title: 'Calm Playlist',            duration: '10 min', instruction: 'Choose instrumental or ambient music. Let your rising energy settle gently into rest.' },
    { emoji: '🌬️', title: 'Box Breathing',            duration: '5 min',  instruction: 'Inhale 4, hold 4, exhale 4, hold 4. This balances your nervous system after the active energy of your follicular phase.' },
    { emoji: '🧴', title: 'Facial Gua Sha',           duration: '5 min',  instruction: 'Use upward strokes with a jade tool. Your skin is building resilience — this enhances lymphatic flow while calming your mind.' },
    { emoji: '📵', title: 'Phone Blackout',            duration: '30 min', instruction: 'Place your phone in another room. Your follicular energy may tempt you to scroll — protect your sleep with a firm boundary.' },
  ],
  ovulation: [
    { emoji: '🚿', title: 'Cool Shower',             duration: '5 min',  instruction: 'A slightly cooler shower helps lower your core body temperature — essential for quality sleep during your peak-energy phase.' },
    { emoji: '🌿', title: 'Lavender Diffuser',       duration: '15 min', instruction: 'Diffuse lavender 15 minutes before bed. Your ovulatory energy runs high — aromatherapy helps bridge the gap to rest.' },
    { emoji: '🧘', title: 'Yin Yoga Stretch',        duration: '10 min', instruction: 'Hold a few gentle hip-opening poses. Your body is at peak power; now invite it to surrender.' },
    { emoji: '🌬️', title: '4-7-8 Breathing',         duration: '5 min',  instruction: 'Inhale 4, hold 7, exhale 8. This technique is especially effective at ovulation when cortisol tends to peak.' },
    { emoji: '📓', title: 'Gratitude Notes',         duration: '5 min',  instruction: 'Write three things that went well today. Closing the loop on your outward energy helps you transition inward.' },
  ],
  luteal: [
    { emoji: '🍵', title: 'Chamomile or Valerian Tea', duration: '10 min', instruction: 'Sip slowly and without rushing. Both herbs support GABA activity, which eases the anxiety that can rise in the luteal phase.' },
    { emoji: '🌡️', title: 'Heating Pad on Back',       duration: '8 min',  instruction: 'Warmth soothes the nervous tension that builds in the late luteal phase. Let it work while you breathe slowly.' },
    { emoji: '✍️', title: 'Brain Dump Journal',         duration: '7 min',  instruction: 'Write everything swirling in your mind — worries, to-dos, feelings. Getting it on paper clears space for rest.' },
    { emoji: '🌬️', title: 'Extended Exhale',           duration: '5 min',  instruction: 'Breathe in for 4 counts, out for 8. The long exhale downregulates the heightened nervous system of the luteal phase.' },
    { emoji: '📵', title: 'Early Phone Off',            duration: '60 min', instruction: 'Turn off your phone an hour before bed. Luteal-phase sensitivity to stimulation means blue light hits harder now.' },
  ],
}

// ── Bedtime calculator ────────────────────────────────────────────────────────

function suggestedBedtime(wakeStr, isMenstrual) {
  const [h, m] = (wakeStr || '07:00').split(':').map(Number)
  let mins = h * 60 + m - 8 * 60
  if (isMenstrual) mins -= 30  // 30 min extra sleep buffer
  mins = ((mins % 1440) + 1440) % 1440
  const bh = Math.floor(mins / 60)
  const bm = mins % 60
  return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`
}

function to12h(time24) {
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

// ── Routine card ──────────────────────────────────────────────────────────────

function RoutineCard({ step, index, done, onDone }) {
  return (
    <button
      onClick={() => onDone(index)}
      style={{
        width: '100%', background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: `1px solid ${done ? 'rgba(143,165,140,0.5)' : 'rgba(155,151,196,0.28)'}`,
        padding: '14px 14px 13px',
        marginBottom: 10, textAlign: 'left',
        cursor: 'pointer',
        opacity: done ? 0.55 : 1,
        transition: 'opacity 0.3s, border-color 0.3s',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}
    >
      {/* Emoji + done checkmark */}
      <div style={{
        width: 40, height: 40, flexShrink: 0, borderRadius: 12,
        background: done ? 'rgba(143,165,140,0.2)' : 'rgba(155,151,196,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {done ? <Check size={18} color="#8FA58C" strokeWidth={2.5} /> : step.emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span className="font-cinzel text-sm" style={{ color: done ? '#8FA58C' : '#3B3330' }}>
            {step.title}
          </span>
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 7,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: INDIGO,
            background: 'rgba(155,151,196,0.15)',
            border: '1px solid rgba(155,151,196,0.3)',
            padding: '2px 8px', borderRadius: 8, flexShrink: 0, marginLeft: 8,
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SleepWindDown() {
  const { phase, label }  = usePhase()
  const { profile }       = useProfile()

  const [steps,   setSteps]   = useState([])
  const [done,    setDone]    = useState([])
  const [loading, setLoading] = useState(false)

  const wakeTime    = profile?.preferences?.wake_time || '07:00'
  const isMenstrual = phase === 'menstrual'
  const bedtime     = suggestedBedtime(wakeTime, isMenstrual)

  useEffect(() => {
    if (!phase) return
    loadRoutine()
  }, [phase])

  async function loadRoutine() {
    setLoading(true)
    try {
      const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString()
      const { data: cached } = await supabase
        .from('wind_down_cache')
        .select('content')
        .eq('phase_name', phase)
        .gte('generated_at', cutoff)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cached?.content?.steps?.length) {
        setSteps(cached.content.steps)
        setLoading(false)
        return
      }

      // Cache miss — fetch from AI
      const r = await fetch('/.netlify/functions/ai-sleep', {
        method: 'POST',
        body: JSON.stringify({ type: 'wind_down', phase, label }),
      })
      const d = await r.json()
      const fetchedSteps = d.steps

      if (!Array.isArray(fetchedSteps) || !fetchedSteps.length) throw new Error('bad response')
      setSteps(fetchedSteps)
      // Cache (fire and forget)
      supabase.from('wind_down_cache').insert({ phase_name: phase, content: { steps: fetchedSteps } }).then(() => {})
    } catch {
      setSteps(FALLBACK_ROUTINES[phase] || FALLBACK_ROUTINES.luteal)
    }
    setLoading(false)
  }

  function toggleDone(index) {
    setDone(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])
  }

  const completedCount = done.length
  const totalCount     = steps.length

  if (!phase) return (
    <div style={{ paddingTop: 40, textAlign: 'center' }}>
      <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
        Set your cycle start date to unlock your wind-down routine.
      </p>
    </div>
  )

  return (
    <>
      {/* Phase header */}
      <div style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16, padding: '12px 14px', marginBottom: 16,
        border: `1px solid rgba(155,151,196,0.3)`,
      }}>
        <p className="font-cinzel text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: INDIGO }}>
          {label} Wind-Down Routine
        </p>
        <p className="font-garamond text-sm" style={{ color: '#7A6A65' }}>
          Tap each card as you complete it.
          {totalCount > 0 && ` ${completedCount} of ${totalCount} done.`}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.4)', animation: 'slLoad 1.5s ease-in-out infinite' }}>
            Building your routine…
          </p>
          <style>{`@keyframes slLoad{0%,100%{opacity:.3}50%{opacity:.7}}`}</style>
        </div>
      ) : (
        steps.map((step, i) => (
          <RoutineCard
            key={i} step={step} index={i}
            done={done.includes(i)} onDone={toggleDone}
          />
        ))
      )}

      {/* Suggested bedtime */}
      <div style={{
        background: `linear-gradient(135deg, rgba(155,151,196,0.18) 0%, rgba(255,255,255,0.4) 100%)`,
        border: `1px solid rgba(155,151,196,0.35)`,
        borderRadius: 16, padding: '14px 16px',
        marginTop: 8, marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <p className="font-cinzel text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: INDIGO }}>
            Suggested Bedtime
          </p>
          <p className="font-garamond text-xs" style={{ color: '#7A6A65' }}>
            {isMenstrual ? '8.5 hrs before wake · extra rest for your period' : '8 hrs before your wake time'}
          </p>
        </div>
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: 22, fontWeight: 700,
          color: INDIGO,
        }}>
          {to12h(bedtime)}
        </span>
      </div>
    </>
  )
}
