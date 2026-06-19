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

// ── Label helpers ─────────────────────────────────────────────────────────────
const SKIP_LABELS   = new Set(['wrists', 'knees', 'feet'])
const FORCE_RIGHT   = new Set(['upper_abs', 'mid_abs', 'lower_abs', 'obliques', 'v_cut'])
const SVG_MID       = 441   // horizontal midpoint of the 882-wide viewBox
const LABEL_LEFT_X  = -12   // text-anchor:end  → text extends leftward from here
const LABEL_RIGHT_X = 902   // text-anchor:start → text extends rightward from here
const MIN_BBOX_AREA = 2000  // SVG-unit² threshold — skip tiny elements
const LABEL_MIN_GAP = 90    // min vertical gap between labels (SVG units)

// Wrap long strings at a space near maxChars
function splitText(str, maxChars = 16) {
  if (str.length <= maxChars) return [str]
  let idx = str.lastIndexOf(' ', maxChars)
  if (idx <= 0) idx = str.indexOf(' ', maxChars)
  if (idx <= 0) return [str]
  return [str.slice(0, idx).trim(), str.slice(idx + 1).trim()].filter(Boolean)
}

// Distribute label Y positions so they span the natural muscle range,
// then enforce a minimum gap by pushing overlaps downward.
function spreadY(items) {
  if (!items.length) return []
  const sorted = [...items].sort((a, b) => a.cy - b.cy)
  if (sorted.length === 1) return [{ ...sorted[0], labelY: sorted[0].cy }]

  const firstY = Math.max(sorted[0].cy - 10, 80)
  const lastY  = Math.min(sorted[sorted.length - 1].cy + 10, 1820)
  const range  = lastY - firstY

  // Initial proportional placement
  const result = sorted.map((item, i) => ({
    ...item,
    labelY: Math.round(firstY + (range * i) / (sorted.length - 1)),
  }))

  // Enforce minimum gap (downward push)
  for (let i = 1; i < result.length; i++) {
    if (result[i].labelY - result[i - 1].labelY < LABEL_MIN_GAP) {
      result[i].labelY = result[i - 1].labelY + LABEL_MIN_GAP
    }
  }

  return result
}

function addMuscleLabels(svg) {
  const old = svg.getElementById('muscle-labels')
  if (old) old.remove()

  const root = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  root.id = 'muscle-labels'
  root.setAttribute('pointer-events', 'none')

  const leftItems = [], rightItems = []

  Object.entries(MUSCLE_PAIRS).forEach(([pairKey, ids]) => {
    if (SKIP_LABELS.has(pairKey)) return
    const el = svg.getElementById(ids[0])
    if (!el) return
    let bbox
    try { bbox = el.getBBox() } catch { return }
    if (!bbox || bbox.width * bbox.height < MIN_BBOX_AREA) return

    const cx = bbox.x + bbox.width / 2
    const cy = bbox.y + bbox.height / 2

    const item = {
      pairKey,
      cx, cy,
      // Line endpoint: near edge of the muscle closest to the label side
      edgeX: FORCE_RIGHT.has(pairKey)
        ? bbox.x + bbox.width
        : cx < SVG_MID
          ? bbox.x                   // LEFT muscle → connect at its LEFT edge
          : bbox.x + bbox.width,     // RIGHT muscle → connect at its RIGHT edge
      color: MUSCLE_COLORS[pairKey] ?? '#C9A86C',
    }

    if (FORCE_RIGHT.has(pairKey) || cx >= SVG_MID) {
      rightItems.push(item)
    } else {
      leftItems.push(item)
    }
  })

  function mkEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag)
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)))
    return el
  }

  function drawLabel(item, isLeft) {
    const { pairKey, cx, cy, edgeX, color, labelY } = item
    const labelX    = isLeft ? LABEL_LEFT_X : LABEL_RIGHT_X
    const textAnchor = isLeft ? 'end' : 'start'
    const commonName = MUSCLE_NAMES[pairKey] ?? pairKey
    const sciName    = MUSCLE_ANATOMICAL[pairKey] ?? ''
    const sciLines   = splitText(sciName, 16)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // ── Leader line: label → muscle near-edge ──
    g.appendChild(mkEl('line', {
      x1: Math.round(labelX + (isLeft ? 6 : -6)),
      y1: Math.round(labelY),
      x2: Math.round(edgeX),
      y2: Math.round(cy),
      stroke: color,
      'stroke-opacity': 0.38,
      'stroke-width': 2,
    }))

    // ── Small tick at label end of leader ──
    g.appendChild(mkEl('line', {
      x1: Math.round(labelX + (isLeft ? 6 : -6)),
      y1: Math.round(labelY - 10),
      x2: Math.round(labelX + (isLeft ? 6 : -6)),
      y2: Math.round(labelY + 10),
      stroke: color,
      'stroke-opacity': 0.45,
      'stroke-width': 1.5,
    }))

    // ── Dot at muscle end of leader ──
    g.appendChild(mkEl('circle', {
      cx: Math.round(edgeX),
      cy: Math.round(cy),
      r: 4,
      fill: color,
      'fill-opacity': 0.45,
    }))

    // ── Common name ──
    const t1 = mkEl('text', {
      x: Math.round(labelX),
      y: Math.round(labelY - 5),
      'text-anchor': textAnchor,
      'font-family': "'Cinzel', serif",
      'font-size': 28,
      fill: color,
      'fill-opacity': 0.95,
      'paint-order': 'stroke',
      stroke: 'rgba(8,3,14,0.75)',
      'stroke-width': 6,
      'stroke-linejoin': 'round',
    })
    t1.textContent = commonName
    g.appendChild(t1)

    // ── Scientific name (wrapped if needed) ──
    sciLines.forEach((line, i) => {
      const t2 = mkEl('text', {
        x: Math.round(labelX),
        y: Math.round(labelY + 20 + i * 21),
        'text-anchor': textAnchor,
        'font-family': "'Cormorant Garamond', serif",
        'font-style': 'italic',
        'font-size': 21,
        fill: color,
        'fill-opacity': 0.58,
        'paint-order': 'stroke',
        stroke: 'rgba(8,3,14,0.7)',
        'stroke-width': 4,
        'stroke-linejoin': 'round',
      })
      t2.textContent = line
      g.appendChild(t2)
    })

    root.appendChild(g)
  }

  spreadY(leftItems).forEach(item => drawLabel(item, true))
  spreadY(rightItems).forEach(item => drawLabel(item, false))

  svg.appendChild(root)
}

// ── Component ─────────────────────────────────────────────────────────────────
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

    // Expand viewBox horizontally when labels are shown to give side zones
    const viewBox = showLabels ? '-320 0 1522 1866' : '0 0 882 1866'
    svg.setAttribute('viewBox', viewBox)
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
          group.addEventListener('mouseenter', () => { setHovered(pairKey); onHoverChange?.(pairKey) })
          group.addEventListener('mouseleave', () => { setHovered(null); onHoverChange?.(null) })
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

          group.addEventListener('click',      activate)
          group.addEventListener('touchstart', handleTouchStart, { passive: true })
          group.addEventListener('touchend',   handleTouchEnd,   { passive: false })
          group.addEventListener('mouseenter', () => setHovered(pairKey))
          group.addEventListener('mouseleave', () => setHovered(null))
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
      const color  = MUSCLE_COLORS[pairKey]
      const active = activeMuscles.includes(pairKey)
      const isHov  = hovered === pairKey
      const isSugg = suggestedMuscles.includes(pairKey) && !active

      ids.forEach(id => {
        const group = svg.getElementById(id)
        if (!group) return

        if (heatmap) {
          const opacity = heatmap[pairKey] ?? 0.06
          group.querySelectorAll('*').forEach(el => {
            if (el.tagName.toLowerCase() === 'g') return
            el.setAttribute('fill',           color);  el.style.fill          = color
            el.setAttribute('fill-opacity',   String(opacity)); el.style.fillOpacity = String(opacity)
            el.setAttribute('stroke',         color);  el.style.stroke        = color
            el.setAttribute('stroke-opacity', String(Math.min(opacity * 0.8, 1))); el.style.strokeOpacity = String(Math.min(opacity * 0.8, 1))
            el.setAttribute('stroke-width',   '0.8')
          })
          group.removeAttribute('filter')
          group.style.animation = 'none'
          return
        }

        group.querySelectorAll('*').forEach(el => {
          if (el.tagName === 'g' || el.tagName === 'G') return
          el.style.transition = 'fill-opacity 0.18s ease, stroke-opacity 0.18s ease'

          let fillOp, strokeOp, strokeW
          if (active)      { fillOp = '1';    strokeOp = '1';    strokeW = '2.5' }
          else if (isHov)  { fillOp = '0.55'; strokeOp = '0.9';  strokeW = '1.3' }
          else if (isSugg) { fillOp = '0.4';  strokeOp = '0.65'; strokeW = '1.0' }
          else             { fillOp = '0.22'; strokeOp = '0.38'; strokeW = '0.8' }

          el.setAttribute('fill',           color); el.style.fill          = color
          el.setAttribute('fill-opacity',   fillOp); el.style.fillOpacity   = fillOp
          el.setAttribute('stroke',         color); el.style.stroke        = color
          el.setAttribute('stroke-opacity', strokeOp); el.style.strokeOpacity = strokeOp
          el.setAttribute('stroke-width',   strokeW)
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

      {/* Tooltip (hover) */}
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
