import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  ChevronLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Gauge, Timer, Dumbbell, PersonStanding,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

/* ═══════════════════════════════════════════════════════════════════════════
   ACTIVE SESSION — light editorial template.
   This is the STANDARD layout for every session in the Pilates Studio. The
   structure, spacing and styling never change; only the video, exercise name,
   reps, cue text and exercise queue vary, and all of that is data-driven.
   This is the only light-themed screen in the app (see CLAUDE.md → "Active
   Session (light mode)" tokens).
   ══════════════════════════════════════════════════════════════════════════ */

// ── Light-mode tokens (this screen only) ───────────────────────────────────
const T = {
  bg:     '#F2E8E8',  // soft blush pink — screen background
  card:   '#FFFFFF',  // white card
  text:   '#2E1F26',  // deep plum-brown — primary text
  accent: '#8B5A6B',  // muted mauve-rose — accent / progress
  muted:  '#9B8288',  // dusty taupe — secondary text
  next:   '#5F7D82',  // muted teal — next button
}

const SPEEDS = [0.5, 1, 1.5, 2]

// Slug lookup for clips living under /videos/Exercises.
const EXERCISE_SLUGS = {
  'Hundred Prep':           'hundred-prep',
  'Roll Up':                'roll-up',
  'Single Leg Stretch':     'single-leg-stetch',   // matches filename on disk
  'Criss Cross':            'criss-cross',
  'Bridge Lift':            'bridge-lift',
  'Single Leg Bridge':      'single-leg-bridge',
}

// Explicit per-exercise video paths for clips that live elsewhere on disk.
// A `video_url` on the exercise row always wins over both of these.
const EXERCISE_VIDEO_SRC = {
  'Standing Roll Down':       '/images/pilates/dynamic-stretch-and-tone/standing_roll_down.mp4',
  'Lunge Hip Flexor':         '/images/pilates/dynamic-stretch-and-tone/lung_hip_flexor.mp4',
  "World's Greatest Stretch": '/images/pilates/dynamic-stretch-and-tone/worlds_greatest_stretch.mp4',
  'Leg Pull Front':           '/images/pilates/dynamic-stretch-and-tone/leg_pull_front.mp4',
  'Pigeon Stretch':           '/images/pilates/dynamic-stretch-and-tone/pigeon_stretch.mp4',
  'Pelvic Tilt':              '/images/pilates/rising-energy-core/pelvic_tilt.mp4',
  'Knee Fold Single Leg':     '/images/pilates/rising-energy-core/knee_fold_single_leg.mp4',
}

function resolveVideo(ex) {
  if (!ex) return null
  if (ex.video_url) return ex.video_url
  if (EXERCISE_VIDEO_SRC[ex.name]) return EXERCISE_VIDEO_SRC[ex.name]
  const slug = EXERCISE_SLUGS[ex.name]
  return slug ? `/videos/Exercises/${slug}.mp4.mp4` : null
}

function formatTime(s) {
  const total = Math.max(0, Math.floor(s))
  const m = Math.floor(total / 60)
  const h = Math.floor(m / 60)
  const ss = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m % 60).padStart(2, '0')}:${ss}` : `${m}:${ss}`
}

function titleize(v) {
  return v ? String(v).replace(/_/g, ' ') : ''
}

/* ── Dot matrix ────────────────────────────────────────────────────────────
   Rows = sets, filled dots per row = reps, mauve gradient across the row.
   Counts above the display caps collapse into a "+n" tail. */
function DotMatrix({ sets, reps }) {
  const rows = Math.min(Math.max(sets ?? 1, 1), 4)
  const cols = Math.min(Math.max(reps ?? 1, 1), 10)
  const overflowReps = (reps ?? 0) > 10
  const overflowSets = (sets ?? 0) > 4

  return (
    <div className="flex flex-col items-start gap-[3px]" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-[3px]">
          {Array.from({ length: cols }).map((_, c) => (
            <span
              key={c}
              style={{
                width: 4, height: 4, borderRadius: '50%',
                background: T.accent,
                opacity: 0.28 + (0.62 * (c + 1)) / cols,
              }}
            />
          ))}
          {overflowReps && (
            <span className="font-garamond" style={{ fontSize: 8, color: T.muted, marginLeft: 2 }}>
              +{reps - 10}
            </span>
          )}
        </div>
      ))}
      {overflowSets && (
        <span className="font-garamond" style={{ fontSize: 8, color: T.muted }}>
          +{sets - 4} sets
        </span>
      )}
    </div>
  )
}

export default function ActiveSession({
  session,
  sessionId,
  exercises = [],
  onComplete,
  onExit,
}) {
  const sid = session?.id ?? sessionId ?? null

  // ── Exercise data ────────────────────────────────────────────────────────
  // Prefer exercises handed down by the studio; otherwise fetch this session's
  // own rows so the component works standalone from just a sessionId.
  const provided = useMemo(
    () => (exercises ?? []).filter(e => !sid || !e.session_id || e.session_id === sid),
    [exercises, sid],
  )
  const [fetched, setFetched] = useState(null)

  useEffect(() => {
    if (provided.length || !sid) return
    let cancelled = false
    supabase
      .from('pilates_exercises')
      .select('*')
      .eq('session_id', sid)
      .then(({ data }) => { if (!cancelled) setFetched(data ?? []) })
    return () => { cancelled = true }
  }, [provided.length, sid])

  // Sorted client-side so either `sort_order` or the legacy `order_num` works.
  const list = useMemo(() => {
    const rows = provided.length ? provided : (fetched ?? [])
    return [...rows].sort(
      (a, b) => (a.sort_order ?? a.order_num ?? 0) - (b.sort_order ?? b.order_num ?? 0),
    )
  }, [provided, fetched])

  // ── State ────────────────────────────────────────────────────────────────
  const [exIdx,         setExIdx]         = useState(0)
  const [elapsed,       setElapsed]       = useState(0)
  const [playing,       setPlaying]       = useState(true)
  const [muted,         setMuted]         = useState(true)
  const [speedIdx,      setSpeedIdx]      = useState(1)      // → SPEEDS[1] === 1x
  const [clipPct,       setClipPct]       = useState(0)
  const [showExitModal, setShowExitModal] = useState(false)
  const [reduceMotion,  setReduceMotion]  = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const videoRef    = useRef(null)
  const queueRef    = useRef(null)
  const pillRefs    = useRef([])
  const touchStartX = useRef(null)

  const current  = list[exIdx]
  const total    = list.length
  const isLast   = total > 0 && exIdx >= total - 1
  const pct      = total > 0 ? ((exIdx + 1) / total) * 100 : 0
  const speed    = SPEEDS[speedIdx]
  const videoSrc = resolveVideo(current)

  // Reps / hold presentation
  const reps = current?.reps ?? null
  const sets = current?.sets ?? (reps ? 1 : null)
  const hold = current?.duration_sec ?? null
  const countLabel = reps
    ? `${sets ?? 1} × ${reps}`
    : hold ? formatTime(hold) : '—'
  const countCaption = reps
    ? `${sets ?? 1} set${(sets ?? 1) === 1 ? '' : 's'} × ${reps} rep${reps === 1 ? '' : 's'}`
    : hold ? `hold ${hold}s` : ''
  const equipment = current?.equipment ?? session?.equipment ?? 'Mat'
  const cue = current?.cue ?? current?.form_cue ?? ''

  // ── Reduced motion ───────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = e => setReduceMotion(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  // ── Session timer ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // ── Player sync ──────────────────────────────────────────────────────────
  // Each exercise mounts a fresh <video> (keyed on src), so push the current
  // speed/volume onto the new element and resume playback.
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    vid.playbackRate = speed
    vid.muted = muted
    if (playing) vid.play?.().catch(() => setPlaying(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exIdx, videoSrc])

  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = speed }, [speed])
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted }, [muted])

  function handleTimeUpdate() {
    const vid = videoRef.current
    if (!vid?.duration) return
    setClipPct((vid.currentTime / vid.duration) * 100)
  }

  function togglePlay() {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) { vid.play?.().catch(() => {}); setPlaying(true) }
    else            { vid.pause(); setPlaying(false) }
  }

  function scrub(e) {
    const vid = videoRef.current
    const value = Number(e.target.value)
    setClipPct(value)
    if (vid?.duration) vid.currentTime = (value / 100) * vid.duration
  }

  function cycleSpeed() { setSpeedIdx(i => (i + 1) % SPEEDS.length) }

  function goFullscreen() {
    const vid = videoRef.current
    if (!vid) return
    // iOS Safari only exposes the native entry point on the element itself.
    if (vid.webkitEnterFullscreen) vid.webkitEnterFullscreen()
    else vid.requestFullscreen?.().catch(() => {})
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  // Every index change also rewinds the scrub bar for the incoming clip.
  const goTo = useCallback(i => { setExIdx(i); setClipPct(0) }, [])

  const advance = useCallback(() => {
    if (isLast) { onComplete?.({ session, exercises: list, elapsed }); return }
    goTo(exIdx + 1)
  }, [isLast, onComplete, session, list, elapsed, exIdx, goTo])

  function goBack() {
    if (exIdx > 0) goTo(exIdx - 1)
    else setShowExitModal(true)
  }

  function handleTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    if (dx > 50)       advance()
    else if (dx < -50) goBack()
    touchStartX.current = null
  }

  // Keep the current exercise pinned to the leftmost queue position.
  useEffect(() => {
    const c = queueRef.current
    const pill = pillRefs.current[exIdx]
    if (!c || !pill) return
    c.scrollTo({
      left: Math.max(0, pill.offsetLeft - 2),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [exIdx, reduceMotion, total])

  const ease = reduceMotion ? 'none' : 'all 0.3s ease'

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: T.bg, color: T.text }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Progress bar (very top edge) ─────────────────────────────────── */}
      <div className="h-[3px] w-full shrink-0" style={{ background: 'rgba(139,90,107,0.15)' }}>
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background: T.accent,
            transition: reduceMotion ? 'none' : 'width 0.4s ease',
          }}
        />
      </div>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 shrink-0"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)', paddingBottom: 10 }}
      >
        <button
          onClick={goBack}
          aria-label={exIdx > 0 ? 'Previous exercise' : 'Exit session'}
          className="flex items-center justify-center shrink-0"
          style={{ width: 44, height: 44, color: T.text }}
        >
          <ChevronLeft size={24} strokeWidth={1.75} />
        </button>

        <div className="flex flex-col items-center flex-1 min-w-0 px-1">
          <span className="font-cinzel truncate w-full text-center" style={{ fontSize: 15, color: T.text }}>
            {session?.title ?? 'Session'}
          </span>
          <span
            className="font-garamond uppercase"
            style={{ fontSize: 10, letterSpacing: '0.18em', color: T.accent, marginTop: 2 }}
          >
            — Exercise {Math.min(exIdx + 1, Math.max(total, 1))} of {total || 1} —
          </span>
        </div>

        <div
          className="flex items-center justify-center shrink-0 rounded-full"
          style={{ width: 36, height: 36, background: T.accent, color: '#FFFFFF' }}
          aria-hidden="true"
        >
          <PersonStanding size={19} strokeWidth={1.75} />
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* ── Video player card ──────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: T.card, boxShadow: '0 2px 14px rgba(46,31,38,0.06)' }}
        >
          <div className="p-2">
            <div
              className="relative overflow-hidden"
              style={{ borderRadius: 14, aspectRatio: '16 / 9', background: 'rgba(139,90,107,0.08)' }}
            >
              {videoSrc ? (
                <video
                  ref={videoRef}
                  key={videoSrc}
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onLoadedMetadata={() => {
                    if (videoRef.current) videoRef.current.playbackRate = speed
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className="font-garamond uppercase"
                    style={{ fontSize: 10, letterSpacing: '0.18em', color: T.muted }}
                  >
                    {titleize(current?.focus_area) || 'Demonstration'}
                  </span>
                </div>
              )}

              {/* Overlaid player controls */}
              <div
                className="absolute left-0 right-0 bottom-0 px-2 pb-1.5 pt-6"
                style={{ background: 'linear-gradient(180deg, rgba(46,31,38,0) 0%, rgba(46,31,38,0.4) 100%)' }}
              >
                <input
                  type="range"
                  min="0" max="100" step="0.1"
                  value={clipPct}
                  onChange={scrub}
                  aria-label="Scrub video"
                  className="w-full"
                  style={{ accentColor: '#FFFFFF', height: 16, cursor: 'pointer' }}
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={togglePlay}
                    aria-label={playing ? 'Pause' : 'Play'}
                    className="flex items-center justify-center"
                    style={{ width: 44, height: 44, color: '#FFFFFF', filter: 'drop-shadow(0 1px 3px rgba(46,31,38,0.5))' }}
                  >
                    {playing
                      ? <Pause size={20} strokeWidth={2} fill="#FFFFFF" />
                      : <Play  size={20} strokeWidth={2} fill="#FFFFFF" />}
                  </button>
                  <div className="flex items-center">
                    <button
                      onClick={() => setMuted(m => !m)}
                      aria-label={muted ? 'Unmute' : 'Mute'}
                      className="flex items-center justify-center"
                      style={{ width: 44, height: 44, color: '#FFFFFF', filter: 'drop-shadow(0 1px 3px rgba(46,31,38,0.5))' }}
                    >
                      {muted ? <VolumeX size={20} strokeWidth={1.75} /> : <Volume2 size={20} strokeWidth={1.75} />}
                    </button>
                    <button
                      onClick={goFullscreen}
                      aria-label="Fullscreen"
                      className="flex items-center justify-center"
                      style={{ width: 44, height: 44, color: '#FFFFFF', filter: 'drop-shadow(0 1px 3px rgba(46,31,38,0.5))' }}
                    >
                      <Maximize size={19} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control row — 3 equal columns */}
          <div className="grid grid-cols-3" style={{ borderTop: '1px solid rgba(139,90,107,0.12)' }}>
            <button
              onClick={cycleSpeed}
              aria-label={`Playback speed ${speed}x`}
              className="flex items-center justify-center gap-1.5"
              style={{ minHeight: 44, color: T.text, borderRight: '1px solid rgba(139,90,107,0.12)' }}
            >
              <Gauge size={15} strokeWidth={1.6} color={T.accent} />
              <span className="font-garamond" style={{ fontSize: 13 }}>Speed ×{speed}</span>
            </button>
            <button
              onClick={() => setMuted(m => !m)}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="flex items-center justify-center gap-1.5"
              style={{ minHeight: 44, color: T.text, borderRight: '1px solid rgba(139,90,107,0.12)' }}
            >
              {muted
                ? <VolumeX size={15} strokeWidth={1.6} color={T.accent} />
                : <Volume2 size={15} strokeWidth={1.6} color={T.accent} />}
              <span className="font-garamond" style={{ fontSize: 13 }}>{muted ? 'Muted' : 'Volume'}</span>
            </button>
            <div className="flex items-center justify-center gap-1.5" style={{ minHeight: 44, color: T.text }}>
              <Timer size={15} strokeWidth={1.6} color={T.accent} />
              <span className="font-garamond tabular-nums" style={{ fontSize: 13 }}>{formatTime(elapsed)}</span>
            </div>
          </div>
        </div>

        {/* ── Exercise info card ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl mt-3 px-5 py-5 text-center"
          style={{ background: T.card, boxShadow: '0 2px 14px rgba(46,31,38,0.06)' }}
        >
          <h2
            className="font-cinzel uppercase leading-tight"
            style={{ fontSize: 20, letterSpacing: '0.04em', color: T.text }}
          >
            {current?.name ?? '—'}
          </h2>
          {current?.focus_area && (
            <p
              className="font-garamond uppercase"
              style={{ fontSize: 10, letterSpacing: '0.22em', color: T.accent, marginTop: 6 }}
            >
              {titleize(current.focus_area)}
            </p>
          )}

          {/* Reps row — dot matrix · count · equipment */}
          <div className="flex items-center justify-between mt-5" style={{ gap: 12 }}>
            <div className="flex-1 flex justify-start">
              <DotMatrix sets={sets} reps={reps} />
            </div>

            <p className="font-cinzel shrink-0" style={{ fontSize: 32, lineHeight: 1, color: T.text }}>
              {countLabel}
            </p>

            <div className="flex-1 flex flex-col items-end gap-1">
              <Dumbbell size={18} strokeWidth={1.5} color={T.accent} />
              <span className="font-garamond capitalize" style={{ fontSize: 11, color: T.muted, lineHeight: 1.2 }}>
                {equipment}
              </span>
              {countCaption && (
                <span className="font-garamond text-right" style={{ fontSize: 10, color: T.muted, lineHeight: 1.2 }}>
                  {countCaption}
                </span>
              )}
            </div>
          </div>

          {cue && (
            <p
              className="font-garamond italic mx-auto"
              style={{ fontSize: 15, lineHeight: 1.65, color: T.text, marginTop: 18, maxWidth: 300 }}
            >
              {cue}
            </p>
          )}
        </div>

        {/* ── Carousel dots ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-1.5 mt-4" aria-hidden="true">
          {list.map((ex, i) => (
            <span
              key={ex.id ?? i}
              style={{
                width:  i === exIdx ? 8 : 5,
                height: i === exIdx ? 8 : 5,
                borderRadius: '50%',
                background: T.accent,
                opacity: i === exIdx ? 1 : 0.28,
                transition: ease,
              }}
            />
          ))}
        </div>

        {/* ── Exercise queue strip ───────────────────────────────────────── */}
        <div
          ref={queueRef}
          className="relative flex items-center overflow-x-auto mt-3 pb-1 hide-scrollbar"
          style={{ scrollbarWidth: 'none' }}
        >
          {list.map((ex, i) => (
            <div key={ex.id ?? i} className="flex items-center shrink-0">
              {i > 0 && (
                <span
                  className="shrink-0"
                  style={{ width: 12, height: 1, background: 'rgba(139,90,107,0.3)' }}
                  aria-hidden="true"
                />
              )}
              <button
                ref={el => { pillRefs.current[i] = el }}
                onClick={() => goTo(i)}
                className="shrink-0 rounded-full font-garamond whitespace-nowrap"
                style={{
                  minHeight: 34,
                  padding: '7px 14px',
                  fontSize: 13,
                  background: i === exIdx ? T.accent : T.card,
                  color:      i === exIdx ? '#FFFFFF' : T.accent,
                  border:     i === exIdx ? '1px solid transparent' : '1px solid rgba(139,90,107,0.22)',
                  opacity:    i < exIdx ? 0.55 : 1,
                  transition: ease,
                }}
              >
                {ex.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Next / Complete ──────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 pt-2"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
      >
        <button
          onClick={advance}
          className="w-full font-cinzel uppercase"
          style={{
            minHeight: 52,
            borderRadius: 16,
            background: T.next,
            color: '#FFFFFF',
            fontSize: 12,
            letterSpacing: '0.2em',
            border: 'none',
            cursor: 'pointer',
            transition: ease,
          }}
        >
          {isLast ? 'Complete Session →' : 'Next Exercise →'}
        </button>
      </div>

      {/* ── Exit confirmation ────────────────────────────────────────────── */}
      {showExitModal && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center px-8"
          style={{ background: 'rgba(46,31,38,0.45)' }}
        >
          <div
            className="w-full rounded-2xl p-6 text-center"
            style={{ background: T.card, boxShadow: '0 8px 30px rgba(46,31,38,0.2)' }}
          >
            <p className="font-cinzel mb-2" style={{ fontSize: 15, color: T.text }}>End Session?</p>
            <p className="font-garamond mb-6" style={{ fontSize: 14, color: T.muted }}>
              Your progress won't be saved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 rounded-xl font-garamond"
                style={{ minHeight: 44, fontSize: 14, border: '1px solid rgba(139,90,107,0.25)', color: T.text }}
              >
                Keep Going
              </button>
              <button
                onClick={onExit}
                className="flex-1 rounded-xl font-cinzel uppercase"
                style={{ minHeight: 44, fontSize: 11, letterSpacing: '0.18em', background: T.accent, color: '#FFFFFF' }}
              >
                End
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
