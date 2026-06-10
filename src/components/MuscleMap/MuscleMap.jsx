import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import bodySVGRaw from '../../assets/body/Main_Body.svg?raw'
import musclesSVGRaw from '../../assets/body/muscles.svg?raw'

const MUSCLE_PAIRS = {
  traps:        ['traps_left', 'traps_right'],
  front_delts:  ['front_delts_left', 'front_delts_right'],
  chest:        ['chest_left', 'chest_right'],
  biceps:       ['biceps_left', 'biceps_right'],
  forearms:     ['forearms_left', 'forearms_right'],
  upper_abs:    ['upper_abs_left', 'upper_abs_right'],
  mid_abs:      ['mid_abs_left', 'mid_abs_right'],
  lower_abs:    ['lower_abs_left', 'lower_abs_right'],
  obliques:     ['obliques_left', 'obliques_right'],
  v_cut:        ['v_cut_left', 'v_cut_right'],
  inner_thigh:  ['inner_thigh_left', 'inner_thigh_right'],
  quads:        ['quads_left', 'quads_right'],
  outer_quad:   ['outer_quad_left', 'outer_quad_right'],
  inner_quad:   ['inner_quad_left', 'inner_quad_right'],
  shins:        ['shins_left', 'shins_right'],
  calves_inner: ['calves_inner_left', 'calves_inner_right'],
}

const ALL_MUSCLE_IDS = new Set(Object.values(MUSCLE_PAIRS).flat())

const ID_TO_PAIR_KEY = {}
Object.entries(MUSCLE_PAIRS).forEach(([key, ids]) => {
  ids.forEach(id => { ID_TO_PAIR_KEY[id] = key })
})

const DISPLAY_NAMES = {
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
}

const LEGEND_GROUPS = [
  { label: 'Upper Body', keys: ['traps', 'front_delts', 'chest', 'biceps', 'forearms'] },
  { label: 'Core',       keys: ['upper_abs', 'mid_abs', 'lower_abs', 'obliques', 'v_cut'] },
  { label: 'Legs',       keys: ['inner_thigh', 'quads', 'outer_quad', 'inner_quad', 'shins', 'calves_inner'] },
]

const GLOW_FILTER = `<filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="8" result="blur"/>
  <feFlood floodColor="#C9A86C" floodOpacity="0.55" result="color"/>
  <feComposite in="color" in2="blur" operator="in" result="glow"/>
  <feMerge>
    <feMergeNode in="glow"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>`

// Processed once at runtime, cached across renders
let _bodyContent = null
let _musclesContent = null

function getBodyContent() {
  if (_bodyContent !== null) return _bodyContent
  const parser = new DOMParser()
  const doc = parser.parseFromString(bodySVGRaw, 'image/svg+xml')
  _bodyContent = doc.documentElement.innerHTML
  return _bodyContent
}

function getMusclesContent() {
  if (_musclesContent !== null) return _musclesContent
  const parser = new DOMParser()
  const doc = parser.parseFromString(musclesSVGRaw, 'image/svg+xml')
  const svg = doc.documentElement

  // Inject gold glow filter
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.insertBefore(defs, svg.firstChild)
  }
  defs.innerHTML += GLOW_FILTER

  // Strip all Figma debug fills/strokes so React state drives appearance
  ALL_MUSCLE_IDS.forEach(id => {
    const g = svg.getElementById(id)
    if (!g) return
    g.querySelectorAll('path, polygon, circle, ellipse, rect, polyline').forEach(el => {
      el.setAttribute('fill', 'inherit')
      el.removeAttribute('fill-opacity')
      el.setAttribute('stroke', 'inherit')
      el.setAttribute('stroke-width', 'inherit')
      el.removeAttribute('stroke-opacity')
    })
  })

  _musclesContent = svg.innerHTML
  return _musclesContent
}

export default function MuscleMap({ activeMuscles = [], onMusclePress, showLegend = true }) {
  const [hoveredKey, setHoveredKey] = useState(null)
  const overlayRef = useRef(null)

  const bodyContent    = useMemo(() => getBodyContent(), [])
  const musclesContent = useMemo(() => getMusclesContent(), [])

  // Attach hover listeners to each muscle group element after mount
  useLayoutEffect(() => {
    const svg = overlayRef.current
    if (!svg) return

    const cleanups = []

    ALL_MUSCLE_IDS.forEach(id => {
      const g = svg.getElementById(id)
      if (!g) return

      g.style.cursor = 'pointer'
      g.style.transition = 'fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease'

      const onEnter = () => setHoveredKey(ID_TO_PAIR_KEY[id])
      const onLeave = () => setHoveredKey(null)

      g.addEventListener('mouseenter', onEnter)
      g.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        g.removeEventListener('mouseenter', onEnter)
        g.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => cleanups.forEach(fn => fn())
  }, [musclesContent])

  // Re-apply fill/stroke styles whenever active set or hover changes
  useEffect(() => {
    const svg = overlayRef.current
    if (!svg) return

    const activeIds = new Set(
      (activeMuscles ?? []).flatMap(key => MUSCLE_PAIRS[key] ?? [])
    )

    ALL_MUSCLE_IDS.forEach(id => {
      const g = svg.getElementById(id)
      if (!g) return

      const isActive  = activeIds.has(id)
      const isHovered = hoveredKey === ID_TO_PAIR_KEY[id]

      if (isActive) {
        g.style.fill        = 'rgba(201,168,108,0.65)'
        g.style.stroke      = '#C9A86C'
        g.style.strokeWidth = '1.5px'
        g.style.filter      = 'url(#goldGlow)'
      } else if (isHovered) {
        g.style.fill        = 'rgba(201,168,108,0.2)'
        g.style.stroke      = 'rgba(201,168,108,0.45)'
        g.style.strokeWidth = '1px'
        g.style.filter      = 'none'
      } else {
        g.style.fill        = 'transparent'
        g.style.stroke      = 'transparent'
        g.style.strokeWidth = '0'
        g.style.filter      = 'none'
      }
    })
  }, [activeMuscles, hoveredKey])

  function handleClick(e) {
    const g = e.target.closest('g[id]')
    if (!g || !ALL_MUSCLE_IDS.has(g.id)) return
    const pairKey = ID_TO_PAIR_KEY[g.id]
    if (pairKey) onMusclePress?.(pairKey)
  }

  const activeMuscleSet = new Set(activeMuscles ?? [])
  const legendSections = LEGEND_GROUPS
    .map(({ label, keys }) => ({ label, active: keys.filter(k => activeMuscleSet.has(k)) }))
    .filter(({ active }) => active.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Map container — shared 1387×1848 coordinate space */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1387 / 1848' }}>

        {/* Hover tooltip */}
        {hoveredKey && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              background: 'rgba(20,10,24,0.85)',
              border: '1px solid #C9A86C',
              borderRadius: 20,
              color: '#C9A86C',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 13,
              letterSpacing: '0.08em',
              padding: '4px 14px',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {DISPLAY_NAMES[hoveredKey]}
          </div>
        )}

        {/* Layer 1: illustrated body silhouette (base) */}
        <svg
          viewBox="0 0 1387 1848"
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: bodyContent }}
        />

        {/* Layer 2: interactive muscle overlay */}
        <svg
          ref={overlayRef}
          viewBox="0 0 1387 1848"
          preserveAspectRatio="xMidYMid meet"
          onClick={handleClick}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'all',
          }}
          dangerouslySetInnerHTML={{ __html: musclesContent }}
        />
      </div>

      {/* Legend */}
      {showLegend && (
        <div
          style={{
            padding: '12px 16px 20px',
            background: '#140A18',
            borderTop: '1px solid rgba(201,168,108,0.15)',
            minHeight: 60,
          }}
        >
          {legendSections.length > 0 ? (
            legendSections.map(({ label, active }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <p
                  style={{
                    fontFamily: 'Tenor Sans, sans-serif',
                    fontSize: 9,
                    color: 'rgba(201,168,108,0.4)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    margin: '0 0 6px',
                  }}
                >
                  {label}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {active.map(key => (
                    <span
                      key={key}
                      style={{
                        background: 'rgba(201,168,108,0.12)',
                        border: '1px solid #C9A86C',
                        borderRadius: 20,
                        color: '#C9A86C',
                        fontSize: 12,
                        fontFamily: 'Tenor Sans, sans-serif',
                        padding: '3px 10px',
                      }}
                    >
                      {DISPLAY_NAMES[key]}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'rgba(242,237,232,0.5)',
                textAlign: 'center',
                margin: '8px 0 0',
              }}
            >
              Tap a muscle to select it
            </p>
          )}
        </div>
      )}
    </div>
  )
}
