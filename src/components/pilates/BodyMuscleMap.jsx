import bodyModel from '../../assets/pilates/body-model.png'

const W = 1425
const H = 2000

const ZONE_DEFS = {
  deltoid:      { label: 'Deltoid',              dotPct: [21, 22], linePct: [4, 16],  anchor: 'end' },
  biceps:       { label: 'Bicep',                dotPct: [16, 40], linePct: [4, 37],  anchor: 'end' },
  forearms:     { label: 'Forearm Flexors',       dotPct: [14, 54], linePct: [4, 51],  anchor: 'end' },
  obliques:     { label: 'Obliques',              dotPct: [28, 48], linePct: [4, 45],  anchor: 'end' },
  tfl:          { label: 'Tensor Fasciae Latae',  dotPct: [30, 57], linePct: [4, 60],  anchor: 'end' },
  quads_outer:  { label: 'Vastus Lateralis',      dotPct: [28, 65], linePct: [4, 69],  anchor: 'end' },
  tibialis:     { label: 'Tibialis Anterior',     dotPct: [30, 80], linePct: [4, 83],  anchor: 'end' },
  trapezius:    { label: 'Trapezius',             dotPct: [62, 18], linePct: [96, 14], anchor: 'start' },
  chest:        { label: 'Pectorals',             dotPct: [62, 28], linePct: [96, 25], anchor: 'start' },
  serratus:     { label: 'Serratus Anterior',     dotPct: [65, 38], linePct: [96, 36], anchor: 'start' },
  abs_upper:    { label: 'Rectus Abdominis',      dotPct: [55, 43], linePct: [96, 43], anchor: 'start' },
  hip_flexors:  { label: 'Hip Flexors',           dotPct: [58, 57], linePct: [96, 56], anchor: 'start' },
  quads_center: { label: 'Rectus Femoris',        dotPct: [64, 65], linePct: [96, 69], anchor: 'start' },
  calves:       { label: 'Gastrocnemius',         dotPct: [66, 80], linePct: [96, 84], anchor: 'start' },
}

function pctToCoord(pct, dim) {
  return (pct / 100) * dim
}

export default function BodyMuscleMap({
  activeMuscles = [],
  primaryMuscles = [],
  secondaryMuscles = [],
  showLabels = true,
  height = 280,
}) {
  const primarySet   = new Set([...activeMuscles, ...primaryMuscles])
  const secondarySet = new Set(secondaryMuscles.filter(m => !primarySet.has(m)))

  return (
    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
      <img
        src={bodyModel}
        alt=""
        style={{ height, width: 'auto', display: 'block', userSelect: 'none' }}
        draggable={false}
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id="zone-glow">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {Object.entries(ZONE_DEFS).map(([key, zone]) => {
          const isPrimary   = primarySet.has(key)
          const isSecondary = secondarySet.has(key)
          const isActive    = isPrimary || isSecondary

          const dotX  = pctToCoord(zone.dotPct[0], W)
          const dotY  = pctToCoord(zone.dotPct[1], H)
          const lineX = pctToCoord(zone.linePct[0], W)
          const lineY = pctToCoord(zone.linePct[1], H)

          const glowOpacity  = isPrimary ? 0.55 : isSecondary ? 0.28 : 0
          const lineOpacity  = isPrimary ? 1.0  : isSecondary ? 0.85 : 0.4
          const dotFill      = isActive ? '#C4859A' : 'rgba(242,237,232,0.3)'
          const textFill     = isActive ? '#C4859A' : 'rgba(242,237,232,0.3)'

          return (
            <g key={key} style={{ transition: 'all 0.3s ease' }}>
              {/* Glow ellipse (only when active) */}
              {isActive && (
                <ellipse
                  cx={dotX}
                  cy={dotY}
                  rx={70}
                  ry={50}
                  fill="#C4859A"
                  filter="url(#zone-glow)"
                  opacity={glowOpacity}
                  style={{ transition: 'all 0.3s ease' }}
                />
              )}

              {/* Pointer line */}
              {showLabels && (
                <line
                  x1={dotX}
                  y1={dotY}
                  x2={lineX}
                  y2={lineY}
                  stroke="#F2EDE8"
                  strokeWidth={0.5}
                  opacity={lineOpacity}
                  style={{ transition: 'all 0.3s ease' }}
                />
              )}

              {/* Dot */}
              <circle
                cx={dotX}
                cy={dotY}
                r={18}
                fill={dotFill}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Label text */}
              {showLabels && (
                <text
                  x={lineX}
                  y={lineY}
                  fontFamily="EB Garamond, Cormorant Garamond, serif"
                  fontStyle="italic"
                  fontSize={34}
                  fill={textFill}
                  textAnchor={zone.anchor}
                  dominantBaseline="middle"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {zone.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
