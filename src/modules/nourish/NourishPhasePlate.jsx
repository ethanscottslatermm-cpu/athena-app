import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { usePhase } from '../../hooks/usePhase'

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

const SECTION_CONFIG = {
  eat_more: {
    label:  'Eat More Of',
    accent: '#8FA58C',
    bg:     'rgba(143,165,140,0.15)',
    border: 'rgba(143,165,140,0.35)',
    chipBg: 'rgba(143,165,140,0.18)',
    chipBorder: 'rgba(143,165,140,0.4)',
  },
  anti_inflammatory: {
    label:  'Anti-Inflammatory Picks',
    accent: '#D4A0A0',
    bg:     'rgba(212,160,160,0.12)',
    border: 'rgba(212,160,160,0.3)',
    chipBg: 'rgba(212,160,160,0.15)',
    chipBorder: 'rgba(212,160,160,0.35)',
  },
  gentle_limits: {
    label:  'Gentle Limits',
    accent: '#7A6A65',
    bg:     'rgba(196,175,168,0.18)',
    border: 'rgba(196,175,168,0.4)',
    chipBg: 'rgba(196,175,168,0.25)',
    chipBorder: 'rgba(196,175,168,0.45)',
  },
}

const FALLBACK_PLATES = {
  follicular: {
    eat_more:           [{ name: 'Leafy Greens',  note: 'Iron & folate to support rising estrogen' }, { name: 'Eggs',          note: 'Choline for hormonal signaling' }, { name: 'Fermented Foods', note: 'Gut health primes the phase' }, { name: 'Oats',          note: 'Steady energy for creative days' }, { name: 'Flaxseeds',     note: 'Lignan-rich for estrogen balance' }],
    anti_inflammatory:  [{ name: 'Blueberries',   note: 'Antioxidant-dense & anti-inflammatory'   }, { name: 'Salmon',        note: 'Omega-3s reduce systemic inflammation' }, { name: 'Turmeric',    note: 'Curcumin supports your building phase' }, { name: 'Walnuts',       note: 'ALA omega-3 for brain clarity' }, { name: 'Green Tea',     note: 'Light catechins, steady energy' }],
    gentle_limits:      [{ name: 'Alcohol',        note: 'May disrupt estrogen metabolism' }, { name: 'Processed sugar', note: 'Worth spacing out to keep energy even' }, { name: 'Heavy fried foods', note: 'Your liver is busy — ease up' }, { name: 'Caffeine excess', note: 'More than 2 cups may spike cortisol' }, { name: 'Refined flour', note: 'May not serve your gut flora right now' }],
  },
  luteal: {
    eat_more:           [{ name: 'Dark Chocolate', note: 'Magnesium supports PMS relief'         }, { name: 'Sweet Potato',  note: 'Complex carbs ease mood dips' }, { name: 'Lentils',       note: 'Iron & B6 for emotional steadiness' }, { name: 'Pumpkin Seeds', note: 'Zinc & magnesium for calm' }, { name: 'Avocado',       note: 'Healthy fat to soothe inflammation' }],
    anti_inflammatory:  [{ name: 'Ginger Tea',    note: 'Soothes bloating and cramping' }, { name: 'Chia Seeds',    note: 'Omega-3s ease luteal inflammation' }, { name: 'Broccoli',    note: 'DIM helps clear excess estrogen' }, { name: 'Chamomile',     note: 'Calms the nervous system' }, { name: 'Berries',       note: 'Low sugar, high antioxidants' }],
    gentle_limits:      [{ name: 'Salty snacks',  note: 'May worsen bloating this phase' }, { name: 'Alcohol',       note: 'Amplifies mood swings — worth pausing' }, { name: 'Caffeine',    note: 'Can heighten anxiety and breast tenderness' }, { name: 'Refined sugar', note: 'Blood sugar swings hit harder now' }, { name: 'Dairy in excess', note: 'May contribute to inflammation' }],
  },
  menstrual: {
    eat_more:           [{ name: 'Red Meat',       note: 'Iron replenishment during flow'          }, { name: 'Beets',         note: 'Natural blood builder' }, { name: 'Bone Broth',    note: 'Mineral-rich and deeply nourishing' }, { name: 'Warming Soups', note: 'Gentle on the digestive system' }, { name: 'Dark Leafy Greens', note: 'Folate and iron together' }],
    anti_inflammatory:  [{ name: 'Omega-3 fish',  note: 'Prostaglandin balance for cramping' }, { name: 'Turmeric milk', note: 'Anti-inflammatory and warming' }, { name: 'Ginger',      note: 'Reduces cramping and nausea' }, { name: 'Tart Cherry',   note: 'Natural COX-2 inhibitor' }, { name: 'Magnesium-rich foods', note: 'Muscle relaxation and pain relief' }],
    gentle_limits:      [{ name: 'Cold foods',    note: 'TCM wisdom: warm foods support flow' }, { name: 'Alcohol',       note: 'Depletes zinc and B vitamins' }, { name: 'Excess caffeine', note: 'Can worsen cramps and anxiety' }, { name: 'Ultra-processed foods', note: 'Increase systemic inflammation' }, { name: 'High sodium', note: 'Worsens bloating and water retention' }],
  },
  ovulation: {
    eat_more:           [{ name: 'Raw Vegetables', note: 'Peak digestive capacity this phase' }, { name: 'Zinc-rich foods', note: 'Supports healthy ovulation' }, { name: 'Light protein',  note: 'Sustains peak energy without heaviness' }, { name: 'Fresh fruit',   note: 'Natural sugars for vibrant energy' }, { name: 'Flaxseed',      note: 'Supports estrogen clearance' }],
    anti_inflammatory:  [{ name: 'Colorful salads', note: 'Diverse phytonutrients at their best' }, { name: 'Citrus',       note: 'Vitamin C supports luteinizing hormone' }, { name: 'Brazil nuts', note: 'Selenium for egg quality' }, { name: 'Pineapple core', note: 'Bromelain may support implantation' }, { name: 'Extra virgin olive oil', note: 'Oleocanthal is a natural anti-inflammatory' }],
    gentle_limits:      [{ name: 'Very heavy meals', note: 'Energy is better used outward now' }, { name: 'High sugar drinks', note: 'May dampen the hormonal peak' }, { name: 'Alcohol',      note: 'Your body is doing important work' }, { name: 'Excess dairy',  note: 'Can be mucus-forming around ovulation' }, { name: 'Fried foods',   note: 'Oxidative load is higher than needed' }],
  },
}

// ── Pill chip ─────────────────────────────────────────────────────────────────

function Chip({ name, note, chipBg, chipBorder, accent }) {
  const [showNote, setShowNote] = useState(false)
  return (
    <button
      onClick={() => setShowNote(v => !v)}
      style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
        background: showNote ? chipBg : 'rgba(255,255,255,0.45)',
        border: `1px solid ${showNote ? chipBorder : 'rgba(196,175,168,0.35)'}`,
        borderRadius: 20, padding: showNote ? '7px 12px' : '6px 12px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.2s',
      }}
    >
      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, color: '#3B3330', lineHeight: 1.2 }}>
        {name}
      </span>
      {showNote && (
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 11, color: accent, marginTop: 2, lineHeight: 1.3 }}>
          {note}
        </span>
      )}
    </button>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────

function PlateSection({ sectionKey, items }) {
  const cfg = SECTION_CONFIG[sectionKey]
  if (!cfg || !items?.length) return null
  return (
    <div style={{
      background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(255,255,255,0.4) 100%)`,
      border: `1px solid ${cfg.border}`,
      borderRadius: 18, padding: '14px 14px 16px',
      marginBottom: 12,
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.25em] uppercase mb-3" style={{ color: cfg.accent }}>
        {cfg.label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {items.map((item, i) => (
          <Chip key={i} name={item.name} note={item.note}
            chipBg={cfg.chipBg} chipBorder={cfg.chipBorder} accent={cfg.accent} />
        ))}
      </div>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 11, color: '#7A6A65', marginTop: 10, marginBottom: 0 }}>
        Tap any item for a note
      </p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function NourishPhasePlate() {
  const { phase, label } = usePhase()
  const [plate,   setPlate]   = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!phase) return
    loadPlate()
  }, [phase])

  async function loadPlate() {
    setLoading(true)
    try {
      // Check cache
      const cutoff = new Date(Date.now() - SEVEN_DAYS_MS).toISOString()
      const { data: cached } = await supabase
        .from('phase_food_cache')
        .select('content')
        .eq('phase_name', phase)
        .gte('generated_at', cutoff)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cached?.content) {
        setPlate(cached.content)
        setLoading(false)
        return
      }

      // Cache miss — fetch from AI
      const r = await fetch('/.netlify/functions/ai-nourish', {
        method: 'POST',
        body: JSON.stringify({ type: 'phase_plate', phase, label }),
      })
      const d = await r.json()
      if (!d.eat_more) throw new Error('bad response')

      setPlate(d)
      // Write to cache (fire and forget)
      supabase.from('phase_food_cache').insert({ phase_name: phase, content: d }).then(() => {})
    } catch {
      setPlate(FALLBACK_PLATES[phase] || FALLBACK_PLATES.follicular)
    }
    setLoading(false)
  }

  if (!phase) return (
    <div style={{ paddingTop: 40, textAlign: 'center' }}>
      <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
        Set your cycle start date to unlock phase-aligned nutrition.
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
        border: '1px solid rgba(196,175,168,0.35)',
      }}>
        <p className="font-cinzel text-[9px] tracking-[0.25em] uppercase mb-1" style={{ color: '#8FA58C' }}>
          {label} Phase Guide
        </p>
        <p className="font-garamond text-sm" style={{ color: '#7A6A65' }}>
          Foods that work with your body right now. Updated every 7 days.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.4)', animation: 'nrPlateLoad 1.5s ease-in-out infinite' }}>
            Preparing your phase plate…
          </p>
          <style>{`@keyframes nrPlateLoad { 0%,100%{opacity:.3} 50%{opacity:.7} }`}</style>
        </div>
      ) : plate ? (
        <>
          <PlateSection sectionKey="eat_more"          items={plate.eat_more}          />
          <PlateSection sectionKey="anti_inflammatory"  items={plate.anti_inflammatory}  />
          <PlateSection sectionKey="gentle_limits"      items={plate.gentle_limits}      />
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 11, color: 'rgba(122,106,101,0.55)', textAlign: 'center', paddingBottom: 8 }}>
            This guide refreshes with each new phase.
          </p>
        </>
      ) : null}
    </>
  )
}
