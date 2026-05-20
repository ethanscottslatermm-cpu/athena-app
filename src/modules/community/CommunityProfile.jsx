import { useState, useEffect } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const SAGE  = '#8FA58C'
const BROWN = '#3B3330'
const TAUPE = '#7A6A65'
const MAUVE = '#C4AFA8'
const ROSE  = '#D4A0A0'
const GOLD  = '#C9A84C'

const AVATAR_OPTIONS = [
  { key: 'athena_1', emoji: '🦉', name: 'Athena'     },
  { key: 'athena_2', emoji: '🌙', name: 'Artemis'    },
  { key: 'athena_3', emoji: '🌸', name: 'Persephone' },
  { key: 'athena_4', emoji: '🌹', name: 'Aphrodite'  },
  { key: 'athena_5', emoji: '🌻', name: 'Demeter'    },
  { key: 'athena_6', emoji: '🌿', name: 'Gaia'       },
  { key: 'athena_7', emoji: '💫', name: 'Selene'     },
  { key: 'athena_8', emoji: '🔮', name: 'Hecate'     },
]

const AVATARS = Object.fromEntries(AVATAR_OPTIONS.map(a => [a.key, a.emoji]))

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Onboarding card ───────────────────────────────────────────────────────────

function ProfileSetup({ onSaved }) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [avatar,      setAvatar]      = useState('athena_1')
  const [showPhase,   setShowPhase]   = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  async function save() {
    if (!displayName.trim()) { setError('Please enter a display name.'); return }
    setSaving(true)
    const { error: dbErr } = await supabase.from('profiles').update({
      display_name: displayName.trim(),
      avatar_choice: avatar,
      show_phase_publicly: showPhase,
      community_joined_at: new Date().toISOString(),
    }).eq('id', user.id)
    if (dbErr) { setError('Could not save. Try again.'); setSaving(false); return }
    onSaved()
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(196,175,168,0.2) 0%, rgba(255,255,255,0.5) 100%)',
        borderRadius: 18, padding: '20px 16px',
        border: '1px solid rgba(196,175,168,0.4)', marginBottom: 16,
      }}>
        <p style={{ fontSize: 32, textAlign: 'center', marginBottom: 6 }}>🌿</p>
        <p className="font-cinzel text-sm tracking-wide text-center mb-1" style={{ color: BROWN }}>
          Set Up Your Community Profile
        </p>
        <p className="font-garamond text-sm italic text-center mb-16" style={{ color: TAUPE }}>
          Choose how you appear to your circle.
        </p>

        <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-2" style={{ color: TAUPE }}>Display Name</p>
        <input
          value={displayName}
          onChange={e => { setDisplayName(e.target.value); setError('') }}
          placeholder="How should we call you?"
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 12,
            border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)',
            fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: BROWN,
            outline: 'none', marginBottom: 14,
          }}
        />

        <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-3" style={{ color: TAUPE }}>Choose Your Goddess Avatar</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
          {AVATAR_OPTIONS.map(a => (
            <button key={a.key} onClick={() => setAvatar(a.key)} style={{
              padding: '10px 4px', borderRadius: 14, cursor: 'pointer',
              border: `1.5px solid ${avatar === a.key ? MAUVE : 'rgba(196,175,168,0.3)'}`,
              background: avatar === a.key ? 'rgba(196,175,168,0.15)' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 24 }}>{a.emoji}</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 6.5, color: avatar === a.key ? BROWN : TAUPE }}>
                {a.name}
              </span>
            </button>
          ))}
        </div>

        <button onClick={() => setShowPhase(p => !p)} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
          border: `1px solid ${showPhase ? SAGE : 'rgba(196,175,168,0.35)'}`,
          background: showPhase ? 'rgba(143,165,140,0.1)' : 'transparent',
          marginBottom: 16, transition: 'all 0.15s',
        }}>
          <span style={{ fontSize: 16 }}>☽</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, color: BROWN }}>Share My Phase</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12, fontStyle: 'italic', color: TAUPE }}>
              Show your cycle phase on posts
            </p>
          </div>
          {showPhase && <Check size={16} color={SAGE} strokeWidth={2} />}
        </button>

        {error && <p className="font-garamond text-sm italic mb-3" style={{ color: ROSE }}>{error}</p>}

        <button onClick={save} disabled={saving} style={{
          width: '100%', padding: 14, background: MAUVE, border: 'none',
          borderRadius: 14, cursor: 'pointer',
          fontFamily: 'Cinzel, serif', fontSize: 10,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#F2EDE8', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving…' : 'Join the Circle'}
        </button>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function CommunityProfile({ onSwitchTab }) {
  const { user }         = useAuth()
  const { phase, label } = usePhase()

  const [profile,      setProfile]      = useState(null)
  const [earnedBadges, setEarnedBadges] = useState([])
  const [myPosts,      setMyPosts]      = useState([])
  const [circles,      setCircles]      = useState({})
  const [loading,      setLoading]      = useState(true)
  const [editing,      setEditing]      = useState(false)

  // Edit fields
  const [editName,      setEditName]      = useState('')
  const [editAvatar,    setEditAvatar]    = useState('athena_1')
  const [editShowPhase, setEditShowPhase] = useState(false)
  const [saving,        setSaving]        = useState(false)

  useEffect(() => { if (user) loadAll() }, [user])

  async function loadAll() {
    setLoading(true)
    const [{ data: prof }, { data: badges }, { data: posts }, { data: circlesData }] = await Promise.all([
      supabase.from('profiles').select('display_name, avatar_choice, show_phase_publicly, community_joined_at').eq('id', user.id).maybeSingle(),
      supabase.from('user_badges').select('*, badge:badge_id(*)').eq('user_id', user.id),
      supabase.from('posts').select('*, circles(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('circles').select('id, name'),
    ])
    setProfile(prof)
    setEarnedBadges(badges || [])
    setMyPosts(posts || [])
    const cMap = {}
    ;(circlesData || []).forEach(c => { cMap[c.id] = c.name })
    setCircles(cMap)
    setLoading(false)
  }

  async function saveEdit() {
    setSaving(true)
    await supabase.from('profiles').update({
      display_name: editName,
      avatar_choice: editAvatar,
      show_phase_publicly: editShowPhase,
    }).eq('id', user.id)
    setSaving(false)
    setEditing(false)
    loadAll()
  }

  async function deletePost(postId) {
    await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)
    setMyPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (loading) return (
    <p className="font-garamond text-sm italic text-center py-8" style={{ color: 'rgba(59,51,48,0.35)' }}>
      Loading…
    </p>
  )

  if (!profile?.display_name) {
    return <ProfileSetup onSaved={loadAll} />
  }

  if (editing) {
    return (
      <div style={{ paddingTop: 8 }}>
        <p className="font-cinzel text-[9px] tracking-[0.2em] uppercase mb-4" style={{ color: BROWN }}>Edit Profile</p>

        <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-1" style={{ color: TAUPE }}>Display Name</p>
        <input
          value={editName}
          onChange={e => setEditName(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 12,
            border: '1px solid rgba(196,175,168,0.4)', background: 'rgba(255,255,255,0.6)',
            fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: BROWN,
            outline: 'none', marginBottom: 14,
          }}
        />

        <p className="font-cinzel text-[7.5px] tracking-[0.18em] uppercase mb-3" style={{ color: TAUPE }}>Avatar</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
          {AVATAR_OPTIONS.map(a => (
            <button key={a.key} onClick={() => setEditAvatar(a.key)} style={{
              padding: '8px 4px', borderRadius: 12, cursor: 'pointer',
              border: `1.5px solid ${editAvatar === a.key ? MAUVE : 'rgba(196,175,168,0.3)'}`,
              background: editAvatar === a.key ? 'rgba(196,175,168,0.15)' : 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <span style={{ fontSize: 22 }}>{a.emoji}</span>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 6.5, color: TAUPE }}>{a.name}</span>
            </button>
          ))}
        </div>

        <button onClick={() => setEditShowPhase(p => !p)} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
          border: `1px solid ${editShowPhase ? SAGE : 'rgba(196,175,168,0.35)'}`,
          background: editShowPhase ? 'rgba(143,165,140,0.1)' : 'transparent',
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 16 }}>☽</span>
          <span style={{ flex: 1, fontFamily: 'Cinzel, serif', fontSize: 8.5, color: BROWN, textAlign: 'left' }}>
            Show Phase on Posts
          </span>
          {editShowPhase && <Check size={15} color={SAGE} strokeWidth={2} />}
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditing(false)} style={{
            flex: 1, padding: 12, borderRadius: 14,
            border: '1px solid rgba(196,175,168,0.4)', background: 'transparent',
            cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9,
            letterSpacing: '0.15em', textTransform: 'uppercase', color: TAUPE,
          }}>Cancel</button>
          <button onClick={saveEdit} disabled={saving} style={{
            flex: 2, padding: 12, borderRadius: 14,
            border: 'none', background: SAGE, cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: 9,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#F2EDE8', opacity: saving ? 0.6 : 1,
          }}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
        <div style={{ height: 16 }} />
      </div>
    )
  }

  const memberSince = profile.community_joined_at
    ? new Date(profile.community_joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <>
      {/* Profile header */}
      <div style={{
        background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
        borderRadius: 18, padding: '20px 16px', marginBottom: 14,
        border: '1px solid rgba(196,175,168,0.35)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 52, marginBottom: 6 }}>
          {AVATARS[profile.avatar_choice] || '🦉'}
        </div>
        <p className="font-cinzel text-lg tracking-wide mb-1" style={{ color: BROWN }}>
          {profile.display_name}
        </p>
        {memberSince && (
          <p className="font-garamond text-sm italic" style={{ color: TAUPE }}>
            Member since {memberSince}
          </p>
        )}
        {profile.show_phase_publicly && phase && (
          <div style={{ marginTop: 6 }}>
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: 8, color: SAGE,
              background: 'rgba(143,165,140,0.12)', borderRadius: 10, padding: '3px 10px',
              border: '1px solid rgba(143,165,140,0.25)',
            }}>
              ☽ {label || phase} Phase
            </span>
          </div>
        )}
        <button onClick={() => {
          setEditName(profile.display_name || '')
          setEditAvatar(profile.avatar_choice || 'athena_1')
          setEditShowPhase(profile.show_phase_publicly || false)
          setEditing(true)
        }} style={{
          marginTop: 12, padding: '7px 18px', borderRadius: 12,
          border: '1px solid rgba(196,175,168,0.4)', background: 'transparent',
          cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 8,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: TAUPE,
        }}>
          Edit Profile
        </button>
      </div>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <>
          <p className="font-cinzel text-[8.5px] tracking-[0.22em] uppercase mb-3" style={{ color: TAUPE }}>
            Earned Badges
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {earnedBadges.map(b => (
              <div key={b.id} style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(255,255,255,0.5) 100%)',
                borderRadius: 14, padding: '10px 12px',
                border: '1px solid rgba(201,168,76,0.3)',
                textAlign: 'center', minWidth: 72,
              }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{b.badge?.icon_emoji}</div>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: 7, color: BROWN }}>{b.badge?.name}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* My posts */}
      <p className="font-cinzel text-[8.5px] tracking-[0.22em] uppercase mb-3" style={{ color: TAUPE }}>
        My Posts
      </p>
      {myPosts.length === 0 && (
        <p className="font-garamond text-sm italic text-center py-4" style={{ color: 'rgba(59,51,48,0.35)' }}>
          You haven't posted yet.{' '}
          <button onClick={() => onSwitchTab?.('feed')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: SAGE, fontFamily: 'inherit', fontSize: 'inherit', fontStyle: 'inherit', textDecoration: 'underline' }}>
            Share something →
          </button>
        </p>
      )}
      {myPosts.map(post => (
        <div key={post.id} style={{
          background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)',
          borderRadius: 14, padding: '12px 14px', marginBottom: 8,
          border: '1px solid rgba(196,175,168,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div>
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: 7.5, color: SAGE,
                background: 'rgba(143,165,140,0.1)', borderRadius: 6, padding: '2px 8px',
                border: '1px solid rgba(143,165,140,0.2)',
              }}>
                {post.circles?.name || '—'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="font-garamond text-xs italic" style={{ color: TAUPE }}>{timeAgo(post.created_at)}</span>
              <button onClick={() => deletePost(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(212,160,160,0.5)', padding: 2 }}>
                <Trash2 size={13} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <p className="font-garamond text-sm leading-snug" style={{ color: BROWN }}>{post.content}</p>
          {post.is_anonymous && (
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 7, color: TAUPE, marginTop: 3 }}>🌙 Posted anonymously</p>
          )}
        </div>
      ))}

      <div style={{ height: 16 }} />
    </>
  )
}
