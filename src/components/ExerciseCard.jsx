import { useState } from 'react'

const gold = '#C9A86C'
const mutedText = 'rgba(242,237,232,0.45)'
const linen = '#F2EDE8'
const fontSerif = "'Cormorant Garamond', serif"
const fontSans = "'Tenor Sans', sans-serif"

export default function ExerciseCard({
  exercise,
  color = gold,
  onLog,
  onWatch,
}) {
  const [expanded, setExpanded] = useState(false)

  const hasVideo = exercise.videoRow?.video_id && !exercise.videoRow?.not_found
  const isVideoLoading = exercise.needsVideoLookup
  const repsLabel = exercise.reps || ''

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {/* Collapsed card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${color}20`,
          borderRadius: 12,
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Exercise name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: fontSans,
              fontSize: 13,
              fontWeight: 600,
              color: linen,
              margin: 0,
              wordBreak: 'break-word',
            }}
          >
            {exercise.name}
          </p>
        </div>

        {/* Equipment pill */}
        {exercise.equipment && (
          <span
            style={{
              fontFamily: fontSans,
              fontSize: 10,
              color: mutedText,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              padding: '4px 8px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {exercise.equipment}
          </span>
        )}

        {/* Sets × reps pill */}
        <span
          style={{
            fontFamily: fontSans,
            fontSize: 10,
            color: color,
            background: `${color}15`,
            border: `1px solid ${color}35`,
            borderRadius: 8,
            padding: '4px 8px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {exercise.sets} × {repsLabel}
        </span>

        {/* + Log button */}
        <button
          onClick={() => onLog(exercise)}
          style={{
            fontFamily: fontSans,
            fontSize: 11,
            color: gold,
            background: `${gold}15`,
            border: `1px solid ${gold}40`,
            borderRadius: 8,
            padding: '4px 10px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = `${gold}25`
            e.target.style.borderColor = `${gold}60`
          }}
          onMouseLeave={(e) => {
            e.target.style.background = `${gold}15`
            e.target.style.borderColor = `${gold}40`
          }}
        >
          + Log
        </button>

        {/* ▶ Watch button */}
        <button
          onClick={() => {
            onWatch(exercise)
            setExpanded(!expanded)
          }}
          disabled={isVideoLoading}
          style={{
            fontFamily: fontSans,
            fontSize: 11,
            color: hasVideo ? '#4F9DE0' : isVideoLoading ? mutedText : 'transparent',
            background: hasVideo
              ? 'rgba(79,157,224,0.15)'
              : isVideoLoading
              ? 'rgba(255,255,255,0.04)'
              : 'transparent',
            border: hasVideo
              ? '1px solid rgba(79,157,224,0.35)'
              : isVideoLoading
              ? '1px dashed rgba(255,255,255,0.15)'
              : 'none',
            borderRadius: 8,
            padding: '4px 10px',
            cursor: isVideoLoading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            opacity: isVideoLoading ? 0.5 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (hasVideo && !isVideoLoading) {
              e.target.style.background = 'rgba(79,157,224,0.25)'
              e.target.style.borderColor = 'rgba(79,157,224,0.55)'
            }
          }}
          onMouseLeave={(e) => {
            if (hasVideo && !isVideoLoading) {
              e.target.style.background = 'rgba(79,157,224,0.15)'
              e.target.style.borderColor = 'rgba(79,157,224,0.35)'
            }
          }}
        >
          {isVideoLoading ? '⏳' : '▶'} Watch
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            marginTop: 8,
            padding: '1rem',
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${color}15`,
            borderRadius: 12,
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {/* Video embed (if available) */}
          {hasVideo && (
            <>
              <div style={{ position: 'relative', paddingTop: '56.25%', marginBottom: '0.75rem' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${exercise.videoRow.video_id}?rel=0`}
                  title={exercise.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: 8,
                  }}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  {exercise.videoRow.channel_title && (
                    <p
                      style={{
                        fontFamily: fontSans,
                        fontSize: 10,
                        color: mutedText,
                        margin: 0,
                      }}
                    >
                      {exercise.videoRow.channel_title}
                    </p>
                  )}
                </div>
                <a
                  href={`https://www.youtube.com/watch?v=${exercise.videoRow.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: fontSans,
                    fontSize: 10,
                    color: '#4F9DE0',
                    textDecoration: 'none',
                    padding: '4px 8px',
                    border: '1px solid rgba(79,157,224,0.35)',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Open in YouTube →
                </a>
              </div>
            </>
          )}

          {/* Instructions list */}
          {exercise.instructions && exercise.instructions.length > 0 ? (
            <ol
              style={{
                fontFamily: fontSerif,
                fontSize: 12,
                color: linen,
                margin: 0,
                paddingLeft: '1.25rem',
                lineHeight: 1.6,
              }}
            >
              {exercise.instructions.map((instruction, idx) => (
                <li key={idx} style={{ marginBottom: idx < exercise.instructions.length - 1 ? '0.5rem' : 0 }}>
                  {instruction}
                </li>
              ))}
            </ol>
          ) : (
            !hasVideo && (
              <p
                style={{
                  fontFamily: fontSerif,
                  fontStyle: 'italic',
                  fontSize: 12,
                  color: mutedText,
                  margin: 0,
                }}
              >
                {isVideoLoading ? 'Video coming soon' : 'No instructions available'}
              </p>
            )
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
