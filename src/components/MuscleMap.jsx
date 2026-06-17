import { useRef, useEffect, useState } from 'react'
import muscleMapSVG from '../assets/body/musclemap.svg?raw'

const MUSCLE_PAIRS = {
  traps:        ['traps_left',        'traps_right'],
  front_delts:  ['front_delts_left',  'front_delts_right'],
  chest:        ['chest_left',        'chest_right'],
  biceps:       ['biceps_left',       'biceps_right'],
  forearms:     ['forearms_left',     'forearms_right'],
  upper_abs:    ['upper_abs_left',    'upper_abs_right'],
  mid_abs:      ['mid_abs_left',      'mid_abs_right'],
  lower_abs:    ['lower_abs_left',    'lower_abs_right'],
  obliques:     ['obliques_left',     'obliques_right'],
  v_cut:        ['v_cut_left',        'v_cut_right'],
  inner_thigh:  ['inner_thigh_left',  'inner_thigh_right'],
  quads:        ['quads_left',        'quads_right'],
  outer_quad:   ['outer_quad_left',   'outer_quad_right'],
  inner_quad:   ['inner_quad_left',   'inner_quad_right'],
  shins:        ['shins_left',        'shins_right'],
  calves_inner: ['calves_inner_left', 'calves_inner_right'],
  wrists:       ['hand_left',         'hand_right'],
  knees:        ['knee_left',         'knee_right'],
  feet:         ['foot_left',         'foot_right'],
}

const ID_TO_PAIR = {}
Object.entries(MUSCLE_PAIRS).forEach(([pair, ids]) => {
  ids.forEach(id => { ID_TO_PAIR[id] = pair })
})

const MUSCLE_COLORS = {
  traps:        '#C9A86C',
  front_delts:  '#E8956D',
  chest:        '#C4859A',
  biceps:       '#A07BC4',
  forearms:     '#7BA8C4',
  upper_abs:    '#8FAF8A',
  mid_abs:      '#7FA08A',
  lower_abs:    '#6F9180',
  obliques:     '#C4A86C',
  v_cut:        '#D4956A',
  inner_thigh:  '#9B7FA0',
  quads:        '#6A8FBF',
  outer_quad:   '#5A7FAF',
  inner_quad:   '#7A9FC9',
  shins:        '#8FAF9A',
  calves_inner: '#7A9F8A',
  wrists:       '#A09080',
  knees:        '#A09080',
  feet:         '#A09080',
}

const MUSCLE_NAMES = {
  traps:        'Trapezius',
  front_delts:  'Front Delts',
  chest:        'Pectoralis',
  biceps:       'Biceps',
  forearms:     'Forearms',
  upper_abs:    'Upper Abs',
  mid_abs:      'Mid Abs',
  lower_abs:    'Lower Abs',
  obliques:     'Obliques',
  v_cut:        'Hip Flexors',
  inner_thigh:  'Inner Thigh',
  quads:        'Quadriceps',
  outer_quad:   'Outer Quad',
  inner_quad:   'VMO',
  shins:        'Tibialis',
  calves_inner: 'Gastrocnemius',
  wrists:       'Wrists',
  knees:        'Knees',
  feet:         'Feet',
}

export default function MuscleMap({
  activeMuscles = [],
  onMusclePress = () => {},
  interactive   = true,
  showTooltip   = true,
  showLegend    = true,
}) {
  const containerRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const callbackRef = useRef(onMusclePress)
  useEffect(() => { callbackRef.current = onMusclePress }, [onMusclePress])

  // ── Mount: render SVG + wire events ──────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = muscleMapSVG

    const svg = container.querySelector('svg')
    if (!svg) return

    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.style.display = 'block'

    // Inject glow filter
    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.prepend(defs)
    }
    defs.innerHTML += `
      <filter id="muscleGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feFlood flood-color="var(--glow-color, #C9A86C)" flood-opacity="0.6" result="color"/>
        <feComposite in="color" in2="blur" operator="in" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `

    if (!interactive) return

    Object.entries(MUSCLE_PAIRS).forEach(([pairKey, ids]) => {
      ids.forEach(id => {
        const group = svg.getElementById(id)
        if (!group) return

        group.setAttribute('pointer-events', 'all')
        group.style.cursor = 'pointer'

        const activate = () => callbackRef.current(pairKey)
        const handleTouchStart = () => setHovered(pairKey)
        const handleTouchEnd   = (e) => { e.preventDefault(); activate(); setTimeout(() => setHovered(null), 500) }
        const handleEnter      = () => setHovered(pairKey)
        const handleLeave      = () => setHovered(null)

        group.addEventListener('click',      activate)
        group.addEventListener('touchstart', handleTouchStart, { passive: true })
        group.addEventListener('touchend',   handleTouchEnd,   { passive: false })
        group.addEventListener('mouseenter', handleEnter)
        group.addEventListener('mouseleave', handleLeave)
      })
    })
  }, [interactive])

  // ── Update: apply visual state whenever activeMuscles/hovered changes ────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const svg = container.querySelector('svg')
    if (!svg) return

    Object.entries(MUSCLE_PAIRS).forEach(([pairKey, ids]) => {
      const color  = MUSCLE_COLORS[pairKey]
      const active = activeMuscles.includes(pairKey)
      const isHov  = hovered === pairKey

      ids.forEach(id => {
        const group = svg.getElementById(id)
        if (!group) return

        group.querySelectorAll('path, rect, circle, ellipse').forEach(el => {
          el.style.transition = 'fill-opacity 0.18s ease, stroke-opacity 0.18s ease'
          if (active) {
            el.setAttribute('fill',           color)
            el.setAttribute('fill-opacity',   '1')
            el.setAttribute('stroke',         color)
            el.setAttribute('stroke-opacity', '1')
            el.setAttribute('stroke-width',   '1.8')
          } else if (isHov) {
            el.setAttribute('fill',           color)
            el.setAttribute('fill-opacity',   '0.4')
            el.setAttribute('stroke',         color)
            el.setAttribute('stroke-opacity', '0.75')
            el.setAttribute('stroke-width',   '1.2')
          } else {
            el.setAttribute('fill',           color)
            el.setAttribute('fill-opacity',   '0.15')
            el.setAttribute('stroke',         color)
            el.setAttribute('stroke-opacity', '0.3')
            el.setAttribute('stroke-width',   '0.8')
          }
        })

        if (active) {
          group.style.setProperty('--glow-color', color)
          group.setAttribute('filter', 'url(#muscleGlow)')
        } else {
          group.style.removeProperty('--glow-color')
          group.removeAttribute('filter')
        }
      })
    })
  }, [activeMuscles, hovered])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Tooltip */}
      {showTooltip && hovered && (
        <div style={{
          position:      'absolute',
          top:           '0.75rem',
          left:          '50%',
          transform:     'translateX(-50%)',
          background:    'rgba(20,10,24,0.92)',
          border:        `1px solid ${MUSCLE_COLORS[hovered]}`,
          borderRadius:  '20px',
          color:         MUSCLE_COLORS[hovered],
          fontFamily:    "'Cormorant Garamond', serif",
          fontSize:      '13px',
          letterSpacing: '0.08em',
          padding:       '4px 16px',
          pointerEvents: 'none',
          whiteSpace:    'nowrap',
          zIndex:        10,
        }}>
          {MUSCLE_NAMES[hovered]}
        </div>
      )}

      {/* SVG container */}
      <div
        ref={containerRef}
        style={{ width: '100%', aspectRatio: '973 / 2170', overflow: 'hidden' }}
      />

      {/* Active muscle chips */}
      {showLegend && activeMuscles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0.75rem 0 0' }}>
          {activeMuscles.map(key => (
            <span key={key} style={{
              background:    `${MUSCLE_COLORS[key]}1A`,
              border:        `1px solid ${MUSCLE_COLORS[key]}`,
              borderRadius:  '20px',
              color:         MUSCLE_COLORS[key],
              fontSize:      '11px',
              padding:       '3px 12px',
              fontFamily:    "'Tenor Sans', sans-serif",
              letterSpacing: '0.04em',
            }}>
              {MUSCLE_NAMES[key]}
            </span>
          ))}
        </div>
      )}

      {/* Empty state */}
      {showLegend && activeMuscles.length === 0 && interactive && (
        <p style={{
          textAlign:  'center',
          color:      'rgba(242,237,232,0.4)',
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle:  'italic',
          fontSize:   '13px',
          margin:     '0.75rem 0 0',
        }}>
          Tap a muscle to select it
        </p>
      )}
    </div>
  )
}
