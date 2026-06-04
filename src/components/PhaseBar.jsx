import { usePhase } from '../hooks/usePhase'

export default function PhaseBar() {
  const { label, color, days } = usePhase()

  if (!label) return null

  return (
    <div style={{ padding: '0 16px 12px' }}>
      <div
        style={{
          borderRadius: 12,
          backgroundColor: color + '22',
          border: `1px solid ${color}44`,
          padding: '7px 14px',
          textAlign: 'center',
          fontFamily: 'Cinzel, serif',
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: color,
        }}
      >
        {label} Phase · Days {days}
      </div>
    </div>
  )
}
