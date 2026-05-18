import { useState, useCallback } from 'react'
import SkinLog      from '../modules/skin/SkinLog'
import SkinRoutine  from '../modules/skin/SkinRoutine'
import SkinInsights from '../modules/skin/SkinInsights'

const TABS = [
  { id: 'log',      label: 'Log'      },
  { id: 'routine',  label: 'Routine'  },
  { id: 'insights', label: 'Insights' },
]

const ROSE = '#C4859A'

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
    <div className="flex-1 min-h-0 flex flex-col bg-[#F2EDE8] overflow-hidden">
      <style>{`
        .sk-pane { scrollbar-width: none; }
        .sk-pane::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header + pill nav */}
      <div className="flex-shrink-0 px-4 pt-8 pb-3">
        <h2 className="font-cinzel text-2xl tracking-widest mb-4" style={{ color: '#3B3330' }}>
          Skin
        </h2>
        <div style={{
          display: 'flex', gap: 4, padding: '4px',
          background: 'rgba(196,133,154,0.1)',
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
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
