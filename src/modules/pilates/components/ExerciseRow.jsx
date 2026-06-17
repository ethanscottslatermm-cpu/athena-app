import { useState } from 'react'

export default function ExerciseRow({ exercise, index, active = false, dark = false }) {
  const [expanded, setExpanded] = useState(false)

  const durationLabel = exercise.duration_sec
    ? `${exercise.duration_sec}s`
    : `${exercise.sets ?? 1} × ${exercise.reps ?? 0}`

  const bg = dark
    ? index % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)'
    : active
    ? 'rgba(212,160,160,0.1)'
    : index % 2 === 0
    ? 'rgba(242,237,232,0.7)'
    : 'rgba(242,237,232,0.4)'

  const nameColor  = dark ? 'rgba(242,237,232,0.8)' : active ? '#3B3330' : 'rgba(59,51,48,0.75)'
  const numColor   = dark ? 'rgba(201,168,108,0.5)' : active ? '#D4A0A0' : 'rgba(212,160,160,0.5)'
  const durColor   = dark ? '#C9A86C'                : active ? '#D4A0A0' : 'rgba(212,160,160,0.7)'
  const chevColor  = dark ? 'rgba(242,237,232,0.2)'  : 'rgba(59,51,48,0.25)'
  const cueColor   = dark ? 'rgba(242,237,232,0.4)'  : 'rgba(59,51,48,0.5)'
  const restColor  = dark ? 'rgba(242,237,232,0.25)' : 'rgba(59,51,48,0.35)'

  return (
    <div style={{ background: bg, borderTop: dark && index > 0 ? '1px solid rgba(201,168,108,0.07)' : undefined }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ minHeight: 44 }}
      >
        <span
          className="font-cinzel text-[10px] w-5 text-center shrink-0 leading-none"
          style={{ color: numColor }}
        >
          {index + 1}
        </span>
        <span
          className="font-garamond text-sm flex-1 leading-tight"
          style={{ color: nameColor }}
        >
          {exercise.name}
        </span>
        <span
          className="font-garamond text-sm shrink-0"
          style={{ color: durColor }}
        >
          {durationLabel}
        </span>
        <span style={{ color: chevColor, fontSize: 12, flexShrink: 0 }}>{expanded ? '▾' : '›'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4" style={{ paddingLeft: '2.75rem' }}>
          <div className="mb-3">
            {exercise.form_cue && (
              <p className="font-garamond italic text-sm leading-relaxed" style={{ color: cueColor }}>
                {exercise.form_cue}
              </p>
            )}
            {exercise.rest_sec > 0 && (
              <p className="font-garamond text-xs mt-1.5" style={{ color: restColor }}>
                Rest {exercise.rest_sec}s after this exercise
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
