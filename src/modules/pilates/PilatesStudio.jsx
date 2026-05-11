import { useState, useEffect, useCallback } from 'react'
import { useAuth }    from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { usePhase }   from '../../hooks/usePhase'
import { supabase }   from '../../lib/supabase'

import HomeTab        from './HomeTab'
import LibraryTab     from './LibraryTab'
import ProgressTab    from './ProgressTab'
import ChallengesTab  from './ChallengesTab'
import SessionDetail  from './SessionDetail'
import ActiveSession  from './ActiveSession'
import SessionComplete from './SessionComplete'

const TABS = [
  { id: 'home',       label: 'Home',       icon: '🏠' },
  { id: 'library',    label: 'Library',    icon: '🔍' },
  { id: 'progress',   label: 'Progress',   icon: '📈' },
  { id: 'challenges', label: 'Challenges', icon: '🏆' },
]

export default function PilatesStudio() {
  const { user }    = useAuth()
  const { profile } = useProfile()
  const phaseData   = usePhase()

  const [activeTab,        setActiveTab]        = useState('home')
  const [selectedSession,  setSelectedSession]  = useState(null)  // → SessionDetail overlay
  const [activeSession,    setActiveSession]    = useState(null)  // → ActiveSession full-screen
  const [activeExercises,  setActiveExercises]  = useState([])
  const [completedData,    setCompletedData]    = useState(null)  // → SessionComplete

  // ── Data ─────────────────────────────────────────────────────────────────
  const [sessions,         setSessions]         = useState([])
  const [exercises,        setExercises]        = useState([])
  const [completions,      setCompletions]      = useState([])
  const [favorites,        setFavorites]        = useState(new Set())
  const [challenges,       setChallenges]       = useState([])
  const [challengeEntries, setChallengeEntries] = useState([])
  const [loading,          setLoading]          = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [sRes, eRes, cRes, fRes, chRes, ceRes] = await Promise.all([
      supabase.from('pilates_sessions').select('*').order('phase').order('duration_min'),
      supabase.from('pilates_exercises').select('*').order('order_num'),
      supabase.from('session_completions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }),
      supabase.from('user_favorites').select('session_id').eq('user_id', user.id),
      supabase.from('challenges').select('*').order('created_at', { ascending: false }),
      supabase.from('challenge_entries').select('*').eq('user_id', user.id),
    ])
    setSessions(sRes.data ?? [])
    setExercises(eRes.data ?? [])
    setCompletions(cRes.data ?? [])
    setFavorites(new Set((fRes.data ?? []).map(f => f.session_id)))
    setChallenges(chRes.data ?? [])
    setChallengeEntries(ceRes.data ?? [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Favorite toggle ──────────────────────────────────────────────────────
  async function toggleFavorite(sessionId) {
    if (!user) return
    const isFav = favorites.has(sessionId)
    setFavorites(prev => {
      const next = new Set(prev)
      isFav ? next.delete(sessionId) : next.add(sessionId)
      return next
    })
    if (isFav) {
      await supabase.from('user_favorites').delete()
        .eq('user_id', user.id).eq('session_id', sessionId)
    } else {
      await supabase.from('user_favorites').upsert(
        { user_id: user.id, session_id: sessionId },
        { onConflict: 'user_id,session_id' }
      )
    }
  }

  // ── Session flow ─────────────────────────────────────────────────────────
  function handleSelectSession(session) {
    setSelectedSession(session)
  }

  function handleStartSession(session, sessionExercises) {
    setSelectedSession(null)
    setActiveSession(session)
    setActiveExercises(sessionExercises)
  }

  async function handleSessionComplete({ session, elapsed }) {
    setActiveSession(null)
    setActiveExercises([])
    setCompletedData({ session, elapsed })
    if (user) {
      await supabase.from('session_completions').insert({
        user_id:          user.id,
        session_id:       session.id,
        completed_at:     new Date().toISOString(),
        duration_actual:  Math.round(elapsed / 60),
        phase_at_time:    phaseData?.phase ?? null,
      })
      fetchData()
    }
  }

  async function handleCompleteBack(rating) {
    if (completedData && user && rating > 0) {
      const { data } = await supabase
        .from('session_completions')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', completedData.session.id)
        .order('completed_at', { ascending: false })
        .limit(1)
      if (data?.[0]) {
        await supabase.from('session_completions')
          .update({ rating })
          .eq('id', data[0].id)
      }
    }
    setCompletedData(null)
    fetchData()
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#060404]">
      <style>{`
        @keyframes shimmerSlide {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes sheetUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes goldPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,108,0); }
          50%      { box-shadow: 0 0 24px 6px rgba(201,168,108,0.3); }
        }
        @keyframes cycleSlideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Background ───────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/athena-hero.webp)' }}
      />
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(to bottom, rgba(6,4,4,0.65) 0%, rgba(6,4,4,0.2) 30%, rgba(6,4,4,0.08) 50%),
          radial-gradient(ellipse at 50% 10%, rgba(201,168,108,0.12) 0%, transparent 60%)
        `,
      }} />

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-20"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 36px)',
          background: 'linear-gradient(to bottom, rgba(6,4,4,0.85) 0%, rgba(6,4,4,0.0) 100%)',
        }}
      >
        <div className="flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all"
              style={{
                borderBottom: activeTab === tab.id
                  ? '2px solid #C9A86C'
                  : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 18, opacity: activeTab === tab.id ? 1 : 0.4 }}>
                {tab.icon}
              </span>
              <span
                className="font-cinzel text-[9px] tracking-widest"
                style={{ color: activeTab === tab.id ? '#C9A86C' : 'rgba(244,239,230,0.38)' }}
              >
                {tab.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Glass card area (from 15% down) ──────────────────────────────── */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          top: '15%',
          background: 'rgba(8,5,4,0.44)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: '1px solid rgba(201,168,108,0.12)',
        }}
      >
        <div className="overflow-y-auto hide-scrollbar h-full px-4 pt-5 pb-nav">
          {activeTab === 'home' && (
            <HomeTab
              sessions={sessions}
              exercises={exercises}
              completions={completions}
              favorites={favorites}
              phaseData={phaseData}
              profile={profile}
              onSelectSession={handleSelectSession}
              onFavoriteToggle={toggleFavorite}
              onSeeAll={() => setActiveTab('library')}
            />
          )}
          {activeTab === 'library' && (
            <LibraryTab
              sessions={sessions}
              favorites={favorites}
              onSelectSession={handleSelectSession}
              onFavoriteToggle={toggleFavorite}
            />
          )}
          {activeTab === 'progress' && (
            <ProgressTab
              sessions={sessions}
              completions={completions}
              loading={loading}
              onSelectSession={handleSelectSession}
            />
          )}
          {activeTab === 'challenges' && (
            <ChallengesTab
              challenges={challenges}
              challengeEntries={challengeEntries}
              phaseData={phaseData}
              user={user}
              onRefresh={fetchData}
            />
          )}
        </div>
      </div>

      {/* ── Session Detail overlay ───────────────────────────────────────── */}
      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          exercises={exercises}
          isFavorite={favorites.has(selectedSession.id)}
          onFavoriteToggle={toggleFavorite}
          onStart={handleStartSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* ── Active Session overlay ───────────────────────────────────────── */}
      {activeSession && (
        <ActiveSession
          session={activeSession}
          exercises={activeExercises}
          phaseData={phaseData}
          onComplete={handleSessionComplete}
          onExit={() => { setActiveSession(null); setActiveExercises([]) }}
        />
      )}

      {/* ── Session Complete overlay ─────────────────────────────────────── */}
      {completedData && (
        <SessionComplete
          session={completedData.session}
          elapsed={completedData.elapsed}
          phaseData={phaseData}
          onBack={handleCompleteBack}
          onShareCommunity={() => {}}
        />
      )}
    </div>
  )
}
