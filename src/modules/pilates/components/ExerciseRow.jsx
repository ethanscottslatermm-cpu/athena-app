import { useState } from 'react'

export default function ExerciseRow({ exercise, index, active = false }) {
  const [expanded, setExpanded] = useState(false)

  const durationLabel = exercise.duration_sec
    ? `${exercise.duration_sec}s`
    : `${exercise.sets ?? 1} × ${exercise.reps ?? 0}`

  return (
    <div
      style={{
        background: active
          ? 'rgba(196,133,154,0.1)'
          : index % 2 === 0
          ? 'rgba(242,237,232,0.7)'
          : 'rgba(242,237,232,0.4)',
      }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ minHeight: 44 }}
      >
        <span
          className="font-cinzel text-[10px] w-5 text-center shrink-0 leading-none"
          style={{ color: active ? '#C4859A' : 'rgba(196,133,154,0.5)' }}
        >
          {index + 1}
        </span>
        <span
          className="font-garamond text-sm flex-1 leading-tight"
          style={{ color: active ? '#252220' : 'rgba(37,34,32,0.75)' }}
        >
          {exercise.name}
        </span>
        <span
          className="font-garamond text-sm shrink-0"
          style={{ color: active ? '#C4859A' : 'rgba(196,133,154,0.7)' }}
        >
          {durationLabel}
        </span>
        <span className="text-brown/25 text-xs shrink-0">{expanded ? '▾' : '›'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4" style={{ paddingLeft: '2.75rem' }}>
          <div className="mb-3">
            {exercise.form_cue && (
              <p className="font-garamond italic text-brown/50 text-sm leading-relaxed">
                {exercise.form_cue}
              </p>
            )}
            {exercise.rest_sec > 0 && (
              <p className="font-garamond text-brown/35 text-xs mt-1.5">
                Rest {exercise.rest_sec}s after this exercise
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
