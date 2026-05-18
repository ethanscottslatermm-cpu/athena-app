import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Trophy, Lock, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePhase } from '../../hooks/usePhase'

const SAGE  = '#8FA58C'
const BROWN = '#3B3330'
const TAUPE = '#7A6A65'
const MAUVE = '#C4AFA8'
const ROSE  = '#C4859A'
const GOLD  = '#C9A84C'

// ── Progress tracking ─────────────────────────────────────────────────────────

async function fetchProgress(userId, entry, challenge) {
  const { module_link, target_count } = challenge
  const since = entry.joined_at

  try {
    if (module_link === 'water_log') {
      const { data } = await supabase
        .from('water_log')
        .select('glasses_count')
        .eq('user_id', userId)
        .gte('log_date', since.split('T')[0])
      return (data || []).filter(r => r.glasses_count >= 6).length

    } else if (module_link === 'posts') {
      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', since)
      return count || 0

    } else {
      // pilates_sessions, sleep_logs, skin_logs, food_log
      const { count } = await supabase
        .from(module_link)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', since)
      return Math.min(count || 0, target_count)
    }
  } catch {
    return 0
  }
}

// ── Badge celebration modal ───────────────────────────────────────────────────

function BadgeCelebration({ badge, message, onClose }) {
  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(59,51,48,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#F2EDE8',
        borderRadius: 24, padding: '32px 24px', margin: '0 20px',
        textAlign: 'center', maxWidth: 320,
        border: '1px solid rgba(201,168,76,0.4)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        animation: 'badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <style>{`@keyframes badgePop{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{badge.icon_emoji}</div>
        <p className="font-cinzel text-xs tracking-[0.2em] uppercase mb-1" style={{ color: GOLD }}>
          Badge Earned
        </p>
        <p className="font-cinzel text-xl mb-2" style={{ color: BROWN }}>{badge.name}</p>
        <p className="font-garamond text-sm italic leading-relaxed mb-6" style={{ color: TAUPE }}>
          {message || badge.description}
        </p>
        <button onClick={onClose} style={{
          padding: '12px 28px', borderRadius: 14, border: 'none',
          background: GOLD, cursor: 'pointer',
          fontFamily: 'Cinzel, serif', fontSize: 9,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: '#F2EDE8',
        }}>
          Claim Badge
        </button>
      </div>
    </div>,
    document.body
  )
}

// ── Challenge card ────────────────────────────────────────────────────────────

function ChallengeCard({ challenge, entry, progress, onJoin, onComplete, participantCount }) {
  const pct      = Math.min((progress / challenge.target_count) * 100, 100)
  const joined   = !!entry
  const complete = !!entry?.completed_at
  const daysLeft = challenge.end_date
    ? Math.max(0, Math.ceil((new Date(challenge.end_date) - Date.now()) / 86400000))
    : null

  return (
    <div style={{
      background: complete
        ? 'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(255,255,255,0.5) 100%)'
        : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(12px)',
      borderRadius: 16, padding: '14px',
      marginBottom: 10,
      border: `1px solid ${complete ? 'rgba(201,168,76,0.35)' : 'rgba(196,175,168,0.35)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 26, lineHeight: 1 }}>{challenge.badge?.icon_emoji || '🏆'}</span>
        <div style={{ flex: 1 }}>
          <p className="font-cinzel text-xs" style={{ color: BROWN }}>{challenge.title}</p>
          <p className="font-garamond text-sm italic" style={{ color: TAUPE }}>{challenge.description}</p>
        </div>
        {!complete && (
          <button onClick={() => !joined && onJoin(challenge)} style={{
            padding: '6px 12px', borderRadius: 12, cursor: joined ? 'default' : 'pointer',
            border: `1px solid ${joined ? SAGE : 'rgba(196,175,168,0.4)'}`,
            background: joined ? 'rgba(143,165,140,0.15)' : 'transparent',
            fontFamily: 'Cinzel, serif', fontSize: 7.5, textTransform: 'uppercase',
            color: joined ? SAGE : TAUPE, whiteSpace: 'nowrap',
          }}>
            {joined ? '✓ Joined' : 'Join'}
          </button>
        )}
        {complete && (
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 7.5, color: GOLD,
            background: 'rgba(201,168,76,0.12)', borderRadius: 8, padding: '4px 10px',
            border: '1px solid rgba(201,168,76,0.3)',
          }}>
            ✓ Done
          </span>
        )}
      </div>

      {joined && !complete && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, color: TAUPE }}>
              Progress: {progress}/{challenge.target_count}
            </span>
            {daysLeft !== null && (
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, color: TAUPE }}>
                {daysLeft}d left
              </span>
            )}
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(196,175,168,0.3)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: pct >= 100 ? GOLD : SAGE,
              width: `${pct}%`, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, color: TAUPE }}>
          {participantCount} women joined
        </span>
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function CommunityChallenges() {
  const { user }         = useAuth()
  const { phase, label } = usePhase()

  const [challenges,    setChallenges]    = useState([])
  const [entries,       setEntries]       = useState({})
  const [progress,      setProgress]      = useState({})
  const [partCounts,    setPartCounts]    = useState({})
  const [earnedBadges,  setEarnedBadges]  = useState([])
  const [allBadges,     setAllBadges]     = useState([])
  const [celebration,   setCelebration]   = useState(null) // { badge, message }
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard,   setLeaderboard]   = useState([])
  const [leaderChallenge, setLeaderChallenge] = useState(null)
  const [onLeaderboard, setOnLeaderboard] = useState(false)
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    if (user) loadAll()
  }, [user])

  async function loadAll() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [{ data: chData }, { data: entData }, { data: badgeData }, { data: earnedData }, { data: profile }] = await Promise.all([
      supabase.from('challenges').select('*, badge:badge_id(*)').lte('start_date', today).gte('end_date', today),
      supabase.from('challenge_entries').select('*').eq('user_id', user.id),
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('*, badge:badge_id(*)').eq('user_id', user.id),
      supabase.from('profiles').select('show_on_leaderboard').eq('id', user.id).maybeSingle(),
    ])

    const chs   = chData   || []
    const ents  = entData  || []
    const entMap = {}
    ents.forEach(e => { entMap[e.challenge_id] = e })

    setChallenges(chs)
    setEntries(entMap)
    setAllBadges(badgeData || [])
    setEarnedBadges((earnedData || []).map(e => e.badge_id))
    setOnLeaderboard(profile?.show_on_leaderboard || false)

    // Participant counts
    if (chs.length) {
      const { data: pData } = await supabase
        .from('challenge_entries')
        .select('challenge_id')
        .in('challenge_id', chs.map(c => c.id))
      const pMap = {}
      ;(pData || []).forEach(e => { pMap[e.challenge_id] = (pMap[e.challenge_id] || 0) + 1 })
      setPartCounts(pMap)
    }

    // Progress for joined challenges
    const progMap = {}
    for (const entry of ents) {
      if (entry.completed_at) { progMap[entry.challenge_id] = 999; continue }
      const ch = chs.find(c => c.id === entry.challenge_id)
      if (!ch) continue
      const prog = await fetchProgress(user.id, entry, ch)
      progMap[entry.challenge_id] = prog

      // Check for completion
      if (prog >= ch.target_count) {
        await markComplete(entry, ch)
      }
    }
    setProgress(progMap)
    setLoading(false)
  }

  async function markComplete(entry, challenge) {
    if (entry.completed_at) return
    await supabase.from('challenge_entries')
      .update({ completed_at: new Date().toISOString(), current_progress: challenge.target_count })
      .eq('id', entry.id)

    if (challenge.badge_id) {
      const alreadyEarned = earnedBadges.includes(challenge.badge_id)
      if (!alreadyEarned) {
        await supabase.from('user_badges').insert({ user_id: user.id, badge_id: challenge.badge_id })

        // Fetch AI completion message
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
        try {
          const r = await fetch('/.netlify/functions/ai-community', {
            method: 'POST',
            body: JSON.stringify({
              type: 'challenge_complete',
              challengeTitle: challenge.title,
              badgeName: challenge.badge?.name,
              phase: label || phase,
              displayName: profile?.display_name,
            }),
          })
          const d = await r.json()
          setCelebration({ badge: challenge.badge, message: d.message || '' })
        } catch {
          setCelebration({ badge: challenge.badge, message: '' })
        }
      }
    }
  }

  async function joinChallenge(challenge) {
    if (!user || entries[challenge.id]) return
    const { data } = await supabase.from('challenge_entries')
      .insert({ user_id: user.id, challenge_id: challenge.id })
      .select().single()
    if (data) {
      setEntries(prev => ({ ...prev, [challenge.id]: data }))
      setProgress(prev => ({ ...prev, [challenge.id]: 0 }))
      setPartCounts(prev => ({ ...prev, [challenge.id]: (prev[challenge.id] || 0) + 1 }))
    }
  }

  async function loadLeaderboard(challenge) {
    setLeaderChallenge(challenge)
    const { data } = await supabase
      .from('challenge_entries')
      .select('current_progress, profiles!challenge_entries_user_id_fkey(display_name, show_on_leaderboard)')
      .eq('challenge_id', challenge.id)
      .order('current_progress', { ascending: false })
      .limit(10)
    const visible = (data || []).filter(e => e.profiles?.show_on_leaderboard)
    setLeaderboard(visible)
    setShowLeaderboard(true)
  }

  async function toggleLeaderboard() {
    const next = !onLeaderboard
    setOnLeaderboard(next)
    await supabase.from('profiles').update({ show_on_leaderboard: next }).eq('id', user.id)
  }

  const completedChallenges = challenges.filter(c => entries[c.id]?.completed_at)
  const activeChallenges    = challenges.filter(c => !entries[c.id]?.completed_at)

  if (loading) return (
    <p className="font-garamond text-sm italic text-center py-8" style={{ color: 'rgba(59,51,48,0.35)' }}>
      Loading challenges…
    </p>
  )

  return (
    <>
      {/* Leaderboard toggle */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 14, padding: '8px 12px',
        background: 'rgba(255,255,255,0.45)', borderRadius: 12,
        border: '1px solid rgba(196,175,168,0.3)',
      }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, color: TAUPE }}>
          Show me on leaderboard
        </span>
        <button onClick={toggleLeaderboard} style={{
          width: 38, height: 22, borderRadius: 11,
          background: onLeaderboard ? SAGE : 'rgba(196,175,168,0.35)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s',
        }}>
          <div style={{
            position: 'absolute', top: 3, left: onLeaderboard ? 18 : 3,
            width: 16, height: 16, borderRadius: '50%',
            background: '#F2EDE8', transition: 'left 0.2s',
          }} />
        </button>
      </div>

      {/* Active challenges */}
      {activeChallenges.length > 0 && (
        <>
          <p className="font-cinzel text-[8.5px] tracking-[0.22em] uppercase mb-3" style={{ color: TAUPE }}>
            Active Challenges
          </p>
          {activeChallenges.map(c => (
            <div key={c.id}>
              <ChallengeCard
                challenge={c}
                entry={entries[c.id]}
                progress={progress[c.id] || 0}
                onJoin={joinChallenge}
                onComplete={markComplete}
                participantCount={partCounts[c.id] || 0}
              />
              {entries[c.id] && !entries[c.id]?.completed_at && (
                <button onClick={() => loadLeaderboard(c)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Cinzel, serif', fontSize: 7.5, color: TAUPE,
                  marginTop: -6, marginBottom: 8, paddingLeft: 2,
                }}>
                  View leaderboard →
                </button>
              )}
            </div>
          ))}
        </>
      )}

      {activeChallenges.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 16 }}>
          <p className="font-garamond text-sm italic" style={{ color: 'rgba(59,51,48,0.35)' }}>
            No active challenges right now. Check back soon.
          </p>
        </div>
      )}

      {/* Completed */}
      {completedChallenges.length > 0 && (
        <>
          <p className="font-cinzel text-[8.5px] tracking-[0.22em] uppercase mb-3 mt-2" style={{ color: TAUPE }}>
            Completed
          </p>
          {completedChallenges.map(c => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              entry={entries[c.id]}
              progress={c.target_count}
              participantCount={partCounts[c.id] || 0}
            />
          ))}
        </>
      )}

      {/* My Badges */}
      <p className="font-cinzel text-[8.5px] tracking-[0.22em] uppercase mb-3 mt-4" style={{ color: TAUPE }}>
        My Badges
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {allBadges.map(b => {
          const earned = earnedBadges.includes(b.id)
          return (
            <div key={b.id} style={{ textAlign: 'center' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: earned
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.2) 0%, rgba(255,255,255,0.5) 100%)'
                  : 'rgba(196,175,168,0.12)',
                border: `1px solid ${earned ? 'rgba(201,168,76,0.4)' : 'rgba(196,175,168,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 4px',
                fontSize: earned ? 24 : 20,
                filter: earned ? 'none' : 'grayscale(1)',
                opacity: earned ? 1 : 0.45,
              }}>
                {earned ? b.icon_emoji : <Lock size={16} color={TAUPE} strokeWidth={1.5} />}
              </div>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: 6.5, color: earned ? BROWN : TAUPE, textAlign: 'center', lineHeight: 1.2 }}>
                {b.name}
              </p>
              {!earned && (
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 9, fontStyle: 'italic', color: 'rgba(59,51,48,0.35)', marginTop: 1 }}>
                  {b.criteria}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ height: 16 }} />

      {/* Badge celebration */}
      {celebration && (
        <BadgeCelebration
          badge={celebration.badge}
          message={celebration.message}
          onClose={() => { setCelebration(null); loadAll() }}
        />
      )}

      {/* Leaderboard sheet */}
      {showLeaderboard && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(59,51,48,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowLeaderboard(false)}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: '#F2EDE8', borderRadius: '20px 20px 0 0',
            padding: '20px 16px 32px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="font-cinzel text-[9px] tracking-[0.2em] uppercase" style={{ color: BROWN }}>
                Leaderboard · {leaderChallenge?.title}
              </span>
              <button onClick={() => setShowLeaderboard(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TAUPE }}><X size={18} /></button>
            </div>

            {leaderboard.length === 0 ? (
              <p className="font-garamond text-sm italic text-center py-6" style={{ color: 'rgba(59,51,48,0.35)' }}>
                No one has opted in to the leaderboard yet.
              </p>
            ) : (
              leaderboard.map((e, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', marginBottom: 6,
                  background: 'rgba(255,255,255,0.55)', borderRadius: 12,
                  border: '1px solid rgba(196,175,168,0.3)',
                }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: i === 0 ? GOLD : TAUPE, minWidth: 24, textAlign: 'center' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>
                  <span className="font-garamond text-sm" style={{ color: BROWN, flex: 1 }}>
                    {e.profiles?.display_name || 'Goddess'}
                  </span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, color: SAGE }}>
                    {e.current_progress}/{leaderChallenge?.target_count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
