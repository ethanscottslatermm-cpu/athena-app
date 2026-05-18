import { useState, useCallback } from 'react'
import NourishToday      from '../modules/nourish/NourishToday'
import NourishSearch     from '../modules/nourish/NourishSearch'
import NourishPhasePlate from '../modules/nourish/NourishPhasePlate'
import NourishInsights   from '../modules/nourish/NourishInsights'

const TABS = [
  { id: 'today',    label: 'Today'        },
  { id: 'search',   label: 'Search & Log' },
  { id: 'plate',    label: 'Phase Plate'  },
  { id: 'insights', label: 'Insights'     },
]

export default function Nourish() {
  const [activeTab,  setActiveTab]  = useState('today')
  const [visited,    setVisited]    = useState({ today: true })
  const [refreshKey, setRefreshKey] = useState(0)

  function switchTab(id) {
    setVisited(v => ({ ...v, [id]: true }))
    setActiveTab(id)
  }

  const onLogSaved = useCallback(() => {
    setRefreshKey(k => k + 1)
    switchTab('today')
  }, [])

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F2EDE8] overflow-hidden">
      <style>{`
        .nr-pane { scrollbar-width: none; }
        .nr-pane::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header + pill switcher */}
      <div className="flex-shrink-0 px-4 pt-8 pb-3">
        <h2 className="font-cinzel text-2xl tracking-widest mb-4" style={{ color: '#3B3330' }}>
          Body Fuel
        </h2>
        <div style={{
          display: 'flex', gap: 4, padding: '4px',
          background: 'rgba(196,175,168,0.2)',
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
                  background: active ? '#8FA58C' : 'transparent',
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

      {/* Tab panes — all mounted after first visit, scroll preserved */}
      <div className="flex-1 min-h-0 relative">
        {TABS.map(tab => (
          <div
            key={tab.id}
            className="nr-pane pb-nav"
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
                {tab.id === 'today'    && (
                  <NourishToday key={refreshKey} onOpenSearch={() => switchTab('search')} />
                )}
                {tab.id === 'search'   && <NourishSearch   onLogSaved={onLogSaved} />}
                {tab.id === 'plate'    && <NourishPhasePlate />}
                {tab.id === 'insights' && <NourishInsights />}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
