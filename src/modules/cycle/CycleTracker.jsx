import { useState, useEffect, useCallback } from 'react'
import { useAuth }    from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { usePhase }   from '../../hooks/usePhase'
import { supabase }   from '../../lib/supabase'
import CalendarTab from './CalendarTab'
import LogTab      from './LogTab'
import StatsTab    from './StatsTab'
import HintBubble  from '../../components/HintBubble'

const CYCLE_HINTS = {
  calendar: [
    'Tap any past date to log symptoms retroactively — Athena adjusts your insights automatically.',
    'Your phase colours on the calendar help you plan workouts, social events, and rest days with intention.',
  ],
  log: [
    'Log your period start date any time your cycle arrives. Athena refines its predictions over time.',
    'Symptom logging helps surface patterns like mid-cycle pain or luteal fatigue that are easy to overlook.',
  ],
  stats: [
    'Your cycle stats improve in accuracy the longer you log — even two months of data reveals meaningful patterns.',
    'Average cycle length and variation are shown here: useful context for your overall hormonal health picture.',
  ],
}

import calendarIcon from '../../assets/icons/Calendar.png'
import logIcon      from '../../assets/icons/Log.png'
import statsIcon    from '../../assets/icons/Stats.png'

const TABS = [
  { id: 'calendar', label: 'Calendar', icon: calendarIcon },
  { id: 'log',      label: 'Log',      icon: logIcon      },
  { id: 'stats',    label: 'Stats',    icon: statsIcon    },
]

export default function CycleTracker() {
  const { user }    = useAuth()
  const { profile } = useProfile()
  const phaseData   = usePhase()

  const [activeTab, setActiveTab] = useState('calendar')
  const [symptoms,  setSymptoms]  = useState([])
  const [cycles,    setCycles]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [logDate,   setLogDate]   = useState(null)
  const [banner,    setBanner]    = useState(null)
  const [bannerOn,  setBannerOn]  = useState(false)

  // ── Shared data fetch ─────────────────────────────────────────────────────
  const refreshData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [sRes, cRes] = await Promise.all([
      supabase.from('symptoms').select('*').eq('user_id', user.id).order('logged_date', { ascending: false }),
      supabase.from('cycles').select('*').eq('user_id', user.id).order('start_date', { ascending: false }),
    ])
    setSymptoms(sRes.data ?? [])
    setCycles(cRes.data ?? [])
    setLoading(false)
  }, [user?.id])

  useEffect(() => { refreshData() }, [refreshData])

  // ── Notification banner ───────────────────────────────────────────────────
  useEffect(() => {
    if (!profile?.notifications_on || !phaseData?.dayOfCycle) return
    const ovDay    = (profile.cycle_length ?? 28) - 14
    const periodIn2 = phaseData.daysUntilNextPeriod === 2
    const fertOpen  = phaseData.dayOfCycle === ovDay - 5
    if (periodIn2)  { setBanner('period');   setBannerOn(true) }
    else if (fertOpen) { setBanner('ovulation'); setBannerOn(true) }
  }, [profile, phaseData?.dayOfCycle])

  useEffect(() => {
    if (!bannerOn) return
    const t = setTimeout(() => setBannerOn(false), 4000)
    return () => clearTimeout(t)
  }, [bannerOn])

  function handleQuickLog(date) {
    setLogDate(date)
    setActiveTab('log')
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#F3EAE7]">
      <style>{`
        @keyframes cycleSlideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(212,160,160,0); }
          50%      { box-shadow: 0 0 24px 6px rgba(212,160,160,0.25); }
        }
        @keyframes shimmerSlide {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes sheetUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>


      {/* ── Background hero ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/dashboard/Cycle.png)' }}
      />
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, rgba(242,237,232,0.18) 0%, rgba(242,237,232,0.08) 20%, rgba(242,237,232,0.72) 55%, rgba(242,237,232,0.97) 75%)',
      }} />

      {/* ── In-app notification banner ──────────────────────────────────────── */}
      {bannerOn && (
        <div
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
          style={{
            background: 'rgba(242,237,232,0.95)',
            borderBottom: '1px solid rgba(212,160,160,0.35)',
            animation: 'cycleSlideDown 0.35s ease-out',
          }}
        >
          <span className="font-garamond text-brown/90 text-sm">
            {banner === 'period'
              ? '🩸 Your period is predicted in 2 days.'
              : '✦ Your fertile window opens today.'}
          </span>
          <button onClick={() => setBannerOn(false)} className="text-brown/40 ml-4 text-xl leading-none">×</button>
        </div>
      )}

      {/* ── Tab bar — top of page ────────────────────────────────────────────── */}
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
                  ? '2px solid #D4A0A0'
                  : '2px solid transparent',
              }}
            >
              <img
                src={tab.icon}
                alt=""
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain',
                  opacity: activeTab === tab.id ? 1 : 0.4,
                  transition: 'opacity 0.2s',
                  filter: activeTab === tab.id ? 'none' : 'brightness(0.4)',
                }}
              />
              <span
                className="font-cinzel text-[9px] tracking-widest"
                style={{ color: activeTab === tab.id ? '#D4A0A0' : 'rgba(59,51,48,0.45)' }}
              >
                {tab.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Glass card — fills from 24% down ────────────────────────────────── */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          top: '24%',
          background: 'rgba(242,237,232,0.92)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderTop: '1px solid rgba(196,175,168,0.4)',
        }}
      >
        <div className="overflow-y-auto hide-scrollbar h-full px-4 pt-5 pb-nav">
          {activeTab === 'calendar' && (
            <CalendarTab
              profile={profile}
              phaseData={phaseData}
              symptoms={symptoms}
              onQuickLog={handleQuickLog}
            />
          )}
          {activeTab === 'log' && (
            <LogTab
              key={logDate?.toISOString() ?? 'today'}
              profile={profile}
              phaseData={phaseData}
              user={user}
              preselectedDate={logDate}
              symptoms={symptoms}
              onSaved={refreshData}
            />
          )}
          {activeTab === 'stats' && (
            <StatsTab
              profile={profile}
              phaseData={phaseData}
              symptoms={symptoms}
              cycles={cycles}
              loading={loading}
            />
          )}
        </div>
      </div>

      <HintBubble hintKey={`cycle-${activeTab}`} hints={CYCLE_HINTS[activeTab] ?? []} />
    </div>
  )
}
