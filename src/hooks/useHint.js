import { useState, useEffect } from 'react'

const DISABLED_KEY = 'athena_hints_disabled'
const WELCOMED_KEY = 'athena_welcomed_v1'
const IDX_PREFIX   = 'athena_hint_idx_'

export function useHint(key, hints = []) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    if (
      !hints.length ||
      localStorage.getItem(DISABLED_KEY) === 'true' ||
      localStorage.getItem(WELCOMED_KEY) !== 'true'
    ) return

    const t = setTimeout(() => setVisible(true), 3000)
    return () => { clearTimeout(t); setVisible(false) }
  }, [key])

  function currentIdx() {
    const raw = parseInt(localStorage.getItem(IDX_PREFIX + key) ?? '0', 10)
    return isNaN(raw) ? 0 : raw % hints.length
  }

  function dismiss() {
    setVisible(false)
    localStorage.setItem(IDX_PREFIX + key, String((currentIdx() + 1) % hints.length))
  }

  function disableAll() {
    setVisible(false)
    localStorage.setItem(DISABLED_KEY, 'true')
  }

  return { visible, hint: hints[currentIdx()] ?? '', dismiss, disableAll }
}
