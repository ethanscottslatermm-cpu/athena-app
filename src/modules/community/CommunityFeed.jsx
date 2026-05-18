import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Plus, MessageCircle, X, Send, Image, Sparkles, MoreHorizontal, Flag, Ban } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const SAGE  = '#8FA58C'
const BROWN = '#3B3330'
const TAUPE = '#7A6A65'
const MAUVE = '#C4AFA8'
const ROSE  = '#C4859A'

const REACTION_EMOJIS = ['❤️', '🙌', '💜', '🔥']

const AVATARS = {
  athena_1: '🦉', athena_2: '🌙', athena_3: '🌸',
  athena_4: '🌹', athena_5: '🌻', athena_6: '🌿',
  athena_7: '💫', athena_8: '🔮',
}

const REPORT_REASONS = ['Harmful Content', 'Spam', 'Misinformation', 'Other']

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function calcPhase(lastPeriod, cycleLength = 28) {
  if (!lastPeriod) return null
  const day = (Math.floor((Date.now() - new Date(lastPeriod)) / 86400000) % cycleLength) + 1
  if (day <= 5) return 'Menstrual'
  if (day <= 13) return 'Follicular'
  if (day <= 16) return 'Ovulation'
  return 'Luteal'
}

// ── Post card ────────────────────────────────────────────────────────────────

function PostCard({ post, userReactions, onReact, onOpenReplies, onReport, onBlock, isOwn }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const name   = post.is_anonymous ? 'Anonymous' : (post.profiles?.display_name || 'Goddess')
  const avatar = post.is_anonymous ? '🌙' : (AVATARS[post.profiles?.avatar_choice] || '🦉')
  const showPhase = !post.is_anonymous && post.profiles?.show_phase_publicly && post.phase_snapshot

  const reactionMap = {}
  ;(post.reactions || []).forEach(r => { reactionMap[r.emoji] = (reactionMap[r.emoji] || 0) + 1 })

  const replyCount = post.replies?.[0]?.count ?? 0

  return (
    <div style={{
      position: 'relative',
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16, padding: '14px',
      marginBottom: 10,
      border: '1px solid rgba(196,175,168,0.35)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{avatar}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="font-cinzel text-xs" style={{ color: BROWN }}>{name}</span>
            {showPhase && (
              <span style={{
                fontFamily: 'Cinzel, serif', fontSize: 7, color: SAGE,
                background: 'rgba(143,165,140,0.12)', borderRadius: 6, padding: '1px 6px',
                border: '1px solid rgba(143,165,140,0.25)',
              }}>{post.phase_snapshot}</span>
            )}
          </div>
          <span className="font-garamond text-xs italic" style={{ color: TAUPE }}>{timeAgo(post.created_at)}</span>
        </div>

        {/* Overflow menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: TAUPE }}>
            <MoreHorizontal size={15} strokeWidth={1.5} />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 22, zIndex: 20,
              background: '#F2EDE8', borderRadius: 12,
              border: '1px solid rgba(196,175,168,0.4)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              minWidth: 150, overflow: 'hidden',
            }}>
              {!isOwn && (
                <>
                  <button onClick={() => { onReport(post.id); setMenuOpen(false) }} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, color: BROWN, textAlign: 'left',
                  }}>
                    <Flag size={11} /> Report Post
                  </button>
                  <button onClick={() => { onBlock(post.user_id); setMenuOpen(false) }} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                    cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, color: ROSE, textAlign: 'left',
                  }}>
                    <Ban size={11} /> Block User
                  </button>
                </>
              )}
              {isOwn && (
                <button onClick={() => setMenuOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, color: TAUPE, textAlign: 'left',
                }}>
                  My Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="font-garamond text-sm leading-relaxed" style={{ color: BROWN, marginBottom: 8 }}>
        {post.content}
      </p>

      {post.image_url && (
        <img src={post.image_url} alt="" style={{
          width: '100%', borderRadius: 12, marginBottom: 8,
          objectFit: 'cover', maxHeight: 220,
        }} />
      )}

      {/* Reactions + reply */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
        {REACTION_EMOJIS.map(emoji => {
          const count  = reactionMap[emoji] || 0
          const active = userReactions?.[post.id]?.has(emoji)
          return (
            <button key={emoji} onClick={() => onReact(post.id, emoji)} style={{
              padding: '3px 8px', borderRadius: 20, cursor: 'pointer',
              border: `1px solid ${active ? SAGE : 'rgba(196,175,168,0.35)'}`,
              background: active ? 'rgba(143,165,140,0.15)' : 'transparent',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 3,
              transition: 'all 0.15s',
            }}>
              {emoji}
              {count > 0 && (
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, color: TAUPE }}>{count}</span>
              )}
            </button>
          )
        })}
        <button onClick={() => onOpenReplies(post)} style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
          background: 'none', border: 'none', cursor: 'pointer', color: TAUPE,
        }}>
          <MessageCircle size={13} strokeWidth={1.5} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8 }}>{replyCount}</span>
        </button>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function CommunityFeed() {
  const { user }         = useAuth()
  const { phase, label } = usePhase()

  const [circles,        setCircles]        = useState([])
  const [activeCircle,   setActiveCircle]   = useState(null)
  const [posts,          setPosts]          = useState([])
  const [dailyPrompt,    setDailyPrompt]    = useState('')
  const [solidarityCount, setSolidarityCount] = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [userReactions,  setUserReactions]  = useState({})
  const [blockedIds,     setBlockedIds]     = useState([])

  // Compose sheet
  const [composeOpen, setComposeOpen] = useState(false)
  const [newContent,  setNewContent]  = useState('')
  const [newCircle,   setNewCircle]   = useState(null)
  const [isAnon,      setIsAnon]      = useState(false)
  const [imageFile,   setImageFile]   = useState(null)
  const [posting,     setPosting]     = useState(false)

  // Reply sheet
  const [replyPost,    setReplyPost]    = useState(null)
  const [replies,      setReplies]      = useState([])
  const [newReply,     setNewReply]     = useState('')
  const [replyAnon,    setReplyAnon]    = useState(false)
  const [sendingReply, setSendingReply] = useState(false)

  // Report sheet
  const [reportPostId, setReportPostId] = useState(null)
  const [reportReason, setReportReason] = useState('')

  const fileRef = useRef()

  useEffect(() => {
    loadCircles()
    if (user) loadBlocks()
  }, [user])

  useEffect(() => { if (phase) loadDailyPrompt() }, [phase])
  useEffect(() => { if (phase) loadSolidarity()  }, [phase])

  useEffect(() => {
    if (activeCircle) loadPosts()
  }, [activeCircle, blockedIds])

  useEffect(() => {
    if (!activeCircle) return
    const ch = supabase
      .channel(`posts-${activeCircle}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'posts',
        filter: `circle_id=eq.${activeCircle}`,
      }, payload => {
        if (!blockedIds.includes(payload.new.user_id))
          setPosts(prev => [{ ...payload.new, reactions: [], replies: [{ count: 0 }] }, ...prev])
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [activeCircle, blockedIds])

  async function loadBlocks() {
    const { data } = await supabase.from('user_blocks').select('blocked_id').eq('blocker_id', user.id)
    setBlockedIds((data || []).map(b => b.blocked_id))
  }

  async function loadCircles() {
    const { data } = await supabase.from('circles').select('*').order('name')
    if (!data?.length) return
    setCircles(data)
    setActiveCircle(data[0].id)
    setNewCircle(data[0].id)
  }

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*, profiles!posts_user_id_fkey(display_name, avatar_choice, show_phase_publicly), reactions(emoji, user_id), replies(count)')
      .eq('circle_id', activeCircle)
      .order('created_at', { ascending: false })
      .limit(60)

    const filtered = (data || []).filter(p => !blockedIds.includes(p.user_id))
    setPosts(filtered)

    if (user) {
      const map = {}
      filtered.forEach(p => {
        const mine = (p.reactions || []).filter(r => r.user_id === user.id).map(r => r.emoji)
        if (mine.length) map[p.id] = new Set(mine)
      })
      setUserReactions(map)
    }
    setLoading(false)
  }

  async function loadDailyPrompt() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('phase_daily_prompts')
      .select('content')
      .eq('phase_name', phase)
      .eq('prompt_date', today)
      .maybeSingle()

    if (data?.content) { setDailyPrompt(data.content); return }

    try {
      const r = await fetch('/.netlify/functions/ai-community', {
        method: 'POST',
        body: JSON.stringify({ type: 'phase_prompt', phase, label }),
      })
      const d = await r.json()
      const prompt = d.prompt || ''
      setDailyPrompt(prompt)
      if (prompt) supabase.from('phase_daily_prompts').upsert(
        { phase_name: phase, prompt_date: today, content: prompt },
        { onConflict: 'phase_name,prompt_date', ignoreDuplicates: true }
      ).then(() => {})
    } catch {}
  }

  async function loadSolidarity() {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('last_period_date, cycle_length')
        .not('last_period_date', 'is', null)
      if (!data?.length) return
      let count = 0
      data.forEach(p => { if (calcPhase(p.last_period_date, p.cycle_length || 28) === phase) count++ })
      setSolidarityCount(count)
    } catch {}
  }

  async function handleReact(postId, emoji) {
    if (!user) return
    const current = userReactions[postId] || new Set()
    const hasIt   = current.has(emoji)

    if (hasIt) {
      await supabase.from('reactions').delete().eq('user_id', user.id).eq('post_id', postId).eq('emoji', emoji)
      setUserReactions(prev => {
        const s = new Set(prev[postId] || [])
        s.delete(emoji)
        const next = { ...prev }
        if (s.size) next[postId] = s; else delete next[postId]
        return next
      })
      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p, reactions: (p.reactions || []).filter(r => !(r.user_id === user.id && r.emoji === emoji))
      }))
    } else {
      await supabase.from('reactions').insert({ user_id: user.id, post_id: postId, emoji })
      setUserReactions(prev => {
        const s = new Set(prev[postId] || [])
        s.add(emoji)
        return { ...prev, [postId]: s }
      })
      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p, reactions: [...(p.reactions || []), { user_id: user.id, emoji }]
      }))
    }
  }

  async function openReplies(post) {
    setReplyPost(post)
    setNewReply('')
    const { data } = await supabase
      .from('replies')
      .select('*, profiles!replies_user_id_fkey(display_name, avatar_choice)')
      .eq('post_id', post.id)
      .order('created_at')
    setReplies((data || []).filter(r => !blockedIds.includes(r.user_id)))
  }

  async function submitReply() {
    if (!newReply.trim() || !replyPost || !user) return
    setSendingReply(true)
    const { data } = await supabase.from('replies')
      .insert({ user_id: user.id, post_id: replyPost.id, content: newReply.trim(), is_anonymous: replyAnon })
      .select('*, profiles!replies_user_id_fkey(display_name, avatar_choice)').single()
    if (data) setReplies(prev => [...prev, data])
    setNewReply('')
    setSendingReply(false)
  }

  async function submitPost() {
    if (!newContent.trim() || !user) return
    setPosting(true)
    let image_url = null
    if (imageFile) {
      const { data: s } = await supabase.storage.from('community-posts')
        .upload(`${user.id}/${Date.now()}-${imageFile.name}`, imageFile)
      if (s) {
        const { data: { publicUrl } } = supabase.storage.from('community-posts').getPublicUrl(s.path)
        image_url = publicUrl
      }
    }
    const circleId = newCircle || activeCircle
    const { data } = await supabase.from('posts')
      .insert({ user_id: user.id, circle_id: circleId, content: newContent.trim(), is_anonymous: isAnon, image_url, phase_snapshot: phase || null })
      .select('*, profiles!posts_user_id_fkey(display_name, avatar_choice, show_phase_publicly), reactions(emoji, user_id), replies(count)')
      .single()
    if (data) {
      if (circleId === activeCircle) setPosts(prev => [data, ...prev])
      setNewContent('')
      setIsAnon(false)
      setImageFile(null)
      setComposeOpen(false)
    }
    setPosting(false)
  }

  async function submitReport() {
    if (!user || !reportPostId || !reportReason) return
    await supabase.from('reports').insert({ reporter_id: user.id, post_id: reportPostId, reason: reportReason })
    setReportPostId(null)
    setReportReason('')
  }

  async function blockUser(blockedId) {
    if (!user || !blockedId) return
    await supabase.from('user_blocks').insert({ blocker_id: user.id, blocked_id: blockedId }).select()
    setBlockedIds(prev => [...prev, blockedId])
    setPosts(prev => prev.filter(p => p.user_id !== blockedId))
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Solidarity banner */}
      {solidarityCount > 1 && (
        <div style={{
          background: 'rgba(143,165,140,0.12)',
          borderRadius: 14, padding: '8px 14px',
          border: '1px solid rgba(143,165,140,0.25)',
          marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 14 }}>🌿</span>
          <p className="font-garamond text-sm italic" style={{ color: TAUPE }}>
            <span style={{ color: SAGE, fontStyle: 'normal', fontWeight: 600 }}>{solidarityCount} women</span>
            {' '}are in their {phase || 'cycle'} phase with you today.
          </p>
        </div>
      )}

      {/* Circle selector */}
      <div className="cm-hscroll" style={{
        display: 'flex', gap: 7, overflowX: 'auto',
        margin: '0 -16px', padding: '0 16px 10px',
      }}>
        {circles.map(c => (
          <button key={c.id} onClick={() => setActiveCircle(c.id)} style={{
            flexShrink: 0, padding: '5px 12px', borderRadius: 20,
            border: `1px solid ${activeCircle === c.id ? SAGE : 'rgba(196,175,168,0.4)'}`,
            background: activeCircle === c.id ? 'rgba(143,165,140,0.12)' : 'transparent',
            cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'Cinzel, serif', fontSize: 8,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: activeCircle === c.id ? SAGE : TAUPE,
            whiteSpace: 'nowrap',
          }}>
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      {/* Daily phase prompt */}
      {dailyPrompt && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(143,165,140,0.15) 0%, rgba(255,255,255,0.5) 100%)',
          borderRadius: 14, padding: '12px 14px',
          border: '1px solid rgba(143,165,140,0.3)',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
            <Sparkles size={10} color={SAGE} strokeWidth={1.5} />
            <span className="font-cinzel text-[8px] tracking-[0.2em] uppercase" style={{ color: SAGE }}>
              Today's Prompt
            </span>
          </div>
          <p className="font-garamond text-sm italic leading-snug" style={{ color: BROWN }}>
            {dailyPrompt}
          </p>
        </div>
      )}

      {/* Post feed */}
      {loading ? (
        <p className="font-garamond text-sm italic text-center py-8" style={{ color: 'rgba(59,51,48,0.35)' }}>
          Loading posts…
        </p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 32 }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
            Be the first to post in this circle.
          </p>
        </div>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            userReactions={userReactions}
            onReact={handleReact}
            onOpenReplies={openReplies}
            onReport={id => setReportPostId(id)}
            onBlock={blockUser}
            isOwn={post.user_id === user?.id}
          />
        ))
      )}

      {/* Compose FAB */}
      <div style={{ position: 'sticky', bottom: 16, display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button onClick={() => setComposeOpen(true)} style={{
          width: 52, height: 52, borderRadius: '50%',
          background: MAUVE, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(196,175,168,0.55)',
        }}>
          <Plus size={22} color="#F2EDE8" strokeWidth={2} />
        </button>
      </div>

      <div style={{ height: 16 }} />

      {/* ── Compose sheet ────────────────────────────────────────────────────── */}
      {composeOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(59,51,48,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setComposeOpen(false)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#F2EDE8', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 32px', maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span className="font-cinzel text-[10px] tracking-[0.22em] uppercase" style={{ color: BROWN }}>New Post</span>
              <button onClick={() => setComposeOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TAUPE }}>
                <X size={18} />
              </button>
            </div>

            {/* Circle picker */}
            <p className="font-cinzel text-[8px] tracking-[0.18em] uppercase mb-2" style={{ color: TAUPE }}>Circle</p>
            <div className="cm-hscroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
              {circles.map(c => (
                <button key={c.id} onClick={() => setNewCircle(c.id)} style={{
                  flexShrink: 0, padding: '4px 10px', borderRadius: 16,
                  border: `1px solid ${newCircle === c.id ? SAGE : 'rgba(196,175,168,0.4)'}`,
                  background: newCircle === c.id ? 'rgba(143,165,140,0.12)' : 'transparent',
                  cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 7.5,
                  color: newCircle === c.id ? SAGE : TAUPE, whiteSpace: 'nowrap',
                }}>
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>

            {/* Content */}
            <textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Share something with your circle…"
              rows={4}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.6)', borderRadius: 12,
                border: '1px solid rgba(196,175,168,0.4)', padding: '12px',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 15, fontStyle: 'italic',
                color: BROWN, resize: 'none', outline: 'none',
                marginBottom: 10,
              }}
            />

            {/* Image + anon row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => setImageFile(e.target.files[0] || null)} />
              <button onClick={() => fileRef.current?.click()} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: '1px solid rgba(196,175,168,0.4)',
                borderRadius: 10, padding: '5px 10px', cursor: 'pointer',
                fontFamily: 'Cinzel, serif', fontSize: 8, color: TAUPE,
              }}>
                <Image size={12} />
                {imageFile ? imageFile.name.slice(0, 12) + '…' : 'Add Photo'}
              </button>
              <button onClick={() => setIsAnon(p => !p)} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: isAnon ? 'rgba(196,133,154,0.1)' : 'none',
                border: `1px solid ${isAnon ? ROSE : 'rgba(196,175,168,0.4)'}`,
                borderRadius: 10, padding: '5px 10px', cursor: 'pointer',
                fontFamily: 'Cinzel, serif', fontSize: 8,
                color: isAnon ? ROSE : TAUPE, transition: 'all 0.15s',
              }}>
                🌙 {isAnon ? 'Anonymous On' : 'Post Anonymously'}
              </button>
            </div>

            <button onClick={submitPost} disabled={posting || !newContent.trim()} style={{
              width: '100%', padding: 14, background: SAGE, border: 'none',
              borderRadius: 14, cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontSize: 10,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#F2EDE8', opacity: (posting || !newContent.trim()) ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}>
              {posting ? 'Posting…' : 'Post to Circle'}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* ── Reply sheet ───────────────────────────────────────────────────── */}
      {replyPost && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(59,51,48,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setReplyPost(null)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#F2EDE8', borderRadius: '20px 20px 0 0',
            padding: '20px 16px', maxHeight: '80vh',
            display: 'flex', flexDirection: 'column',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
              <span className="font-cinzel text-[9px] tracking-[0.2em] uppercase" style={{ color: BROWN }}>Replies</span>
              <button onClick={() => setReplyPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TAUPE }}>
                <X size={18} />
              </button>
            </div>

            {/* Original post */}
            <div style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 12, padding: '10px 12px', marginBottom: 10, flexShrink: 0 }}>
              <p className="font-garamond text-sm italic leading-snug" style={{ color: BROWN }}>{replyPost.content}</p>
            </div>

            {/* Replies scroll */}
            <div className="cm-pane" style={{ flex: 1, overflowY: 'auto', marginBottom: 10 }}>
              {replies.length === 0 && (
                <p className="font-garamond text-sm italic text-center py-4" style={{ color: 'rgba(59,51,48,0.35)' }}>
                  No replies yet — start the conversation.
                </p>
              )}
              {replies.map(r => (
                <div key={r.id} style={{ marginBottom: 8 }}>
                  <span className="font-cinzel text-[8px]" style={{ color: TAUPE, marginRight: 6 }}>
                    {r.is_anonymous ? '🌙 Anonymous' : (r.profiles?.display_name || 'Goddess')}
                  </span>
                  <p className="font-garamond text-sm leading-snug" style={{ color: BROWN }}>{r.content}</p>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div style={{ flexShrink: 0, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={newReply}
                onChange={e => setNewReply(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(196,175,168,0.4)', borderRadius: 12,
                  padding: '10px 12px', fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 14, fontStyle: 'italic', color: BROWN,
                  resize: 'none', outline: 'none',
                }}
              />
              <button onClick={submitReply} disabled={sendingReply || !newReply.trim()} style={{
                width: 40, height: 40, borderRadius: '50%',
                background: SAGE, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: (sendingReply || !newReply.trim()) ? 0.5 : 1,
              }}>
                <Send size={16} color="#F2EDE8" strokeWidth={2} />
              </button>
            </div>

            {/* Anonymous toggle */}
            <button onClick={() => setReplyAnon(p => !p)} style={{
              marginTop: 6, background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Cinzel, serif', fontSize: 8,
              color: replyAnon ? ROSE : TAUPE, textAlign: 'left',
            }}>
              🌙 {replyAnon ? 'Replying anonymously' : 'Reply anonymously'}
            </button>

            <div style={{ height: 'env(safe-area-inset-bottom)', minHeight: 16 }} />
          </div>
        </div>,
        document.body
      )}

      {/* ── Report sheet ──────────────────────────────────────────────────── */}
      {reportPostId && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(59,51,48,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setReportPostId(null)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#F2EDE8', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 32px',
          }} onClick={e => e.stopPropagation()}>
            <p className="font-cinzel text-[9px] tracking-[0.2em] uppercase mb-4" style={{ color: BROWN }}>
              Report Post
            </p>
            {REPORT_REASONS.map(r => (
              <button key={r} onClick={() => setReportReason(r)} style={{
                display: 'block', width: '100%', padding: '11px 14px',
                marginBottom: 6, borderRadius: 12, cursor: 'pointer',
                border: `1px solid ${reportReason === r ? ROSE : 'rgba(196,175,168,0.4)'}`,
                background: reportReason === r ? 'rgba(196,133,154,0.1)' : 'rgba(255,255,255,0.55)',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 15,
                color: reportReason === r ? ROSE : BROWN, textAlign: 'left',
                transition: 'all 0.15s',
              }}>
                {r}
              </button>
            ))}
            <button onClick={submitReport} disabled={!reportReason} style={{
              width: '100%', marginTop: 10, padding: 13,
              background: ROSE, border: 'none', borderRadius: 14,
              cursor: 'pointer', fontFamily: 'Cinzel, serif',
              fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#F2EDE8', opacity: reportReason ? 1 : 0.5,
            }}>
              Submit Report
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
