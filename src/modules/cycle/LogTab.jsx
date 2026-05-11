import { useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase'

import lowIcon     from '../../assets/icons/low.png'
import anxiousIcon from '../../assets/icons/anxious.png'
import neutralIcon from '../../assets/icons/Neutral.png'
import goodIcon    from '../../assets/icons/Good.png'
import greatIcon   from '../../assets/icons/Great.png'

const SYMPTOM_CATEGORIES = [
  {
    name: 'Physical Pain',
    items: ['Cramps', 'Back pain', 'Headache', 'Breast tenderness', 'Bloating'],
  },
  {
    name: 'Energy & Body',
    items: ['Fatigue', 'Nausea', 'Dizziness', 'Acne', 'Hot flashes', 'Chills'],
  },
  {
    name: 'Digestive',
    items: ['Constipation', 'Diarrhea', 'Food cravings', 'Appetite changes'],
  },
  {
    name: 'Other',
    items: ['Spotting', 'Discharge changes', 'Insomnia', 'Weight changes'],
  },
]

const FLOW_LABELS = ['Spotting', 'Light', 'Medium', 'Heavy', 'Very Heavy']

const MOODS = [
  { icon: lowIcon,     label: 'Low',     value: 1 },
  { icon: anxiousIcon, label: 'Anxious', value: 2 },
  { icon: neutralIcon, label: 'Neutral', value: 3 },
  { icon: goodIcon,    label: 'Good',    value: 4 },
  { icon: greatIcon,   label: 'Great',   value: 5 },
]

function toKey(s) { return s.toLowerCase().replace(/\s+/g, '_') }

export default function LogTab({ profile, phaseData, user, preselectedDate, symptoms, onSaved }) {
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  // Find existing log for preselected date to pre-fill
  const initDate = preselectedDate ?? todayDate
  const initDateStr = format(initDate, 'yyyy-MM-dd')
  const existing = symptoms?.find(s => s.logged_date === initDateStr)

  const [selectedDate, setSelectedDate] = useState(initDate)
  const [periodOn,  setPeriodOn]  = useState(existing?.flow_level > 0 ?? false)
  const [flow,      setFlow]      = useState(existing?.flow_level ?? 0)
  const [selected,  setSelected]  = useState(() => {
    if (!existing) return []
    const s = []
    if (existing.cramps)            s.push('Cramps')
    if (existing.bloating)          s.push('Bloating')
    if (existing.headache)          s.push('Headache')
    if (existing.fatigue)           s.push('Fatigue')
    if (existing.breast_tenderness) s.push('Breast tenderness')
    if (Array.isArray(existing.symptoms_raw)) {
      existing.symptoms_raw.forEach(x => { if (!s.includes(x)) s.push(x) })
    }
    return s
  })
  const [mood,      setMood]      = useState(existing?.mood ?? null)
  const [bbt,       setBbt]       = useState(existing?.bbt ?? '')
  const [bbtUnit,   setBbtUnit]   = useState('F')
  const [weight,    setWeight]    = useState(existing?.weight ?? '')
  const [weightUnit,setWeightUnit]= useState('lbs')
  const [water,     setWater]     = useState(existing?.water_glasses ?? 0)
  const [notes,     setNotes]     = useState(existing?.notes ?? '')
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)

  function toggleSymptom(sym) {
    setSelected(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    )
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const symSet  = new Set(selected.map(toKey))

    const entry = {
      user_id:           user.id,
      logged_date:       dateStr,
      flow_level:        periodOn ? flow : null,
      cramps:            symSet.has('cramps'),
      bloating:          symSet.has('bloating'),
      headache:          symSet.has('headache'),
      fatigue:           symSet.has('fatigue'),
      breast_tenderness: symSet.has('breast_tenderness'),
      symptoms_raw:      selected,
      mood:              mood,
      bbt:               bbt !== '' ? parseFloat(bbt) : null,
      bbt_unit:          bbt !== '' ? bbtUnit : null,
      weight:            weight !== '' ? parseFloat(weight) : null,
      weight_unit:       weight !== '' ? weightUnit : null,
      water_glasses:     water,
      notes:             notes.trim() || null,
      phase_at_time:     phaseData?.phase ?? null,
    }

    await supabase.from('symptoms').upsert(entry, { onConflict: 'user_id,logged_date' })

    // Manage cycles table
    if (periodOn) {
      await supabase.from('cycles').upsert(
        { user_id: user.id, start_date: dateStr },
        { onConflict: 'user_id,start_date', ignoreDuplicates: true }
      )
      // Update profile last_period_date if this is today
      if (format(todayDate, 'yyyy-MM-dd') === dateStr) {
        await supabase.from('profiles').update({ last_period_date: dateStr }).eq('id', user.id)
      }
    } else {
      // Close any open cycle that started before or on this date
      const { data: open } = await supabase
        .from('cycles')
        .select('id')
        .eq('user_id', user.id)
        .is('end_date', null)
        .lte('start_date', dateStr)
        .order('start_date', { ascending: false })
        .limit(1)
      if (open?.length > 0) {
        await supabase.from('cycles').update({ end_date: dateStr }).eq('id', open[0].id)
      }
    }

    setSaving(false)
    setSaved(true)
    onSaved?.()
    setTimeout(() => setSaved(false), 2000)
  }

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const maxDate = format(todayDate, 'yyyy-MM-dd')

  return (
    <div className="space-y-5 pb-4">
      {/* ── Date header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="font-cinzel text-ivory/60 text-[10px] tracking-widest uppercase">Logging for</p>
        <input
          type="date"
          value={dateStr}
          max={maxDate}
          onChange={e => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
          className="font-garamond text-gold text-sm bg-transparent border-b border-gold/30 pb-0.5 outline-none cursor-pointer"
        />
      </div>

      {/* ── Period & Flow ────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(139,26,26,0.12)', border: '1px solid rgba(139,26,26,0.25)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-cinzel text-ivory/80 text-xs tracking-widest">PERIOD TODAY?</span>
          <button
            onClick={() => { setPeriodOn(p => !p); if (!periodOn && flow === 0) setFlow(2) }}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ background: periodOn ? '#C9A86C' : 'rgba(244,239,230,0.15)' }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow"
              style={{ left: periodOn ? '22px' : '2px' }}
            />
          </button>
        </div>

        {periodOn && (
          <div className="flex justify-between pt-1">
            {FLOW_LABELS.map((label, i) => (
              <button
                key={label}
                onClick={() => setFlow(i + 1)}
                className="flex flex-col items-center gap-1"
              >
                <span
                  className="text-xl transition-all"
                  style={{ color: flow >= i + 1 ? '#C9A86C' : 'rgba(244,239,230,0.18)' }}
                >
                  {flow >= i + 1 ? '💧' : '○'}
                </span>
                <span className="font-garamond text-[9px] text-ivory/35">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Symptoms ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase mb-3">Symptoms</p>
        <div className="space-y-3">
          {SYMPTOM_CATEGORIES.map(cat => (
            <div key={cat.name}>
              <p className="font-garamond text-ivory/30 text-xs mb-2 italic">{cat.name}</p>
              <div className="grid grid-cols-3 gap-2">
                {cat.items.map(sym => {
                  const on = selected.includes(sym)
                  return (
                    <button
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className="font-garamond text-xs py-1.5 px-2 rounded-lg text-center transition-all leading-tight"
                      style={{
                        background: on ? 'rgba(201,168,108,0.18)' : 'transparent',
                        border: on ? '1px solid rgba(201,168,108,0.6)' : '1px solid rgba(244,239,230,0.18)',
                        color: on ? '#C9A86C' : 'rgba(244,239,230,0.6)',
                      }}
                    >
                      {sym}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mood ─────────────────────────────────────────────────────────────── */}
      <div>
        <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase mb-3">Mood</p>
        <div className="flex justify-between">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  border: mood === m.value ? '2px solid #C9A86C' : '2px solid rgba(244,239,230,0.1)',
                  background: mood === m.value ? 'rgba(201,168,108,0.12)' : 'rgba(244,239,230,0.06)',
                }}
              >
                <img
                  src={m.icon}
                  alt={m.label}
                  style={{
                    width: '28px',
                    height: '28px',
                    objectFit: 'contain',
                    opacity: mood === m.value ? 1 : 0.7,
                    transition: 'opacity 0.2s',
                  }}
                />
              </div>
              <span className="font-garamond text-[9px] text-ivory/35">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Body Stats ───────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 space-y-4"
        style={{ background: 'rgba(201,168,108,0.06)', border: '1px solid rgba(201,168,108,0.12)' }}
      >
        <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase">Body Stats</p>

        {/* BBT */}
        <div>
          <p className="font-garamond text-ivory/40 text-xs mb-1">Basal Body Temp</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              placeholder={bbtUnit === 'F' ? '98.6' : '37.0'}
              value={bbt}
              onChange={e => setBbt(e.target.value)}
              className="flex-1 bg-transparent border-b border-ivory/20 text-ivory font-garamond text-sm py-1 outline-none"
            />
            <button
              onClick={() => setBbtUnit(u => u === 'F' ? 'C' : 'F')}
              className="font-cinzel text-[10px] text-gold border border-gold/30 px-2 py-1 rounded"
            >
              °{bbtUnit}
            </button>
          </div>
        </div>

        {/* Weight */}
        <div>
          <p className="font-garamond text-ivory/40 text-xs mb-1">Weight</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              placeholder={weightUnit === 'lbs' ? '130' : '59'}
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="flex-1 bg-transparent border-b border-ivory/20 text-ivory font-garamond text-sm py-1 outline-none"
            />
            <button
              onClick={() => setWeightUnit(u => u === 'lbs' ? 'kg' : 'lbs')}
              className="font-cinzel text-[10px] text-gold border border-gold/30 px-2 py-1 rounded"
            >
              {weightUnit}
            </button>
          </div>
        </div>

        {/* Water */}
        <div>
          <p className="font-garamond text-ivory/40 text-xs mb-2">Water Intake</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWater(w => Math.max(0, w - 1))}
              className="w-7 h-7 flex items-center justify-center text-gold border border-gold/30 rounded-full text-lg leading-none"
            >
              −
            </button>
            <div className="flex gap-1 flex-1 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => (
                <button key={i} onClick={() => setWater(i + 1)}>
                  <span
                    className="text-sm transition-all"
                    style={{ color: i < water ? '#C9A86C' : 'rgba(244,239,230,0.18)' }}
                  >
                    {i < water ? '💧' : '○'}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setWater(w => Math.min(10, w + 1))}
              className="w-7 h-7 flex items-center justify-center text-gold border border-gold/30 rounded-full text-lg leading-none"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ── Notes ────────────────────────────────────────────────────────────── */}
      <div>
        <p className="font-cinzel text-ivory/50 text-[10px] tracking-widest uppercase mb-2">Notes</p>
        <div className="relative">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="How are you feeling today? Any other observations..."
            className="w-full bg-transparent text-ivory/70 font-garamond text-sm resize-none outline-none border-b border-ivory/15 pb-5 placeholder:text-ivory/25 leading-relaxed"
          />
          <span className="absolute bottom-1 right-0 font-garamond text-[10px] text-ivory/25">
            {notes.length}/500
          </span>
        </div>
      </div>

      {/* ── Save button ──────────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="w-full py-4 rounded-xl font-cinzel tracking-widest text-sm transition-all"
        style={{
          background: saved ? 'rgba(201,168,108,0.12)' : 'transparent',
          border: '1px solid rgba(201,168,108,0.55)',
          color: '#C9A86C',
          animation: saved ? 'goldPulse 0.6s ease-out' : undefined,
        }}
      >
        {saving ? '···' : saved ? '✦ SAVED' : 'SAVE TODAY'}
      </button>
    </div>
  )
}
