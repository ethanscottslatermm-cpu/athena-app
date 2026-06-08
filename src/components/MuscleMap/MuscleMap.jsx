const ALL_MUSCLES = [
  'muscle_deltoid-left',       'muscle_deltoid-right',
  'muscle_trapezius-left',     'muscle_trapezius-right',
  'muscle_pectorals-left',     'muscle_pectorals-right',
  'muscle_bicep-left',         'muscle_bicep-right',
  'muscle_forearm-inner-left', 'muscle_forearm-outer-left',
  'muscle_forearm-inner-right','muscle_forearm-outer-right',
  'muscle_abs-upper-left',     'muscle_abs-upper-right',
  'muscle_abs-mid-left',       'muscle_abs-mid-right',
  'muscle_abs-lower-left',     'muscle_abs-lower-right',
  'muscle_oblique-left',       'muscle_oblique-right',
  'muscle_hip-flexor-left',    'muscle_hip-flexor-right',
  'muscle_tfl-left',           'muscle_tfl-right',
  'muscle_adductor-left',      'muscle_adductor-right',
  'muscle_quad-inner-left',    'muscle_quad-inner-right',
  'muscle_quad-outer-left',    'muscle_quad-outer-right',
  'muscle_calf-left',          'muscle_calf-right',
  'muscle_tibialis-left',      'muscle_tibialis-right',
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

// Map legacy focus-area group keys → muscle_ IDs
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

const SIZE_WIDTHS = { sm: 120, md: 200 }
const GOLD_FILTER = 'sepia(1) saturate(3) hue-rotate(5deg) brightness(1.1)'

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

  const width = SIZE_WIDTHS[size]
  const containerStyle = width
    ? { width, flexShrink: 0 }
    : { width: '100%' }

  function getMuscleStyle(id) {
    const isActive = activeSet.has(id)
    let opacity = 0
    let filter = 'none'

    if (mode === 'overview') {
      filter = GOLD_FILTER
      if (hasOpacityMap) {
        opacity = opacityMap[id] ?? (isActive ? 0.25 : 0.05)
      } else if (hasActive) {
        opacity = isActive ? 0.25 : 0.05
      } else {
        opacity = 0.25
      }
    } else if (mode === 'session') {
      if (hasActive) {
        if (isActive) { opacity = 1; filter = GOLD_FILTER }
        else { opacity = 0.05 }
      }
    }
    // static: opacity stays 0

    return {
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: isInteractive ? 'auto' : 'none',
      opacity,
      filter,
      transition: 'opacity 0.3s ease',
      userSelect: 'none',
    }
  }

  return (
    <div style={containerStyle}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1316 / 1883' }}>
        {showOutline && (
          <img
            src="/assets/body/Body_Silhoutte.svg"
            alt=""
            draggable={false}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none',
              opacity: 0.85,
              filter: 'drop-shadow(0 0 6px rgba(201,168,108,0.6)) drop-shadow(0 0 12px rgba(201,168,108,0.3))',
              userSelect: 'none',
            }}
          />
        )}
        {ALL_MUSCLES.map(id => (
          <img
            key={id}
            src={`/assets/muscles/${id}.svg`}
            alt=""
            draggable={false}
            onClick={isInteractive ? () => onMusclePress(id) : undefined}
            style={getMuscleStyle(id)}
          />
        ))}
      </div>
    </div>
  )
}
