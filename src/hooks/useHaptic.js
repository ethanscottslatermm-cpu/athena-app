export function useHaptic() {
  function vibrate(pattern = [10]) {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  }

  return {
    tap:    () => vibrate([10]),
    soft:   () => vibrate([5, 50, 5]),
    strong: () => vibrate([30]),
  }
}
