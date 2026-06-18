import { useEffect, useRef, useCallback } from 'react'

export function useInactivityTimer(timeoutMs, onTimeout) {
  const timerRef = useRef(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(onTimeout, timeoutMs)
  }, [timeoutMs, onTimeout])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    const events = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'touchmove', 'click',
    ]

    events.forEach(e =>
      window.addEventListener(e, resetTimer, { passive: true })
    )

    resetTimer()

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      clearTimer()
    }
  }, [resetTimer, clearTimer])

  return { resetTimer, clearTimer }
}
