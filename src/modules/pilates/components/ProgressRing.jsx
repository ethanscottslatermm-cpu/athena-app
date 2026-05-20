export default function ProgressRing({ value = 0, max = 1, size = 96, strokeWidth = 7, color = '#D4A0A0' }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(1, max > 0 ? value / max : 0))

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(59,51,48,0.1)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="font-cinzel text-rose leading-none" style={{ fontSize: Math.round(size * 0.22) }}>
          {value}
        </span>
        <span className="font-garamond text-brown/40" style={{ fontSize: Math.round(size * 0.13) }}>
          of {max}
        </span>
      </div>
    </div>
  )
}
