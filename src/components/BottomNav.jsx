import { NavLink } from 'react-router-dom'

import dashboardIcon from '../assets/icons/nav-dashboard.png'
import pilatesIcon   from '../assets/icons/nav-pilates.png'
import communityIcon from '../assets/icons/nav-community.png'
import cycleIcon     from '../assets/icons/nav-cycle.png'
import moodIcon      from '../assets/icons/nav-mood.png'
import nourishIcon   from '../assets/icons/nav-nourish.png'
import groceryIcon   from '../assets/icons/nav-grocery.svg'

function PngIcon({ src, delay = 0 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: '24px', height: '24px', flexShrink: 0 }}>
      {/* Icon */}
      <span style={{
        display: 'block', width: '100%', height: '100%',
        WebkitMask: `url(${src}) no-repeat center / contain`,
        mask: `url(${src}) no-repeat center / contain`,
        backgroundColor: 'currentColor',
        transition: 'color 0.3s',
      }} />
      {/* Platinum shimmer pass */}
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

const navItems = [
  { to: '/',          label: 'Home',      png: dashboardIcon },
  { to: '/nourish',   label: 'Body Fuel', png: nourishIcon   },
  { to: '/pilates',   label: 'Pilates',   png: pilatesIcon   },
  { to: '/grocery',   label: 'Grocery',   png: groceryIcon   },
  { to: '/mood',      label: 'Mood',      png: moodIcon      },
  { to: '/cycle',     label: 'Cycle',     png: cycleIcon     },
  { to: '/community', label: 'Community', png: communityIcon },
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
        style={{ backgroundColor: '#8A7E78', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
          {navItems.map(({ to, label, png }, i) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-2 py-2 transition-colors ${
                  isActive ? 'text-rose' : 'text-linen/70 hover:text-linen'
                }`
              }
            >
              <PngIcon src={png} delay={i * 0.7} />
              <span className="text-[10px] font-garamond tracking-wide">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
