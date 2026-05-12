import { useState, useEffect, useRef } from 'react'
import ExerciseAnimation from './components/ExerciseAnimation'

function formatTime(s) {
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function ActiveSession({ session, exercises = [], phaseData, onComplete, onExit }) {
  const [exIdx,          setExIdx]          = useState(0)
  const [elapsed,        setElapsed]        = useState(0)
  const [paused,         setPaused]         = useState(false)
  const [restSecs,       setRestSecs]       = useState(0)   // 0 = not resting
  const [showExitModal,  setShowExitModal]  = useState(false)

  const current = exercises[exIdx]
  const total   = exercises.length
  const pct     = total > 0 ? (exIdx / total) * 100 : 0

  // ── Elapsed timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (paused || restSecs > 0) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [paused, restSecs])

  // ── Rest countdown (chains via useState-triggered re-render) ─────────────
  useEffect(() => {
    if (restSecs <= 0) return
    const t = setTimeout(() => {
      setRestSecs(s => {
        if (s <= 1) {
          // advance to next exercise
          setExIdx(i => i + 1)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearTimeout(t)
  }, [restSecs])

  function handleNext() {
    if (exIdx >= total - 1) {
      // Session complete
      onComplete?.({ session, exercises, elapsed })
      return
    }
    const rest = current?.rest_sec ?? 30
    if (rest > 0) {
      setRestSecs(rest)
    } else {
      setExIdx(i => i + 1)
    }
  }

  function handlePrev() {
    if (restSecs > 0) { setRestSecs(0); return }
    setExIdx(i => Math.max(0, i - 1))
  }

  function skipRest() {
    setRestSecs(0)
    setExIdx(i => Math.min(total - 1, i + 1))
  }

  const pc = {
    menstrual: '#8B1A1A',
    follicular: '#8FAF8A',
    ovulation: '#C9A86C',
    luteal: '#6B4F6B',
  }[phaseData?.phase] ?? '#C9A86C'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(6,4,4,0.97)' }}
    >
      {/* ── Top progress bar ────────────────────────────────────────────── */}
      <div className="h-1 w-full" style={{ background: 'rgba(244,239,230,0.06)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: '#C9A86C' }}
        />
      </div>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
      >
        <button
          onClick={() => setShowExitModal(true)}
          className="w-10 h-10 flex items-center justify-center text-ivory/50 text-xl"
        >
          ×
        </button>
        <span className="font-garamond text-ivory/45 text-sm flex-1 text-center truncate px-2">
          {session?.title}
        </span>
        <span className="font-cinzel text-gold text-base w-14 text-right">
          {formatTime(elapsed)}
        </span>
      </div>

      <p className="font-cinzel text-ivory/30 text-[10px] tracking-widest text-center pb-2">
        EXERCISE {exIdx + 1} OF {total}
      </p>

      {/* ── Main exercise display ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {restSecs > 0 ? (
          // Rest mode
          <>
            <p className="font-cinzel text-ivory/40 text-xs tracking-widest uppercase mb-3">REST</p>
            <span
              className="font-cinzel text-gold leading-none mb-4"
              style={{ fontSize: 88 }}
            >
              {restSecs}
            </span>
            <button
              onClick={skipRest}
              className="font-garamond text-ivory/40 text-sm underline underline-offset-2"
            >
              Skip rest
            </button>
            <p className="font-garamond italic text-ivory/25 text-sm mt-6">
              Up next: {exercises[exIdx + 1]?.name ?? '—'}
            </p>
          </>
        ) : (
          // Exercise mode
          <>
            <div
              className="rounded-2xl mb-4 flex items-center justify-center overflow-hidden"
              style={{ background: `${pc}10`, border: `1px solid ${pc}20`, width: 220, height: 220 }}
            >
              <ExerciseAnimation focusArea={current?.focus_area} size={200} />
            </div>
            <h2 className="font-cinzel text-ivory text-2xl leading-tight mb-3">
              {current?.name ?? '—'}
            </h2>
            <p
              className="font-cinzel text-gold mb-4"
              style={{ fontSize: 40, lineHeight: 1 }}
            >
              {current?.duration_sec
                ? `${current.duration_sec}s`
                : `${current?.sets ?? 1} × ${current?.reps ?? 0}`}
            </p>
            {current?.form_cue && (
              <p className="font-garamond italic text-ivory/45 text-sm leading-relaxed max-w-xs">
                {current.form_cue}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-4">
        <div className="flex items-center justify-center gap-10 mb-4">
          <button
            onClick={handlePrev}
            disabled={exIdx === 0 && restSecs === 0}
            className="w-12 h-12 flex items-center justify-center rounded-full text-gold text-2xl"
            style={{ background: 'rgba(201,168,108,0.1)', opacity: (exIdx === 0 && restSecs === 0) ? 0.35 : 1 }}
          >
            ←
          </button>
          <button
            onClick={() => setPaused(p => !p)}
            className="w-14 h-14 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(201,168,108,0.15)', border: '1px solid rgba(201,168,108,0.4)' }}
          >
            <span className="font-cinzel text-gold text-lg">{paused ? '▶' : '⏸'}</span>
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 flex items-center justify-center rounded-full text-gold text-2xl"
            style={{ background: 'rgba(201,168,108,0.1)' }}
          >
            {exIdx >= total - 1 ? '✓' : '→'}
          </button>
        </div>

        {/* Exercise queue strip */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar justify-start px-1">
          {exercises.map((ex, i) => {
            const isCurrent = i === exIdx && restSecs === 0
            const isNext    = restSecs > 0 && i === exIdx + 1
            return (
              <div
                key={ex.id ?? i}
                className="shrink-0 px-3 py-2 rounded-lg font-garamond text-xs text-center"
                style={{
                  minWidth: 80,
                  background: isCurrent ? 'rgba(201,168,108,0.18)' : isNext ? 'rgba(244,239,230,0.06)' : 'rgba(8,5,4,0.8)',
                  border: isCurrent ? '1px solid rgba(201,168,108,0.6)' : isNext ? '1px solid rgba(244,239,230,0.2)' : '1px solid rgba(244,239,230,0.07)',
                  color: isCurrent ? '#C9A86C' : isNext ? 'rgba(244,239,230,0.7)' : 'rgba(244,239,230,0.25)',
                }}
              >
                {ex.name}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Exit modal ──────────────────────────────────────────────────── */}
      {showExitModal && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center px-8"
          style={{ background: 'rgba(6,4,4,0.88)' }}
        >
          <div
            className="w-full rounded-2xl p-6 text-center"
            style={{ background: 'rgba(20,14,12,0.98)', border: '1px solid rgba(201,168,108,0.25)' }}
          >
            <p className="font-cinzel text-ivory text-base mb-2">End Session?</p>
            <p className="font-garamond text-ivory/50 text-sm mb-6">Your progress won't be saved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 rounded-xl font-garamond text-sm text-ivory/60"
                style={{ border: '1px solid rgba(244,239,230,0.15)' }}
              >
                Keep Going
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3 rounded-xl font-cinzel text-xs tracking-widest text-gold"
                style={{ border: '1px solid rgba(201,168,108,0.4)' }}
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
