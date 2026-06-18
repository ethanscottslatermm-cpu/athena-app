import { NavLink } from 'react-router-dom'

import dashboardIcon from '../assets/icons/nav-dashboard.png'
import cycleIcon     from '../assets/icons/nav-cycle.png'
import moodIcon      from '../assets/icons/nav-mood.png'
import communityIcon from '../assets/icons/nav-community.png'
import nourishIcon   from '../assets/icons/nav-nourish.png'
import groceryIcon   from '../assets/icons/nav-grocery.svg'

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

function AthenaIcon({ isActive }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, flexShrink: 0,
      fontSize: 15,
      color: isActive ? '#C9A86C' : 'currentColor',
      transition: 'color 0.3s',
    }}>
      ✦
    </span>
  )
}

const navItems = [
  { to: '/',          label: 'Home',      png: dashboardIcon, athena: false },
  { to: '/nourish',   label: 'Body Fuel', png: nourishIcon,   athena: false },
  { to: '/grocery',   label: 'Grocery',   png: groceryIcon,   athena: false },
  { to: '/mood',      label: 'Mood',      png: moodIcon,      athena: false },
  { to: '/cycle',     label: 'Cycle',     png: cycleIcon,     athena: false },
  { to: '/athena',    label: 'Athena',    png: null,          athena: true  },
  { to: '/community', label: 'Community', png: communityIcon, athena: false },
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
          {navItems.map(({ to, label, png, athena }, i) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="flex flex-col items-center gap-0.5 px-1 py-2 transition-colors"
              style={({ isActive }) => ({ color: isActive ? (athena ? '#C9A86C' : '#2A1C14') : '#6B5248' })}
            >
              {({ isActive }) => (
                <>
                  {athena
                    ? <AthenaIcon isActive={isActive} />
                    : <PngIcon src={png} delay={i * 0.7} />
                  }
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '0.6rem',
                    fontWeight: 500,
                    letterSpacing: '0.03em',
                    color: isActive && athena ? '#C9A86C' : 'inherit',
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
