import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Fine line-art icons drawn to match the frosted-glass nav reference.
// All strokes use currentColor so the active/inactive colour flows through.
function LineIcon({ children, size = 34 }) {
  return (
    <svg
      viewBox="0 0 32 32" width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="1.15"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block' }}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// Ionic column with a sprig
const HomeIcon = () => (
  <LineIcon>
    <path d="M4.5 8h15" />
    <path d="M6 8c-1.6 0-2.4 1-2.4 2 0 1.1.9 1.8 1.8 1.8.8 0 1.3-.5 1.3-1.2" />
    <path d="M18 8c1.6 0 2.4 1 2.4 2 0 1.1-.9 1.8-1.8 1.8-.8 0-1.3-.5-1.3-1.2" />
    <path d="M7 11.2h10" />
    <path d="M8.5 12.5v12M11 12.5v12M13 12.5v12M15.5 12.5v12" />
    <path d="M6.5 25.5h11" />
    <path d="M19.5 27c2-2.6 4.2-5.6 7.5-8.5" />
    <path d="M22 23.6c-1.8-.4-2.6-1.8-2.4-3.4 1.5.5 2.4 1.7 2.4 3.4z" />
    <path d="M24.4 21c-1.7-.6-2.3-2-2-3.6 1.4.6 2.2 1.9 2 3.6z" />
    <path d="M22.6 24.6c1.7.6 3.3.1 4.1-1.3-1.6-.4-3.1.1-4.1 1.3z" />
    <path d="M25 21.9c1.6.4 3-.2 3.6-1.6-1.5-.3-2.9.3-3.6 1.6z" />
  </LineIcon>
)

// Standing figure, arms softly open
const BodyIcon = () => (
  <LineIcon>
    <circle cx="16" cy="5.8" r="2.4" />
    <path d="M16 9.5v8.5" />
    <path d="M9 11.5c2.4 1.6 4.6 2.1 7 2.1s4.6-.5 7-2.1" />
    <path d="M16 18l-3.6 9" />
    <path d="M16 18l3.6 9" />
  </LineIcon>
)

// Crescent moon with a small star
const CycleIcon = () => (
  <LineIcon>
    <path d="M19.5 5.2A11 11 0 1 0 27 20.4 8.6 8.6 0 0 1 19.5 5.2z" />
    <path d="M24.5 6.5v3M23 8h3" />
  </LineIcon>
)

// Lotus
const MoodIcon = () => (
  <LineIcon>
    <path d="M16 7.5c-3 3.8-3 10.2 0 14.5 3-4.3 3-10.7 0-14.5z" />
    <path d="M16 22c-4.2-.8-7.6-4.6-7.6-10.4 4.2 1 7 4.6 7.6 10.4z" />
    <path d="M16 22c4.2-.8 7.6-4.6 7.6-10.4-4.2 1-7 4.6-7.6 10.4z" />
    <path d="M16 22c-5.8 1-10.6-1.6-12.6-5.6 4.2-1 9.2.4 12.6 5.6z" />
    <path d="M16 22c5.8 1 10.6-1.6 12.6-5.6-4.2-1-9.2.4-12.6 5.6z" />
  </LineIcon>
)

// Botanical sprig
const MoreIcon = () => (
  <LineIcon>
    <path d="M8 28.5C12 21 17.5 12.5 24.5 3.5" />
    <path d="M11.6 23.2c-2.6-1-3.6-3.6-2.8-6.4 1.9 1.6 2.9 3.8 2.8 6.4z" />
    <path d="M14.6 18.4c-2.6-1-3.6-3.6-2.8-6.4 1.9 1.6 2.9 3.8 2.8 6.4z" />
    <path d="M18 13.4c-2.2-1.6-2.6-4.3-1.2-6.8 1.4 2 1.8 4.3 1.2 6.8z" />
    <path d="M12.6 22c2.8.2 5-1.4 5.8-4.2-2.6-.2-4.8 1.4-5.8 4.2z" />
    <path d="M15.8 17c2.8.2 5-1.4 5.8-4.2-2.6-.2-4.8 1.4-5.8 4.2z" />
    <path d="M19.4 11.6c2.6-.4 4.4-2.4 4.6-5.2-2.5.4-4.3 2.4-4.6 5.2z" />
  </LineIcon>
)

const navItems = [
  { to: '/',      label: 'Home',  Icon: HomeIcon },
  { to: '/body',  label: 'Body',  Icon: BodyIcon },
  { to: '/cycle', label: 'Cycle', Icon: CycleIcon },
  { to: '/mood',  label: 'Mood',  Icon: MoodIcon },
  { to: '/more',  label: 'More',  Icon: MoreIcon },
]

const ACTIVE_COLOR   = '#9C5F66'
const INACTIVE_COLOR = '#7A6A65'

const glassSurface = {
  background: 'linear-gradient(180deg, rgba(253,246,243,0.78) 0%, rgba(246,234,229,0.72) 100%)',
  backdropFilter: 'blur(24px) saturate(140%)',
  WebkitBackdropFilter: 'blur(24px) saturate(140%)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: '0 12px 32px rgba(140,100,92,0.18), 0 2px 6px rgba(140,100,92,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
}

const activePill = {
  background: 'linear-gradient(180deg, rgba(255,238,233,0.98) 0%, rgba(246,214,207,0.92) 100%)',
  boxShadow: '0 4px 16px rgba(214,146,136,0.35), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px rgba(255,255,255,0.6)',
}

export default function BottomNav() {
  // Remember which path the bar was opened on, so navigating away collapses it
  const [expandedOn, setExpandedOn] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const isActivePath = (to) =>
    to === '/' ? location.pathname === '/' : (location.pathname === to || location.pathname.startsWith(to + '/'))

  const isExpanded = expandedOn === location.pathname

  const activeItem = navItems.find(item => isActivePath(item.to)) || navItems[0]
  const ActiveIcon = activeItem.Icon

  return (
    <>
      <style>{`
        @keyframes collapsedGlow {
          0%   { box-shadow: 0 0 0 0 rgba(214,146,136,0.45), 0 8px 24px rgba(140,100,92,0.18); }
          50%  { box-shadow: 0 0 0 9px rgba(214,146,136,0), 0 8px 24px rgba(140,100,92,0.18); }
          100% { box-shadow: 0 0 0 0 rgba(214,146,136,0), 0 8px 24px rgba(140,100,92,0.18); }
        }
        @keyframes chevronBounce {
          0%, 100% { transform: translateY(0); opacity: 0.45; }
          50% { transform: translateY(-4px); opacity: 0.7; }
        }
        .nav-glow { animation: ${prefersReduced ? 'none' : 'collapsedGlow 2.6s ease-in-out infinite'}; }
        .nav-chevron { animation: ${prefersReduced ? 'none' : 'chevronBounce 1.6s ease-in-out infinite'}; }
        .athena-nav-item:focus-visible { outline: 1.5px solid ${ACTIVE_COLOR}66; outline-offset: 2px; }
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
            onClick={() => setExpandedOn(location.pathname)}
            className="nav-glow athena-nav-item"
            style={{
              ...glassSurface,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 62, height: 62,
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              color: ACTIVE_COLOR,
            }}
            aria-label="Expand navigation"
          >
            <ActiveIcon />
          </button>
        </div>
      )}

      {/* Expanded: Floating frosted-glass bar */}
      <nav style={{
        ...glassSurface,
        position: 'fixed', zIndex: 100,
        left: 12, right: 12, bottom: 'max(12px, env(safe-area-inset-bottom))',
        maxWidth: 520, margin: '0 auto',
        borderRadius: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '12px 6px 10px',
        opacity: isExpanded ? 1 : 0,
        pointerEvents: isExpanded ? 'auto' : 'none',
        transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% + 24px))',
        transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: isExpanded ? 'transform, opacity' : 'auto',
      }}>
        {navItems.map(({ to, label, Icon }) => {
          const isActive = isActivePath(to)
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="athena-nav-item"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                flex: 1, minWidth: 0, padding: '2px 2px 4px',
                color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                transition: 'color 0.25s ease',
                outline: 'none',
                borderRadius: 16,
                minHeight: 56,
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
            >
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 'min(72px, 100%)', height: 46,
                borderRadius: 999,
                transition: 'background 0.3s ease, box-shadow 0.3s ease',
                ...(isActive ? activePill : { background: 'transparent', boxShadow: 'none' }),
              }}>
                <Icon />
              </span>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '0.88rem',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.02em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
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
