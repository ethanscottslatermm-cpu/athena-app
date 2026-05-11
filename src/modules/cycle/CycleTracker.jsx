import { useState, useEffect, useCallback } from 'react'
import { useAuth }    from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { usePhase }   from '../../hooks/usePhase'
import { supabase }   from '../../lib/supabase'
import CalendarTab from './CalendarTab'
import LogTab      from './LogTab'
import StatsTab    from './StatsTab'

const TABS = [
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'log',      label: 'Log',      icon: '◯'  },
  { id: 'stats',    label: 'Stats',    icon: '📊' },
]

export default function CycleTracker() {
  const { user }                 = useAuth()
  const { profile }              = useProfile()
  const phaseData                = usePhase()

  const [activeTab, setActiveTab]       = useState('calendar')
  const [symptoms,  setSymptoms]        = useState([])
  const [cycles,    setCycles]          = useState([])
  const [loading,   setLoading]         = useState(true)
  const [logDate,   setLogDate]         = useState(null)
  const [banner,    setBanner]          = useState(null)   // 'period' | 'ovulation'
  const [bannerOn,  setBannerOn]        = useState(false)

  // ── Shared data fetch (avoids triple-querying across the 3 tabs) ──────────
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

  // ── In-app notification banner ────────────────────────────────────────────
  useEffect(() => {
    if (!profile?.notifications_on || !phaseData?.dayOfCycle) return

    const cycleLen  = profile.cycle_length ?? 28
    const ovDay     = cycleLen - 14
    const periodIn2 = phaseData.daysUntilNextPeriod === 2
    const fertOpen  = phaseData.dayOfCycle === ovDay - 5   // fertile window first day

    if (periodIn2) {
      setBanner('period')
      setBannerOn(true)
    } else if (fertOpen) {
      setBanner('ovulation')
      setBannerOn(true)
    }
  }, [profile, phaseData?.dayOfCycle])

  useEffect(() => {
    if (!bannerOn) return
    const t = setTimeout(() => setBannerOn(false), 4000)
    return () => clearTimeout(t)
  }, [bannerOn])

  // ── Quick-log bridge from CalendarTab day-detail sheet ────────────────────
  function handleQuickLog(date) {
    setLogDate(date)
    setActiveTab('log')
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#060404]">
      <style>{`
        @keyframes cycleSlideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,108,0); }
          50%      { box-shadow: 0 0 24px 6px rgba(201,168,108,0.35); }
        }
        @keyframes shimmerSlide {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── Warrior goddess background ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/athena-hero.webp)' }}
      />
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(to bottom, rgba(6,4,4,0.55) 0%, rgba(6,4,4,0.3) 30%, rgba(6,4,4,0.1) 50%),
          radial-gradient(ellipse at 50% 15%, rgba(139,26,26,0.28) 0%, transparent 60%)
        `
      }} />

      {/* ── In-app notification banner ──────────────────────────────────────── */}
      {bannerOn && (
        <div
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
          style={{
            background: 'rgba(8,5,4,0.92)',
            borderBottom: '1px solid rgba(201,168,108,0.35)',
            animation: 'cycleSlideDown 0.35s ease-out',
          }}
        >
          <span className="font-garamond text-ivory/90 text-sm">
            {banner === 'period'
              ? '🩸 Your period is predicted in 2 days.'
              : '✦ Your fertile window opens today.'}
          </span>
          <button onClick={() => setBannerOn(false)} className="text-ivory/40 hover:text-ivory ml-4 text-xl leading-none">
            ×
          </button>
        </div>
      )}

      {/* ── Glass card — bottom 60% ─────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '76vh',
          background: 'rgba(8,5,4,0.44)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          borderTop: '1px solid rgba(201,168,108,0.12)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
        }}
      >
        {/* Tab bar */}
        <div className="flex border-b border-white/10">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-all"
              style={{
                borderBottom: activeTab === tab.id ? '2px solid #C9A86C' : '2px solid transparent',
              }}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span
                className="font-cinzel text-[9px] tracking-widest"
                style={{ color: activeTab === tab.id ? '#C9A86C' : 'rgba(244,239,230,0.38)' }}
              >
                {tab.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {/* Scrollable tab content */}
        <div className="overflow-y-auto hide-scrollbar h-[calc(100%-52px)] px-4 pt-4 pb-nav">
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
    </div>
  )
}
