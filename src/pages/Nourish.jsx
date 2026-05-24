import { useState, useCallback } from 'react'
import { Camera } from 'lucide-react'
import NourishToday      from '../modules/nourish/NourishToday'
import NourishSearch     from '../modules/nourish/NourishSearch'
import NourishPhasePlate from '../modules/nourish/NourishPhasePlate'
import NourishInsights   from '../modules/nourish/NourishInsights'
import FoodScanner       from '../modules/nourish/FoodScanner'
import HintBubble        from '../components/HintBubble'

const NOURISH_HINTS = {
  today: [
    'Your daily macro totals update each time you log a meal. Keep the streak going.',
    'Body Fuel adapts your nutritional targets to your cycle phase — luteal days often call for more complex carbs and magnesium.',
  ],
  search: [
    'Search any food to log it. Athena uses a live nutrition database for accurate macro data.',
    'Log meals as you eat them — it takes less than ten seconds and compounds into real insight.',
  ],
  plate: [
    'Your Phase Plate highlights foods that are especially beneficial during your current hormonal phase.',
    'Follicular phase? Reach for lighter proteins and leafy greens. Luteal? Think dark chocolate, nuts, and complex carbs.',
  ],
  insights: [
    'Your nutrition insights reward consistency over perfection. Small daily improvements compound.',
    'Check your weekly macro averages here to see where you have the most room to grow.',
  ],
}

const TABS = [
  { id: 'today',    label: 'Today'        },
  { id: 'search',   label: 'Search & Log' },
  { id: 'plate',    label: 'Phase Plate'  },
  { id: 'insights', label: 'Insights'     },
]

export default function Nourish() {
  const [activeTab,    setActiveTab]    = useState('today')
  const [visited,      setVisited]      = useState({ today: true })
  const [refreshKey,   setRefreshKey]   = useState(0)
  const [scannerOpen,  setScannerOpen]  = useState(false)

  function switchTab(id) {
    setVisited(v => ({ ...v, [id]: true }))
    setActiveTab(id)
  }

  const onLogSaved = useCallback(() => {
    setRefreshKey(k => k + 1)
    switchTab('today')
  }, [])

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F3EAE7] overflow-hidden">
      <style>{`
        .nr-pane { scrollbar-width: none; }
        .nr-pane::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header + pill switcher */}
      <div className="flex-shrink-0 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/dashboard/nourish.png)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(242,237,232,0.35) 0%, rgba(242,237,232,0.92) 65%, rgba(242,237,232,1) 100%)',
        }} />
        <div className="relative px-4 pt-8 pb-3">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="font-cinzel text-2xl tracking-widest" style={{ color: '#3B3330' }}>
            Body Fuel
          </h2>
          {/* Scan button */}
          <button
            onClick={() => setScannerOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 22,
              background: 'rgba(143,165,140,0.15)',
              border: '1px solid rgba(143,165,140,0.4)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Camera size={14} color="#8FA58C" strokeWidth={1.8} />
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: 8,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#8FA58C',
            }}>Scan</span>
          </button>
        </div>
        <div style={{
          display: 'flex', gap: 4, padding: '4px',
          background: 'rgba(196,175,168,0.2)', borderRadius: 22,
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
                {tab.id === 'search'   && <NourishSearch   onLogSaved={onLogSaved} onScanRequest={() => setScannerOpen(true)} />}
                {tab.id === 'plate'    && <NourishPhasePlate />}
                {tab.id === 'insights' && <NourishInsights />}
              </>
            )}
          </div>
        ))}
      </div>

      <HintBubble hintKey={`nourish-${activeTab}`} hints={NOURISH_HINTS[activeTab] ?? []} />

      {scannerOpen && (
        <FoodScanner
          onClose={() => setScannerOpen(false)}
          onLogSaved={() => { setScannerOpen(false); onLogSaved() }}
          onSearchInstead={() => { setScannerOpen(false); switchTab('search') }}
        />
      )}
    </div>
  )
}
