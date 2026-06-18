import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }    from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { usePhase }   from '../../hooks/usePhase'
import { supabase }   from '../../lib/supabase'
import { useInactivityTimer } from '../../hooks/useInactivityTimer'
import exitIcon from '../../assets/icons/nav-exit.png'
import AthenaPreSession  from '../../components/AthenaPreSession'
import AthenaPostSession from '../../components/AthenaPostSession'
import AthenaInsightCard from '../../components/AthenaInsightCard'
import { FOCUS_TO_MUSCLES } from '../../constants/muscleMap'

// ── Inline SVG tab icons ──────────────────────────────────────────────────────

function IconStudio({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M482.163,362.607c0-11.964-4.659-23.219-13.124-31.676L319.893,181.777
        c23.287-18.782,38.511-47.198,38.511-79.377c0-56.465-45.935-102.4-102.4-102.4s-102.4,45.935-102.4,102.4
        c0,32.179,15.223,60.587,38.511,79.377L42.961,330.931c-8.465,8.465-13.124,19.712-13.124,31.676
        s4.659,23.219,13.124,31.676c6.886,6.886,15.65,11.085,25.105,12.476c-0.802,2.586-1.647,5.163-2.125,7.885
        c-2.97,16.836,0.794,33.818,10.598,47.821s24.474,23.347,41.31,26.317l126.054,22.229c3.695,0.657,7.45,0.99,11.17,0.99
        c0.265,0,0.503-0.094,0.768-0.094c0.375,0,0.717,0.094,1.092,0.094c3.721,0,7.475-0.333,11.162-0.981l126.054-22.229
        c16.836-2.97,31.505-12.314,41.31-26.317c9.805-14.003,13.568-30.984,10.598-47.821c-0.478-2.731-1.323-5.299-2.125-7.885
        c9.463-1.391,18.227-5.598,25.105-12.476C477.504,385.826,482.163,374.571,482.163,362.607z
        M179.204,102.4c0-42.419,34.381-76.8,76.8-76.8c42.419,0,76.8,34.381,76.8,76.8c0,42.419-34.381,76.8-76.8,76.8
        C213.585,179.2,179.204,144.819,179.204,102.4z
        M193.95,459.11c1.152,6.536,3.439,12.587,6.349,18.227l-77.995-13.756c-20.89-3.686-34.833-23.595-31.147-44.484
        c3.285-18.628,19.49-31.735,37.769-31.735c2.21,0,4.454,0.196,6.716,0.589l77.363,13.645
        C197.961,415.889,190.084,437.18,193.95,459.11z
        M389.696,463.582l-126.054,22.229c-2.253,0.393-4.497,0.589-6.707,0.589c-18.287,0-34.492-13.107-37.769-31.735
        c-3.686-20.89,10.266-40.798,31.147-44.484l126.054-22.229c2.253-0.401,4.497-0.589,6.716-0.589
        c18.287,0,34.483,13.107,37.768,31.735C424.529,439.979,410.586,459.904,389.696,463.582z
        M450.94,376.183c-3.746,3.746-8.661,5.623-13.577,5.623c-4.915,0-9.83-1.877-13.576-5.623L319.936,272.546
        c-5-5.001-13.107-5.001-18.099,0c-4.992,5.001-5,13.107,0,18.099l72.064,71.919c-0.657,0.094-1.331,0.06-1.98,0.171
        l-115.917,20.446l-115.917-20.437c-0.657-0.119-1.323-0.077-1.98-0.171l72.064-71.919c5.001-5.001,5.001-13.107,0-18.099
        c-5.001-4.992-13.107-5-18.099,0L88.222,376.192c-3.746,3.746-8.661,5.623-13.577,5.623c-4.915,0-9.83-1.877-13.577-5.623
        c-7.501-7.501-7.501-19.652,0-27.153l153.284-153.284c12.757,5.709,26.795,9.045,41.651,9.045
        c14.857,0,28.894-3.336,41.651-9.054L450.94,349.03C458.441,356.531,458.441,368.683,450.94,376.183z"/>
    </svg>
  )
}

function IconSessions({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M29.095,30.64c0.051-0.065,0.098-0.136,0.141-0.21c0.249-0.431,0.314-0.932,0.187-1.411
        c-0.128-0.477-0.434-0.877-0.862-1.125c-0.002-0.001-0.002-0.003-0.004-0.004l-10.25-5.953
        c-0.661-0.524-0.954-1.051-0.949-1.707v-6.227c0-1.202-0.547-2.312-1.412-3.029c0.654-0.157,1.256-0.518,1.706-1.053
        c1.14-1.355,0.966-3.385-0.389-4.525c-0.835-0.703-1.957-0.932-3.001-0.617c-0.19,0.058-0.298,0.259-0.24,0.449
        c0.058,0.19,0.262,0.297,0.449,0.24c0.81-0.248,1.679-0.068,2.327,0.478c1.05,0.885,1.185,2.459,0.301,3.511
        c-0.603,0.718-1.557,1.032-2.467,0.822c-0.049-0.014-0.098-0.027-0.147-0.038c-0.186-0.046-0.381,0.069-0.431,0.259
        c-0.05,0.189,0.061,0.383,0.249,0.437c0.049,0.015,0.099,0.027,0.149,0.04c1.273,0.368,2.185,1.619,2.185,3.027v6.224
        c-0.006,0.885,0.381,1.607,1.265,2.304l10.293,5.982h0.001c0.263,0.152,0.452,0.398,0.531,0.692
        c0.078,0.294,0.038,0.601-0.114,0.865c-0.314,0.544-1.013,0.729-1.566,0.412l-13.141-7.087
        c-0.145-0.075-3.545-1.902-3.545-6.182V2.5c0-0.628,0.512-1.14,1.14-1.14s1.14,0.512,1.14,1.14V11h0.72V2.5
        c0-1.025-0.834-1.86-1.86-1.86S9.64,1.475,9.64,2.5v14.714c0,4.727,3.773,6.737,3.928,6.817l12.254,6.608H6.969
        c0.245-0.314,0.391-0.711,0.391-1.14v-7.14H10V21.64H7c-0.199,0-0.36,0.161-0.36,0.36v7.5c0,0.629-0.512,1.14-1.14,1.14
        s-1.14-0.511-1.14-1.14V21c0-0.797,0.843-1.64,1.64-1.64h3v-0.72H6c-1.191,0-2.36,1.169-2.36,2.36v8.5
        c0,0.429,0.146,0.825,0.391,1.14H1v0.721h30V30.64H29.095z"/>
    </svg>
  )
}

function IconProgress({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M19.697,30.64c0.411-0.425,0.665-1.003,0.665-1.64v-0.001v-14.64h2.521
        c0.021,0,0.04-0.001,0.059-0.005c0.881-0.085,1.509-1.299,1.509-2.127c0-0.413-0.157-0.806-0.431-1.094
        c-0.011-0.013-1.138-1.307-2.204-2.414c-0.931-0.992-2.219-1.747-3.624-2.139c0.752-0.629,1.207-1.569,1.207-2.578
        c0-1.853-1.524-3.361-3.398-3.361c-1.873,0-3.396,1.508-3.396,3.361c0,1.009,0.454,1.949,1.206,2.578
        c-1.387,0.387-2.649,1.127-3.621,2.135c-1.071,1.111-2.197,2.405-2.198,2.407c-0.284,0.3-0.44,0.692-0.44,1.105
        c0,0.828,0.627,2.042,1.508,2.127c0.019,0.003,0.039,0.005,0.059,0.005h2.523v1.484l-3.528,3.319
        c-0.708,0.827-0.609,2.076,0.207,2.773l4.26,3.951c0.755,0.646,2.25,0.621,3.058,0.016v3.097L15.642,29
        c0,0.637,0.253,1.215,0.665,1.64H1v0.721h30V30.64H19.697z
        M9.159,13.639c-0.412,0-0.888-0.855-0.888-1.413c0-0.228,0.086-0.445,0.253-0.622
        c0.011-0.013,1.126-1.294,2.184-2.391c1.057-1.097,2.497-1.847,4.058-2.113c0.062-0.004,0.123-0.023,0.176-0.059
        c0.102-0.066,0.164-0.181,0.164-0.303c0-0.106-0.046-0.206-0.127-0.274c-0.037-0.032-0.08-0.055-0.125-0.069
        c-0.931-0.433-1.53-1.368-1.53-2.396c0-1.456,1.2-2.641,2.676-2.641c1.477,0,2.678,1.185,2.678,2.641
        c0,1.03-0.602,1.967-1.537,2.398c-0.043,0.015-0.083,0.037-0.118,0.067c-0.081,0.068-0.127,0.17-0.127,0.276
        c0,0.122,0.062,0.235,0.164,0.302c0.056,0.036,0.118,0.055,0.182,0.058c1.57,0.269,3.045,1.036,4.054,2.112
        c1.057,1.097,2.171,2.377,2.192,2.402c0.157,0.166,0.243,0.382,0.243,0.61c0,0.558-0.476,1.413-0.887,1.413h-6.482V10.36
        c0.289,0.104,0.603,0.3,0.892,0.484c0.429,0.274,0.799,0.511,1.162,0.513h1.521c0.199,0,0.36-0.161,0.36-0.36
        s-0.162-0.36-0.36-0.36h-1.52c-0.153-0.001-0.499-0.222-0.776-0.399c-0.495-0.316-1.055-0.674-1.648-0.674
        c-0.577,0-1.137,0.358-1.631,0.674c-0.278,0.177-0.624,0.398-0.774,0.399h-1.521c-0.199,0-0.36,0.161-0.36,0.36
        s0.161,0.36,0.36,0.36h1.523c0.362-0.002,0.732-0.239,1.16-0.513c0.287-0.183,0.599-0.378,0.892-0.482v3.275H9.159V13.639z
        M15.639,22.852l-2.256-2.238c0.444-0.423,1.318-1.255,1.697-1.618l0.559,0.241V22.852z
        M19.642,28.999L19.642,28.999c0,0.905-0.735,1.641-1.64,1.641s-1.64-0.735-1.64-1.64l-0.003-0.001v-4.474
        c0.007-0.096,0.007-0.191,0-0.287v-5.239c0-0.144-0.085-0.273-0.218-0.331l-0.997-0.429
        c-0.135-0.058-0.293-0.027-0.397,0.077c-0.105,0.106-2.129,2.03-2.129,2.03c-0.07,0.067-0.111,0.159-0.112,0.257
        s0.037,0.191,0.106,0.26l2.591,2.569c0.263,0.226,0.41,0.537,0.435,0.857v0.194c-0.02,0.256-0.118,0.508-0.296,0.717
        c-0.437,0.509-1.765,0.589-2.283,0.148l-4.26-3.951c-0.525-0.45-0.588-1.243-0.166-1.74l3.615-3.397
        c0.072-0.068,0.113-0.163,0.113-0.262v-1.64h7.28L19.642,28.999L19.642,28.999z"/>
    </svg>
  )
}


function IconBodyMap({ color }) {
  return (
    <svg width="20" height="22" viewBox="0 0 24 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="4" r="3.2" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M8 10 Q12 8 16 10 L17 20 H7 Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
      <path d="M7 20 L5 32" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 20 L19 32" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 20 L2 16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 20 L22 16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 32 L4 40" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 32 L8 40" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19 32 L18 40" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19 32 L22 40" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const TAB_ICONS = { home: IconStudio, library: IconSessions, progress: IconProgress, bodymap: IconBodyMap }

const INTRO_KEY      = 'athena_pilates_intro_ts_v2'
const INTRO_COOLDOWN = 20 * 60 * 1000 // 20 minutes

function shouldShowIntro() {
  try {
    const ts = localStorage.getItem(INTRO_KEY)
    if (!ts) return true
    return Date.now() - Number(ts) > INTRO_COOLDOWN
  } catch { return true }
}

function TabIcon({ tabId, active }) {
  const Icon = TAB_ICONS[tabId]
  return <Icon color={active ? '#2A1C14' : '#6B5248'} />
}

import HintBubble    from '../../components/HintBubble'

const PILATES_HINTS = {
  home: [
    'Sessions here are matched to your current cycle phase for optimal energy and recovery.',
    'Tap any session card to preview the full exercise list before you start.',
  ],
  library: [
    'Tap the heart on any session to save it to your Favorites for quick access.',
    'Browse by duration to find a session that fits exactly how much time you have today.',
  ],
  progress: [
    'Every completed session builds your streak. Consistency is the most powerful form of self-care.',
    'Scroll your completion history to celebrate how much you have already done.',
  ],
  bodymap: [
    'Tap any muscle group to see which sessions target it and how often you train it.',
    'Your phase shapes which muscles to prioritize — the highlighted groups reflect where your body is right now.',
  ],
}

import HomeTab        from './HomeTab'
import LibraryTab     from './LibraryTab'
import ProgressTab    from './ProgressTab'
import SessionDetail  from './SessionDetail'
import ActiveSession  from './ActiveSession'
import SessionComplete from './SessionComplete'
import BodyTab        from '../../pages/BodyTab'

const TABS = [
  { id: 'home',       label: 'Studio'     },
  { id: 'library',    label: 'Sessions'   },
  { id: 'progress',   label: 'Progress'   },
  { id: 'bodymap',    label: 'Body'       },
]

export default function PilatesStudio() {
  const { user }    = useAuth()
  const { profile } = useProfile()
  const phaseData   = usePhase()

  const introRef  = useRef(null)
  const [showIntro,   setShowIntro]   = useState(() => shouldShowIntro())
  const [skipVisible, setSkipVisible] = useState(false)

  function dismissIntro() {
    try { localStorage.setItem(INTRO_KEY, String(Date.now())) } catch {}
    setShowIntro(false)
    setSkipVisible(false)
  }

  useEffect(() => {
    if (!showIntro || !introRef.current) return
    introRef.current.muted = true
    introRef.current.play().catch(() => {}) // silent — onError handles real failures
    const t = setTimeout(() => setSkipVisible(true), 2000)
    return () => clearTimeout(t)
  }, [showIntro])

  const [activeTab,        setActiveTab]        = useState('home')
  const [selectedSession,  setSelectedSession]  = useState(null)  // → SessionDetail overlay
  const [activeSession,    setActiveSession]    = useState(null)  // → ActiveSession full-screen
  const [activeExercises,  setActiveExercises]  = useState([])
  const [completedData,    setCompletedData]    = useState(null)  // → SessionComplete
  const [preSession,       setPreSession]       = useState(null)  // { session, exercises }
  const [postSession,      setPostSession]      = useState(null)  // { completionId }

  // ── Data ─────────────────────────────────────────────────────────────────
  const [sessions,         setSessions]         = useState([])
  const [exercises,        setExercises]        = useState([])
  const [completions,      setCompletions]      = useState([])
  const [favorites,        setFavorites]        = useState(new Set())
  const [loading,          setLoading]          = useState(true)

  // ── Exit / inactivity ────────────────────────────────────────────────────────
  const navigate = useNavigate()
  const [exiting, setExiting] = useState(false)

  const PILATES_TIMEOUT = 10 * 60 * 1000

  const handleTimeout = useCallback(() => {
    setExiting(true)
    setTimeout(() => navigate('/', { replace: true }), 320)
  }, [navigate])

  const { clearTimer } = useInactivityTimer(PILATES_TIMEOUT, handleTimeout)

  const handleExit = useCallback(() => {
    clearTimer()
    setExiting(true)
    setTimeout(() => navigate('/', { replace: true }), 320)
  }, [clearTimer, navigate])

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [sRes, eRes, cRes, fRes] = await Promise.all([
      supabase.from('pilates_sessions').select('*').order('phase').order('duration_min'),
      supabase.from('pilates_exercises').select('*').order('order_num'),
      supabase.from('session_completions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }),
      supabase.from('user_favorites').select('session_id').eq('user_id', user.id),
    ])
    setSessions((sRes.data ?? []).map(s => ({
      ...s,
      muscleGroups: s.muscle_groups?.length
        ? s.muscle_groups
        : (FOCUS_TO_MUSCLES[s.focus_area] ?? []),
    })))
    setExercises(eRes.data ?? [])
    setCompletions(cRes.data ?? [])
    setFavorites(new Set((fRes.data ?? []).map(f => f.session_id)))
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
    // Show pre-session Athena interstitial first
    setPreSession({ session, exercises: sessionExercises })
  }

  function handlePreSessionBegin() {
    if (!preSession) return
    setActiveSession(preSession.session)
    setActiveExercises(preSession.exercises)
    setPreSession(null)
  }

  async function handleSessionComplete({ session, elapsed }) {
    setActiveSession(null)
    setActiveExercises([])
    setCompletedData({ session, elapsed })
    if (user) {
      const { data } = await supabase.from('session_completions').insert({
        user_id:      user.id,
        session_id:   session.id,
        completed_at: new Date().toISOString(),
        duration_min: Math.round(elapsed / 60),
      }).select('id').single()
      // Show post-session check-in
      if (data?.id) setPostSession({ completionId: data.id })
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
    <div
      className="relative min-h-[100svh] overflow-hidden bg-[#F3EAE7]"
      style={{
        animation: exiting
          ? 'pilatesSlideDown 320ms cubic-bezier(0.4, 0, 1, 1) forwards'
          : 'pilatesSlideUp 380ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
      }}
    >

      {/* ── Exit button — always visible ──────────────────────────────────── */}
      <button
        onClick={handleExit}
        aria-label="Exit Pilates Studio"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 16px) + 12px)',
          right: '20px',
          zIndex: 200,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'rgba(20,10,24,0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(201,168,108,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          WebkitMask: `url(${exitIcon}) no-repeat center / contain`,
          mask: `url(${exitIcon}) no-repeat center / contain`,
          backgroundColor: 'rgba(242,237,232,0.7)',
        }} />
      </button>

      {/* ── Athena Pre-session ─────────────────────────────────────────────── */}
      {preSession && (
        <AthenaPreSession
          session={preSession.session}
          onBegin={handlePreSessionBegin}
          onLighterDay={null}
        />
      )}

      {/* ── Athena Post-session ─────────────────────────────────────────────── */}
      {postSession && (
        <AthenaPostSession
          completionId={postSession.completionId}
          onDone={() => setPostSession(null)}
        />
      )}

      {/* ── Pilates Studio intro video ──────────────────────────────────────── */}
      {showIntro && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#0E0A08' }}>
          <video
            ref={introRef}
            src="/pilates-studio.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={dismissIntro}
            onError={dismissIntro}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {skipVisible && (
            <button
              onClick={dismissIntro}
              style={{
                position: 'absolute', bottom: 52, right: 24,
                background: 'rgba(242,237,232,0.15)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(242,237,232,0.28)',
                borderRadius: 20,
                padding: '9px 22px',
                fontFamily: 'Cinzel, serif',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(242,237,232,0.85)',
                cursor: 'pointer',
                animation: 'skipFadeIn 0.4s ease forwards',
              }}
            >
              Skip
            </button>
          )}
          <style>{`
            @keyframes skipFadeIn {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

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
          0%,100% { box-shadow: 0 0 0 0 rgba(212,160,160,0); }
          50%      { box-shadow: 0 0 24px 6px rgba(212,160,160,0.25); }
        }
        @keyframes cycleSlideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pilatesSlideUp {
          from { transform: translateY(100vh); }
          to   { transform: translateY(0); }
        }
        @keyframes pilatesSlideDown {
          from { transform: translateY(0); }
          to   { transform: translateY(100vh); }
        }
      `}</style>


      {/* ── Background hero ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/dashboard/pilates.png)' }}
      />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(242,237,232,0.18) 0%, rgba(242,237,232,0.08) 20%, rgba(242,237,232,0.72) 55%, rgba(242,237,232,0.97) 75%)',
      }} />

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-20"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 36px)',
          background: 'linear-gradient(to bottom, rgba(242,237,232,0.88) 0%, rgba(242,237,232,0.0) 100%)',
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
                  ? '2px solid #6B5248'
                  : '2px solid transparent',
              }}
            >
              <TabIcon tabId={tab.id} active={activeTab === tab.id} />
              <span
                className="font-cinzel text-[9px]"
                style={{
                  color: activeTab === tab.id ? '#2A1C14' : '#6B5248',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  letterSpacing: '0.12em',
                }}
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
          background: activeTab === 'bodymap' ? 'rgba(20,10,24,0.94)' : 'rgba(242,237,232,0.92)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: activeTab === 'bodymap'
            ? '1px solid rgba(201,168,108,0.15)'
            : '1px solid rgba(196,175,168,0.4)',
          transition: 'background 0.25s ease, border-top-color 0.25s ease',
        }}
      >
        <div className={`overflow-y-auto hide-scrollbar h-full pt-5 pb-nav ${activeTab === 'bodymap' ? 'px-0' : 'px-4'}`}>
          {activeTab === 'home' && (
            <>
              <AthenaInsightCard moduleName="pilates" />
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
            </>
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
          {activeTab === 'bodymap' && <BodyTab embedded />}
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

      <HintBubble hintKey={`pilates-${activeTab}`} hints={PILATES_HINTS[activeTab] ?? []} />

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
