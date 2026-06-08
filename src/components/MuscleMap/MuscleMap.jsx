import { useRef, useState } from 'react'
import { musclePaths } from './musclePaths'

const ALL_MUSCLES = [
  'muscle_deltoid-left',        'muscle_deltoid-right',
  'muscle_trapezius-left',      'muscle_trapezius-right',
  'muscle_pectorals-left',      'muscle_pectorals-right',
  'muscle_bicep-left',          'muscle_bicep-right',
  'muscle_forearm-inner-left',  'muscle_forearm-outer-left',
  'muscle_forearm-inner-right', 'muscle_forearm-outer-right',
  'muscle_abs-upper-left',      'muscle_abs-upper-right',
  'muscle_abs-mid-left',        'muscle_abs-mid-right',
  'muscle_abs-lower-left',      'muscle_abs-lower-right',
  'muscle_oblique-left',        'muscle_oblique-right',
  'muscle_hip-flexor-left',     'muscle_hip-flexor-right',
  'muscle_tfl-left',            'muscle_tfl-right',
  'muscle_adductor-left',       'muscle_adductor-right',
  'muscle_quad-inner-left',     'muscle_quad-inner-right',
  'muscle_quad-outer-left',     'muscle_quad-outer-right',
  'muscle_calf-left',           'muscle_calf-right',
  'muscle_tibialis-left',       'muscle_tibialis-right',
]

export const MUSCLE_GROUPS = {
  shoulders: ['muscle_deltoid-left', 'muscle_deltoid-right',
              'muscle_trapezius-left', 'muscle_trapezius-right'],
  chest:     ['muscle_pectorals-left', 'muscle_pectorals-right'],
  arms:      ['muscle_bicep-left', 'muscle_bicep-right',
              'muscle_forearm-inner-left', 'muscle_forearm-outer-left',
              'muscle_forearm-inner-right', 'muscle_forearm-outer-right'],
  core:      ['muscle_abs-upper-left', 'muscle_abs-upper-right',
              'muscle_abs-mid-left', 'muscle_abs-mid-right',
              'muscle_abs-lower-left', 'muscle_abs-lower-right',
              'muscle_oblique-left', 'muscle_oblique-right'],
  hips:      ['muscle_hip-flexor-left', 'muscle_hip-flexor-right',
              'muscle_tfl-left', 'muscle_tfl-right',
              'muscle_adductor-left', 'muscle_adductor-right'],
  legs:      ['muscle_quad-inner-left', 'muscle_quad-inner-right',
              'muscle_quad-outer-left', 'muscle_quad-outer-right',
              'muscle_calf-left', 'muscle_calf-right',
              'muscle_tibialis-left', 'muscle_tibialis-right'],
}

export const MUSCLE_LABELS = {
  'muscle_deltoid-left':         'Left Deltoid',
  'muscle_deltoid-right':        'Right Deltoid',
  'muscle_trapezius-left':       'Left Trapezius',
  'muscle_trapezius-right':      'Right Trapezius',
  'muscle_pectorals-left':       'Left Pectoral',
  'muscle_pectorals-right':      'Right Pectoral',
  'muscle_bicep-left':           'Left Bicep',
  'muscle_bicep-right':          'Right Bicep',
  'muscle_forearm-inner-left':   'Left Inner Forearm',
  'muscle_forearm-outer-left':   'Left Outer Forearm',
  'muscle_forearm-inner-right':  'Right Inner Forearm',
  'muscle_forearm-outer-right':  'Right Outer Forearm',
  'muscle_abs-upper-left':       'Upper Abs',
  'muscle_abs-upper-right':      'Upper Abs',
  'muscle_abs-mid-left':         'Mid Abs',
  'muscle_abs-mid-right':        'Mid Abs',
  'muscle_abs-lower-left':       'Lower Abs',
  'muscle_abs-lower-right':      'Lower Abs',
  'muscle_oblique-left':         'Left Oblique',
  'muscle_oblique-right':        'Right Oblique',
  'muscle_hip-flexor-left':      'Left Hip Flexor',
  'muscle_hip-flexor-right':     'Right Hip Flexor',
  'muscle_tfl-left':             'Left TFL',
  'muscle_tfl-right':            'Right TFL',
  'muscle_adductor-left':        'Left Adductor',
  'muscle_adductor-right':       'Right Adductor',
  'muscle_quad-inner-left':      'Left Inner Quad',
  'muscle_quad-inner-right':     'Right Inner Quad',
  'muscle_quad-outer-left':      'Left Outer Quad',
  'muscle_quad-outer-right':     'Right Outer Quad',
  'muscle_calf-left':            'Left Calf',
  'muscle_calf-right':           'Right Calf',
  'muscle_tibialis-left':        'Left Tibialis',
  'muscle_tibialis-right':       'Right Tibialis',
}

export const FOCUS_TO_MUSCLE_IDS = {
  deltoid:      ['muscle_deltoid-left', 'muscle_deltoid-right'],
  trapezius:    ['muscle_trapezius-left', 'muscle_trapezius-right'],
  chest:        ['muscle_pectorals-left', 'muscle_pectorals-right'],
  biceps:       ['muscle_bicep-left', 'muscle_bicep-right'],
  forearms:     ['muscle_forearm-inner-left', 'muscle_forearm-outer-left',
                 'muscle_forearm-inner-right', 'muscle_forearm-outer-right'],
  serratus:     [],
  abs_upper:    ['muscle_abs-upper-left', 'muscle_abs-upper-right',
                 'muscle_abs-mid-left', 'muscle_abs-mid-right',
                 'muscle_abs-lower-left', 'muscle_abs-lower-right'],
  obliques:     ['muscle_oblique-left', 'muscle_oblique-right'],
  hip_flexors:  ['muscle_hip-flexor-left', 'muscle_hip-flexor-right'],
  tfl:          ['muscle_tfl-left', 'muscle_tfl-right'],
  quads_center: ['muscle_quad-inner-left', 'muscle_quad-inner-right',
                 'muscle_adductor-left', 'muscle_adductor-right'],
  quads_outer:  ['muscle_quad-outer-left', 'muscle_quad-outer-right'],
  calves:       ['muscle_calf-left', 'muscle_calf-right'],
  tibialis:     ['muscle_tibialis-left', 'muscle_tibialis-right'],
}

export function focusGroupsToMuscleIds(groups = []) {
  const ids = new Set()
  groups.forEach(g => (FOCUS_TO_MUSCLE_IDS[g] ?? []).forEach(id => ids.add(id)))
  return [...ids]
}

const MUSCLE_FILL = '#D4A0A0'

export default function MuscleMap({
  mode = 'static',
  activeMuscles = [],
  opacityMap = {},
  size = 'md',
  showOutline = true,
  onMusclePress,
}) {
  const activeSet = new Set(activeMuscles)
  const hasActive = activeSet.size > 0
  const hasOpacityMap = Object.keys(opacityMap).length > 0
  const isInteractive = typeof onMusclePress === 'function'
  const debounceRef = useRef(null)
  const [hovered, setHovered] = useState(null)

  const widths = { sm: 120, md: 200 }
  const w = widths[size]
  const containerStyle = w ? { width: w, flexShrink: 0 } : { width: '100%' }

  function getOpacity(id) {
    // ALIGNMENT CHECK — set to true to paint all 34 paths at 0.3 for visual verification
    // if (true) return 0.3
    const active = activeSet.has(id)
    if (mode === 'overview') {
      if (hasOpacityMap) return opacityMap[id] ?? (active ? 0.25 : 0.06)
      if (hasActive) return active ? 0.25 : 0.06
      return 0.25
    }
    if (mode === 'session') {
      if (hasActive) return active ? 1 : 0.06
      return 0
    }
    if (mode === 'explore') {
      return id === hovered ? 0.85 : 0.06
    }
    return 0
  }

  function handlePress(id) {
    if (!isInteractive || debounceRef.current) return
    debounceRef.current = setTimeout(() => { debounceRef.current = null }, 150)
    onMusclePress(id)
  }

  return (
    <div style={containerStyle}>
      {/*
        Single SVG — all layers share viewBox="0 0 1316 1883".
        No <img> tags: they scale independently and drift from the
        inline coordinate space. Everything lives here.
      */}
      <svg
        viewBox="0 0 1316 1883"
        preserveAspectRatio="xMidYMid meet"
        aria-label="muscle map"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1316 / 1883',
          display: 'block',
          overflow: 'hidden',
        }}
      >
        {/* Layer 1: skin fill */}
        <image
          href="/assets/body/body_skin.svg"
          x="0" y="0" width="1316" height="1883"
          preserveAspectRatio="none"
        />

        {/* Layer 2: stroke silhouette with warm glow */}
        {showOutline && (
          <g
            opacity={0.9}
            style={{ filter: 'drop-shadow(0 0 6px rgba(201,168,108,0.7)) drop-shadow(0 0 14px rgba(201,168,108,0.3))' }}
          >
            <image
              href="/assets/body/Body_Silhoutte.svg"
              x="0" y="0" width="1316" height="1883"
              preserveAspectRatio="none"
            />
          </g>
        )}

        {/* Layer 3: muscle paths — pointer-events="visibleFill" for pixel-precise tap */}
        {ALL_MUSCLES.map(id => {
          const d = musclePaths[id]
          if (!d) return null
          const opacity = getOpacity(id)
          return (
            <path
              key={id}
              d={d}
              fill={MUSCLE_FILL}
              opacity={opacity}
              pointerEvents={isInteractive ? 'visibleFill' : 'none'}
              style={{ transition: 'opacity 0.3s ease', cursor: isInteractive ? 'pointer' : 'default' }}
              onClick={() => handlePress(id)}
              onMouseEnter={mode === 'explore' ? () => setHovered(id) : undefined}
              onMouseLeave={mode === 'explore' ? () => setHovered(null) : undefined}
            />
          )
        })}
      </svg>
    </div>
  )
}
