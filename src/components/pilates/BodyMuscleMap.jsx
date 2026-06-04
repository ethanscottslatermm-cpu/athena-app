// SVG viewBox="0 0 160 460" — update if body-model.png has a different aspect ratio.
// Place the silhouette PNG at: public/images/pilates/body-model.png

const VIEWBOX_W = 160
const VIEWBOX_H = 460

// Each zone is an array of SVG path strings (bilateral zones have two paths).
// Paths trace an approximate standing female figure in anatomical neutral position.
const MUSCLE_PATHS = {
  shoulders: [
    // left deltoid
    'M 30,64 C 18,59 11,69 13,84 C 15,97 26,102 40,95 C 50,89 54,77 47,66 Z',
    // right deltoid
    'M 130,64 C 142,59 149,69 147,84 C 145,97 134,102 120,95 C 110,89 106,77 113,66 Z',
  ],
  chest: [
    'M 55,70 C 46,79 44,100 46,122 C 48,140 58,150 80,152 C 102,150 112,140 114,122 C 116,100 114,79 105,70 C 97,64 88,62 80,62 C 72,62 63,64 55,70 Z',
  ],
  core: [
    'M 50,150 C 43,162 41,180 43,200 C 45,216 54,224 80,226 C 106,224 115,216 117,200 C 119,180 117,162 110,150 C 102,144 91,141 80,141 C 69,141 58,144 50,150 Z',
  ],
  arms: [
    // left bicep / upper arm
    'M 15,75 C 7,82 3,100 5,122 C 7,140 16,148 29,144 C 38,140 42,128 40,108 C 38,89 29,74 20,73 Z',
    // right bicep / upper arm
    'M 145,75 C 153,82 157,100 155,122 C 153,140 144,148 131,144 C 122,140 118,128 120,108 C 122,89 131,74 140,73 Z',
  ],
  forearms: [
    // left forearm
    'M 7,146 C 1,156 -1,178 1,202 C 3,220 12,228 25,224 C 34,220 38,208 36,186 C 34,165 25,147 16,145 Z',
    // right forearm
    'M 153,146 C 159,156 161,178 159,202 C 157,220 148,228 135,224 C 126,220 122,208 124,186 C 126,165 135,147 144,145 Z',
  ],
  // back uses the chest zone as a placeholder (front-view silhouette)
  back: [
    'M 55,70 C 46,79 44,100 46,122 C 48,140 58,150 80,152 C 102,150 112,140 114,122 C 116,100 114,79 105,70 C 97,64 88,62 80,62 C 72,62 63,64 55,70 Z',
    'M 50,150 C 43,162 41,180 43,200 C 45,216 54,224 80,226 C 106,224 115,216 117,200 C 119,180 117,162 110,150 C 102,144 91,141 80,141 C 69,141 58,144 50,150 Z',
  ],
  glutes: [
    'M 46,222 C 36,232 32,250 34,268 C 36,283 46,292 80,294 C 114,292 124,283 126,268 C 128,250 124,232 114,222 C 104,215 92,212 80,212 C 68,212 56,215 46,222 Z',
  ],
  quads: [
    // left front thigh
    'M 37,290 C 28,302 24,324 26,348 C 28,366 38,375 56,370 C 67,366 71,353 69,332 C 67,311 58,293 46,288 Z',
    // right front thigh
    'M 123,290 C 132,302 136,324 134,348 C 132,366 122,375 104,370 C 93,366 89,353 91,332 C 93,311 102,293 114,288 Z',
  ],
  // hamstrings share the quad zone (front-view figure — rear muscles shown as overlay)
  hamstrings: [
    'M 37,290 C 28,302 24,324 26,348 C 28,366 38,375 56,370 C 67,366 71,353 69,332 C 67,311 58,293 46,288 Z',
    'M 123,290 C 132,302 136,324 134,348 C 132,366 122,375 104,370 C 93,366 89,353 91,332 C 93,311 102,293 114,288 Z',
  ],
  calves: [
    // left calf
    'M 28,372 C 22,384 20,406 22,428 C 24,444 33,452 48,448 C 59,444 63,432 61,410 C 59,390 50,373 39,371 Z',
    // right calf
    'M 132,372 C 138,384 140,406 138,428 C 136,444 127,452 112,448 C 101,444 97,432 99,410 C 101,390 110,373 121,371 Z',
  ],
}

const ALL_ZONES = Object.keys(MUSCLE_PATHS)

export default function BodyMuscleMap({
  activeMuscles = [],
  secondaryMuscles = [],
  height = 220,
  showLegend = true,
}) {
  const expanded = (arr) =>
    arr.includes('full_body') ? ALL_ZONES : arr

  const primary   = expanded(activeMuscles)
  const secondary = expanded(secondaryMuscles).filter(z => !primary.includes(z))

  function zoneStyle(zone) {
    if (primary.includes(zone))   return { opacity: 0.55, filter: 'url(#muscle-glow)' }
    if (secondary.includes(zone)) return { opacity: 0.28, filter: 'url(#muscle-glow)' }
    return { opacity: 0 }
  }

  const legendZones = [...new Set([...primary, ...secondary])]
    .filter(z => z !== 'full_body' && MUSCLE_PATHS[z])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

      {/* Figure wrapper — PNG base + SVG overlay scale together */}
      <div style={{ position: 'relative', height, display: 'inline-block' }}>
        <img
          src="/images/pilates/body-model.png"
          alt=""
          style={{ height: '100%', width: 'auto', display: 'block', userSelect: 'none' }}
          draggable={false}
        />

        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <defs>
            {/* Soft glow filter — extends slightly beyond path boundary */}
            <filter id="muscle-glow" x="-25%" y="-10%" width="150%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {Object.entries(MUSCLE_PATHS).map(([zone, paths]) => {
            const s = zoneStyle(zone)
            return paths.map((d, i) => (
              <path
                key={`${zone}-${i}`}
                d={d}
                fill="#C4859A"
                opacity={s.opacity}
                filter={s.filter}
                style={{ transition: 'opacity 0.3s ease-in-out' }}
              />
            ))
          })}
        </svg>
      </div>

      {/* Legend pills */}
      {showLegend && legendZones.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
          {legendZones.map(zone => {
            const isPrimary = primary.includes(zone)
            return (
              <span
                key={zone}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: isPrimary
                    ? 'rgba(196,133,154,0.14)'
                    : 'rgba(196,133,154,0.07)',
                  border: `1px solid rgba(196,133,154,${isPrimary ? '0.35' : '0.2'})`,
                  fontFamily: 'Cinzel, serif',
                  fontSize: 8,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isPrimary ? '#C4859A' : 'rgba(196,133,154,0.6)',
                  transition: 'all 0.3s ease',
                }}
              >
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: '#C9A86C',
                  display: 'inline-block',
                  opacity: isPrimary ? 1 : 0.5,
                }} />
                {zone.replace(/_/g, ' ')}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
