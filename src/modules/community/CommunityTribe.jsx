import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, Star, MapPin, Calendar, Users, Dumbbell } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const SAGE  = '#8FA58C'
const BROWN = '#3B3330'
const TAUPE = '#7A6A65'
const MAUVE = '#C4AFA8'
const ROSE  = '#C4859A'

const MEETUP_TYPES   = ['pilates','gym','walk_run','yoga','other']
const MEETUP_EMOJIS  = { pilates:'🧘', gym:'🏋️', walk_run:'🚶', yoga:'☯️', other:'📍' }
const STUDIO_TYPES   = ['pilates','yoga','gym','barre','other']
const WORKOUT_STYLES = ['Pilates','Strength','HIIT','Yoga','Running','Barre']
const PREF_TIMES     = ['Morning','Midday','Evening','Weekends']
const SUB_TABS       = ['Meetups','Studios','Gym Buddy']

function formatDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function Stars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={11} strokeWidth={1.5}
          fill={n <= rating ? '#C4AFA8' : 'none'}
          color={n <= rating ? '#C4AFA8' : 'rgba(196,175,168,0.4)'} />
      ))}
    </span>
  )
}

// ── Meetups ───────────────────────────────────────────────────────────────────

function MeetupsSection() {
  const { user } = useAuth()
  const [meetups,      setMeetups]      = useState([])
  const [rsvps,        setRsvps]        = useState(new Set())
  const [rsvpCounts,   setRsvpCounts]   = useState({})
  const [filter,       setFilter]       = useState('all')
  const [sheetOpen,    setSheetOpen]    = useState(false)
  const [title,        setTitle]        = useState('')
  const [type,         setType]         = useState('pilates')
  const [city,         setCity]         = useState('')
  const [hood,         setHood]         = useState('')
  const [dateStr,      setDateStr]      = useState('')
  const [maxAtt,       setMaxAtt]       = useState(10)
  const [desc,         setDesc]         = useState('')
  const [aiLoading,    setAiLoading]    = useState(false)
  const [saving,       setSaving]       = useState(false)

  useEffect(() => { loadMeetups() }, [filter])
  useEffect(() => { if (user) loadRsvps() }, [user])

  async function loadMeetups() {
    let q = supabase.from('meetups').select('*').gte('meetup_date', new Date().toISOString()).order('meetup_date')
    if (filter !== 'all') q = q.eq('meetup_type', filter)
    const { data } = await q.limit(30)
    setMeetups(data || [])

    if (data?.length) {
      const { data: counts } = await supabase.from('meetup_rsvps').select('meetup_id').in('meetup_id', data.map(m => m.id))
      const map = {}
      ;(counts || []).forEach(r => { map[r.meetup_id] = (map[r.meetup_id] || 0) + 1 })
      setRsvpCounts(map)
    }
  }

  async function loadRsvps() {
    const { data } = await supabase.from('meetup_rsvps').select('meetup_id').eq('user_id', user.id)
    setRsvps(new Set((data || []).map(r => r.meetup_id)))
  }

  async function toggleRsvp(meetupId) {
    if (!user) return
    if (rsvps.has(meetupId)) {
      await supabase.from('meetup_rsvps').delete().eq('user_id', user.id).eq('meetup_id', meetupId)
      setRsvps(prev => { const s = new Set(prev); s.delete(meetupId); return s })
      setRsvpCounts(prev => ({ ...prev, [meetupId]: Math.max((prev[meetupId] || 1) - 1, 0) }))
    } else {
      await supabase.from('meetup_rsvps').insert({ user_id: user.id, meetup_id: meetupId })
      setRsvps(prev => new Set([...prev, meetupId]))
      setRsvpCounts(prev => ({ ...prev, [meetupId]: (prev[meetupId] || 0) + 1 }))
    }
  }

  async function suggestDesc() {
    if (!title) return
    setAiLoading(true)
    try {
      const r = await fetch('/.netlify/functions/ai-community', {
        method: 'POST', body: JSON.stringify({ type: 'meetup_description', title, meetupType: type }),
      })
      const d = await r.json()
      if (d.description) setDesc(d.description)
    } catch {}
    setAiLoading(false)
  }

  async function saveMeetup() {
    if (!user || !title) return
    setSaving(true)
    await supabase.from('meetups').insert({
      host_user_id: user.id, title, description: desc, meetup_type: type,
      location_city: city, location_neighborhood: hood,
      meetup_date: dateStr ? new Date(dateStr).toISOString() : null,
      max_attendees: maxAtt,
    })
    setSheetOpen(false)
    setTitle(''); setDesc(''); setCity(''); setHood(''); setDateStr('')
    setSaving(false)
    loadMeetups()
  }

  return (
    <>
      {/* Filter pills */}
      <div className="cm-hscroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
        {['all', ...MEETUP_TYPES].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            flexShrink: 0, padding: '4px 11px', borderRadius: 16, cursor: 'pointer',
            border: `1px solid ${filter === t ? SAGE : 'rgba(196,175,168,0.4)'}`,
            background: filter === t ? 'rgba(143,165,140,0.12)' : 'transparent',
            fontFamily: 'Cinzel, serif', fontSize: 7.5, textTransform: 'uppercase',
            color: filter === t ? SAGE : TAUPE, letterSpacing: '0.1em',
          }}>
            {t === 'all' ? 'All' : t.replace('_', ' & ')}
          </button>
        ))}
      </div>

      {meetups.length === 0 && (
        <p className="font-garamond text-sm italic text-center py-6" style={{ color: 'rgba(59,51,48,0.35)' }}>
          No upcoming meetups. Create one!
        </p>
      )}

      {meetups.map(m => {
        const count   = rsvpCounts[m.id] || 0
        const going   = rsvps.has(m.id)
        const spotsLeft = m.max_attendees - count
        return (
          <div key={m.id} style={{
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px', marginBottom: 8,
            border: '1px solid rgba(196,175,168,0.35)',
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{MEETUP_EMOJIS[m.meetup_type] || '📍'}</span>
              <div style={{ flex: 1 }}>
                <p className="font-cinzel text-xs" style={{ color: BROWN }}>{m.title}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                  {m.location_neighborhood && (
                    <span className="font-garamond text-xs italic" style={{ color: TAUPE }}>
                      <MapPin size={9} style={{ display: 'inline', marginRight: 2 }} />
                      {m.location_neighborhood}{m.location_city && `, ${m.location_city}`}
                    </span>
                  )}
                  {m.meetup_date && (
                    <span className="font-garamond text-xs italic" style={{ color: TAUPE }}>
                      <Calendar size={9} style={{ display: 'inline', marginRight: 2 }} />
                      {formatDate(m.meetup_date)}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => toggleRsvp(m.id)} style={{
                padding: '5px 12px', borderRadius: 12, cursor: 'pointer',
                border: `1px solid ${going ? SAGE : 'rgba(196,175,168,0.4)'}`,
                background: going ? 'rgba(143,165,140,0.15)' : 'transparent',
                fontFamily: 'Cinzel, serif', fontSize: 7.5, textTransform: 'uppercase',
                color: going ? SAGE : TAUPE, whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}>
                {going ? '✓ Going' : 'RSVP'}
              </button>
            </div>
            {m.description && (
              <p className="font-garamond text-sm italic leading-snug" style={{ color: TAUPE, marginTop: 4 }}>
                {m.description}
              </p>
            )}
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, color: TAUPE, marginTop: 4 }}>
              <Users size={9} style={{ display: 'inline', marginRight: 3 }} />
              {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'} · {count} going
            </p>
          </div>
        )
      })}

      {/* FAB */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4, marginBottom: 8 }}>
        <button onClick={() => setSheetOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 14, border: 'none', background: SAGE, cursor: 'pointer',
          fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#F2EDE8',
        }}>
          <Plus size={13} /> Create Meetup
        </button>
      </div>

      {/* Create sheet */}
      {sheetOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(59,51,48,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSheetOpen(false)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#F2EDE8', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 32px', maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="font-cinzel text-[9px] tracking-[0.2em] uppercase" style={{ color: BROWN }}>Create Meetup</span>
              <button onClick={() => setSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TAUPE }}><X size={18} /></button>
            </div>

            {[
              { label: 'Title', val: title, set: setTitle, placeholder: 'Sunday Pilates Flow' },
              { label: 'City', val: city, set: setCity, placeholder: 'Los Angeles' },
              { label: 'Neighborhood', val: hood, set: setHood, placeholder: 'Silver Lake' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 10 }}>
                <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>{f.label}</p>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: BROWN, outline: 'none' }} />
              </div>
            ))}

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>Type</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
              {MEETUP_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: '4px 10px', borderRadius: 14, cursor: 'pointer',
                  border: `1px solid ${type === t ? SAGE : 'rgba(196,175,168,0.4)'}`,
                  background: type === t ? 'rgba(143,165,140,0.12)' : 'transparent',
                  fontFamily: 'Cinzel, serif', fontSize: 7.5, color: type === t ? SAGE : TAUPE,
                }}>{t.replace('_', ' & ')}</button>
              ))}
            </div>

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>Date & Time</p>
            <input type="datetime-local" value={dateStr} onChange={e => setDateStr(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: BROWN, outline: 'none', marginBottom: 10 }} />

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>Max Attendees</p>
            <input type="number" value={maxAtt} onChange={e => setMaxAtt(parseInt(e.target.value) || 10)} min={2} max={100}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: BROWN, outline: 'none', marginBottom: 10 }} />

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>Description</p>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Tell people what to expect…"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: 14, fontStyle: 'italic', color: BROWN, resize: 'none', outline: 'none', marginBottom: 6 }} />
            <button onClick={suggestDesc} disabled={!title || aiLoading} style={{
              padding: '5px 12px', borderRadius: 10, border: `1px solid ${SAGE}`, background: 'none',
              cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 7.5, color: SAGE, marginBottom: 12,
              opacity: (!title || aiLoading) ? 0.5 : 1,
            }}>
              {aiLoading ? 'Thinking…' : '✨ Suggest Description'}
            </button>

            <button onClick={saveMeetup} disabled={saving || !title} style={{
              width: '100%', padding: 13, background: SAGE, border: 'none', borderRadius: 14,
              cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F2EDE8',
              opacity: (!title || saving) ? 0.5 : 1,
            }}>{saving ? 'Saving…' : 'Create Meetup'}</button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Studio Reviews ────────────────────────────────────────────────────────────

function StudiosSection() {
  const { user } = useAuth()
  const [reviews,     setReviews]     = useState([])
  const [grouped,     setGrouped]     = useState({})
  const [expanded,    setExpanded]    = useState(null)
  const [summaries,   setSummaries]   = useState({})
  const [sheetOpen,   setSheetOpen]   = useState(false)
  const [name,        setName]        = useState('')
  const [type,        setType]        = useState('pilates')
  const [city,        setCity]        = useState('')
  const [hood,        setHood]        = useState('')
  const [rating,      setRating]      = useState(0)
  const [text,        setText]        = useState('')
  const [saving,      setSaving]      = useState(false)

  useEffect(() => { loadReviews() }, [])

  async function loadReviews() {
    const { data } = await supabase.from('studio_reviews').select('*').order('created_at', { ascending: false })
    setReviews(data || [])
    const g = {}
    ;(data || []).forEach(r => {
      if (!g[r.studio_name]) g[r.studio_name] = []
      g[r.studio_name].push(r)
    })
    setGrouped(g)
  }

  async function loadSummary(studioName, studioReviews) {
    if (summaries[studioName]) return
    if (studioReviews.length < 3) return
    const { data } = await supabase.from('studio_review_summaries').select('summary').eq('studio_name', studioName).maybeSingle()
    if (data?.summary) { setSummaries(p => ({ ...p, [studioName]: data.summary })); return }
    try {
      const r = await fetch('/.netlify/functions/ai-community', {
        method: 'POST', body: JSON.stringify({ type: 'studio_summary', studioName, studioType: studioReviews[0]?.studio_type, reviews: studioReviews }),
      })
      const d = await r.json()
      if (d.summary) {
        setSummaries(p => ({ ...p, [studioName]: d.summary }))
        supabase.from('studio_review_summaries').upsert({ studio_name: studioName, summary: d.summary }, { onConflict: 'studio_name' }).then(() => {})
      }
    } catch {}
  }

  async function saveReview() {
    if (!user || !name || !rating) return
    setSaving(true)
    await supabase.from('studio_reviews').insert({
      user_id: user.id, studio_name: name, studio_type: type,
      location_city: city, location_neighborhood: hood, rating, review_text: text,
    })
    setSheetOpen(false)
    setName(''); setText(''); setCity(''); setHood(''); setRating(0)
    setSaving(false)
    loadReviews()
  }

  function avgRating(list) {
    return list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1) : '—'
  }

  return (
    <>
      {Object.entries(grouped).map(([studio, list]) => {
        const isExp = expanded === studio
        return (
          <div key={studio} style={{
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px', marginBottom: 8,
            border: '1px solid rgba(196,175,168,0.35)',
          }}>
            <button style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
              onClick={() => {
                setExpanded(isExp ? null : studio)
                if (!isExp) loadSummary(studio, list)
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <p className="font-cinzel text-xs" style={{ color: BROWN }}>{studio}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Stars rating={Math.round(parseFloat(avgRating(list)))} />
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, color: TAUPE }}>{avgRating(list)} · {list.length} review{list.length !== 1 ? 's' : ''}</span>
                  </div>
                  {list[0]?.location_neighborhood && (
                    <span className="font-garamond text-xs italic" style={{ color: TAUPE }}>{list[0].location_neighborhood}</span>
                  )}
                </div>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 18, color: TAUPE }}>{isExp ? '▲' : '▼'}</span>
              </div>
            </button>

            {isExp && (
              <div style={{ marginTop: 10 }}>
                {summaries[studio] && (
                  <div style={{ background: 'rgba(143,165,140,0.1)', borderRadius: 10, padding: '8px 12px', marginBottom: 10, border: '1px solid rgba(143,165,140,0.2)' }}>
                    <p style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, color: SAGE, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 3 }}>
                      ✨ What members love
                    </p>
                    <p className="font-garamond text-sm italic" style={{ color: BROWN }}>{summaries[studio]}</p>
                  </div>
                )}
                {list.map(r => (
                  <div key={r.id} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid rgba(196,175,168,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Stars rating={r.rating} />
                    </div>
                    {r.review_text && <p className="font-garamond text-sm italic" style={{ color: BROWN }}>{r.review_text}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {Object.keys(grouped).length === 0 && (
        <p className="font-garamond text-sm italic text-center py-6" style={{ color: 'rgba(59,51,48,0.35)' }}>
          No reviews yet — share your studio experience.
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button onClick={() => setSheetOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
          borderRadius: 14, border: 'none', background: MAUVE, cursor: 'pointer',
          fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#F2EDE8',
        }}>
          <Plus size={13} /> Add Review
        </button>
      </div>

      {sheetOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(59,51,48,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSheetOpen(false)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#F2EDE8', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 32px', maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="font-cinzel text-[9px] tracking-[0.2em] uppercase" style={{ color: BROWN }}>Add Studio Review</span>
              <button onClick={() => setSheetOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TAUPE }}><X size={18} /></button>
            </div>

            {[
              { label: 'Studio Name', val: name, set: setName, placeholder: 'Club Pilates Silverlake' },
              { label: 'City', val: city, set: setCity, placeholder: 'Los Angeles' },
              { label: 'Neighborhood', val: hood, set: setHood, placeholder: 'Silver Lake' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 10 }}>
                <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>{f.label}</p>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: BROWN, outline: 'none' }} />
              </div>
            ))}

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>Type</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
              {STUDIO_TYPES.map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: '4px 10px', borderRadius: 14, cursor: 'pointer',
                  border: `1px solid ${type === t ? SAGE : 'rgba(196,175,168,0.4)'}`,
                  background: type === t ? 'rgba(143,165,140,0.12)' : 'transparent',
                  fontFamily: 'Cinzel, serif', fontSize: 7.5, color: type === t ? SAGE : TAUPE,
                }}>{t}</button>
              ))}
            </div>

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-2" style={{ color: TAUPE }}>Rating</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Star size={24} strokeWidth={1.5}
                    fill={n <= rating ? MAUVE : 'none'}
                    color={n <= rating ? MAUVE : 'rgba(196,175,168,0.5)'} />
                </button>
              ))}
            </div>

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>Review</p>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="What did you love about this studio?"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: 14, fontStyle: 'italic', color: BROWN, resize: 'none', outline: 'none', marginBottom: 14 }} />

            <button onClick={saveReview} disabled={saving || !name || !rating} style={{
              width: '100%', padding: 13, background: MAUVE, border: 'none', borderRadius: 14,
              cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F2EDE8',
              opacity: (!name || !rating || saving) ? 0.5 : 1,
            }}>{saving ? 'Saving…' : 'Submit Review'}</button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Gym Buddy ─────────────────────────────────────────────────────────────────

function GymBuddySection() {
  const { user } = useAuth()
  const [myProfile,  setMyProfile]  = useState(null)
  const [matches,    setMatches]    = useState([])
  const [editOpen,   setEditOpen]   = useState(false)
  const [city,       setCity]       = useState('')
  const [gym,        setGym]        = useState('')
  const [styles,     setStyles]     = useState([])
  const [times,      setTimes]      = useState([])
  const [saving,     setSaving]     = useState(false)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => { if (user) loadProfile() }, [user])

  async function loadProfile() {
    setLoading(true)
    const { data } = await supabase.from('gym_buddy_profiles').select('*').eq('user_id', user.id).maybeSingle()
    setMyProfile(data)
    if (data) {
      setCity(data.location_city || '')
      setGym(data.gym_name || '')
      setStyles(data.workout_styles || [])
      setTimes(data.preferred_times || [])
      loadMatches(data)
    }
    setLoading(false)
  }

  async function loadMatches(profile) {
    if (!profile?.location_city) return
    const { data } = await supabase
      .from('gym_buddy_profiles')
      .select('*, profiles!gym_buddy_profiles_user_id_fkey(display_name, avatar_choice)')
      .eq('location_city', profile.location_city)
      .eq('is_visible', true)
      .neq('user_id', user.id)
      .limit(10)
    const filtered = (data || []).filter(m =>
      (m.workout_styles || []).some(s => (profile.workout_styles || []).includes(s))
    ).slice(0, 3)
    setMatches(filtered)
  }

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    const payload = { user_id: user.id, location_city: city, gym_name: gym, workout_styles: styles, preferred_times: times, updated_at: new Date().toISOString() }
    await supabase.from('gym_buddy_profiles').upsert(payload, { onConflict: 'user_id' })
    setSaving(false)
    setEditOpen(false)
    loadProfile()
  }

  function toggle(arr, setArr, val) {
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])
  }

  const AVATARS = { athena_1:'🦉', athena_2:'🌙', athena_3:'🌸', athena_4:'🌹', athena_5:'🌻', athena_6:'🌿', athena_7:'💫', athena_8:'🔮' }

  if (loading) return <p className="font-garamond text-sm italic text-center py-8" style={{ color: 'rgba(59,51,48,0.35)' }}>Loading…</p>

  return (
    <>
      {!myProfile ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(196,175,168,0.2) 0%, rgba(255,255,255,0.5) 100%)',
          borderRadius: 16, padding: '20px 16px', marginBottom: 12,
          border: '1px solid rgba(196,175,168,0.4)', textAlign: 'center',
        }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🏋️</p>
          <p className="font-cinzel text-sm tracking-wide mb-2" style={{ color: BROWN }}>Find Your Gym Match</p>
          <p className="font-garamond text-sm italic mb-14" style={{ color: TAUPE }}>
            Set up your buddy profile and we'll find women in your area with matching workout styles.
          </p>
          <button onClick={() => setEditOpen(true)} style={{
            padding: '11px 24px', borderRadius: 14, border: 'none', background: MAUVE,
            cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F2EDE8',
          }}>
            Set Up Profile
          </button>
        </div>
      ) : (
        <>
          <div style={{
            background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
            borderRadius: 14, padding: '12px 14px', marginBottom: 12,
            border: '1px solid rgba(196,175,168,0.35)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <p className="font-cinzel text-[9px] tracking-[0.2em] uppercase" style={{ color: SAGE }}>Your Buddy Profile</p>
              <button onClick={() => setEditOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 8, color: TAUPE }}>Edit</button>
            </div>
            <p className="font-garamond text-sm" style={{ color: BROWN }}>
              {myProfile.location_city || '—'}{myProfile.gym_name ? ` · ${myProfile.gym_name}` : ''}
            </p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
              {(myProfile.workout_styles || []).map(s => (
                <span key={s} style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, color: SAGE, background: 'rgba(143,165,140,0.12)', borderRadius: 8, padding: '2px 8px', border: '1px solid rgba(143,165,140,0.25)' }}>{s}</span>
              ))}
            </div>
          </div>

          {matches.length > 0 && (
            <>
              <p className="font-cinzel text-[8.5px] tracking-[0.2em] uppercase mb-2" style={{ color: TAUPE }}>Suggested Matches</p>
              {matches.map(m => (
                <div key={m.id} style={{
                  background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
                  borderRadius: 14, padding: '12px 14px', marginBottom: 8,
                  border: '1px solid rgba(196,175,168,0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>{AVATARS[m.profiles?.avatar_choice] || '🦉'}</span>
                    <div>
                      <p className="font-cinzel text-xs" style={{ color: BROWN }}>{m.profiles?.display_name || 'Goddess'}</p>
                      <p className="font-garamond text-xs italic" style={{ color: TAUPE }}>{m.location_city}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                    {(m.workout_styles || []).map(s => (
                      <span key={s} style={{ fontFamily: 'Cinzel, serif', fontSize: 7, color: MAUVE, background: 'rgba(196,175,168,0.12)', borderRadius: 6, padding: '2px 7px' }}>{s}</span>
                    ))}
                  </div>
                  <a href="/community" onClick={e => e.preventDefault()} style={{
                    display: 'inline-block', padding: '6px 12px', borderRadius: 10,
                    border: `1px solid ${SAGE}`, background: 'transparent',
                    fontFamily: 'Cinzel, serif', fontSize: 7.5, color: SAGE,
                    textDecoration: 'none', cursor: 'pointer',
                  }}>
                    Connect in Circles →
                  </a>
                </div>
              ))}
            </>
          )}
          {matches.length === 0 && (
            <p className="font-garamond text-sm italic text-center py-4" style={{ color: 'rgba(59,51,48,0.35)' }}>
              No matches found yet in your area.
            </p>
          )}
        </>
      )}

      {editOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(59,51,48,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setEditOpen(false)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#F2EDE8', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 32px', maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="font-cinzel text-[9px] tracking-[0.2em] uppercase" style={{ color: BROWN }}>Gym Buddy Profile</span>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TAUPE }}><X size={18} /></button>
            </div>

            {[
              { label: 'City', val: city, set: setCity, placeholder: 'Los Angeles' },
              { label: 'Gym (optional)', val: gym, set: setGym, placeholder: 'Equinox, Planet Fitness…' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 10 }}>
                <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>{f.label}</p>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)', fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: BROWN, outline: 'none' }} />
              </div>
            ))}

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-2" style={{ color: TAUPE }}>Workout Styles</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
              {WORKOUT_STYLES.map(s => (
                <button key={s} onClick={() => toggle(styles, setStyles, s)} style={{
                  padding: '5px 11px', borderRadius: 14, cursor: 'pointer',
                  border: `1px solid ${styles.includes(s) ? SAGE : 'rgba(196,175,168,0.4)'}`,
                  background: styles.includes(s) ? 'rgba(143,165,140,0.12)' : 'transparent',
                  fontFamily: 'Cinzel, serif', fontSize: 8, color: styles.includes(s) ? SAGE : TAUPE,
                }}>{s}</button>
              ))}
            </div>

            <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-2" style={{ color: TAUPE }}>Preferred Times</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
              {PREF_TIMES.map(t => (
                <button key={t} onClick={() => toggle(times, setTimes, t)} style={{
                  padding: '5px 11px', borderRadius: 14, cursor: 'pointer',
                  border: `1px solid ${times.includes(t) ? MAUVE : 'rgba(196,175,168,0.4)'}`,
                  background: times.includes(t) ? 'rgba(196,175,168,0.12)' : 'transparent',
                  fontFamily: 'Cinzel, serif', fontSize: 8, color: times.includes(t) ? MAUVE : TAUPE,
                }}>{t}</button>
              ))}
            </div>

            <button onClick={saveProfile} disabled={saving || !city} style={{
              width: '100%', padding: 13, background: SAGE, border: 'none', borderRadius: 14,
              cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9,
              letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F2EDE8',
              opacity: (!city || saving) ? 0.5 : 1,
            }}>{saving ? 'Saving…' : 'Save Profile'}</button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function CommunityTribe() {
  const [sub, setSub] = useState('Meetups')

  return (
    <>
      {/* Sub-nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => setSub(t)} style={{
            flex: 1, padding: '7px 4px', borderRadius: 12, cursor: 'pointer',
            border: `1px solid ${sub === t ? SAGE : 'rgba(196,175,168,0.35)'}`,
            background: sub === t ? 'rgba(143,165,140,0.12)' : 'rgba(255,255,255,0.45)',
            fontFamily: 'Cinzel, serif', fontSize: 7.5, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: sub === t ? SAGE : TAUPE,
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {sub === 'Meetups'   && <MeetupsSection />}
      {sub === 'Studios'   && <StudiosSection />}
      {sub === 'Gym Buddy' && <GymBuddySection />}

      <div style={{ height: 16 }} />
    </>
  )
}
