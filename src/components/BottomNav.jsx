import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Moon, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

import pilatesIcon   from '../assets/icons/nav-pilates.png'
import communityIcon from '../assets/icons/nav-community.png'
import moodIcon      from '../assets/icons/nav-mood.png'

const NAV_ICON_FILTER = {
  inactive: 'invert(1) sepia(1) saturate(2) hue-rotate(2deg) brightness(0.7)',
  active:   'invert(1) sepia(1) saturate(4) hue-rotate(2deg) brightness(1)',
}

function PngIcon({ src, isActive }) {
  return (
    <img
      src={src}
      alt=""
      style={{
        width: '24px',
        height: '24px',
        objectFit: 'contain',
        filter: isActive ? NAV_ICON_FILTER.active : NAV_ICON_FILTER.inactive,
        opacity: isActive ? 1 : 0.5,
        transition: 'opacity 0.3s, filter 0.3s',
      }}
    />
  )
}

const navItems = [
  { to: '/',          label: 'Dashboard', lucide: LayoutDashboard, png: null          },
  { to: '/pilates',   label: 'Pilates',   lucide: null,            png: pilatesIcon   },
  { to: '/community', label: 'Community', lucide: null,            png: communityIcon },
  { to: '/cycle',     label: 'Cycle',     lucide: Moon,            png: null          },
  { to: '/mood',      label: 'Mood',      lucide: null,            png: moodIcon      },
]

export default function BottomNav() {
  const [exiting,   setExiting]   = useState(false)
  const [fadingOut, setFadingOut] = useState(false)
  const videoRef = useRef(null)
  const navigate = useNavigate()
  const doneRef  = useRef(false)

  function doSignOut() {
    if (doneRef.current) return
    doneRef.current = true
    supabase.auth.signOut().then(() => navigate('/login', { replace: true }))
  }

  useEffect(() => {
    if (!exiting || !videoRef.current) return
    videoRef.current.muted = true
    videoRef.current.play().catch(() => doSignOut())
    const timer = setTimeout(doSignOut, 5000)
    return () => clearTimeout(timer)
  }, [exiting])

  function handleSignOut() { setExiting(true) }

  function handleVideoEnd() {
    setFadingOut(true)
    setTimeout(doSignOut, 650)
  }

  return (
    <>
      {/* Exit video overlay */}
      {exiting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: '#060404',
          animation: 'exitFadeIn 1.4s ease forwards',
        }}>
          <style>{`
            @keyframes exitFadeIn  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes exitBlackIn { from { opacity: 0; } to { opacity: 1; } }
          `}</style>
          <video
            ref={videoRef}
            src="/athena-exit.mp4"
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            onError={handleVideoEnd}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* Fade-to-black bridge to login */}
      {fadingOut && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 201,
          backgroundColor: '#000',
          animation: 'exitBlackIn 0.65s ease forwards',
          pointerEvents: 'none',
        }} />
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {navItems.map(({ to, label, lucide: LucideIcon, png }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                  isActive ? 'text-gold' : 'text-white/40 hover:text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {png
                    ? <PngIcon src={png} isActive={isActive} />
                    : <LucideIcon size={20} strokeWidth={1.5} />
                  }
                  <span className="text-[10px] font-garamond tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 px-3 py-2 text-white/40 hover:text-white/70 transition-colors"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-garamond tracking-wide">Exit</span>
          </button>
        </div>
      </nav>
    </>
  )
}
