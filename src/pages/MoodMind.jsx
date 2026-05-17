import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Mic } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'

// ─── Static data ──────────────────────────────────────────────────────────────

const MOOD_WEATHER = [
  { id: 'golden',   icon: '☀️',  label: 'Golden Hour'   },
  { id: 'partly',   icon: '🌤',  label: 'Partly Cloudy' },
  { id: 'storm',    icon: '🌧',  label: 'Storm Passing' },
  { id: 'foggy',    icon: '🌫',  label: 'Foggy'         },
  { id: 'heavy',    icon: '⛈',  label: 'Heavy Weather' },
  { id: 'clearing', icon: '🌈',  label: 'Clearing Up'   },
  { id: 'night',    icon: '🌙',  label: 'Still Night'   },
]

const FEELINGS_WHEEL = [
  { id: 'happy',       label: 'Happy',       subs: ['Joyful', 'Hopeful', 'Playful', 'Content']           },
  { id: 'calm',        label: 'Calm',        subs: ['Peaceful', 'Grounded', 'Detached', 'Sleepy']         },
  { id: 'anxious',     label: 'Anxious',     subs: ['Dread', 'Overstimulated', 'Uncertain', 'Restless']   },
  { id: 'sad',         label: 'Sad',         subs: ['Lonely', 'Grieving', 'Disappointed', 'Numb']         },
  { id: 'irritable',   label: 'Irritable',   subs: ['Frustrated', 'Resentful', 'Snappy', 'Drained']       },
  { id: 'motivated',   label: 'Motivated',   subs: ['Focused', 'Ambitious', 'Energized', 'Determined']    },
  { id: 'grateful',    label: 'Grateful',    subs: ['Moved', 'Appreciative', 'Warm', 'Blessed']           },
  { id: 'overwhelmed', label: 'Overwhelmed', subs: ['Depleted', 'Frozen', 'Scattered', 'Suffocated']      },
]

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="font-cinzel text-[9px] tracking-[0.28em] uppercase mb-3"
      style={{ color: '#7A6A65' }}>
      {children}
    </p>
  )
}

// ─── Phase Banner ─────────────────────────────────────────────────────────────

function PhaseBanner({ label, dayOfCycle, cycleLength, insight, loading, onNavigate }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(143,165,140,0.32) 0%, rgba(143,165,140,0.10) 100%)',
      border: '1px solid rgba(143,165,140,0.45)',
      borderRadius: 16,
    }} className="flex items-start justify-between gap-3 px-4 py-3 mb-5">
      <div className="flex-1 min-w-0">
        <p className="font-cinzel text-[9px] tracking-[0.25em] uppercase mb-1.5"
          style={{ color: '#8FA58C' }}>
          {label ?? 'Cycle Phase'}
          {dayOfCycle ? ` · Day ${dayOfCycle}${cycleLength ? ` of ${cycleLength}` : ''}` : ''}
        </p>
        <p className="font-garamond text-sm leading-snug"
          style={{ color: loading ? 'rgba(59,51,48,0.35)' : '#3B3330', fontStyle: loading ? 'italic' : 'normal', transition: 'color 0.3s' }}>
          {loading ? 'Reading your phase…' : (insight || 'Your body holds its own wisdom this phase.')}
        </p>
      </div>
      <button onClick={onNavigate} className="mt-0.5 flex-shrink-0" style={{ color: '#8FA58C' }}>
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}

// ─── Mood Weather Selector ────────────────────────────────────────────────────

function WeatherSelector({ selected, onSelect }) {
  return (
    <div className="mb-5">
      <SectionLabel>Inner weather</SectionLabel>
      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {MOOD_WEATHER.map(w => {
          const active = w.id === selected
          return (
            <button
              key={w.id}
              onClick={() => onSelect(active ? null : w.id)}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                borderRadius: 22,
                border: active ? '1px solid rgba(143,165,140,0.7)' : '1px solid rgba(59,51,48,0.12)',
                background: active ? 'rgba(143,165,140,0.16)' : 'rgba(242,237,232,0.65)',
                transition: 'all 0.2s',
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span style={{ fontSize: 18, lineHeight: 1 }}>{w.icon}</span>
                <span className="font-garamond text-[10px] whitespace-nowrap"
                  style={{ color: active ? '#3B3330' : '#7A6A65' }}>
                  {w.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Feelings Wheel ───────────────────────────────────────────────────────────

function FeelingsWheel({ selected, onToggle, expanded, onExpand }) {
  return (
    <div className="mb-5">
      <SectionLabel>What are you feeling?</SectionLabel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {FEELINGS_WHEEL.map(f => {
          const isExpanded   = expanded === f.id
          const isSelected   = selected.includes(f.id)

          return (
            <div key={f.id}>
              {/* Tier-1 pill */}
              <button
                onClick={() => { onToggle(f.id); onExpand(isExpanded ? null : f.id) }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px',
                  borderRadius: 22,
                  border: isSelected
                    ? '1px solid rgba(196,133,154,0.65)'
                    : '1px solid rgba(59,51,48,0.14)',
                  background: isSelected
                    ? 'rgba(196,133,154,0.16)'
                    : 'rgba(242,237,232,0.65)',
                  color: isSelected ? '#C4859A' : '#3B3330',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 14,
                  transition: 'all 0.2s',
                }}
              >
                {f.label}
                <ChevronDown
                  size={11} strokeWidth={1.8}
                  style={{
                    color: isSelected ? '#C4859A' : '#7A6A65',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.22s ease',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Sub-emotions accordion */}
              <div style={{
                maxHeight: isExpanded ? '100px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.25s ease',
              }}>
                <div className="flex flex-wrap gap-2 pt-2 pl-2 pb-1">
                  {f.subs.map(sub => {
                    const subActive = selected.includes(sub)
                    return (
                      <button
                        key={sub}
                        onClick={() => onToggle(sub)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: 12.5,
                          border: subActive
                            ? '1px solid rgba(196,133,154,0.55)'
                            : '1px solid rgba(196,175,168,0.5)',
                          background: subActive
                            ? 'rgba(196,133,154,0.12)'
                            : 'rgba(196,175,168,0.22)',
                          color: subActive ? '#C4859A' : '#7A6A65',
                          transition: 'all 0.18s',
                        }}
                      >
                        {sub}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selected.length > 0 && (
        <p className="font-garamond text-[11px] mt-3" style={{ color: '#7A6A65', fontStyle: 'italic' }}>
          {selected.length} {selected.length === 1 ? 'emotion' : 'emotions'} selected
        </p>
      )}
    </div>
  )
}

// ─── Affirmation Card ─────────────────────────────────────────────────────────

function AffirmationCard({ text, loading }) {
  return (
    <div style={{
      background: '#C4AFA8',
      border: '1px solid rgba(196,175,168,0.4)',
      borderRadius: 16,
      padding: '14px 16px',
      marginBottom: 20,
      animation: 'mmFadeUp 0.35s ease both',
    }}>
      <p className="font-cinzel text-[8px] tracking-[0.25em] uppercase mb-2"
        style={{ color: '#7A6A65' }}>For you, right now</p>
      {loading ? (
        <p className="font-garamond text-sm italic"
          style={{ color: 'rgba(59,51,48,0.45)', animation: 'mmPulse 1.6s ease-in-out infinite' }}>
          Finding your affirmation…
        </p>
      ) : (
        <p className="font-garamond text-base leading-relaxed" style={{ color: '#3B3330' }}>
          "{text}"
        </p>
      )}
    </div>
  )
}

// ─── Journal Section ──────────────────────────────────────────────────────────

function JournalSection({ prompt, promptLoading, text, onChange, onRecord, recording }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Journal</SectionLabel>
        <button
          onClick={onRecord}
          className="flex items-center gap-1.5 mb-3"
          style={{ color: recording ? '#C4859A' : '#7A6A65' }}
        >
          {recording && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#C4859A',
              display: 'inline-block', animation: 'mmRecDot 1s ease-in-out infinite',
            }} />
          )}
          <Mic size={13} strokeWidth={1.5} />
          <span className="font-garamond text-[10px] italic">
            {recording ? 'Listening…' : 'Speak instead'}
          </span>
        </button>
      </div>

      {/* Guided prompt */}
      <div style={{
        background: 'rgba(196,175,168,0.18)',
        border: '1px solid rgba(196,175,168,0.38)',
        borderRadius: 12,
        padding: '10px 14px',
        marginBottom: 8,
      }}>
        <p className="font-garamond text-sm leading-relaxed"
          style={{
            color: promptLoading ? 'rgba(59,51,48,0.32)' : '#3B3330',
            fontStyle: 'italic',
            animation: promptLoading ? 'mmPulse 1.6s ease-in-out infinite' : 'none',
          }}>
          {promptLoading
            ? 'Writing your prompt…'
            : (prompt || 'What is one thing your body is asking for today?')}
        </p>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => onChange(e.target.value)}
        placeholder="Write freely, or just breathe…"
        rows={4}
        style={{
          width: '100%',
          background: 'rgba(242,237,232,0.7)',
          border: '1px solid rgba(196,175,168,0.38)',
          borderRadius: 12,
          padding: '12px 14px',
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 14,
          color: '#3B3330',
          outline: 'none',
          resize: 'none',
          lineHeight: 1.65,
        }}
      />
    </div>
  )
}

// ─── Gratitude Modal ──────────────────────────────────────────────────────────

function GratitudeModal({ value, onChange, onAdd, onSkip }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(59,51,48,0.3)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'mmFadeUp 0.2s ease both',
    }}>
      <div style={{
        background: '#F2EDE8',
        borderRadius: '20px 20px 0 0',
        padding: '28px 24px 44px',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 -8px 40px rgba(59,51,48,0.1)',
        animation: 'mmSlideUp 0.3s ease both',
      }}>
        <p className="font-cinzel text-[8px] tracking-[0.3em] uppercase mb-3"
          style={{ color: '#8FA58C' }}>One last thing</p>
        <p className="font-garamond text-base leading-relaxed mb-6"
          style={{ color: '#3B3330' }}>
          What's one thing you're grateful for today?
        </p>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && value.trim() && onAdd(value)}
          placeholder="Something small counts…"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(196,133,154,0.5)',
            padding: '8px 0',
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 15,
            color: '#3B3330',
            outline: 'none',
            marginBottom: 24,
          }}
        />
        <div className="flex gap-3">
          <button
            onClick={() => onAdd(value)}
            className="flex-1 py-3 rounded-xl font-cinzel text-[8.5px] tracking-[0.2em] uppercase"
            style={{
              background: 'rgba(196,133,154,0.14)',
              border: '1px solid rgba(196,133,154,0.4)',
              color: '#C4859A',
            }}
          >
            Add it
          </button>
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl font-cinzel text-[8.5px] tracking-[0.2em] uppercase"
            style={{
              background: 'transparent',
              border: '1px solid rgba(59,51,48,0.12)',
              color: '#7A6A65',
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Success Overlay ──────────────────────────────────────────────────────────

function SuccessOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 101,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(242,237,232,0.94)',
      animation: 'mmFadeUp 0.4s ease both',
    }}>
      <div className="text-center px-8" style={{ animation: 'mmFadeUp 0.5s ease 0.1s both' }}>
        <p className="font-cinzel text-[9px] tracking-[0.35em] uppercase mb-3"
          style={{ color: '#8FA58C' }}>Saved</p>
        <p className="font-garamond text-lg leading-relaxed" style={{ color: '#3B3330' }}>
          Logged. You showed up for yourself today.
        </p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MoodMind() {
  const { user }    = useAuth()
  const { profile } = useProfile()
  const { phase, label: phaseLabel, dayOfCycle } = usePhase()
  const navigate    = useNavigate()

  const cycleLength = profile?.cycle_length ?? 28

  // Core
  const [moodWeather,       setMoodWeather]       = useState(null)
  const [mood,               setMood]               = useState(5)
  const [energy,             setEnergy]             = useState(5)
  const [expandedEmotion,    setExpandedEmotion]    = useState(null)
  const [selectedEmotions,   setSelectedEmotions]   = useState([])

  // AI
  const [phaseInsight,       setPhaseInsight]       = useState('')
  const [phaseInsightLoading,setPhaseInsightLoading]= useState(false)
  const [affirmation,        setAffirmation]        = useState('')
  const [affirmationLoading, setAffirmationLoading] = useState(false)
  const [journalPrompt,      setJournalPrompt]      = useState('')
  const [journalPromptLoading,setJournalPromptLoading] = useState(false)

  // Journal & voice
  const [journalText, setJournalText] = useState('')
  const [recording,   setRecording]   = useState(false)
  const recognitionRef = useRef(null)

  // Submit flow
  const [saving,        setSaving]        = useState(false)
  const [showGratitude, setShowGratitude] = useState(false)
  const [gratitudeText, setGratitudeText] = useState('')
  const [success,       setSuccess]       = useState(false)

  // ── Phase banner insight ────────────────────────────────────────────────────
  useEffect(() => {
    if (!phase) return
    let dead = false
    setPhaseInsightLoading(true)
    fetch('/.netlify/functions/ai-mood-phase-banner', {
      method: 'POST',
      body: JSON.stringify({ phase, label: phaseLabel }),
    })
      .then(r => r.json())
      .then(d => { if (!dead) setPhaseInsight(d.insight || '') })
      .catch(() => {})
      .finally(() => { if (!dead) setPhaseInsightLoading(false) })
    return () => { dead = true }
  }, [phase])

  // ── Affirmation (debounced) ─────────────────────────────────────────────────
  useEffect(() => {
    if (selectedEmotions.length === 0) { setAffirmation(''); setAffirmationLoading(false); return }
    setAffirmationLoading(true)
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/.netlify/functions/ai-mood-affirmation', {
          method: 'POST',
          body: JSON.stringify({ emotions: selectedEmotions, moodWeather, phase }),
        })
        const d = await r.json()
        setAffirmation(d.affirmation || '')
      } catch {}
      setAffirmationLoading(false)
    }, 1200)
    return () => clearTimeout(t)
  }, [selectedEmotions.join(','), moodWeather])

  // ── Journal prompt (debounced) ──────────────────────────────────────────────
  useEffect(() => {
    if (!phase) return
    setJournalPromptLoading(true)
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/.netlify/functions/ai-journal-prompt', {
          method: 'POST',
          body: JSON.stringify({ phase, mood, energy, emotions: selectedEmotions, moodWeather }),
        })
        const d = await r.json()
        setJournalPrompt(d.prompt || '')
      } catch {}
      setJournalPromptLoading(false)
    }, 1400)
    return () => clearTimeout(t)
  }, [phase, selectedEmotions.join(','), moodWeather])

  // ── Cleanup speech recognition on unmount ───────────────────────────────────
  useEffect(() => () => recognitionRef.current?.stop(), [])

  // ── Emotion toggle ──────────────────────────────────────────────────────────
  function toggleEmotion(id) {
    setSelectedEmotions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // ── Voice recording ─────────────────────────────────────────────────────────
  function handleRecord() {
    if (recording) { recognitionRef.current?.stop(); setRecording(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = e => {
      const t = e.results[0][0].transcript
      setJournalText(prev => (prev ? prev + ' ' + t : t))
      setRecording(false)
    }
    rec.onerror = rec.onend = () => setRecording(false)
    rec.start()
    recognitionRef.current = rec
    setRecording(true)
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function doSave(gratitude) {
    setSaving(true)
    setShowGratitude(false)
    const today = new Date().toISOString().split('T')[0]
    try {
      await supabase.from('mood_logs').upsert({
        user_id:        user.id,
        logged_date:    today,
        mood_score:     mood,
        energy_score:   energy,
        emotions:       selectedEmotions,
        phase_at_time:  phase,
        mood_weather:   moodWeather,
        journal_prompt: journalPrompt,
        journal_entry:  journalText,
        gratitude:      gratitude || null,
      })
    } catch {}
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3200)
  }

  // ── ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 min-h-0 bg-[#F2EDE8] overflow-y-auto pb-nav">
      <style>{`
        @keyframes mmFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mmSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes mmPulse {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 0.7; }
        }
        @keyframes mmRecDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(0.7); }
        }
        .mm-scroll::-webkit-scrollbar { display: none; }
        textarea:focus { box-shadow: none; }
      `}</style>

      <div className="px-4 pt-8 max-w-md mx-auto">

        {/* ── Header ── */}
        <h2 className="font-cinzel text-2xl text-brown tracking-widest mb-5">Mood & Mind</h2>

        {/* ── Phase Banner ── */}
        <PhaseBanner
          label={phaseLabel}
          dayOfCycle={dayOfCycle}
          cycleLength={cycleLength}
          insight={phaseInsight}
          loading={phaseInsightLoading}
          onNavigate={() => navigate('/cycle')}
        />

        {/* ── Inner Weather ── */}
        <WeatherSelector selected={moodWeather} onSelect={setMoodWeather} />

        {/* ── Sliders ── */}
        <GlassCard className="mb-5 space-y-4">
          <div>
            <p className="font-garamond text-sm mb-2" style={{ color: 'rgba(59,51,48,0.6)' }}>
              Mood: {mood}/10
            </p>
            <input
              type="range" min="1" max="10" value={mood}
              onChange={e => setMood(Number(e.target.value))}
              className="w-full accent-rose"
            />
          </div>
          <div>
            <p className="font-garamond text-sm mb-2" style={{ color: 'rgba(59,51,48,0.6)' }}>
              Energy: {energy}/10
            </p>
            <input
              type="range" min="1" max="10" value={energy}
              onChange={e => setEnergy(Number(e.target.value))}
              className="w-full accent-sage"
            />
          </div>
        </GlassCard>

        {/* ── Feelings Wheel ── */}
        <FeelingsWheel
          selected={selectedEmotions}
          onToggle={toggleEmotion}
          expanded={expandedEmotion}
          onExpand={setExpandedEmotion}
        />

        {/* ── Affirmation (appears once emotions are selected) ── */}
        {(affirmationLoading || affirmation) && (
          <AffirmationCard text={affirmation} loading={affirmationLoading} />
        )}

        {/* ── Journal ── */}
        <JournalSection
          prompt={journalPrompt}
          promptLoading={journalPromptLoading}
          text={journalText}
          onChange={setJournalText}
          onRecord={handleRecord}
          recording={recording}
        />

        {/* ── Log Mood ── */}
        <button
          onClick={() => setShowGratitude(true)}
          disabled={saving}
          className="w-full font-cinzel tracking-widest py-3 rounded-xl transition-all disabled:opacity-40 mb-6"
          style={{
            background: 'rgba(196,133,154,0.14)',
            border: '1px solid rgba(196,133,154,0.4)',
            color: '#C4859A',
          }}
        >
          {saving ? '…' : 'LOG MOOD'}
        </button>

      </div>

      {/* ── Gratitude Modal ── */}
      {showGratitude && (
        <GratitudeModal
          value={gratitudeText}
          onChange={setGratitudeText}
          onAdd={text => doSave(text)}
          onSkip={() => doSave(null)}
        />
      )}

      {/* ── Success Overlay ── */}
      {success && <SuccessOverlay />}
    </div>
  )
}
