import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const ROSE = '#C4859A'

const CONDITION_OPTIONS = [
  { value: 1, emoji: '🔴', label: 'Flare-Up'  },
  { value: 2, emoji: '😶', label: 'Dull'      },
  { value: 3, emoji: '🙂', label: 'Normal'    },
  { value: 4, emoji: '✨', label: 'Clear'     },
  { value: 5, emoji: '🌟', label: 'Glowing'   },
]

const CONCERN_OPTIONS = [
  'Breakouts',
  'Dryness',
  'Oiliness',
  'Redness',
  'Sensitivity',
  'Dark Spots',
  'Puffiness',
  'Under-Eye Bags',
]

// ── Phase banner ──────────────────────────────────────────────────────────────

function PhaseBanner({ label, dayOfCycle, tip, tipLoading }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(196,133,154,0.2) 0%, rgba(196,133,154,0.05) 100%)',
      border: '1px solid rgba(196,133,154,0.35)',
      borderRadius: 16, padding: '12px 14px', marginBottom: 14,
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.25em] uppercase mb-1.5" style={{ color: ROSE }}>
        {label ? `${label} · Day ${dayOfCycle ?? '—'}` : 'Cycle Phase'}
      </p>
      <p className="font-garamond text-sm leading-snug"
        style={{ color: tipLoading ? 'rgba(59,51,48,0.35)' : '#3B3330', fontStyle: tipLoading ? 'italic' : 'normal', transition: 'color 0.3s' }}>
        {tipLoading ? 'Reading your skin phase…' : (tip || 'Your skin is telling a story — listen closely today.')}
      </p>
    </div>
  )
}

// ── Condition picker ──────────────────────────────────────────────────────────

function ConditionPicker({ selected, onSelect }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16,
      border: '1px solid rgba(196,133,154,0.25)',
      padding: '12px 14px',
      marginBottom: 12,
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: '#7A6A65' }}>
        Today's Skin
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {CONDITION_OPTIONS.map(opt => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              style={{
                flex: 1, padding: '8px 2px', borderRadius: 12,
                border: `1px solid ${active ? ROSE : 'rgba(196,175,168,0.35)'}`,
                background: active ? 'rgba(196,133,154,0.14)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.18s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 18 }}>{opt.emoji}</span>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: 6.5,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: active ? ROSE : '#7A6A65',
              }}>
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Concern chips ─────────────────────────────────────────────────────────────

function ConcernChips({ selected, onToggle }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16,
      border: '1px solid rgba(196,175,168,0.35)',
      padding: '12px 14px',
      marginBottom: 12,
    }}>
      <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: '#7A6A65' }}>
        Any Concerns?
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {CONCERN_OPTIONS.map(c => {
          const active = selected.includes(c)
          return (
            <button
              key={c}
              onClick={() => onToggle(c)}
              style={{
                padding: '6px 12px', borderRadius: 20,
                border: `1px solid ${active ? ROSE : 'rgba(196,175,168,0.4)'}`,
                background: active ? 'rgba(196,133,154,0.14)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.18s',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 13,
                color: active ? ROSE : '#7A6A65',
              }}
            >
              {c}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SkinLog({ onLogSaved }) {
  const { user }                     = useAuth()
  const { phase, label, dayOfCycle } = usePhase()

  const [condition,   setCondition]   = useState(null)
  const [concerns,    setConcerns]    = useState([])
  const [notes,       setNotes]       = useState('')
  const [tip,         setTip]         = useState('')
  const [tipLoading,  setTipLoading]  = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [error,       setError]       = useState('')

  // Load today's existing entry
  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('skin_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        if (data.condition_rating) setCondition(data.condition_rating)
        if (data.concerns?.length) setConcerns(data.concerns)
        if (data.notes) setNotes(data.notes)
      })
  }, [user])

  // Fetch AI skin tip
  useEffect(() => {
    if (!phase) return
    setTipLoading(true)
    fetch('/.netlify/functions/ai-skin', {
      method: 'POST',
      body: JSON.stringify({ type: 'skin_tip', phase, label, dayOfCycle }),
    })
      .then(r => r.json())
      .then(d => setTip(d.tip || ''))
      .catch(() => {})
      .finally(() => setTipLoading(false))
  }, [phase])

  function toggleConcern(c) {
    setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setError('')
    const today = new Date().toISOString().split('T')[0]
    const { error: dbErr } = await supabase
      .from('skin_logs')
      .upsert({
        user_id:          user.id,
        log_date:         today,
        condition_rating: condition,
        concerns,
        notes:            notes || null,
        phase_name:       phase || null,
      }, { onConflict: 'user_id,log_date' })

    if (dbErr) {
      setError('Couldn\'t save. Please try again.')
      setSaving(false)
      return
    }

    setSaved(true)
    setTimeout(() => { setSaved(false); onLogSaved() }, 900)
    setSaving(false)
  }

  return (
    <>
      <PhaseBanner label={label} dayOfCycle={dayOfCycle} tip={tip} tipLoading={tipLoading} />
      <ConditionPicker selected={condition} onSelect={setCondition} />
      <ConcernChips    selected={concerns}  onToggle={toggleConcern} />

      {/* Notes */}
      <div style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: '1px solid rgba(196,175,168,0.35)',
        padding: '12px 14px',
        marginBottom: 16,
      }}>
        <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: '#7A6A65' }}>
          Skin Notes
        </p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="What did you notice about your skin today…"
          rows={3}
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none',
            fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontStyle: 'italic',
            color: '#3B3330',
          }}
        />
      </div>

      {error && (
        <p className="font-garamond text-sm italic mb-3" style={{ color: ROSE }}>{error}</p>
      )}

      {saved ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(196,133,154,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Check size={22} color={ROSE} strokeWidth={2} />
          </div>
        </div>
      ) : (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px',
            background: ROSE, border: 'none', borderRadius: 14,
            cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: 10,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#F2EDE8',
            opacity: saving ? 0.6 : 1,
            transition: 'opacity 0.2s',
            marginBottom: 24,
          }}
        >
          {saving ? 'Saving…' : 'Save Skin Log'}
        </button>
      )}
    </>
  )
}
