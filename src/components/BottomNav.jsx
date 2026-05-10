import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Users, Moon, Heart, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pilates',   icon: Dumbbell,        label: 'Pilates'   },
  { to: '/community', icon: Users,           label: 'Community' },
  { to: '/cycle',     icon: Moon,            label: 'Cycle'     },
  { to: '/mood',      icon: Heart,           label: 'Mood'      },
]

export default function BottomNav() {
  const [exiting, setExiting] = useState(false)
  const videoRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (exiting && videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {
        supabase.auth.signOut().then(() => navigate('/login', { replace: true }))
      })
    }
  }, [exiting])

  async function handleSignOut() {
    setExiting(true)
  }

  async function handleVideoEnd() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Exit transition video */}
      {exiting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: '#060404',
          animation: 'exitFadeIn 1.4s ease forwards',
        }}>
          <style>{`
            @keyframes exitFadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
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

      <nav
        className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
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
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-garamond tracking-wide">{label}</span>
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
