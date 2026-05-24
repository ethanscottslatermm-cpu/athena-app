import { useState, useEffect, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'

const EXERCISE_SLUGS = {
  'Pelvic Tilt':            'pelvic-tilt',
  'Knee Fold Single Leg':   'knee-fold-single-leg',
  'Hundred Prep':           'hundred-prep',
  'Roll Up':                'roll-up',
  'Single Leg Stretch':     'single-leg-stetch',   // matches filename on disk
  'Criss Cross':            'criss-cross',
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function ActiveSession({ session, exercises = [], phaseData, onComplete, onExit }) {
  const [exIdx,         setExIdx]         = useState(0)
  const [elapsed,       setElapsed]       = useState(0)
  const [videoVisible,  setVideoVisible]  = useState(true)
  const [showExitModal, setShowExitModal] = useState(false)
  const touchStartX = useRef(null)

  const current = exercises[exIdx]
  const total   = exercises.length
  const isLast  = exIdx >= total - 1
  const pct     = total > 0 ? ((exIdx + 1) / total) * 100 : 0

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  function advance() {
    if (isLast) {
      onComplete?.({ session, exercises, elapsed })
      return
    }
    setVideoVisible(false)
    setTimeout(() => {
      setExIdx(i => i + 1)
      setVideoVisible(true)
    }, 200)
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (dx > 50) advance()
    touchStartX.current = null
  }

  const slug    = EXERCISE_SLUGS[current?.name]
  const videoSrc = slug ? `/videos/Exercises/${slug}.mp4.mp4` : null

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: '#F3EAE7' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(59,51,48,0.1)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: '#D4A0A0' }}
        />
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)', paddingBottom: 10 }}
      >
        <button
          onClick={() => setShowExitModal(true)}
          className="w-10 h-10 flex items-center justify-center"
          style={{ color: '#7A6A65' }}
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>

        <div className="flex flex-col items-center flex-1 px-2 min-w-0">
          <span
            className="font-garamond text-sm truncate w-full text-center"
            style={{ color: 'rgba(59,51,48,0.5)' }}
          >
            {session?.title}
          </span>
          <span
            className="font-cinzel tracking-widest"
            style={{ fontSize: 8.5, color: 'rgba(59,51,48,0.3)' }}
          >
            EXERCISE {exIdx + 1} OF {total}
          </span>
        </div>

        <span
          className="font-cinzel text-sm w-14 text-right"
          style={{ color: '#D4A0A0' }}
        >
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Video card */}
      <div className="flex flex-col items-center px-5 shrink-0">
        <div
          style={{
            width: '85%',
            aspectRatio: '16 / 9',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'rgba(196,175,168,0.18)',
            border: '1px solid rgba(196,175,168,0.3)',
            opacity: videoVisible ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          {videoSrc ? (
            <video
              key={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
            >
              <span style={{ fontSize: 26, opacity: 0.35 }}>🧘</span>
              <span
                className="font-cinzel tracking-widest"
                style={{ fontSize: 9, color: 'rgba(59,51,48,0.28)' }}
              >
                {current?.name?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Exercise info */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-3">
        <h2
          className="font-cinzel leading-tight mb-2"
          style={{ fontSize: 20, color: '#3B3330' }}
        >
          {current?.name ?? '—'}
        </h2>
        <p
          className="font-cinzel mb-3"
          style={{ fontSize: 34, color: '#D4A0A0', lineHeight: 1 }}
        >
          {current?.duration_sec
            ? `${current.duration_sec}s`
            : `${current?.sets ?? 1} × ${current?.reps ?? 0}`}
        </p>
        {current?.form_cue && (
          <p
            className="font-garamond italic text-sm leading-relaxed"
            style={{ color: 'rgba(59,51,48,0.48)', maxWidth: 280 }}
          >
            {current.form_cue}
          </p>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className="shrink-0 px-5"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}
      >
        {/* Exercise queue strip */}
        <div
          className="flex gap-2 overflow-x-auto mb-3 pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {exercises.map((ex, i) => (
            <div
              key={ex.id ?? i}
              className="shrink-0 rounded-lg font-garamond text-xs text-center"
              style={{
                minWidth: 72,
                padding: '6px 10px',
                background: i === exIdx
                  ? 'rgba(212,160,160,0.18)'
                  : 'rgba(196,175,168,0.12)',
                border: i === exIdx
                  ? '1px solid rgba(212,160,160,0.5)'
                  : '1px solid rgba(196,175,168,0.2)',
                color: i === exIdx
                  ? '#D4A0A0'
                  : i < exIdx
                    ? 'rgba(59,51,48,0.22)'
                    : 'rgba(59,51,48,0.42)',
              }}
            >
              {ex.name}
            </div>
          ))}
        </div>

        {/* Next / Complete button */}
        <button
          onClick={advance}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 18,
            fontFamily: 'Cinzel, serif',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            border: isLast
              ? '1px solid transparent'
              : '1px solid rgba(212,160,160,0.45)',
            background: isLast
              ? 'rgba(212,160,160,0.88)'
              : 'rgba(212,160,160,0.12)',
            color: isLast ? '#F3EAE7' : '#D4A0A0',
            transition: 'all 0.2s',
          }}
        >
          {isLast ? 'Complete Session' : 'Next Exercise →'}
        </button>
      </div>

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center px-8"
          style={{ background: 'rgba(59,51,48,0.5)' }}
        >
          <div
            className="w-full rounded-2xl p-6 text-center"
            style={{ background: '#F3EAE7', border: '1px solid rgba(212,160,160,0.3)' }}
          >
            <p className="font-cinzel text-sm mb-2" style={{ color: '#3B3330' }}>
              End Session?
            </p>
            <p
              className="font-garamond text-sm mb-6"
              style={{ color: 'rgba(59,51,48,0.45)' }}
            >
              Your progress won't be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-xl font-garamond text-sm"
                style={{
                  border: '1px solid rgba(59,51,48,0.2)',
                  color: 'rgba(59,51,48,0.6)',
                }}
              >
                Keep Going
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3 rounded-xl font-cinzel text-xs tracking-widest"
                style={{
                  border: '1px solid rgba(212,160,160,0.4)',
                  color: '#D4A0A0',
                }}
              >
                END
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
