import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const ROUTES = ['/', '/nourish', '/grocery', '/pilates', '/mood', '/cycle', '/community']
const THRESHOLD = 65    // min horizontal px to trigger
const ANGLE_RATIO = 1.4 // dx must be this many times larger than dy

// Walk up the DOM from el; return true if any ancestor is horizontally scrollable
function inHScrollContainer(el) {
  while (el && el !== document.body) {
    const ox = window.getComputedStyle(el).overflowX
    if ((ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 1) return true
    el = el.parentElement
  }
  return false
}

export function useSwipeNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const start    = useRef(null)

  useEffect(() => {
    function onTouchStart(e) {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY, target: e.target }
    }

    function onTouchEnd(e) {
      if (!start.current) return
      const dx     = e.changedTouches[0].clientX - start.current.x
      const dy     = e.changedTouches[0].clientY - start.current.y
      const target = start.current.target
      start.current = null

      if (Math.abs(dx) < THRESHOLD) return
      if (Math.abs(dy) > Math.abs(dx) / ANGLE_RATIO) return
      if (inHScrollContainer(target)) return

      const seg  = location.pathname.split('/')[1]
      const base = seg ? `/${seg}` : '/'
      if (base === '/') return          // no swipe nav on dashboard
      const idx  = ROUTES.indexOf(base)
      if (idx === -1) return

      if (dx < 0 && idx < ROUTES.length - 1) navigate(ROUTES[idx + 1])
      else if (dx > 0 && idx > 0)            navigate(ROUTES[idx - 1])
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  }, [navigate, location.pathname])
}
