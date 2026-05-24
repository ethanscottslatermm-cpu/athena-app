import { useState, useCallback } from 'react'
import SkinLog      from '../modules/skin/SkinLog'
import SkinRoutine  from '../modules/skin/SkinRoutine'
import SkinInsights from '../modules/skin/SkinInsights'
import SkinMirror   from '../modules/skin/SkinMirror'
import HintBubble   from '../components/HintBubble'

const SKIN_HINTS = {
  log: [
    'Daily skin logs help Athena identify patterns across your cycle phases — even subtle ones.',
    'Be specific about your concerns. Over time, Athena learns exactly when your skin is most reactive.',
  ],
  routine: [
    'Build your AM and PM routines here so every step is locked in and never forgotten.',
    'Product-type suggestions adapt to your current cycle phase — lighter actives in follicular, barrier focus in luteal.',
  ],
  insights: [
    'Your 7-day condition chart shows how hormonal shifts affect your skin over time.',
    'Recurring concerns in the same phase every month are worth bringing up with a dermatologist.',
  ],
  mirror: [
    'Turn on the grid overlay for precise skin checks — ideal for tracking breakout locations over time.',
    'Freeze a frame to study your skin closely before logging a concern.',
    'Your saved photos build a visual timeline of your skin health across cycle phases.',
  ],
}

const TABS = [
  { id: 'log',      label: 'Log'      },
  { id: 'routine',  label: 'Routine'  },
  { id: 'insights', label: 'Insights' },
  { id: 'mirror',   label: 'Mirror'   },
]

const ROSE = '#D4A0A0'

export default function Skin() {
  const [activeTab,  setActiveTab]  = useState('log')
  const [visited,    setVisited]    = useState({ log: true })
  const [refreshKey, setRefreshKey] = useState(0)

  function switchTab(id) {
    setVisited(v => ({ ...v, [id]: true }))
    setActiveTab(id)
  }

  const onLogSaved = useCallback(() => {
    setRefreshKey(k => k + 1)
    switchTab('insights')
  }, [])

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F3EAE7] overflow-hidden">
      <style>{`
        .sk-pane { scrollbar-width: none; }
        .sk-pane::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header + pill nav */}
      <div className="flex-shrink-0 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/dashboard/skin.png)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(242,237,232,0.35) 0%, rgba(242,237,232,0.92) 65%, rgba(242,237,232,1) 100%)',
        }} />
        <div className="relative px-4 pt-8 pb-3">
        <h2 className="font-cinzel text-2xl tracking-widest mb-4" style={{ color: '#3B3330' }}>
          Skin
        </h2>
        <div style={{
          display: 'flex', gap: 4, padding: '4px',
          background: 'rgba(212,160,160,0.1)',
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
                  fontFamily: 'Cinzel, serif', fontSize: 7,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  background: active ? ROSE : 'transparent',
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
            className="sk-pane pb-nav"
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
                {tab.id === 'log'      && <SkinLog      key={refreshKey} onLogSaved={onLogSaved} />}
                {tab.id === 'routine'  && <SkinRoutine  />}
                {tab.id === 'insights' && <SkinInsights key={refreshKey} />}
                {tab.id === 'mirror'   && <SkinMirror   />}
              </>
            )}
          </div>
        ))}
      </div>

      <HintBubble hintKey={`skin-${activeTab}`} hints={SKIN_HINTS[activeTab] ?? []} />
    </div>
  )
}
