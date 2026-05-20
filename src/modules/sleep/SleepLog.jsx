import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const QUALITY_OPTIONS = [
  { value: 1, emoji: '😔', label: 'Restless' },
  { value: 2, emoji: '😤', label: 'Wired'    },
  { value: 3, emoji: '😐', label: 'Okay'     },
  { value: 4, emoji: '😊', label: 'Rested'   },
  { value: 5, emoji: '🌙', label: 'Deep'     },
]

const TAG_OPTIONS = [
  'Vivid Dreams',
  'Night Sweats',
  'Trouble Falling Asleep',
  'Woke Often',
  'Slept Through',
  'Restless Legs',
]

const INDIGO = '#9B97C4'

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcHours(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return null
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let bedMins  = bh * 60 + bm
  let wakeMins = wh * 60 + wm
  if (wakeMins <= bedMins) wakeMins += 1440  // next day
  return Math.round((wakeMins - bedMins) / 60 * 10) / 10
}

// ── Phase banner ──────────────────────────────────────────────────────────────

function PhaseBanner({ label, dayOfCycle, tip, tipLoading }) {
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
        style={{ color: tipLoading ? 'rgba(59,51,48,0.35)' : '#3B3330', fontStyle: tipLoading ? 'italic' : 'normal', transition: 'color 0.3s' }}>
        {tipLoading ? 'Gathering your sleep insight…' : (tip || 'Honor your body\'s need for rest tonight.')}
      </p>
    </div>
  )
}

// ── Time picker pair ──────────────────────────────────────────────────────────

function TimeCard({ bedtime, wakeTime, onBedtime, onWakeTime, totalHours }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 18,
      border: '1px solid rgba(155,151,196,0.3)',
      padding: '16px',
      marginBottom: 12,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        {[
          { label: 'Bedtime',   value: bedtime,   onChange: onBedtime   },
          { label: 'Wake Time', value: wakeTime,  onChange: onWakeTime  },
        ].map(({ label, value, onChange }) => (
          <div key={label}>
            <p className="font-cinzel text-[8px] tracking-[0.22em] uppercase mb-2" style={{ color: '#7A6A65' }}>
              {label}
            </p>
            <input
              type="time"
              value={value}
              onChange={e => onChange(e.target.value)}
              style={{
                width: '100%', background: 'rgba(155,151,196,0.1)',
                border: `1px solid rgba(155,151,196,0.35)`,
                borderRadius: 10, padding: '8px 10px',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 20,
                color: '#3B3330', outline: 'none',
                colorScheme: 'light',
              }}
            />
          </div>
        ))}
      </div>

      {totalHours !== null && (
        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 28, fontWeight: 700,
            color: INDIGO,
          }}>
            {totalHours}
          </span>
          <span className="font-garamond text-sm ml-1" style={{ color: '#7A6A65' }}>hours</span>
        </div>
      )}
    </div>
  )
}

// ── Quality rating ────────────────────────────────────────────────────────────

function QualityRow({ selected, onSelect }) {
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
        Sleep Quality
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {QUALITY_OPTIONS.map(opt => {
          const active = selected === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              style={{
                flex: 1, padding: '8px 2px', borderRadius: 12,
                border: `1px solid ${active ? INDIGO : 'rgba(196,175,168,0.35)'}`,
                background: active ? 'rgba(155,151,196,0.18)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.18s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 18 }}>{opt.emoji}</span>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: 6.5,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: active ? INDIGO : '#7A6A65',
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

// ── Tag chips ─────────────────────────────────────────────────────────────────

function TagChips({ selected, onToggle }) {
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
        How Did It Feel?
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {TAG_OPTIONS.map(tag => {
          const active = selected.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              style={{
                padding: '6px 12px', borderRadius: 20,
                border: `1px solid ${active ? INDIGO : 'rgba(196,175,168,0.4)'}`,
                background: active ? 'rgba(155,151,196,0.18)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.18s',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 13,
                color: active ? INDIGO : '#7A6A65',
              }}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SleepLog({ onLogSaved }) {
  const { user }                      = useAuth()
  const { phase, label, dayOfCycle }  = usePhase()

  const [bedtime,    setBedtime]    = useState('22:30')
  const [wakeTime,   setWakeTime]   = useState('07:00')
  const [quality,    setQuality]    = useState(null)
  const [tags,       setTags]       = useState([])
  const [dreamNotes, setDreamNotes] = useState('')
  const [tip,        setTip]        = useState('')
  const [tipLoading, setTipLoading] = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState('')

  const totalHours = calcHours(bedtime, wakeTime)

  // Load today's existing log if any
  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        if (data.bedtime)  setBedtime(data.bedtime.slice(0, 5))
        if (data.wake_time) setWakeTime(data.wake_time.slice(0, 5))
        if (data.quality_rating) setQuality(data.quality_rating)
        if (data.tags?.length) setTags(data.tags)
        if (data.dream_notes) setDreamNotes(data.dream_notes)
      })
  }, [user])

  // Fetch AI sleep tip
  useEffect(() => {
    if (!phase) return
    setTipLoading(true)
    fetch('/.netlify/functions/ai-sleep', {
      method: 'POST',
      body: JSON.stringify({ type: 'sleep_tip', phase, label, dayOfCycle }),
    })
      .then(r => r.json())
      .then(d => setTip(d.tip || ''))
      .catch(() => {})
      .finally(() => setTipLoading(false))
  }, [phase])

  function toggleTag(tag) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setError('')
    const today = new Date().toISOString().split('T')[0]
    const { error: dbErr } = await supabase
      .from('sleep_logs')
      .upsert({
        user_id:        user.id,
        log_date:       today,
        bedtime:        bedtime || null,
        wake_time:      wakeTime || null,
        total_hours:    totalHours,
        quality_rating: quality,
        tags,
        dream_notes:    dreamNotes || null,
        phase_name:     phase || null,
      }, { onConflict: 'user_id,log_date' })

    if (dbErr) {
      setError('Couldn\'t save. Please try again.')
      setSaving(false)
      return
    }

    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onLogSaved()
    }, 900)
    setSaving(false)
  }

  return (
    <>
      <PhaseBanner label={label} dayOfCycle={dayOfCycle} tip={tip} tipLoading={tipLoading} />

      <TimeCard
        bedtime={bedtime} wakeTime={wakeTime}
        onBedtime={setBedtime} onWakeTime={setWakeTime}
        totalHours={totalHours}
      />

      <QualityRow selected={quality} onSelect={setQuality} />
      <TagChips   selected={tags}    onToggle={toggleTag}  />

      {/* Dream notes */}
      <div style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: 16,
        border: '1px solid rgba(196,175,168,0.35)',
        padding: '12px 14px',
        marginBottom: 16,
      }}>
        <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3" style={{ color: '#7A6A65' }}>
          Dream Notes
        </p>
        <textarea
          value={dreamNotes}
          onChange={e => setDreamNotes(e.target.value)}
          placeholder="What did you dream of…"
          rows={3}
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none', resize: 'none',
            fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontStyle: 'italic',
            color: '#3B3330',
          }}
        />
      </div>

      {error && (
        <p className="font-garamond text-sm italic mb-3" style={{ color: '#D4A0A0' }}>{error}</p>
      )}

      {saved ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(155,151,196,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Check size={22} color={INDIGO} strokeWidth={2} />
          </div>
        </div>
      ) : (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px',
            background: INDIGO, border: 'none', borderRadius: 14,
            cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: 10,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#F2EDE8',
            opacity: saving ? 0.6 : 1,
            transition: 'opacity 0.2s',
            marginBottom: 24,
          }}
        >
          {saving ? 'Saving…' : 'Save Sleep Log'}
        </button>
      )}
    </>
  )
}
