import { useState, useCallback } from 'react'
import SleepLog      from '../modules/sleep/SleepLog'
import SleepWindDown from '../modules/sleep/SleepWindDown'
import SleepPatterns from '../modules/sleep/SleepPatterns'
import HintBubble    from '../components/HintBubble'

const SLEEP_HINTS = {
  log: [
    'Log your sleep as soon as you wake up — even a rough estimate builds meaningful patterns over time.',
    'Quality matters as much as duration. A restless 8 hours often ranks below a deep 6.',
  ],
  winddown: [
    'A consistent wind-down routine signals to your nervous system that rest is coming.',
    'Luteal phase sleep can be harder — a magnesium-rich snack and screen cutoff at 9 PM can make a real difference.',
  ],
  patterns: [
    'Your sleep pattern graph reveals which cycle phases tend to disrupt your rest most.',
    'Notice trends across weeks, not just last night — that is where the real insight lives.',
  ],
}

const TABS = [
  { id: 'log',       label: 'Log'        },
  { id: 'winddown',  label: 'Wind Down'  },
  { id: 'patterns',  label: 'Patterns'   },
]

const INDIGO = '#9B97C4'

export default function Sleep() {
  const [activeTab,  setActiveTab]  = useState('log')
  const [visited,    setVisited]    = useState({ log: true })
  const [refreshKey, setRefreshKey] = useState(0)

  function switchTab(id) {
    setVisited(v => ({ ...v, [id]: true }))
    setActiveTab(id)
  }

  const onLogSaved = useCallback(() => {
    setRefreshKey(k => k + 1)
    switchTab('patterns')
  }, [])

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F2EDE8] overflow-hidden">
      <style>{`
        .sl-pane { scrollbar-width: none; }
        .sl-pane::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header + pill nav */}
      <div className="flex-shrink-0 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/dashboard/sleep.png)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(242,237,232,0.35) 0%, rgba(242,237,232,0.92) 65%, rgba(242,237,232,1) 100%)',
        }} />
        <div className="relative px-4 pt-8 pb-3">
        <h2 className="font-cinzel text-2xl tracking-widest mb-4" style={{ color: '#3B3330' }}>
          Sleep
        </h2>
        <div style={{
          display: 'flex', gap: 4, padding: '4px',
          background: 'rgba(155,151,196,0.12)',
          borderRadius: 22,
        }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  flex: 1, padding: '6px 2px', borderRadius: 18,
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'Cinzel, serif', fontSize: 7.5,
                  letterSpacing: '0.13em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  background: active ? INDIGO : 'transparent',
                  color:      active ? '#F2EDE8' : '#7A6A65',
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

      {/* Tab panes */}
      <div className="flex-1 min-h-0 relative">
        {TABS.map(tab => (
          <div
            key={tab.id}
            className="sl-pane pb-nav"
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
                {tab.id === 'log'      && <SleepLog      key={refreshKey} onLogSaved={onLogSaved} />}
                {tab.id === 'winddown' && <SleepWindDown />}
                {tab.id === 'patterns' && <SleepPatterns key={refreshKey} />}
              </>
            )}
          </div>
        ))}
      </div>

      <HintBubble hintKey={`sleep-${activeTab}`} hints={SLEEP_HINTS[activeTab] ?? []} />
    </div>
  )
}
