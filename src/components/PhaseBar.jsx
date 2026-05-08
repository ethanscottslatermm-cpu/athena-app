import { usePhase } from '../hooks/usePhase'

export default function PhaseBar() {
  const { label, color, days } = usePhase()

  if (!label) return null

  return (
    <div
      className="w-full px-4 py-2 text-center text-xs font-garamond tracking-widest uppercase"
      style={{ backgroundColor: color + '33', color }}
    >
      {label} Phase · Days {days}
    </div>
  )
}
