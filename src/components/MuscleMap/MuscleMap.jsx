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
const PINK_FILTER = 'sepia(1) saturate(5) hue-rotate(312deg) brightness(0.88)'

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
      filter = PINK_FILTER
      if (hasOpacityMap) {
        opacity = opacityMap[id] ?? (isActive ? 0.25 : 0.05)
      } else if (hasActive) {
        opacity = isActive ? 0.25 : 0.05
      } else {
        opacity = 0.25
      }
    } else if (mode === 'session') {
      if (hasActive) {
        if (isActive) { opacity = 1; filter = PINK_FILTER }
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
              opacity: 1,
              filter: 'brightness(0.42) contrast(2) drop-shadow(0 0 4px rgba(59,51,48,0.35))',
              userSelect: 'none',
            }}
          />
        )}
        {/* Foot outlines + lower calf connectors — supplements the faint silhouette in the ankle/foot region */}
        <svg
          viewBox="0 0 1316 1883"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <g stroke="rgba(59,51,48,0.7)" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* ── Left foot outline ─────────────────────────────────── */}
            <path d="M 543 1662 Q 520 1680 518 1720 Q 516 1760 520 1800 Q 524 1845 540 1860 Q 552 1868 560 1867 Q 572 1866 580 1858 Q 593 1843 594 1800 Q 595 1760 590 1720 Q 586 1680 570 1662 Z" />
            {/* Left outer edge: calf bottom → foot top-right */}
            <path d="M 600 1584 C 605 1615 597 1649 570 1662" />
            {/* Left inner edge: tibialis bottom → foot top-left */}
            <path d="M 565 1658 Q 554 1662 543 1662" />
            {/* ── Right foot outline ─────────────────────────────────── */}
            <path d="M 710 1662 Q 689 1680 686 1720 Q 683 1760 686 1800 Q 689 1845 705 1860 Q 716 1868 724 1867 Q 736 1866 748 1858 Q 762 1843 764 1800 Q 765 1760 762 1720 Q 758 1680 745 1662 Z" />
            {/* Right inner edge: calf-right bottom → foot top-left */}
            <path d="M 675 1589 C 672 1620 679 1649 710 1662" />
            {/* Right outer edge: tibialis-right bottom → foot top-right */}
            <path d="M 717 1658 Q 731 1661 745 1662" />
          </g>
        </svg>

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
