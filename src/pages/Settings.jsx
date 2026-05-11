import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronDown, Check,
  User, Moon, Dumbbell, Heart, Leaf,
  Sparkles, Users, Bell, Palette, Shield, Info, BedDouble,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import athenaHero from '../assets/athena-hero.webp'

// ─── Section → field map ──────────────────────────────────────────────────────

const SECTION_FIELDS = {
  profile:       ['full_name', 'username', 'life_stage'],
  cycle:         ['last_period_date', 'cycle_length', 'period_duration', 'week_start', 'period_reminder_days', 'ovulation_reminder'],
  pilates:       ['pilates_level', 'preferred_session_duration', 'equipment', 'weekly_session_target', 'session_reminder_time', 'autoplay_sessions'],
  mood:          ['checkin_reminder_time', 'mood_scale', 'gratitude_enabled', 'journal_prompt_style'],
  nourish:       ['water_goal_ml', 'dietary_approach', 'food_intolerances', 'phase_food_suggestions', 'meal_reminders'],
  sleep:         ['sleep_goal_hours', 'bedtime_reminder', 'wake_reminder', 'dream_journal_enabled'],
  skin:          ['skin_type', 'skin_concerns', 'skincare_am_reminder', 'skincare_pm_reminder', 'selfie_logging_enabled'],
  community:     ['community_name', 'default_anonymous', 'notify_replies', 'notify_reactions'],
  notifications: ['notifications_on', 'notification_prefs'],
  appearance:    ['theme', 'font_size', 'reduce_motion'],
  privacy:       ['biometric_enabled', 'app_lock_timeout', 'anonymous_mode', 'ai_personalization'],
}

function isDirty(section, profile, draft) {
  if (!profile) return false
  return (SECTION_FIELDS[section] ?? []).some(f =>
    JSON.stringify(profile[f] ?? null) !== JSON.stringify(draft[f] ?? null)
  )
}

const DEFAULT_NOTIF = {
  period: true, ovulation: true, checkin: true, pilates: true,
  community_replies: true, challenges: true, weekly_insights: true,
}

// ─── Controls ─────────────────────────────────────────────────────────────────

function Toggle({ value, onChange, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: value && !disabled ? '#C9A86C' : 'rgba(244,239,230,0.15)', opacity: disabled ? 0.38 : 1 }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
        style={{ left: value ? '22px' : '2px' }}
      />
    </button>
  )
}

function PillSelect({ options, value, onChange, multi = false }) {
  function toggle(opt) {
    if (multi) {
      const arr = Array.isArray(value) ? [...value] : []
      onChange(arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt])
    } else {
      onChange(opt === value ? null : opt)
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const on = multi ? (Array.isArray(value) && value.includes(opt)) : value === opt
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className="px-3 py-1.5 rounded-full font-garamond text-sm transition-all"
            style={{
              background: on ? 'rgba(201,168,108,0.18)' : 'rgba(244,239,230,0.04)',
              border: `1px solid ${on ? 'rgba(201,168,108,0.55)' : 'rgba(244,239,230,0.14)'}`,
              color: on ? '#C9A86C' : 'rgba(244,239,230,0.48)',
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Stepper({ value, min, max, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => value > min && onChange(value - 1)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none flex-shrink-0"
        style={{ border: '1px solid rgba(201,168,108,0.35)', color: '#C9A86C' }}
      >−</button>
      <span className="font-garamond text-gold text-sm w-6 text-center">{value}</span>
      <button
        onClick={() => value < max && onChange(value + 1)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xl leading-none flex-shrink-0"
        style={{ border: '1px solid rgba(201,168,108,0.35)', color: '#C9A86C' }}
      >+</button>
    </div>
  )
}

function GoldSlider({ value, min, max, step = 1, onChange, fmt = v => v }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mt-1 mb-1">
      <div className="text-center mb-2">
        <span className="font-garamond text-gold text-sm">{fmt(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full outline-none cursor-pointer slider-gold"
        style={{ background: `linear-gradient(to right, #C9A86C ${pct}%, rgba(244,239,230,0.15) ${pct}%)` }}
      />
    </div>
  )
}

function SettingRow({ label, sub, last = false, block = false, children }) {
  return (
    <>
      {block ? (
        <div className="py-3">
          <span className="font-garamond text-sm text-ivory/65 block mb-2">{label}</span>
          {sub && <span className="font-garamond text-xs text-ivory/30 block mb-2">{sub}</span>}
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 py-3" style={{ minHeight: '48px' }}>
          <div className="min-w-0 flex-1">
            <span className="font-garamond text-sm text-ivory/65 leading-tight block">{label}</span>
            {sub && <span className="font-garamond text-xs text-ivory/30 mt-0.5 block">{sub}</span>}
          </div>
          <div className="flex-shrink-0">{children}</div>
        </div>
      )}
      {!last && <div style={{ height: '1px', background: 'rgba(201,168,108,0.08)' }} />}
    </>
  )
}

function TextInput({ value, onChange, placeholder, prefix }) {
  return (
    <div className="flex items-center gap-1">
      {prefix && <span className="font-garamond text-gold text-sm flex-shrink-0">{prefix}</span>}
      <input
        type="text" value={value ?? ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent font-garamond text-gold text-sm outline-none pb-0.5"
        style={{ borderBottom: '1px solid rgba(201,168,108,0.28)' }}
      />
    </div>
  )
}

function TimePicker({ value, onChange }) {
  return (
    <input
      type="time" value={value ?? ''} onChange={e => onChange(e.target.value || null)}
      className="bg-transparent font-garamond text-gold text-sm outline-none pb-0.5 w-24"
      style={{ borderBottom: '1px solid rgba(201,168,108,0.28)' }}
    />
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: '88px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 500,
      background: type === 'error' ? 'rgba(139,26,26,0.9)' : 'rgba(8,5,4,0.92)',
      border: `1px solid ${type === 'error' ? 'rgba(196,154,154,0.4)' : 'rgba(201,168,108,0.4)'}`,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '20px', padding: '9px 20px',
      color: type === 'error' ? '#C49A9A' : '#C9A86C',
      fontFamily: 'Cormorant Garamond, serif', fontSize: '13px', letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.35s ease',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center"
      style={{ background: 'rgba(6,4,4,0.88)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-t-2xl px-6 pt-6 pb-10"
        style={{
          background: 'rgba(8,5,4,0.97)',
          border: '1px solid rgba(201,168,108,0.22)', borderBottom: 'none',
          animation: 'sheetUp 0.28s ease',
          maxHeight: '82vh', overflowY: 'auto',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-cinzel text-[10px] tracking-[0.28em] uppercase text-gold">{title}</h3>
          <button onClick={onClose} className="font-garamond text-ivory/35 text-xl leading-none px-1">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function MInput({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="font-garamond text-[10px] tracking-widest uppercase text-ivory/35 block mb-1">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent font-garamond text-ivory text-sm outline-none py-2"
        style={{ borderBottom: '1px solid rgba(201,168,108,0.28)' }}
      />
    </div>
  )
}

function MActions({ onCancel, onConfirm, label = 'Confirm', danger, disabled }) {
  return (
    <div className="flex items-center justify-between mt-6">
      <button onClick={onCancel} className="font-garamond text-ivory/38 text-sm">Cancel</button>
      <button
        onClick={onConfirm} disabled={disabled}
        className="px-5 py-2 rounded-full font-cinzel text-[9px] tracking-widest transition-all"
        style={{
          border: danger ? '1px solid rgba(139,26,26,0.55)' : '1px solid rgba(201,168,108,0.5)',
          color: danger ? '#C49A9A' : '#C9A86C',
          background: danger ? 'rgba(139,26,26,0.1)' : 'transparent',
          opacity: disabled ? 0.38 : 1,
        }}
      >
        {label}
      </button>
    </div>
  )
}

// ─── Accordion section ────────────────────────────────────────────────────────

function Section({ id, title, icon, open, onToggle, dirty, onSave, saving, saved, children }) {
  return (
    <div
      className="mb-3 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8,5,4,0.44)',
        backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid rgba(201,168,108,0.18)',
      }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3.5"
        style={{ minHeight: '52px' }}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: 'rgba(201,168,108,0.7)' }}>{icon}</span>
          <span className="font-cinzel text-[10px] tracking-[0.25em] uppercase text-ivory/72">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {dirty && !open && <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C9A86C' }} />}
          <ChevronDown
            size={14}
            style={{
              color: 'rgba(201,168,108,0.5)',
              transition: 'transform 0.3s',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      <div style={{ maxHeight: open ? '3000px' : '0px', overflow: 'hidden', transition: 'max-height 0.4s ease' }}>
        <div className="px-4 pb-3">
          <div style={{ height: '1px', background: 'rgba(201,168,108,0.1)', marginBottom: '4px' }} />
          {children}
          {dirty && (
            <button
              onClick={onSave} disabled={saving || saved}
              className="mt-3 mb-1 flex items-center gap-1.5 px-4 py-1.5 rounded-full font-cinzel text-[9px] tracking-widest transition-all"
              style={{ border: '1px solid rgba(201,168,108,0.45)', color: '#C9A86C', background: saved ? 'rgba(201,168,108,0.1)' : 'transparent' }}
            >
              {saved ? <><Check size={10} />SAVED</> : saving ? '···' : 'SAVE CHANGES'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Corner brackets ──────────────────────────────────────────────────────────

function Brackets() {
  const b = { position: 'absolute', width: '10px', height: '10px', borderColor: 'rgba(201,168,108,0.3)' }
  return (
    <>
      <span style={{ ...b, top: '10px', left: '10px', borderTop: '1px solid', borderLeft: '1px solid' }} />
      <span style={{ ...b, top: '10px', right: '10px', borderTop: '1px solid', borderRight: '1px solid' }} />
      <span style={{ ...b, bottom: '10px', left: '10px', borderBottom: '1px solid', borderLeft: '1px solid' }} />
      <span style={{ ...b, bottom: '10px', right: '10px', borderBottom: '1px solid', borderRight: '1px solid' }} />
    </>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const fileRef    = useRef(null)

  const [profile,   setProfile]   = useState(null)
  const [draft,     setDraft]     = useState({})
  const [avatarUrl, setAvatar]    = useState(null)
  const [uploading, setUploading] = useState(false)

  const [openSections, setOpenSections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('athena_settings_open_sections') || '[]') }
    catch { return [] }
  })

  const [secSaving, setSecSaving] = useState({})
  const [secSaved,  setSecSaved]  = useState({})
  const [toast,     setToast]     = useState({ visible: false, message: '', type: 'success' })
  const [modal,     setModal]     = useState(null)

  const [emailForm,   setEmailForm]   = useState({ email: '' })
  const [pwForm,      setPwForm]      = useState({ next: '', confirm: '' })
  const [delConfirm,  setDelConfirm]  = useState('')
  const [feedbackTxt, setFeedbackTxt] = useState('')

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) { setProfile(data); setDraft(data); setAvatar(data.avatar_url) }
      })
  }, [user?.id])

  useEffect(() => {
    localStorage.setItem('athena_settings_open_sections', JSON.stringify(openSections))
  }, [openSections])

  const toggleSection = id =>
    setOpenSections(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const set = field => val => setDraft(d => ({ ...d, [field]: val }))

  function showToast(msg, type = 'success') {
    setToast({ visible: true, message: msg, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200)
  }

  async function saveSection(id) {
    if (!user) return
    const fields  = SECTION_FIELDS[id] ?? []
    const updates = Object.fromEntries(fields.map(f => [f, draft[f] ?? null]))
    setSecSaving(s => ({ ...s, [id]: true }))
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
    setSecSaving(s => ({ ...s, [id]: false }))
    if (error) { showToast('Something went wrong. Try again.', 'error'); return }
    setProfile(p => ({ ...p, ...updates }))
    setSecSaved(s => ({ ...s, [id]: true }))
    showToast('Settings saved')
    setTimeout(() => setSecSaved(s => ({ ...s, [id]: false })), 1500)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)

    // Try Supabase Storage first
    const ext  = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: storageError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })

    let url
    if (storageError) {
      // Fall back to base64 stored directly on the profile
      url = await new Promise(res => {
        const reader = new FileReader()
        reader.onload = ev => res(ev.target.result)
        reader.readAsDataURL(file)
      })
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      url = data.publicUrl
    }

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', user.id)

    if (dbError) { showToast('Could not save photo', 'error'); setUploading(false); return }
    setAvatar(url)
    setProfile(p => ({ ...p, avatar_url: url }))
    setUploading(false)
    showToast('Photo updated')
  }

  async function handleEmailChange() {
    const { error } = await supabase.auth.updateUser({ email: emailForm.email })
    if (error) { showToast(error.message, 'error'); return }
    showToast('Confirmation sent to new email')
    setModal(null)
  }

  async function handlePasswordChange() {
    if (pwForm.next !== pwForm.confirm) { showToast('Passwords do not match', 'error'); return }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    if (error) { showToast(error.message, 'error'); return }
    showToast('Password updated')
    setModal(null)
    setPwForm({ next: '', confirm: '' })
  }

  async function handleDeleteAccount() {
    if (delConfirm !== 'DELETE') return
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  async function handleDownloadData() {
    if (!user) return
    const [a, b, c] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('symptoms').select('*').eq('user_id', user.id),
      supabase.from('cycles').select('*').eq('user_id', user.id),
    ])
    const payload = JSON.stringify({ profile: a.data, symptoms: b.data, cycles: c.data, exported_at: new Date().toISOString() }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    Object.assign(document.createElement('a'), { href: url, download: 'athena-data-export.json' }).click()
    URL.revokeObjectURL(url)
  }

  function handleClearCache() {
    const saved = localStorage.getItem('athena_settings_open_sections')
    localStorage.clear()
    if (saved) localStorage.setItem('athena_settings_open_sections', saved)
    showToast('Cache cleared')
  }

  function sec(id, title, icon) {
    return {
      id, title, icon,
      open:    openSections.includes(id),
      onToggle: () => toggleSection(id),
      dirty:   isDirty(id, profile, draft),
      onSave:  () => saveSection(id),
      saving:  secSaving[id] ?? false,
      saved:   secSaved[id]  ?? false,
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#060404] flex items-center justify-center">
        <span className="font-cinzel text-[10px] tracking-[0.3em] text-gold/30">LOADING</span>
      </div>
    )
  }

  const d           = draft
  const notifPrefs  = { ...DEFAULT_NOTIF, ...(d.notification_prefs ?? {}) }
  const meals       = { breakfast: {}, lunch: {}, dinner: {}, ...(d.meal_reminders ?? {}) }
  const notifOn     = d.notifications_on ?? true

  return (
    <div className="relative h-[100svh] overflow-y-auto bg-[#060404]">
      <style>{`
        @keyframes sheetUp {
          from { transform: translateY(60px); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
        .slider-gold::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: #C9A86C; cursor: pointer;
        }
        .slider-gold::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: #C9A86C; border: none; cursor: pointer;
        }
        input[type="time"]::-webkit-calendar-picker-indicator,
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(2) hue-rotate(4deg); opacity: 0.6;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src={athenaHero} alt="" className="w-full h-full object-cover object-top" style={{ opacity: 0.06 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,4,4,0.78) 0%, rgba(6,4,4,0.95) 40%, rgba(6,4,4,0.99) 100%)' }} />
      </div>

      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div
          className="relative flex items-center justify-between h-14 px-3 max-w-md mx-auto"
          style={{
            background: 'rgba(6,4,4,0.86)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(201,168,108,0.1)',
          }}
        >
          <Brackets />
          <button onClick={() => navigate(-1)} className="p-2 flex items-center" style={{ color: 'rgba(201,168,108,0.55)' }}>
            <ChevronLeft size={18} />
          </button>
          <span className="font-cinzel text-gold text-[12px] tracking-[0.35em]">SETTINGS</span>
          <div className="w-10" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="relative z-10 pt-20 pb-nav px-4 max-w-md mx-auto">

        {/* ── 1. Profile & Account ── */}
        <Section {...sec('profile', 'Profile & Account', <User size={15} />)}>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div className="flex flex-col items-center pt-3 pb-4">
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
              style={{ border: '2px solid rgba(201,168,108,0.45)' }}
            >
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                : <User size={30} style={{ color: 'rgba(201,168,108,0.3)' }} />
              }
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="font-cinzel text-[8px] text-gold">···</span>
                </div>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} className="mt-2 font-garamond text-gold text-sm">
              Change photo
            </button>
          </div>
          <div style={{ height: '1px', background: 'rgba(201,168,108,0.08)', marginBottom: '4px' }} />
          <SettingRow label="Display name" block>
            <TextInput value={d.full_name} onChange={set('full_name')} placeholder="Your name" />
          </SettingRow>
          <SettingRow label="Username" block>
            <TextInput value={d.username} onChange={set('username')} placeholder="handle" prefix="@" />
          </SettingRow>
          <SettingRow label="Email">
            <button onClick={() => setModal('email')} className="font-garamond text-gold text-sm text-right max-w-[170px] truncate">
              {user?.email ?? '—'}
            </button>
          </SettingRow>
          <SettingRow label="Password">
            <button onClick={() => setModal('password')} className="font-garamond text-gold text-sm">
              Change password
            </button>
          </SettingRow>
          <SettingRow label="Life stage" block last>
            <PillSelect
              options={['Regular cycles', 'TTC', 'Postpartum', 'Perimenopause', 'On birth control', 'Prefer not to say']}
              value={d.life_stage} onChange={set('life_stage')}
            />
          </SettingRow>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(139,26,26,0.18)' }}>
            <button onClick={() => setModal('delete')} className="font-garamond text-sm" style={{ color: 'rgba(196,154,154,0.65)' }}>
              Delete my account
            </button>
          </div>
        </Section>

        {/* ── 2. Cycle Preferences ── */}
        <Section {...sec('cycle', 'Cycle Preferences', <Moon size={15} />)}>
          <SettingRow label="Last period date">
            <input
              type="date" value={d.last_period_date ?? ''} max={new Date().toISOString().split('T')[0]}
              onChange={e => set('last_period_date')(e.target.value || null)}
              className="bg-transparent font-garamond text-gold text-sm outline-none pb-0.5"
              style={{ borderBottom: '1px solid rgba(201,168,108,0.28)' }}
            />
          </SettingRow>
          <SettingRow label={`Cycle length — ${d.cycle_length ?? 28} days`} block last>
            <GoldSlider value={d.cycle_length ?? 28} min={21} max={35} onChange={set('cycle_length')} />
          </SettingRow>
          <SettingRow label={`Period duration — ${d.period_duration ?? 5} days`} block last>
            <GoldSlider value={d.period_duration ?? 5} min={2} max={8} onChange={set('period_duration')} />
          </SettingRow>
          <SettingRow label="First day of week" block last>
            <PillSelect
              options={['Sunday', 'Monday']}
              value={(d.week_start ?? 'sunday') === 'sunday' ? 'Sunday' : 'Monday'}
              onChange={v => set('week_start')(v?.toLowerCase())}
            />
          </SettingRow>
          <SettingRow label="Period reminder">
            <div className="flex items-center gap-2">
              <Stepper value={d.period_reminder_days ?? 2} min={1} max={5} onChange={set('period_reminder_days')} />
              <span className="font-garamond text-ivory/30 text-xs">days</span>
            </div>
          </SettingRow>
          <SettingRow label="Ovulation reminder" last>
            <Toggle value={d.ovulation_reminder ?? true} onChange={set('ovulation_reminder')} />
          </SettingRow>
          <div className="mt-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-full font-cinzel text-[9px] tracking-widest"
              style={{ border: '1px solid rgba(201,168,108,0.35)', color: '#C9A86C' }}
            >
              EXPORT PDF REPORT
            </button>
          </div>
        </Section>

        {/* ── 3. Pilates Studio ── */}
        <Section {...sec('pilates', 'Pilates Studio', <Dumbbell size={15} />)}>
          <SettingRow label="Experience level" block last>
            <PillSelect options={['Beginner', 'Intermediate', 'Advanced']} value={d.pilates_level} onChange={set('pilates_level')} />
          </SettingRow>
          <SettingRow label="Session duration" block last>
            <PillSelect options={['15 min', '30 min', '45 min', 'Mix it up']} value={d.preferred_session_duration} onChange={set('preferred_session_duration')} />
          </SettingRow>
          <SettingRow label="Equipment" block last>
            <PillSelect options={['Mat', 'Ring', 'Ball', 'Bands', 'Dumbbells']} value={d.equipment} onChange={set('equipment')} multi />
          </SettingRow>
          <SettingRow label="Weekly session goal">
            <Stepper value={d.weekly_session_target ?? 3} min={1} max={7} onChange={set('weekly_session_target')} />
          </SettingRow>
          <SettingRow label="Session reminder">
            <div className="flex items-center gap-2">
              <Toggle value={!!d.session_reminder_time} onChange={v => set('session_reminder_time')(v ? '08:00' : null)} />
              {d.session_reminder_time && <TimePicker value={d.session_reminder_time} onChange={set('session_reminder_time')} />}
            </div>
          </SettingRow>
          <SettingRow label="Auto-play next session" last>
            <Toggle value={d.autoplay_sessions ?? false} onChange={set('autoplay_sessions')} />
          </SettingRow>
        </Section>

        {/* ── 4. Mood & Mind ── */}
        <Section {...sec('mood', 'Mood & Mind', <Heart size={15} />)}>
          <SettingRow label="Check-in reminder">
            <div className="flex items-center gap-2">
              <Toggle value={!!d.checkin_reminder_time} onChange={v => set('checkin_reminder_time')(v ? '08:00' : null)} />
              {d.checkin_reminder_time && <TimePicker value={d.checkin_reminder_time} onChange={set('checkin_reminder_time')} />}
            </div>
          </SettingRow>
          <SettingRow label="Mood scale" block last>
            <PillSelect
              options={['5-point', '10-point']}
              value={(d.mood_scale ?? 5) === 5 ? '5-point' : '10-point'}
              onChange={v => set('mood_scale')(v === '5-point' ? 5 : 10)}
            />
          </SettingRow>
          <SettingRow label="Gratitude prompts">
            <Toggle value={d.gratitude_enabled ?? true} onChange={set('gratitude_enabled')} />
          </SettingRow>
          <SettingRow label="Journal prompt style" block last>
            <PillSelect
              options={['AI-generated', 'Reflective', 'Affirmations', 'Phase-based']}
              value={d.journal_prompt_style ?? 'AI-generated'} onChange={set('journal_prompt_style')}
            />
          </SettingRow>
        </Section>

        {/* ── 5. Nourish ── */}
        <Section {...sec('nourish', 'Nourish', <Leaf size={15} />)}>
          <SettingRow label="Daily water goal">
            <div className="flex items-center gap-2">
              <input
                type="number" value={d.water_goal_ml ?? 2000} min={0} max={6000}
                onChange={e => set('water_goal_ml')(parseInt(e.target.value) || 0)}
                className="w-16 bg-transparent font-garamond text-gold text-sm outline-none text-right pb-0.5"
                style={{ borderBottom: '1px solid rgba(201,168,108,0.28)' }}
              />
              <span className="font-garamond text-ivory/35 text-xs">ml</span>
            </div>
          </SettingRow>
          <SettingRow label="Dietary approach" block last>
            <PillSelect options={['Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Gluten-free', 'Other']} value={d.dietary_approach} onChange={set('dietary_approach')} />
          </SettingRow>
          <SettingRow label="Food intolerances" block last>
            <PillSelect options={['Dairy', 'Gluten', 'Nuts', 'Soy', 'Eggs', 'Shellfish', 'None']} value={d.food_intolerances} onChange={set('food_intolerances')} multi />
          </SettingRow>
          <SettingRow label="Phase-based suggestions">
            <Toggle value={d.phase_food_suggestions ?? true} onChange={set('phase_food_suggestions')} />
          </SettingRow>
          {['breakfast', 'lunch', 'dinner'].map((meal, i, arr) => (
            <SettingRow key={meal} label={meal.charAt(0).toUpperCase() + meal.slice(1)} last={i === arr.length - 1}>
              <div className="flex items-center gap-2">
                <Toggle
                  value={meals[meal]?.on ?? false}
                  onChange={v => set('meal_reminders')({ ...meals, [meal]: { ...(meals[meal] ?? {}), on: v } })}
                />
                {meals[meal]?.on && (
                  <TimePicker
                    value={meals[meal]?.time}
                    onChange={v => set('meal_reminders')({ ...meals, [meal]: { ...(meals[meal] ?? {}), time: v } })}
                  />
                )}
              </div>
            </SettingRow>
          ))}
        </Section>

        {/* ── 6. Sleep ── */}
        <Section {...sec('sleep', 'Sleep', <BedDouble size={15} />)}>
          <SettingRow label={`Sleep goal — ${d.sleep_goal_hours ?? 8} hrs`} block last>
            <GoldSlider value={d.sleep_goal_hours ?? 8} min={5} max={10} step={0.5} onChange={set('sleep_goal_hours')} fmt={v => `${v} hrs`} />
          </SettingRow>
          <SettingRow label="Bedtime reminder">
            <div className="flex items-center gap-2">
              <Toggle value={!!d.bedtime_reminder} onChange={v => set('bedtime_reminder')(v ? '22:00' : null)} />
              {d.bedtime_reminder && <TimePicker value={d.bedtime_reminder} onChange={set('bedtime_reminder')} />}
            </div>
          </SettingRow>
          <SettingRow label="Wake time reminder">
            <div className="flex items-center gap-2">
              <Toggle value={!!d.wake_reminder} onChange={v => set('wake_reminder')(v ? '07:00' : null)} />
              {d.wake_reminder && <TimePicker value={d.wake_reminder} onChange={set('wake_reminder')} />}
            </div>
          </SettingRow>
          <SettingRow label="Dream journal" last>
            <Toggle value={d.dream_journal_enabled ?? false} onChange={set('dream_journal_enabled')} />
          </SettingRow>
        </Section>

        {/* ── 7. Skin ── */}
        <Section {...sec('skin', 'Skin', <Sparkles size={15} />)}>
          <SettingRow label="Skin type" block last>
            <PillSelect options={['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal']} value={d.skin_type} onChange={set('skin_type')} />
          </SettingRow>
          <SettingRow label="Skin concerns" block last>
            <PillSelect options={['Acne', 'Aging', 'Hydration', 'Texture', 'Redness', 'Dark spots']} value={d.skin_concerns} onChange={set('skin_concerns')} multi />
          </SettingRow>
          <SettingRow label="Morning reminder">
            <div className="flex items-center gap-2">
              <Toggle value={!!d.skincare_am_reminder} onChange={v => set('skincare_am_reminder')(v ? '07:30' : null)} />
              {d.skincare_am_reminder && <TimePicker value={d.skincare_am_reminder} onChange={set('skincare_am_reminder')} />}
            </div>
          </SettingRow>
          <SettingRow label="Evening reminder">
            <div className="flex items-center gap-2">
              <Toggle value={!!d.skincare_pm_reminder} onChange={v => set('skincare_pm_reminder')(v ? '21:00' : null)} />
              {d.skincare_pm_reminder && <TimePicker value={d.skincare_pm_reminder} onChange={set('skincare_pm_reminder')} />}
            </div>
          </SettingRow>
          <SettingRow label="Selfie logging" last>
            <Toggle value={d.selfie_logging_enabled ?? true} onChange={set('selfie_logging_enabled')} />
          </SettingRow>
        </Section>

        {/* ── 8. Community ── */}
        <Section {...sec('community', 'Community', <Users size={15} />)}>
          <SettingRow label="Community display name" block>
            <TextInput value={d.community_name} onChange={set('community_name')} placeholder="Name shown in community" />
          </SettingRow>
          <SettingRow label="Always post anonymously">
            <Toggle value={d.default_anonymous ?? false} onChange={set('default_anonymous')} />
          </SettingRow>
          <SettingRow label="Notify on replies">
            <Toggle value={d.notify_replies ?? true} onChange={set('notify_replies')} />
          </SettingRow>
          <SettingRow label="Notify on reactions">
            <Toggle value={d.notify_reactions ?? false} onChange={set('notify_reactions')} />
          </SettingRow>
          <SettingRow label="Block list" last>
            <button onClick={() => setModal('blocklist')} className="font-garamond text-gold text-sm">View</button>
          </SettingRow>
        </Section>

        {/* ── 9. Notifications ── */}
        <Section {...sec('notifications', 'Notifications', <Bell size={15} />)}>
          <SettingRow label="All notifications">
            <Toggle value={notifOn} onChange={set('notifications_on')} />
          </SettingRow>
          {[
            { k: 'period',            l: 'Period reminder' },
            { k: 'ovulation',         l: 'Ovulation reminder' },
            { k: 'checkin',           l: 'Daily check-in' },
            { k: 'pilates',           l: 'Pilates reminder' },
            { k: 'community_replies', l: 'Community replies' },
            { k: 'challenges',        l: 'Challenge updates' },
            { k: 'weekly_insights',   l: 'Weekly insights' },
          ].map(({ k, l }, i, arr) => (
            <SettingRow key={k} label={l} last={i === arr.length - 1}>
              <Toggle
                value={notifPrefs[k] ?? true}
                disabled={!notifOn}
                onChange={v => set('notification_prefs')({ ...notifPrefs, [k]: v })}
              />
            </SettingRow>
          ))}
        </Section>

        {/* ── 10. Appearance ── */}
        <Section {...sec('appearance', 'Appearance', <Palette size={15} />)}>
          <p className="font-cinzel text-[9px] tracking-widest text-ivory/28 uppercase mt-1 mb-2">Theme</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { id: 'obsidian', label: 'Obsidian', bg: '#0a0706', accent: '#C9A86C' },
              { id: 'ash',      label: 'Ash',      bg: '#18191e', accent: '#9BA8B4' },
              { id: 'sepia',    label: 'Sepia',    bg: '#180f04', accent: '#C98A4A' },
              { id: 'crimson',  label: 'Crimson',  bg: '#100404', accent: '#8B3030' },
            ].map(t => {
              const active = (d.theme ?? 'obsidian') === t.id
              return (
                <button
                  key={t.id} onClick={() => set('theme')(t.id)}
                  className="rounded-xl px-3 py-2.5 flex items-center gap-2 transition-all"
                  style={{
                    background: t.bg,
                    border: active ? `1px solid ${t.accent}` : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: active ? `0 0 14px ${t.accent}35` : 'none',
                  }}
                >
                  <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: t.accent }} />
                  <span className="font-cinzel text-[9px] tracking-widest" style={{ color: active ? t.accent : 'rgba(244,239,230,0.35)' }}>
                    {t.label.toUpperCase()}
                  </span>
                </button>
              )
            })}
          </div>
          <SettingRow label="Font size" block last>
            <PillSelect
              options={['Small', 'Medium', 'Large']}
              value={(d.font_size ?? 'medium').charAt(0).toUpperCase() + (d.font_size ?? 'medium').slice(1)}
              onChange={v => set('font_size')(v?.toLowerCase())}
            />
          </SettingRow>
          <SettingRow label="Reduce motion" last>
            <Toggle
              value={d.reduce_motion ?? false}
              onChange={v => { set('reduce_motion')(v); document.body.classList.toggle('reduce-motion', v) }}
            />
          </SettingRow>
        </Section>

        {/* ── 11. Privacy & Security ── */}
        <Section {...sec('privacy', 'Privacy & Security', <Shield size={15} />)}>
          <SettingRow
            label="Biometric login"
            sub={typeof window !== 'undefined' && !window.PublicKeyCredential ? 'Not supported on this device' : undefined}
          >
            <Toggle
              value={d.biometric_enabled ?? false}
              disabled={typeof window !== 'undefined' && !window.PublicKeyCredential}
              onChange={set('biometric_enabled')}
            />
          </SettingRow>
          <SettingRow label="App lock" block last>
            <PillSelect options={['Immediately', '1 min', '5 min', 'Never']} value={d.app_lock_timeout ?? '5 min'} onChange={set('app_lock_timeout')} />
          </SettingRow>
          <SettingRow label="Anonymous mode">
            <Toggle value={d.anonymous_mode ?? false} onChange={set('anonymous_mode')} />
          </SettingRow>
          <SettingRow label="AI personalization" last>
            <Toggle value={d.ai_personalization ?? true} onChange={set('ai_personalization')} />
          </SettingRow>
          <div className="mt-4 space-y-3">
            <button
              onClick={handleDownloadData}
              className="w-full py-3 rounded-xl font-cinzel text-[9px] tracking-widest"
              style={{ border: '1px solid rgba(201,168,108,0.3)', color: '#C9A86C' }}
            >
              DOWNLOAD MY DATA
            </button>
            <button onClick={handleClearCache} className="font-garamond text-sm" style={{ color: 'rgba(201,168,108,0.5)' }}>
              Clear app cache
            </button>
          </div>
          <div className="flex gap-5 mt-5 pt-3" style={{ borderTop: '1px solid rgba(201,168,108,0.07)' }}>
            <a href="/privacy" className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.25)' }}>Privacy policy</a>
            <a href="/terms"   className="font-garamond text-xs" style={{ color: 'rgba(244,239,230,0.25)' }}>Terms of service</a>
          </div>
        </Section>

        {/* ── 12. App Info ── */}
        <Section
          id="info" title="App Info" icon={<Info size={15} />}
          open={openSections.includes('info')} onToggle={() => toggleSection('info')}
          dirty={false} onSave={() => {}} saving={false} saved={false}
        >
          <SettingRow label="Version"><span className="font-garamond text-gold/60 text-sm">1.0.0</span></SettingRow>
          <SettingRow label="What's new">
            <button onClick={() => setModal('whatsNew')} className="font-garamond text-gold text-sm">View</button>
          </SettingRow>
          <SettingRow label="Send feedback">
            <button onClick={() => setModal('feedback')} className="font-garamond text-gold text-sm">Open</button>
          </SettingRow>
          <SettingRow label="Contact support">
            <a href="mailto:support@athena.app" className="font-garamond text-gold text-sm">Email</a>
          </SettingRow>
          <SettingRow label="About Athena">
            <button onClick={() => setModal('about')} className="font-garamond text-gold text-sm">View</button>
          </SettingRow>
          <SettingRow label="Open source licenses" last>
            <button onClick={() => setModal('licenses')} className="font-garamond text-gold text-sm">View</button>
          </SettingRow>
        </Section>

      </div>

      <Toast {...toast} />

      {/* ── Modals ── */}

      {modal === 'email' && (
        <Modal title="Change Email" onClose={() => setModal(null)}>
          <MInput label="New email address" type="email" value={emailForm.email} onChange={v => setEmailForm({ email: v })} />
          <MActions onCancel={() => setModal(null)} onConfirm={handleEmailChange} label="SEND CONFIRMATION" disabled={!emailForm.email} />
        </Modal>
      )}

      {modal === 'password' && (
        <Modal title="Change Password" onClose={() => setModal(null)}>
          <MInput label="New password" type="password" value={pwForm.next} onChange={v => setPwForm(f => ({ ...f, next: v }))} placeholder="Minimum 8 characters" />
          <MInput label="Confirm new password" type="password" value={pwForm.confirm} onChange={v => setPwForm(f => ({ ...f, confirm: v }))} />
          <MActions onCancel={() => setModal(null)} onConfirm={handlePasswordChange} label="UPDATE PASSWORD" disabled={pwForm.next.length < 6 || pwForm.next !== pwForm.confirm} />
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete Account" onClose={() => { setModal(null); setDelConfirm('') }}>
          <p className="font-garamond text-ivory/48 text-sm leading-relaxed mb-4">
            This will permanently delete all your data. This cannot be undone.
          </p>
          <MInput label='Type "DELETE" to confirm' value={delConfirm} onChange={setDelConfirm} placeholder="DELETE" />
          <MActions onCancel={() => { setModal(null); setDelConfirm('') }} onConfirm={handleDeleteAccount} label="DELETE MY ACCOUNT" danger disabled={delConfirm !== 'DELETE'} />
        </Modal>
      )}

      {modal === 'whatsNew' && (
        <Modal title="What's New" onClose={() => setModal(null)}>
          <p className="font-cinzel text-[10px] tracking-widest text-gold mb-2">v1.0.0 — Initial Release</p>
          <p className="font-garamond text-ivory/50 text-sm leading-relaxed mb-5">
            Athena launches. Full cycle tracking, mood journaling, pilates studio, nourish planner, sleep tracker, skin module, and community circles.
          </p>
          <MActions onCancel={() => setModal(null)} onConfirm={() => setModal(null)} label="CLOSE" />
        </Modal>
      )}

      {modal === 'feedback' && (
        <Modal title="Send Feedback" onClose={() => setModal(null)}>
          <p className="font-garamond text-ivory/35 text-xs mb-3">Tell us what's working and what you'd love to see.</p>
          <textarea
            value={feedbackTxt} onChange={e => setFeedbackTxt(e.target.value.slice(0, 1000))} rows={5}
            placeholder="Your thoughts..."
            className="w-full bg-transparent font-garamond text-ivory/70 text-sm resize-none outline-none p-3 rounded-xl placeholder:text-ivory/18"
            style={{ border: '1px solid rgba(201,168,108,0.18)' }}
          />
          <MActions
            onCancel={() => setModal(null)}
            onConfirm={() => { window.location.href = `mailto:support@athena.app?subject=Feedback&body=${encodeURIComponent(feedbackTxt)}`; setModal(null) }}
            label="SEND" disabled={!feedbackTxt.trim()}
          />
        </Modal>
      )}

      {modal === 'about' && (
        <Modal title="About Athena" onClose={() => setModal(null)}>
          <p className="font-cinzel text-ivory/65 text-sm leading-loose tracking-wide mb-4">
            "Built for the woman who refuses to settle.<br />
            Your strength. Your cycle. Your story."
          </p>
          <p className="font-garamond text-ivory/38 text-sm leading-relaxed">
            Athena is a women's wellness platform designed to help you understand your body, honor your cycle, and live in alignment with your natural rhythms.
          </p>
          <MActions onCancel={() => setModal(null)} onConfirm={() => setModal(null)} label="CLOSE" />
        </Modal>
      )}

      {modal === 'licenses' && (
        <Modal title="Open Source Licenses" onClose={() => setModal(null)}>
          <div className="space-y-2 mb-5">
            {['React — MIT', 'Vite — MIT', 'Tailwind CSS — MIT', 'Supabase JS — MIT', 'date-fns — MIT', 'React Router — MIT', 'Lucide React — ISC'].map(l => (
              <p key={l} className="font-garamond text-ivory/38 text-sm">{l}</p>
            ))}
          </div>
          <MActions onCancel={() => setModal(null)} onConfirm={() => setModal(null)} label="CLOSE" />
        </Modal>
      )}

      {modal === 'blocklist' && (
        <Modal title="Blocked Users" onClose={() => setModal(null)}>
          <p className="font-garamond text-ivory/30 text-sm text-center py-8">No blocked users.</p>
          <MActions onCancel={() => setModal(null)} onConfirm={() => setModal(null)} label="DONE" />
        </Modal>
      )}

    </div>
  )
}
