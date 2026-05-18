import { useState, useCallback } from 'react'
import CommunityFeed       from '../modules/community/CommunityFeed'
import CommunityTribe      from '../modules/community/CommunityTribe'
import CommunityChallenges from '../modules/community/CommunityChallenges'
import CommunityProfile    from '../modules/community/CommunityProfile'

const SAGE = '#8FA58C'

const TABS = [
  { id: 'feed',       label: 'Feed'       },
  { id: 'tribe',      label: 'Tribe'      },
  { id: 'challenges', label: 'Challenges' },
  { id: 'profile',    label: 'Profile'    },
]

export default function Community() {
  const [activeTab, setActiveTab] = useState('feed')
  const [visited,   setVisited]   = useState({ feed: true })

  function switchTab(id) {
    setVisited(v => ({ ...v, [id]: true }))
    setActiveTab(id)
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#F2EDE8] overflow-hidden">
      <style>{`
        .cm-pane { scrollbar-width: none; }
        .cm-pane::-webkit-scrollbar { display: none; }
        .cm-hscroll { scrollbar-width: none; }
        .cm-hscroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header + pill nav */}
      <div className="flex-shrink-0 px-4 pt-8 pb-3">
        <h2 className="font-cinzel text-2xl tracking-widest mb-4" style={{ color: '#3B3330' }}>
          Community
        </h2>
        <div style={{
          display: 'flex', gap: 3, padding: '4px',
          background: 'rgba(143,165,140,0.12)',
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
                  background: active ? SAGE : 'transparent',
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
            className="cm-pane pb-nav"
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
                {tab.id === 'feed'       && <CommunityFeed />}
                {tab.id === 'tribe'      && <CommunityTribe />}
                {tab.id === 'challenges' && <CommunityChallenges />}
                {tab.id === 'profile'    && <CommunityProfile onSwitchTab={switchTab} />}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
