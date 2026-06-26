import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import bodyIcon      from '../assets/icons/nav-body.svg'
import dashboardIcon from '../assets/icons/nav-dashboard.png'
import cycleIcon     from '../assets/icons/nav-cycle.png'
import moodIcon      from '../assets/icons/nav-mood.png'

function PngIcon({ src, size = 22, delay = 0 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
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
        background: 'linear-gradient(110deg, transparent 25%, rgba(245,240,225,0.5) 50%, transparent 75%)',
        backgroundSize: '250% 100%',
        animation: `navShimmer 8s ease-in-out infinite ${delay}s`,
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
  { to: '/',      label: 'Home',  png: dashboardIcon, color: '#8FAF8A' },
  { to: '/body',  label: 'Body',  png: bodyIcon,      color: '#C4859A' },
  { to: '/cycle', label: 'Cycle', png: cycleIcon,     color: '#C9A86C' },
  { to: '/mood',  label: 'Mood',  png: moodIcon,      color: '#E8829A' },
  { to: '/more',  label: 'More',  png: null,          color: '#8FAF8A' },
]

export default function BottomNav() {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const activeItem = navItems.find(item => {
    if (item.to === '/') return location.pathname === '/'
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/')
  }) || navItems[0]

  // Auto-collapse when navigating to a new module
  useEffect(() => {
    setIsExpanded(false)
  }, [location.pathname])

  const handleItemClick = (to) => {
    navigate(to)
  }

  return (
    <>
      <style>{`
        @keyframes navShimmer {
          0%, 42%   { background-position: -250% 0; }
          78%, 100% { background-position:  250% 0; }
        }
        @keyframes collapsedGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(232, 130, 154, 0.6), inset 0 0 0 2px rgba(232, 130, 154, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(232, 130, 154, 0), inset 0 0 0 2px rgba(232, 130, 154, 0.25);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(232, 130, 154, 0), inset 0 0 0 2px rgba(232, 130, 154, 0.3);
          }
        }
        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); opacity: 0.45; }
          50% { transform: translateY(-4px); opacity: 0.7; }
        }
        .nav-glow { animation: ${prefersReduced ? 'none' : 'collapsedGlow 2.6s ease-in-out infinite'}; }
        .nav-chevron { animation: ${prefersReduced ? 'none' : 'chevronBounce 1.6s ease-in-out infinite'}; }
        @media (prefers-reduced-motion: reduce) {
          .nav-collapsed-hint { display: none !important; }
        }
      `}</style>

      {/* Collapsed: Single Icon Pill Button */}
      {!isExpanded && (
        <div style={{
          position: 'fixed', bottom: 'max(12px, env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          pointerEvents: 'auto',
        }}>
          {/* Chevron + "Tap" Label */}
          <div className="nav-chevron" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(122, 106, 101, 0.55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleY(-1)' }}>
              <polyline points="18 15 12 9 6 15"/>
            </svg>
            <span style={{ fontSize: '6.5px', color: '#8A7E78', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, opacity: 0.6 }}>tap</span>
          </div>

          {/* Icon Pill */}
          <button
            onClick={() => setIsExpanded(true)}
            className="nav-glow"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, minWidth: 44, minHeight: 44,
              borderRadius: '50%',
              background: 'rgba(242, 237, 232, 0.88)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `2px solid ${activeItem.color}28`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              outline: 'none',
              color: activeItem.color,
            }}
            aria-label="Expand navigation"
          >
            {/* Single stable icon with glow effect */}
            <div style={{
              filter: `drop-shadow(0 0 12px ${activeItem.color}55)`,
              transition: 'filter 0.3s ease',
            }}>
              <PngIcon src={activeItem.png} size={26} />
            </div>
          </button>
        </div>
      )}

      {/* Expanded: Full Nav Bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(243, 240, 237, 0.94)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderTop: '1px solid rgba(196, 133, 154, 0.2)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '12px 8px max(10px, env(safe-area-inset-bottom))',
        opacity: isExpanded ? 1 : 0,
        pointerEvents: isExpanded ? 'auto' : 'none',
        transform: isExpanded ? 'translateY(0)' : 'translateY(100%)',
        transition: `opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: isExpanded ? 'transform, opacity' : 'auto',
      }}>
        {navItems.map(({ to, label, png, color }, i) => {
          const isActive = to === '/' ? location.pathname === '/' : (location.pathname === to || location.pathname.startsWith(to + '/'))
          return (
            <button
              key={to}
              onClick={() => handleItemClick(to)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                opacity: isActive ? 1 : 0.48,
                transition: 'opacity 0.25s ease, color 0.25s ease',
                flex: 1, minWidth: 0, padding: '8px 2px 4px',
                color: isActive ? color : '#7A6A65',
                outline: 'none',
                borderRadius: '12px',
                minHeight: '56px',
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <div style={{
                filter: isActive ? `drop-shadow(0 0 8px ${color}66)` : 'none',
                transition: 'filter 0.25s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {png ? <PngIcon src={png} size={24} delay={i * 0.3} /> : <GridIcon />}
              </div>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '0.72rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.06em',
                textTransform: 'capitalize',
                transition: 'font-weight 0.25s ease, opacity 0.25s ease',
                opacity: isActive ? 1 : 0.68,
                textShadow: isActive ? '0 0 1px rgba(0,0,0,0.2)' : 'none',
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Layout spacer — maintains consistent bottom space whether nav is collapsed or expanded */}
      <div style={{ height: 'max(64px, calc(64px + env(safe-area-inset-bottom)))' }} />
    </>
  )
}
