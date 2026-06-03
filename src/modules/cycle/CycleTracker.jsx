import { useState, useEffect, useCallback } from 'react'
import { useAuth }    from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { usePhase }   from '../../hooks/usePhase'
import { supabase }   from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import CalendarTab       from './CalendarTab'
import LogTab            from './LogTab'
import StatsTab          from './StatsTab'
import HintBubble        from '../../components/HintBubble'
import AthenaInsightCard from '../../components/AthenaInsightCard'

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

const PHASE_INFO = {
  follicular: { label: 'Follicular', duration: '~8 days', energy: 'Rising',    color: '#8FA58C', dot: '#8FA58C' },
  ovulation:  { label: 'Ovulation',  duration: '~3 days', energy: 'Peak',      color: '#C9A86C', dot: '#C9A86C' },
  luteal:     { label: 'Luteal',     duration: '~12 days', energy: 'Declining', color: '#E8829A', dot: '#E8829A' },
  menstrual:  { label: 'Menstrual',  duration: '~5 days', energy: 'Low',       color: '#7A5A6A', dot: '#7A5A6A' },
}
const PHASE_ORDER = ['menstrual', 'follicular', 'ovulation', 'luteal']

function PhaseStripModal({ phase: activePhase, onClose }) {
  const navigate = useNavigate()
  const info = PHASE_INFO[activePhase] ?? PHASE_INFO.follicular
  const DESCRIPTIONS = {
    follicular: 'Estrogen rises as your body prepares for ovulation. Energy climbs, motivation sharpens, and creativity peaks. A time to begin, plan, and push.',
    ovulation:  'Peak estrogen and testosterone. You are at your physical and social peak — magnetic, clear, and powerful. Make bold moves now.',
    luteal:     'Progesterone rises as your body prepares for menstruation. Energy drops, appetite increases, emotions deepen. A time to soften, complete, and nourish.',
    menstrual:  'The cycle resets. The uterine lining sheds, hormones are at their lowest, and your body asks for rest. Honor this phase — it is the foundation of the next.',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,14,12,0.55)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%',
          background: '#1A0E14',
          borderTopLeftRadius: 22, borderTopRightRadius: 22,
          borderTop: `1px solid ${info.color}55`,
          padding: '22px 24px 36px',
          animation: 'sheetUp 0.28s ease-out',
        }}
      >
        <div style={{ width: 32, height: 3, borderRadius: 2, background: 'rgba(201,168,108,0.25)', margin: '0 auto 18px' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 18, color: 'rgba(242,237,232,0.3)', fontSize: 22, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: info.dot }} />
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: info.color }}>{info.label} Phase</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.12em', background: `${info.color}22`, border: `1px solid ${info.color}40`, borderRadius: 20, padding: '3px 10px', color: info.color }}>{info.duration}</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.12em', background: `${info.color}22`, border: `1px solid ${info.color}40`, borderRadius: 20, padding: '3px 10px', color: info.color }}>Energy: {info.energy}</span>
        </div>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 15, color: 'rgba(242,237,232,0.82)', lineHeight: 1.65 }}>
          {DESCRIPTIONS[activePhase]}
        </p>
        <button
          onClick={() => { onClose(); navigate('/athena', { state: { preloadMessage: `Tell me more about the ${activePhase} phase and what it means for me right now.` } }) }}
          style={{ marginTop: 18, fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A86C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Ask Athena →
        </button>
      </div>
    </div>
  )
}

export default function CycleTracker() {
  const { user }    = useAuth()
  const { profile } = useProfile()
  const phaseData   = usePhase()
  const navigate    = useNavigate()

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

  const [phaseModal, setPhaseModal] = useState(null)

  // Simple client-side pattern detection from loaded symptoms
  const patterns = {
    headachesInLuteal: symptoms.filter(s => s.headache && s.phase_at_time === 'luteal').length >= 3,
  }

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
          0%,100% { box-shadow: 0 0 0 0 rgba(232,130,154,0); }
          50%      { box-shadow: 0 0 24px 6px rgba(232,130,154,0.25); }
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
            borderBottom: '1px solid rgba(232,130,154,0.35)',
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
                  ? '2px solid #E8829A'
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
                style={{ color: activeTab === tab.id ? '#E8829A' : 'rgba(59,51,48,0.45)' }}
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
            <>
              <CalendarTab
                profile={profile}
                phaseData={phaseData}
                symptoms={symptoms}
                onQuickLog={handleQuickLog}
              />

              {/* ── Athena Insight Card ── */}
              <AthenaInsightCard moduleName="cycle" />

              {/* ── Rhythm Forecast ── */}
              {phaseData?.nextPeriodDate && (
                <div style={{ marginBottom: 16, borderRadius: 14, background: 'rgba(201,168,108,0.06)', border: '1px solid rgba(201,168,108,0.2)', padding: '14px 16px' }}>
                  <p style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,108,0.65)', marginBottom: 10 }}>
                    Your Rhythm Forecast
                  </p>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#3B3330', marginBottom: 4 }}>
                    Period expected in <strong>{phaseData.daysUntilNextPeriod}</strong> days
                  </p>
                  {cycles?.length >= 3 && (
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12, color: 'rgba(59,51,48,0.5)', marginBottom: 10 }}>
                      Based on your recent cycles
                    </p>
                  )}
                  {patterns?.headachesInLuteal && (
                    <div style={{ borderTop: '1px solid rgba(201,168,108,0.15)', paddingTop: 10, marginTop: 4 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{ color: '#C9A86C', fontSize: 9, flexShrink: 0 }}>✦</span>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 13, color: '#3B3330', lineHeight: 1.6, margin: 0 }}>
                          Athena noticed: you've logged headaches in luteal phase across multiple cycles. This may be progesterone-related.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/athena', { state: { preloadMessage: 'Tell me about my headache pattern in luteal phase and what I can do about it.' } })}
                        style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A86C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Tell me more →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Phase Strip ── */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(59,51,48,0.4)', marginBottom: 10 }}>
                  Your Cycle Phases
                </p>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {PHASE_ORDER.map(p => {
                    const info = PHASE_INFO[p]
                    const isActive = phaseData?.phase === p
                    return (
                      <button
                        key={p}
                        onClick={() => setPhaseModal(p)}
                        style={{
                          flexShrink: 0,
                          padding: '8px 14px',
                          borderRadius: 22,
                          border: isActive ? `2px solid ${info.color}` : `1px solid rgba(59,51,48,0.12)`,
                          background: isActive ? `${info.color}12` : 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <p style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: isActive ? info.color : 'rgba(59,51,48,0.5)', margin: '0 0 2px' }}>{info.label}</p>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 11, color: 'rgba(59,51,48,0.4)', margin: 0 }}>{info.energy}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {phaseModal && <PhaseStripModal phase={phaseModal} onClose={() => setPhaseModal(null)} />}
            </>
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
