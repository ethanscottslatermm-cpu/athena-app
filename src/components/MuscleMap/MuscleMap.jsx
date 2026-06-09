import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import bodyFrameUrl from '../../assets/Body_Frame.svg'
import musclesSvgRaw from '../../assets/Frame_1_muscles.svg?raw'

const MUSCLE_GROUPS = {
  'traps-left':           { display: 'Traps',               anatomy: 'Trapezius',                         side: 'left' },
  'traps-right':          { display: 'Traps',               anatomy: 'Trapezius',                         side: 'right' },
  'chest-biceps-left':    { display: 'Chest & Biceps',      anatomy: 'Pectoralis Major / Biceps Brachii',  side: 'left' },
  'chest-biceps-right':   { display: 'Chest & Biceps',      anatomy: 'Pectoralis Major / Biceps Brachii',  side: 'right' },
  'delts-triceps-left':   { display: 'Shoulders & Triceps', anatomy: 'Anterior Deltoid / Triceps Brachii', side: 'left' },
  'delts-triceps-right':  { display: 'Shoulders & Triceps', anatomy: 'Anterior Deltoid / Triceps Brachii', side: 'right' },
  'forearms-left':        { display: 'Forearms',            anatomy: 'Brachioradialis',                    side: 'left' },
  'forearms-right':       { display: 'Forearms',            anatomy: 'Brachioradialis',                    side: 'right' },
  'abs-upper-left':       { display: 'Upper Abs',           anatomy: 'Rectus Abdominis (upper)',            side: 'left' },
  'abs-upper-right':      { display: 'Upper Abs',           anatomy: 'Rectus Abdominis (upper)',            side: 'right' },
  'abs-middle-left':      { display: 'Mid Abs',             anatomy: 'Rectus Abdominis (mid)',              side: 'left' },
  'abs-middle-right':     { display: 'Mid Abs',             anatomy: 'Rectus Abdominis (mid)',              side: 'right' },
  'abs-lower-left':       { display: 'Lower Abs',           anatomy: 'Rectus Abdominis (lower)',            side: 'left' },
  'abs-lower-right':      { display: 'Lower Abs',           anatomy: 'Rectus Abdominis (lower)',            side: 'right' },
  'abs-vcut-left':        { display: 'V-Cut',               anatomy: 'Inguinal Ligament',                   side: 'left' },
  'abs-vcut-right':       { display: 'V-Cut',               anatomy: 'Inguinal Ligament',                   side: 'right' },
  'obliques-left':        { display: 'Obliques',            anatomy: 'External Oblique',                    side: 'left' },
  'obliques-right':       { display: 'Obliques',            anatomy: 'External Oblique',                    side: 'right' },
  'abs-core-axis':        { display: 'Core Axis',           anatomy: 'Linea Alba / Sternum to Pubis',       side: 'center', decorative: true },
  'adductors-left':       { display: 'Inner Thighs',        anatomy: 'Adductor Longus',                     side: 'left' },
  'adductors-right':      { display: 'Inner Thighs',        anatomy: 'Adductor Longus',                     side: 'right' },
  'lateral-leg-left':     { display: 'Outer Leg',           anatomy: 'Vastus Lateralis / Tibialis Anterior', side: 'left' },
  'lateral-leg-right':    { display: 'Outer Leg',           anatomy: 'Vastus Lateralis / Tibialis Anterior', side: 'right' },
  'tibialis-left':        { display: 'Shins',               anatomy: 'Tibialis Anterior',                   side: 'left' },
  'tibialis-right':       { display: 'Shins',               anatomy: 'Tibialis Anterior',                   side: 'right' },
  'calves-left':          { display: 'Calves',              anatomy: 'Gastrocnemius',                       side: 'left' },
  'calves-right':         { display: 'Calves',              anatomy: 'Gastrocnemius',                       side: 'right' },
  'face-complete':        { display: 'Face',                anatomy: '',                                    side: 'center', decorative: true },
  'hand-left':            { display: 'Hand',                anatomy: '',                                    side: 'left',  decorative: true },
  'hand-right':           { display: 'Hand',                anatomy: '',                                    side: 'right', decorative: true },
  'foot-left':            { display: 'Foot',                anatomy: '',                                    side: 'left',  decorative: true },
  'foot-right':           { display: 'Foot',                anatomy: '',                                    side: 'right', decorative: true },
}

const GROUP_TRIGGERS = {
  'traps':         ['traps-left', 'traps-right'],
  'chest-biceps':  ['chest-biceps-left', 'chest-biceps-right'],
  'delts-triceps': ['delts-triceps-left', 'delts-triceps-right'],
  'forearms':      ['forearms-left', 'forearms-right'],
  'abs-upper':     ['abs-upper-left', 'abs-upper-right'],
  'abs-middle':    ['abs-middle-left', 'abs-middle-right'],
  'abs-lower':     ['abs-lower-left', 'abs-lower-right'],
  'abs-vcut':      ['abs-vcut-left', 'abs-vcut-right'],
  'obliques':      ['obliques-left', 'obliques-right'],
  'inner-thighs':  ['adductors-left', 'adductors-right'],
  'outer-leg':     ['lateral-leg-left', 'lateral-leg-right'],
  'shins':         ['tibialis-left', 'tibialis-right'],
  'calves':        ['calves-left', 'calves-right'],
}

const DECORATIVE_IDS = new Set([
  'abs-core-axis', 'face-complete', 'hand-left', 'hand-right', 'foot-left', 'foot-right',
])

// Map each side-id back to its trigger key
const ID_TO_TRIGGER = {}
Object.entries(GROUP_TRIGGERS).forEach(([key, ids]) => {
  ids.forEach(id => { ID_TO_TRIGGER[id] = key })
})

// Parse SVG once at module load, strip fills/strokes so CSS fill cascades
let _processedSvgContent = null
function getProcessedSvgContent() {
  if (_processedSvgContent !== null) return _processedSvgContent
  const parser = new DOMParser()
  const doc = parser.parseFromString(musclesSvgRaw, 'image/svg+xml')
  const frameGroup = doc.getElementById('Frame 1') || doc.querySelector('svg > g')
  const root = frameGroup || doc.documentElement
  root.querySelectorAll('path, polygon, circle, ellipse, rect, polyline').forEach(el => {
    el.setAttribute('fill', 'inherit')
    el.removeAttribute('fill-opacity')
    el.setAttribute('stroke', 'none')
    el.removeAttribute('stroke-width')
    el.removeAttribute('stroke-opacity')
  })
  _processedSvgContent = root.innerHTML
  return _processedSvgContent
}

export default function MuscleMap() {
  const [activeKey, setActiveKey] = useState(null)
  const overlayRef = useRef(null)
  const svgContent = useMemo(() => getProcessedSvgContent(), [])

  // After the SVG mounts, apply base styles to all groups once
  useLayoutEffect(() => {
    const svg = overlayRef.current
    if (!svg) return
    Object.keys(MUSCLE_GROUPS).forEach(id => {
      const g = svg.getElementById(id)
      if (!g) return
      g.style.fill = '#C9A86C'
      g.style.opacity = '0'
      g.style.transition = 'opacity 0.3s ease'
      if (DECORATIVE_IDS.has(id)) {
        g.style.pointerEvents = 'none'
      } else {
        g.style.pointerEvents = 'all'
        g.style.cursor = 'pointer'
      }
    })
  }, [svgContent])

  // Update highlighted groups whenever selection changes
  useEffect(() => {
    const svg = overlayRef.current
    if (!svg) return
    const activeIds = activeKey ? new Set(GROUP_TRIGGERS[activeKey] || []) : new Set()
    Object.keys(MUSCLE_GROUPS).forEach(id => {
      if (DECORATIVE_IDS.has(id)) return
      const g = svg.getElementById(id)
      if (!g) return
      g.style.opacity = activeIds.has(id) ? '0.75' : '0'
    })
  }, [activeKey])

  function handleOverlayClick(e) {
    const g = e.target.closest('g[id]')
    if (!g) { setActiveKey(null); return }
    const id = g.id
    if (DECORATIVE_IDS.has(id)) return
    const triggerKey = ID_TO_TRIGGER[id]
    if (!triggerKey) { setActiveKey(null); return }
    setActiveKey(prev => prev === triggerKey ? null : triggerKey)
  }

  const firstActiveId = activeKey ? GROUP_TRIGGERS[activeKey]?.[0] : null
  const selectedInfo = firstActiveId ? MUSCLE_GROUPS[firstActiveId] : null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        width: '100%',
      }}
    >
      {/* ── Map container ─────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          margin: '0 auto',
        }}
      >
        {/* Base layer: illustrated body silhouette */}
        <img
          src={bodyFrameUrl}
          alt="body"
          draggable={false}
          style={{ width: '100%', display: 'block', userSelect: 'none' }}
        />

        {/* Muscle overlay: same viewBox, stacked absolutely */}
        <svg
          ref={overlayRef}
          viewBox="0 0 1316 2051"
          preserveAspectRatio="xMidYMid meet"
          onClick={handleOverlayClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'all',
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      {/* ── Info panel ────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          margin: '0 auto',
          padding: '20px 20px 28px',
          background: '#140A18',
          borderTop: '1px solid rgba(201,168,108,0.2)',
          minHeight: 96,
        }}
      >
        {selectedInfo ? (
          <>
            <p
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 22,
                color: '#C9A86C',
                margin: '0 0 4px',
                lineHeight: 1.2,
              }}
            >
              {selectedInfo.display}
            </p>
            {selectedInfo.anatomy && (
              <p
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 14,
                  color: 'rgba(242,237,232,0.45)',
                  margin: '0 0 8px',
                }}
              >
                {selectedInfo.anatomy}
              </p>
            )}
            <p
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'rgba(242,237,232,0.25)',
                margin: 0,
              }}
            >
              Tap a muscle group to learn more
            </p>
          </>
        ) : (
          <p
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: 14,
              color: 'rgba(242,237,232,0.35)',
              textAlign: 'center',
              margin: '16px 0 0',
            }}
          >
            Tap a muscle group to learn more
          </p>
        )}
      </div>
    </div>
  )
}
