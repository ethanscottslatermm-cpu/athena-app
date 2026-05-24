import { useState, useEffect, useRef } from 'react'
import TodayTab    from '../modules/mood/TodayTab'
import JournalTab  from '../modules/mood/JournalTab'
import PatternsTab from '../modules/mood/PatternsTab'
import MindFeedTab from '../modules/mood/MindFeedTab'
import HintBubble  from '../components/HintBubble'

const MOOD_HINTS = {
  today: [
    'Your mood log connects to your cycle phase — over time, patterns become impossible to miss.',
    'Be honest even on hard days. Those entries are often the most revealing ones.',
  ],
  journal: [
    'Your journal is private. Write freely — no one else can see these entries.',
    'Even a two-sentence entry on a good day compounds into something powerful over months.',
  ],
  patterns: [
    'Your mood pattern graph shows which phases tend to feel lighter or heavier for you personally.',
    'Scroll back through months to see just how much your emotional landscape has shifted.',
  ],
  feed: [
    'The Mind Feed surfaces content curated to your current phase and recent mood history.',
    'Save any article to revisit it later from your profile.',
  ],
}

const TABS = [
  { id: 'today',    label: 'Today'     },
  { id: 'journal',  label: 'Journal'   },
  { id: 'patterns', label: 'Patterns'  },
  { id: 'feed',     label: 'Mind Feed' },
]

export default function MoodMind() {
  const [activeTab, setActiveTab] = useState('today')
  const [visited, setVisited]     = useState({ today: true })
  const [todayLog, setTodayLog]   = useState(null)

  // Restore today's log from localStorage on mount
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const logs  = JSON.parse(localStorage.getItem('athena_mood_logs') || '[]')
      const found = logs.find(l => l.date === today)
      if (found) setTodayLog(found)
    } catch {}
  }, [])

  function switchTab(id) {
    setVisited(v => ({ ...v, [id]: true }))
    setActiveTab(id)
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F3EAE7] overflow-hidden">
      <style>{`
        .mm-tab-pane { scrollbar-width: none; }
        .mm-tab-pane::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Header + sticky tab switcher ── */}
      <div className="flex-shrink-0 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/dashboard/mood.png)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(242,237,232,0.35) 0%, rgba(242,237,232,0.92) 65%, rgba(242,237,232,1) 100%)',
        }} />
        <div className="relative px-4 pt-8 pb-3">
        <h2 className="font-cinzel text-2xl tracking-widest mb-4" style={{ color: '#3B3330' }}>
          Mood & Mind
        </h2>

        {/* Pill switcher */}
        <div
          style={{
            display: 'flex', gap: 4, padding: '4px',
            background: 'rgba(196,175,168,0.2)',
            borderRadius: 22,
          }}
        >
          {TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  flex: 1, padding: '6px 2px', borderRadius: 18, border: 'none', cursor: 'pointer',
                  fontFamily: 'Cinzel, serif', fontSize: 7.5, letterSpacing: '0.13em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap',
                  background: active ? '#8FA58C' : 'transparent',
                  color: active ? '#F2EDE8' : '#7A6A65',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        </div>
      </div>

      {/* ── Tab panes — each keeps its own scroll ── */}
      <div className="flex-1 min-h-0 relative">
        {TABS.map(tab => (
          <div
            key={tab.id}
            className="mm-tab-pane"
            className="pb-nav"
            style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto',
              visibility: activeTab === tab.id ? 'visible' : 'hidden',
              pointerEvents: activeTab === tab.id ? 'auto' : 'none',
              paddingTop: 4,
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            {visited[tab.id] && (
              <>
                {tab.id === 'today' && (
                  <TodayTab onLogSaved={log => setTodayLog(log)} />
                )}
                {tab.id === 'journal' && (
                  <JournalTab
                    todayEmotions={todayLog?.emotions}
                    todayMoodWeather={todayLog?.moodWeather}
                  />
                )}
                {tab.id === 'patterns' && <PatternsTab />}
                {tab.id === 'feed'     && <MindFeedTab todayEmotions={todayLog?.emotions} />}
              </>
            )}
          </div>
        ))}
      </div>

      <HintBubble hintKey={`mood-${activeTab}`} hints={MOOD_HINTS[activeTab] ?? []} />
    </div>
  )
}
