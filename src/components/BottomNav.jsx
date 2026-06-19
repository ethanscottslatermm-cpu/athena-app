import { NavLink } from 'react-router-dom'

import bodyIcon      from '../assets/icons/nav-body.svg'
import dashboardIcon from '../assets/icons/nav-dashboard.png'
import cycleIcon     from '../assets/icons/nav-cycle.png'
import moodIcon      from '../assets/icons/nav-mood.png'

function PngIcon({ src, delay = 0 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: '22px', height: '22px', flexShrink: 0 }}>
      <span style={{
        display: 'block', width: '100%', height: '100%',
        WebkitMask: `url(${src}) no-repeat center / contain`,
        mask: `url(${src}) no-repeat center / contain`,
        backgroundColor: 'currentColor',
        transition: 'color 0.3s',
      }} />
      <span style={{
        position: 'absolute', inset: 0,
        WebkitMask: `url(${src}) no-repeat center / contain`,
        mask: `url(${src}) no-repeat center / contain`,
        background: 'linear-gradient(110deg, transparent 25%, rgba(245,240,225,0.7) 50%, transparent 75%)',
        backgroundSize: '250% 100%',
        animation: `navShimmer 10s ease-in-out infinite ${delay}s`,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }} />
    </span>
  )
}

function GridIcon() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, flexShrink: 0 }}>
      <svg viewBox="0 0 18 18" width={17} height={17} fill="currentColor">
        <rect x="1"    y="1"    width="6.5" height="6.5" rx="1.5" />
        <rect x="10.5" y="1"    width="6.5" height="6.5" rx="1.5" />
        <rect x="1"    y="10.5" width="6.5" height="6.5" rx="1.5" />
        <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" />
      </svg>
    </span>
  )
}

const navItems = [
  { to: '/',      label: 'Home',  png: dashboardIcon },
  { to: '/body',  label: 'Body',  png: bodyIcon      },
  { to: '/cycle', label: 'Cycle', png: cycleIcon     },
  { to: '/mood',  label: 'Mood',  png: moodIcon      },
  { to: '/more',  label: 'More',  png: null          },
]

export default function BottomNav() {
  return (
    <>
      <style>{`
        @keyframes navShimmer {
          0%, 42%   { background-position: -250% 0; }
          78%, 100% { background-position:  250% 0; }
        }
      `}</style>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(196, 184, 176, 0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.32)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-0.5">
          {navItems.map(({ to, label, png }, i) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="flex flex-col items-center gap-0.5 px-1 py-2 transition-colors"
              style={({ isActive }) => ({ color: isActive ? '#2A1C14' : '#6B5248' })}
            >
              {({ isActive }) => (
                <>
                  {png ? <PngIcon src={png} delay={i * 0.7} /> : <GridIcon />}
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    letterSpacing: '0.03em',
                  }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
