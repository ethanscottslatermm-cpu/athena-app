import { useRef, useEffect, useState } from 'react'
import muscleMapSVG from '../../assets/body/musclemap.svg?raw'

const MUSCLE_IDS = [
  'traps_left', 'traps_right',
  'front_delts_left', 'front_delts_right',
  'chest_left', 'chest_right',
  'biceps_left', 'biceps_right',
  'forearms_left', 'forearms_right',
  'upper_abs_left', 'upper_abs_right',
  'mid_abs_left', 'mid_abs_right',
  'lower_abs_left', 'lower_abs_right',
  'obliques_left', 'obliques_right',
  'v_cut_left', 'v_cut_right',
  'inner_thigh_left', 'inner_thigh_right',
  'quads_left', 'quads_right',
  'outer_quad_left', 'outer_quad_right',
  'inner_quad_left', 'inner_quad_right',
  'shins_left', 'shins_right',
  'calves_inner_left', 'calves_inner_right',
]

const ID_TO_PAIR = {
  traps_left: 'traps',               traps_right: 'traps',
  front_delts_left: 'front_delts',   front_delts_right: 'front_delts',
  chest_left: 'chest',               chest_right: 'chest',
  biceps_left: 'biceps',             biceps_right: 'biceps',
  forearms_left: 'forearms',         forearms_right: 'forearms',
  upper_abs_left: 'upper_abs',       upper_abs_right: 'upper_abs',
  mid_abs_left: 'mid_abs',           mid_abs_right: 'mid_abs',
  lower_abs_left: 'lower_abs',       lower_abs_right: 'lower_abs',
  obliques_left: 'obliques',         obliques_right: 'obliques',
  v_cut_left: 'v_cut',               v_cut_right: 'v_cut',
  inner_thigh_left: 'inner_thigh',   inner_thigh_right: 'inner_thigh',
  quads_left: 'quads',               quads_right: 'quads',
  outer_quad_left: 'outer_quad',     outer_quad_right: 'outer_quad',
  inner_quad_left: 'inner_quad',     inner_quad_right: 'inner_quad',
  shins_left: 'shins',               shins_right: 'shins',
  calves_inner_left: 'calves_inner', calves_inner_right: 'calves_inner',
}

const PAIR_DISPLAY = {
  traps: 'Trapezius',
  front_delts: 'Front Delts',
  chest: 'Pectoralis',
  biceps: 'Biceps',
  forearms: 'Forearms',
  upper_abs: 'Upper Abs',
  mid_abs: 'Mid Abs',
  lower_abs: 'Lower Abs',
  obliques: 'Obliques',
  v_cut: 'Hip Flexors',
  inner_thigh: 'Inner Thigh',
  quads: 'Quadriceps',
  outer_quad: 'Outer Quad',
  inner_quad: 'VMO',
  shins: 'Tibialis',
  calves_inner: 'Gastrocnemius',
}

const REGIONS = [
  { label: 'Upper Body', keys: ['traps', 'front_delts', 'chest', 'biceps', 'forearms'] },
  { label: 'Core',       keys: ['upper_abs', 'mid_abs', 'lower_abs', 'obliques', 'v_cut'] },
  { label: 'Legs',       keys: ['inner_thigh', 'quads', 'outer_quad', 'inner_quad', 'shins', 'calves_inner'] },
]

// Debug fills Figma injects (green, cyan, red, orange, yellow overlays)
const DEBUG_FILLS = new Set(['#34C759', '#30B0C7', '#FF3B30', '#FF9500', '#FFCC00'])

// Handles both <g id="..."> groups and bare <path id="..."> elements
function getGroupPaths(el) {
  if (!el) return []
  if (el.tagName?.toLowerCase() === 'path') return [el]
  return [...el.querySelectorAll('path')]
}

export default function MuscleMap({ activeMuscles = [], onMusclePress = () => {}, showLegend = true }) {
  const containerRef = useRef(null)
  const [hovered, setHovered]   = useState(null)
  // Keep callback stable so the mount effect doesn't need to re-run
  const callbackRef = useRef(onMusclePress)
  useEffect(() => { callbackRef.current = onMusclePress }, [onMusclePress])

  // ── Mount: inject glow filter + wire interaction ─────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const svg = container.querySelector('svg')
    if (!svg) return

    // Make SVG fluid
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')

    // Gold glow filter
    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.prepend(defs)
    }
    defs.innerHTML = `
      <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="#C9A86C" flood-opacity="0.55" result="color"/>
        <feComposite in="color" in2="blur" operator="in" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `

    const cleanups = []

    MUSCLE_IDS.forEach(id => {
      const group = svg.getElementById(id)
      if (!group) return

      // Strip Figma debug color overlays on first paint
      getGroupPaths(group).forEach(path => {
        const fill = path.getAttribute('fill')
        if (fill && fill !== 'none' && DEBUG_FILLS.has(fill.toUpperCase())) {
          path.style.fill        = 'none'
          path.style.fillOpacity = '0'
        }
      })

      group.setAttribute('pointer-events', 'all')
      group.style.cursor = 'pointer'

      const handleActivate = () => {
        const pairKey = ID_TO_PAIR[id]
        if (pairKey) callbackRef.current(pairKey)
      }
      // touchstart: immediate visual feedback before 300ms click delay
      const handleTouchStart = () => setHovered(id)
      const handleTouchEnd   = (e) => {
        e.preventDefault()
        handleActivate()
        setTimeout(() => setHovered(null), 500)
      }
      const handleEnter = () => setHovered(id)
      const handleLeave = () => setHovered(null)

      group.addEventListener('click',      handleActivate)
      group.addEventListener('touchstart', handleTouchStart, { passive: true })
      group.addEventListener('touchend',   handleTouchEnd,   { passive: false })
      group.addEventListener('mouseenter', handleEnter)
      group.addEventListener('mouseleave', handleLeave)

      cleanups.push(() => {
        group.removeEventListener('click',      handleActivate)
        group.removeEventListener('touchstart', handleTouchStart)
        group.removeEventListener('touchend',   handleTouchEnd)
        group.removeEventListener('mouseenter', handleEnter)
        group.removeEventListener('mouseleave', handleLeave)
      })
    })

    return () => cleanups.forEach(fn => fn())
  }, [])

  // ── Active / hover visual state ───────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const svg = container.querySelector('svg')
    if (!svg) return

    MUSCLE_IDS.forEach(id => {
      const group = svg.getElementById(id)
      if (!group) return

      const pairKey = ID_TO_PAIR[id]
      const active  = activeMuscles.includes(pairKey)
      const isHov   = hovered === id

      // Use element.style.* — inline style overrides the SVG's <style> guard
      getGroupPaths(group).forEach(path => {
        if (active) {
          path.style.fill        = 'rgba(201,168,108,0.65)'
          path.style.fillOpacity = '1'
          path.style.stroke      = '#C9A86C'
          path.style.strokeWidth = '1.5'
        } else if (isHov) {
          path.style.fill        = 'rgba(201,168,108,0.25)'
          path.style.fillOpacity = '1'
          path.style.stroke      = 'rgba(201,168,108,0.5)'
          path.style.strokeWidth = '1'
        } else {
          path.style.fill        = 'none'
          path.style.fillOpacity = '0'
          path.style.stroke      = 'none'
          path.style.strokeWidth = ''
        }
      })

      group.style.filter = active ? 'url(#goldGlow)' : 'none'
    })
  }, [activeMuscles, hovered])

  const hoveredPair = hovered ? ID_TO_PAIR[hovered] : null
  const activePairs = new Set(activeMuscles)

  return (
    <div style={{ background: '#140A18' }}>
      {/* ── Map ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1107 / 2311', overflow: 'hidden', contain: 'layout' }}>
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: muscleMapSVG }}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Tooltip */}
        {hoveredPair && (
          <div style={{
            position:     'absolute',
            top:          '1rem',
            left:         '50%',
            transform:    'translateX(-50%)',
            background:   'rgba(20,10,24,0.85)',
            border:       '1px solid #C9A86C',
            borderRadius: 20,
            color:        '#C9A86C',
            fontFamily:   "'Cormorant Garamond', serif",
            fontSize:     13,
            letterSpacing:'0.08em',
            padding:      '4px 14px',
            pointerEvents:'none',
            whiteSpace:   'nowrap',
            zIndex:       10,
          }}>
            {PAIR_DISPLAY[hoveredPair]}
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      {showLegend && (
        <div style={{ padding: '12px 16px 16px' }}>
          {activePairs.size === 0 ? (
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle:  'italic',
              color:      'rgba(242,237,232,0.5)',
              fontSize:   13,
              textAlign:  'center',
              margin:     0,
            }}>
              Tap a muscle to select it
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {REGIONS.flatMap(({ keys }) =>
                keys.filter(k => activePairs.has(k)).map(k => (
                  <span key={k} style={{
                    background:   'rgba(201,168,108,0.12)',
                    border:       '1px solid #C9A86C',
                    borderRadius: 20,
                    color:        '#C9A86C',
                    fontSize:     12,
                    padding:      '4px 14px',
                    fontFamily:   "'Cormorant Garamond', serif",
                  }}>
                    {PAIR_DISPLAY[k]}
                  </span>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
