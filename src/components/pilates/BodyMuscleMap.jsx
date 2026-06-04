// Anatomical figure: 1425×2000 RGBA PNG (transparent background)
// Muscle zones are labelled via positioned markers — no SVG path tracing.
// Marker positions are % of image dimensions, calibrated to this specific figure.

const ASPECT = 1425 / 2000  // 0.7125 — used to compute img width from height

// Each zone: display label + marker positions as [x%, y%] of the image
const ZONES = {
  shoulders:  { label: 'Shoulders',  markers: [{ x: 21, y: 21 }, { x: 79, y: 21 }] },
  chest:      { label: 'Chest',      markers: [{ x: 37, y: 28 }, { x: 63, y: 28 }] },
  core:       { label: 'Core',       markers: [{ x: 50, y: 45 }] },
  arms:       { label: 'Arms',       markers: [{ x: 15, y: 38 }, { x: 85, y: 38 }] },
  forearms:   { label: 'Forearms',   markers: [{ x: 13, y: 56 }, { x: 87, y: 56 }] },
  back:       { label: 'Back',       markers: [{ x: 50, y: 23 }] },
  glutes:     { label: 'Glutes',     markers: [{ x: 33, y: 57 }, { x: 67, y: 57 }] },
  quads:      { label: 'Quads',      markers: [{ x: 34, y: 68 }, { x: 66, y: 68 }] },
  hamstrings: { label: 'Hamstrings', markers: [{ x: 34, y: 71 }, { x: 66, y: 71 }] },
  calves:     { label: 'Calves',     markers: [{ x: 35, y: 84 }, { x: 65, y: 84 }] },
}

const ALL_ZONES = Object.keys(ZONES)

export default function BodyMuscleMap({
  activeMuscles   = [],
  secondaryMuscles = [],
  height = 220,
  showLegend = true,
}) {
  const expand = (arr) => arr.includes('full_body') ? ALL_ZONES : arr

  const primary   = expand(activeMuscles)
  const secondary = expand(secondaryMuscles).filter(z => !primary.includes(z))

  function zoneState(zone) {
    if (primary.includes(zone))   return 'primary'
    if (secondary.includes(zone)) return 'secondary'
    return null
  }

  const imgWidth = Math.round(height * ASPECT)
  const legendZones = [...new Set([...primary, ...secondary])].filter(z => ZONES[z])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

      {/* Figure + label markers */}
      <div style={{ position: 'relative', height, width: imgWidth, flexShrink: 0 }}>

        {/* Anatomical image — RGBA PNG, transparent bg shows card behind it */}
        <img
          src="/images/pilates/body-model.png"
          alt=""
          style={{ height: '100%', width: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }}
          draggable={false}
        />

        {/* Zone markers */}
        {Object.entries(ZONES).map(([zone, { label, markers }]) => {
          const state = zoneState(zone)
          if (!state) return null

          const isPrimary = state === 'primary'
          const dotColor  = isPrimary ? '#C4859A' : 'rgba(196,133,154,0.45)'
          const textColor = isPrimary ? '#C4859A' : 'rgba(196,133,154,0.45)'

          return markers.map((pos, i) => {
            const isLeft   = pos.x < 45
            const isRight  = pos.x > 55
            const isCenter = !isLeft && !isRight
            const showLabel = i === 0  // only label the first marker per zone

            return (
              <div
                key={`${zone}-${i}`}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top:  `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  pointerEvents: 'none',
                  flexDirection: isRight ? 'row' : 'row-reverse',
                  transition: 'opacity 0.3s ease',
                }}
              >
                {/* Dot */}
                <div style={{
                  width:        isPrimary ? 5 : 4,
                  height:       isPrimary ? 5 : 4,
                  borderRadius: '50%',
                  background:   dotColor,
                  flexShrink:   0,
                  boxShadow:    isPrimary ? `0 0 7px 2px rgba(196,133,154,0.55)` : 'none',
                  transition:   'all 0.3s ease',
                }}/>

                {/* Label chip — shown only on first marker */}
                {showLabel && (
                  <span style={{
                    fontFamily:     'Cinzel, serif',
                    fontSize:       6.5,
                    letterSpacing:  '0.1em',
                    textTransform:  'uppercase',
                    color:          textColor,
                    whiteSpace:     'nowrap',
                    padding:        '1px 5px',
                    borderRadius:   8,
                    background:     isPrimary ? 'rgba(196,133,154,0.14)' : 'transparent',
                    border:         isPrimary ? '1px solid rgba(196,133,154,0.3)' : 'none',
                    textShadow:     isPrimary ? '0 0 8px rgba(196,133,154,0.6)' : 'none',
                    transition:     'all 0.3s ease',
                  }}>
                    {label}
                  </span>
                )}
              </div>
            )
          })
        })}
      </div>

      {/* Legend pills below figure */}
      {showLegend && legendZones.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
          {legendZones.map(zone => {
            const isPrimary = primary.includes(zone)
            return (
              <span
                key={zone}
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            4,
                  padding:        '3px 10px',
                  borderRadius:   20,
                  background:     isPrimary ? 'rgba(196,133,154,0.14)' : 'rgba(196,133,154,0.07)',
                  border:         `1px solid rgba(196,133,154,${isPrimary ? '0.35' : '0.18'})`,
                  fontFamily:     'Cinzel, serif',
                  fontSize:       8,
                  letterSpacing:  '0.12em',
                  textTransform:  'uppercase',
                  color:          isPrimary ? '#C4859A' : 'rgba(196,133,154,0.55)',
                  transition:     'all 0.3s ease',
                }}
              >
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: '#C9A86C',
                  display: 'inline-block',
                  opacity: isPrimary ? 1 : 0.45,
                }}/>
                {ZONES[zone]?.label ?? zone.replace(/_/g, ' ')}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
