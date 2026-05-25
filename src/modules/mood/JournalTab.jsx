import { useState, useEffect, useRef } from 'react'
import { Mic, Image, X } from 'lucide-react'
import { usePhase } from '../../hooks/usePhase'

function getMoonPhase(date) {
  const refNewMoon = new Date(2000, 0, 6)
  const synodic = 29.53059
  const days = (date - refNewMoon) / 86400000
  const cycle = ((days % synodic) + synodic) % synodic
  if (cycle < 1.85)  return { name: 'New Moon',        icon: '🌑' }
  if (cycle < 7.38)  return { name: 'Waxing Crescent', icon: '🌒' }
  if (cycle < 9.22)  return { name: 'First Quarter',   icon: '🌓' }
  if (cycle < 14.76) return { name: 'Waxing Gibbous',  icon: '🌔' }
  if (cycle < 16.61) return { name: 'Full Moon',       icon: '🌕' }
  if (cycle < 22.15) return { name: 'Waning Gibbous',  icon: '🌖' }
  if (cycle < 23.99) return { name: 'Last Quarter',    icon: '🌗' }
  return                    { name: 'Waning Crescent', icon: '🌘' }
}

function SL({ children }) {
  return (
    <p className="font-cinzel text-[9px] uppercase mb-2" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
      {children}
    </p>
  )
}

function VoiceTextarea({ label, placeholder, value, onChange, onVoice, recording }) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-1.5">
        <SL>{label}</SL>
        <button
          onClick={onVoice}
          className="flex items-center gap-1"
          style={{ color: recording ? '#D4A0A0' : '#7A6A65', flexShrink: 0 }}
        >
          {recording && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#D4A0A0',
              display: 'inline-block', animation: 'jRecDot 1s ease-in-out infinite',
            }} />
          )}
          <Mic size={13} strokeWidth={1.5} />
        </button>
      </div>
      {recording && (
        <p className="font-garamond text-[10px] italic mb-1" style={{ color: '#D4A0A0' }}>speak instead</p>
      )}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        onFocus={e => (e.target.style.borderBottomColor = 'rgba(143,165,140,0.75)')}
        onBlur={e => (e.target.style.borderBottomColor = 'rgba(143,165,140,0.3)')}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          borderBottom: '1px solid rgba(143,165,140,0.3)',
          padding: '8px 0', fontFamily: 'Cormorant Garamond, serif',
          fontSize: 15, color: '#3B3330', outline: 'none', resize: 'none',
          lineHeight: 1.7,
        }}
      />
    </div>
  )
}

function EntryOverlay({ entry, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: '#F2EDE8',
      overflowY: 'auto', scrollbarWidth: 'none',
      padding: '32px 24px 80px',
    }}>
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 20, right: 20, color: '#7A6A65' }}
      >
        <X size={20} strokeWidth={1.5} />
      </button>

      <p className="font-cinzel text-[8px] tracking-[0.3em] uppercase mb-1" style={{ color: '#7A6A65' }}>
        {entry.date} · {entry.moonPhase?.icon} {entry.moonPhase?.name}
      </p>

      {entry.prompt && (
        <p className="font-garamond text-lg italic leading-relaxed mt-3 mb-6 text-center"
          style={{ color: '#3B3330', borderBottom: '1px solid rgba(143,165,140,0.3)', paddingBottom: 16 }}>
          "{entry.prompt}"
        </p>
      )}

      {entry.responses?.how && (
        <div className="mb-5">
          <p className="font-cinzel text-[8px] uppercase mb-2" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>How today felt</p>
          <p className="font-garamond text-sm leading-relaxed" style={{ color: '#3B3330' }}>{entry.responses.how}</p>
        </div>
      )}
      {entry.responses?.drained && (
        <div className="mb-5">
          <p className="font-cinzel text-[8px] uppercase mb-2" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>What drained you</p>
          <p className="font-garamond text-sm leading-relaxed" style={{ color: '#3B3330' }}>{entry.responses.drained}</p>
        </div>
      )}
      {entry.responses?.holding && (
        <div className="mb-5">
          <p className="font-cinzel text-[8px] uppercase mb-2" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>What you were holding onto</p>
          <p className="font-garamond text-sm leading-relaxed" style={{ color: '#3B3330' }}>{entry.responses.holding}</p>
        </div>
      )}
      {entry.photoData && (
        <img src={entry.photoData} alt="" style={{ width: '100%', borderRadius: 12, marginTop: 8 }} />
      )}
    </div>
  )
}

export default function JournalTab({ todayEmotions, todayMoodWeather }) {
  const { phase, label: phaseLabel } = usePhase()

  const [prompt, setPrompt]               = useState('')
  const [promptLoading, setPromptLoading] = useState(false)

  const [how, setHow]         = useState('')
  const [drained, setDrained] = useState('')
  const [holding, setHolding] = useState('')

  const [recording, setRecording] = useState(null) // 'how' | 'drained' | 'holding' | null
  const recognitionRef = useRef(null)

  const [photo, setPhoto]     = useState(null)
  const photoInputRef         = useRef(null)

  const [pastEntries, setPastEntries] = useState([])
  const [expandedEntry, setExpandedEntry] = useState(null)
  const [saved, setSaved]     = useState(false)

  const today     = new Date().toISOString().split('T')[0]
  const moonPhase = getMoonPhase(new Date())
  const dateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  // Load past entries
  useEffect(() => {
    try {
      setPastEntries(JSON.parse(localStorage.getItem('athena_journal') || '[]'))
    } catch {}
  }, [])

  // AI journal prompt
  useEffect(() => {
    if (!phase) return
    let dead = false
    setPromptLoading(true)
    fetch('/.netlify/functions/ai-journal-prompt', {
      method: 'POST',
      body: JSON.stringify({
        phase, mood: 5, energy: 5,
        emotions: todayEmotions || [],
        moodWeather: todayMoodWeather || null,
      }),
    })
      .then(r => r.json())
      .then(d => { if (!dead) setPrompt(d.prompt || '') })
      .catch(() => { if (!dead) setPrompt('What is your body asking for today?') })
      .finally(() => { if (!dead) setPromptLoading(false) })
    return () => { dead = true }
  }, [phase])

  // Cleanup on unmount
  useEffect(() => () => recognitionRef.current?.stop(), [])

  function startVoice(field) {
    if (recording === field) { recognitionRef.current?.stop(); setRecording(null); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    recognitionRef.current?.stop()
    const rec = new SR()
    rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US'
    rec.onresult = e => {
      const t = e.results[0][0].transcript
      if (field === 'how')     setHow(p => p ? p + ' ' + t : t)
      if (field === 'drained') setDrained(p => p ? p + ' ' + t : t)
      if (field === 'holding') setHolding(p => p ? p + ' ' + t : t)
      setRecording(null)
    }
    rec.onerror = () => setRecording(null)
    rec.onend   = () => setRecording(null)
    rec.start()
    recognitionRef.current = rec
    setRecording(field)
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Image is over 2MB — try a smaller photo.')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  function saveEntry() {
    const entry = {
      date: today,
      phase,
      prompt,
      moonPhase,
      responses: { how, drained, holding },
      voiceUsed: false,
      photoAttached: !!photo,
      photoData: photo,
    }
    try {
      const existing = JSON.parse(localStorage.getItem('athena_journal') || '[]')
      const updated  = [entry, ...existing.filter(e => e.date !== today)]
      localStorage.setItem('athena_journal', JSON.stringify(updated))
      setPastEntries(updated)
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <style>{`
        @keyframes jPulse  { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.8; } }
        @keyframes jFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes jRecDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.7); } }
        .jo-scroll::-webkit-scrollbar { display: none; }
        textarea:focus { box-shadow: none; }
      `}</style>

      {/* Date + moon */}
      <div className="flex items-center justify-between mb-7">
        <p className="font-garamond text-sm" style={{ color: '#7A6A65' }}>{dateDisplay}</p>
        <p className="font-garamond text-sm" style={{ color: '#7A6A65' }}>{moonPhase.icon} {moonPhase.name}</p>
      </div>

      {/* AI prompt — centered, italic serif */}
      <div className="text-center mb-9">
        {promptLoading ? (
          <p
            className="font-garamond text-xl italic leading-relaxed"
            style={{ color: 'rgba(59,51,48,0.3)', animation: 'jPulse 1.6s ease-in-out infinite' }}
          >
            Writing your prompt…
          </p>
        ) : (
          <p
            className="font-garamond text-xl italic leading-relaxed"
            style={{ color: '#3B3330', animation: 'jFadeUp 0.4s ease both' }}
          >
            {prompt || 'What is your body asking for today?'}
          </p>
        )}
        <div style={{ width: 48, height: 1, background: 'rgba(143,165,140,0.55)', margin: '14px auto 0' }} />
      </div>

      {/* Three-part journal */}
      <VoiceTextarea
        label="How did today feel?"
        placeholder="Write freely, or just breathe…"
        value={how} onChange={setHow}
        onVoice={() => startVoice('how')} recording={recording === 'how'}
      />
      <VoiceTextarea
        label="What drained you?"
        placeholder="No judgment here…"
        value={drained} onChange={setDrained}
        onVoice={() => startVoice('drained')} recording={recording === 'drained'}
      />
      <VoiceTextarea
        label="What are you holding onto?"
        placeholder="You can set it down here…"
        value={holding} onChange={setHolding}
        onVoice={() => startVoice('holding')} recording={recording === 'holding'}
      />

      {/* Photo attach */}
      <div className="mb-7">
        <input
          ref={photoInputRef} type="file" accept="image/*"
          onChange={handlePhoto} style={{ display: 'none' }}
        />
        <button
          onClick={() => photoInputRef.current?.click()}
          className="flex items-center gap-2 font-garamond text-sm"
          style={{ color: '#7A6A65' }}
        >
          <Image size={14} strokeWidth={1.5} />
          {photo ? 'Change photo' : 'Add a photo to this entry +'}
        </button>
        {photo && (
          <img
            src={photo} alt=""
            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, marginTop: 10 }}
          />
        )}
      </div>

      {/* Save */}
      <button
        onClick={saveEntry}
        className="w-full font-cinzel tracking-widest py-3 rounded-xl transition-all mb-2"
        style={{
          background: saved ? 'rgba(143,165,140,0.22)' : 'rgba(143,165,140,0.14)',
          border: '1px solid rgba(143,165,140,0.5)',
          color: '#3B3330',
        }}
      >
        {saved ? '✓ Saved' : 'Save Entry'}
      </button>

      {/* Past entries */}
      {pastEntries.length > 0 && (
        <div className="mt-9 mb-4">
          <p className="font-cinzel text-[9px] uppercase mb-4" style={{ color: '#6B5248', fontWeight: 600, letterSpacing: '0.12em' }}>
            Previous Entries
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pastEntries.map((entry, i) => (
              <button
                key={i}
                onClick={() => setExpandedEntry(entry)}
                style={{
                  background: 'rgba(196,175,168,0.15)',
                  border: '1px solid rgba(196,175,168,0.32)',
                  borderRadius: 12, padding: '12px 14px',
                  textAlign: 'left', width: '100%',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-cinzel text-[8px] tracking-widest uppercase" style={{ color: '#7A6A65' }}>
                    {entry.date}
                  </span>
                  <span style={{ fontSize: 14 }}>{entry.moonPhase?.icon}</span>
                </div>
                <p
                  className="font-garamond text-sm"
                  style={{ color: '#3B3330', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {(entry.responses?.how || '').slice(0, 60) || 'Entry saved'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {expandedEntry && (
        <EntryOverlay entry={expandedEntry} onClose={() => setExpandedEntry(null)} />
      )}
    </>
  )
}
