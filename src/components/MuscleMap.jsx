import { useRef, useEffect, useState } from 'react'
import muscleMapSVG from '../assets/body/musclemap.svg?raw'
import {
  MUSCLE_PAIRS, MUSCLE_COLORS, MUSCLE_NAMES, MUSCLE_ANATOMICAL, HEATMAP_OPACITY,
} from '../constants/muscleMap'

const PULSE_STYLE = `
@keyframes musclePulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.7; }
}
`

// Muscles too small or non-muscular to label cleanly
const SKIP_LABELS = new Set(['wrists', 'knees', 'feet'])
// Min SVG-unit² bounding box area to warrant a label
const LABEL_MIN_AREA = 3000

function addMuscleLabels(svg) {
  const existing = svg.getElementById('muscle-labels')
  if (existing) existing.remove()

  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.id = 'muscle-labels'
  g.setAttribute('pointer-events', 'none')

  Object.entries(MUSCLE_PAIRS).forEach(([pairKey, ids]) => {
    if (SKIP_LABELS.has(pairKey)) return

    const color = MUSCLE_COLORS[pairKey] ?? '#C9A86C'
    const label = MUSCLE_ANATOMICAL[pairKey] ?? MUSCLE_NAMES[pairKey] ?? pairKey

    // Use only the first id for label anchor (one label per pair)
    const el = svg.getElementById(ids[0])
    if (!el) return

    let bbox
    try { bbox = el.getBBox() } catch { return }
    if (!bbox || bbox.width === 0 || bbox.height === 0) return
    if (bbox.width * bbox.height < LABEL_MIN_AREA) return

    const cx = Math.round(bbox.x + bbox.width * 0.5)
    const cy = Math.round(bbox.y + bbox.height * 0.5)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', String(cx))
    text.setAttribute('y', String(cy))
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dominant-baseline', 'middle')
    text.setAttribute('font-family', "'Cinzel', serif")
    text.setAttribute('font-size', '34')
    text.setAttribute('letter-spacing', '1.5')
    text.setAttribute('fill', color)
    text.setAttribute('fill-opacity', '0.92')
    // Dark outline for legibility on any background
    text.setAttribute('paint-order', 'stroke')
    text.setAttribute('stroke', 'rgba(12,6,18,0.75)')
    text.setAttribute('stroke-width', '7')
    text.setAttribute('stroke-linejoin', 'round')
    text.textContent = label

    g.appendChild(text)
  })

  svg.appendChild(g)
}

export default function MuscleMap({
  activeMuscles    = [],
  onMusclePress    = () => {},
  interactive      = true,
  showTooltip      = true,
  showLegend       = true,
  showLabels       = false,
  containerStyle   = null,
  suggestedMuscles = [],
  phaseColor       = null,
  heatmap          = null,
  onHoverChange    = null,
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

    svg.setAttribute('viewBox', '0 0 882 1866')
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.style.display  = 'block'
    svg.style.overflow = 'visible'

    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.prepend(defs)
    }
    defs.innerHTML += `
      <filter id="muscleGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="var(--glow-color, #C9A86C)" flood-opacity="0.85" result="color"/>
        <feComposite in="color" in2="blur" operator="in" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="muscleSuggestGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="var(--glow-color, #8FAF8A)" flood-opacity="0.35" result="color"/>
        <feComposite in="color" in2="blur" operator="in" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `

    if (heatmap) {
      Object.entries(MUSCLE_PAIRS).forEach(([pairKey, ids]) => {
        ids.forEach(id => {
          const group = svg.getElementById(id)
          if (!group) return
          group.setAttribute('pointer-events', 'visiblePainted')
          group.style.cursor = 'default'
          group.addEventListener('mouseenter', () => {
            setHovered(pairKey)
            onHoverChange?.(pairKey)
          })
          group.addEventListener('mouseleave', () => {
            setHovered(null)
            onHoverChange?.(null)
          })
        })
      })
      return
    }

    if (interactive) {
      Object.entries(MUSCLE_PAIRS).forEach(([pairKey, ids]) => {
        ids.forEach(id => {
          const group = svg.getElementById(id)
          if (!group) return

          group.setAttribute('pointer-events', 'visiblePainted')
          group.style.cursor = 'pointer'

          const activate         = () => callbackRef.current(pairKey)
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
    }

    if (showLabels) addMuscleLabels(svg)
  }, [interactive, !!heatmap, showLabels])

  // ── Update: apply visual state ────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const svg = container.querySelector('svg')
    if (!svg) return

    Object.entries(MUSCLE_PAIRS).forEach(([pairKey, ids]) => {
      const color    = MUSCLE_COLORS[pairKey]
      const active   = activeMuscles.includes(pairKey)
      const isHov    = hovered === pairKey
      const isSugg   = suggestedMuscles.includes(pairKey) && !active

      ids.forEach(id => {
        const group = svg.getElementById(id)
        if (!group) return

        // ── Heatmap mode ──
        if (heatmap) {
          const opacity = heatmap[pairKey] ?? 0.06
          group.querySelectorAll('*').forEach(el => {
            if (el.tagName.toLowerCase() === 'g') return
            el.setAttribute('fill',           color)
            el.style.fill          = color
            el.setAttribute('fill-opacity',   String(opacity))
            el.style.fillOpacity   = String(opacity)
            el.setAttribute('stroke',         color)
            el.style.stroke        = color
            el.setAttribute('stroke-opacity', String(Math.min(opacity * 0.8, 1)))
            el.style.strokeOpacity = String(Math.min(opacity * 0.8, 1))
            el.setAttribute('stroke-width',   '0.8')
          })
          group.removeAttribute('filter')
          group.style.animation = 'none'
          return
        }

        // ── Interactive mode ──
        group.querySelectorAll('*').forEach(el => {
          if (el.tagName === 'g' || el.tagName === 'G') return
          el.style.transition = 'fill-opacity 0.18s ease, stroke-opacity 0.18s ease'

          let fillOp, strokeOp, strokeW
          if (active)        { fillOp = '1';    strokeOp = '1';    strokeW = '2.5' }
          else if (isHov)    { fillOp = '0.55'; strokeOp = '0.9';  strokeW = '1.3' }
          else if (isSugg)   { fillOp = '0.4';  strokeOp = '0.65'; strokeW = '1.0' }
          else               { fillOp = '0.22'; strokeOp = '0.38'; strokeW = '0.8' }

          el.setAttribute('fill',           color)
          el.setAttribute('fill-opacity',   fillOp)
          el.setAttribute('stroke',         color)
          el.setAttribute('stroke-opacity', strokeOp)
          el.setAttribute('stroke-width',   strokeW)
          el.style.fill          = color
          el.style.fillOpacity   = fillOp
          el.style.stroke        = color
          el.style.strokeOpacity = strokeOp
        })

        if (active) {
          group.style.setProperty('--glow-color', color)
          group.setAttribute('filter', 'url(#muscleGlow)')
          group.style.animation = 'none'
        } else if (isSugg) {
          group.style.setProperty('--glow-color', phaseColor ?? '#8FAF8A')
          group.setAttribute('filter', 'url(#muscleSuggestGlow)')
          group.style.animation = 'musclePulse 2.5s ease-in-out infinite'
        } else {
          group.style.removeProperty('--glow-color')
          group.removeAttribute('filter')
          group.style.animation = 'none'
        }
      })
    })
  }, [activeMuscles, hovered, suggestedMuscles, phaseColor, heatmap])

  const suggestColor = phaseColor ?? '#8FAF8A'

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
      <style>{PULSE_STYLE}</style>

      {/* Tooltip */}
      {showTooltip && hovered && (
        <div style={{
          position:      'absolute',
          top:           '0.75rem',
          left:          '50%',
          transform:     'translateX(-50%)',
          background:    'rgba(20,10,24,0.92)',
          border:        `1px solid ${heatmap ? suggestColor : MUSCLE_COLORS[hovered]}`,
          borderRadius:  '20px',
          color:         heatmap ? suggestColor : MUSCLE_COLORS[hovered],
          fontFamily:    "'Cormorant Garamond', serif",
          fontSize:      '13px',
          letterSpacing: '0.08em',
          padding:       '4px 16px',
          pointerEvents: 'none',
          whiteSpace:    'nowrap',
          zIndex:        10,
        }}>
          {heatmap
            ? `Trained ${Math.round((heatmap[hovered] ?? 0.06) * 5)} times`
            : MUSCLE_NAMES[hovered]
          }
        </div>
      )}

      {/* SVG container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          ...(!containerStyle && { aspectRatio: '882 / 1866' }),
          overflow: 'visible',
          display: 'block',
          ...containerStyle,
        }}
      />

      {/* Active muscle chips */}
      {showLegend && activeMuscles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0.75rem 0 0' }}>
          {activeMuscles.map(key => (
            <button
              key={key}
              onClick={interactive ? () => onMusclePress(key) : undefined}
              style={{
                background:    `${MUSCLE_COLORS[key]}1A`,
                border:        `1px solid ${MUSCLE_COLORS[key]}`,
                borderRadius:  '20px',
                color:         MUSCLE_COLORS[key],
                fontSize:      '11px',
                padding:       '3px 12px',
                fontFamily:    "'Tenor Sans', sans-serif",
                letterSpacing: '0.04em',
                cursor:        interactive ? 'pointer' : 'default',
              }}
            >
              {MUSCLE_NAMES[key]}
            </button>
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
