import { useState } from 'react'
import { format, differenceInDays, addMonths, isSameMonth } from 'date-fns'
import {
  getPhaseForDate,
  isFertileWindow,
  isOvulationDay,
  phaseColors,
  phaseLabels,
} from '../../lib/phaseEngine'

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const LEGEND = [
  { label: 'Menstrual',  phase: 'menstrual',  color: '#E8829A', ring: false },
  { label: 'Fertile',    phase: 'fertile',    color: '#E8829A', ring: true  },
  { label: 'Ovulation',  phase: 'ovulation',  color: '#E8829A', ring: false },
  { label: 'Luteal',     phase: 'luteal',     color: '#C4AFA8', ring: false },
]

function buildDays(year, month, lastPeriodDate, cycleLength, periodDuration, symptoms) {
  const firstDow   = new Date(year, month, 1).getDay()
  const daysInMon  = new Date(year, month + 1, 0).getDate()
  const todayStr   = format(new Date(), 'yyyy-MM-dd')
  const logged     = new Set(symptoms.map(s => s.logged_date))

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)

  for (let d = 1; d <= daysInMon; d++) {
    const date    = new Date(year, month, d)
    const dateStr = format(date, 'yyyy-MM-dd')
    const isPast  = dateStr <= todayStr
    const isToday = dateStr === todayStr

    let phase     = null
    let fertile   = false
    let ovulation = false

    if (lastPeriodDate) {
      phase     = getPhaseForDate(date, lastPeriodDate, cycleLength, periodDuration)
      fertile   = isFertileWindow(date, lastPeriodDate, cycleLength)
      ovulation = isOvulationDay(date, lastPeriodDate, cycleLength)
    }

    cells.push({ d, date, dateStr, phase, fertile, ovulation, isToday, isPast, hasLog: logged.has(dateStr) })
  }
  return cells
}

function DayCell({ cell, highlight, onClick }) {
  if (!cell) return <div />

  const { d, phase, fertile, ovulation, isToday, isPast, hasLog } = cell

  let bg          = 'rgba(196,175,168,0.12)'
  let border      = 'transparent'
  let textColor   = isPast ? 'rgba(59,51,48,0.85)' : 'rgba(59,51,48,0.4)'
  let glow        = false
  let opacity     = 1

  // Highlight filter: dim days not in the selected legend category
  if (highlight) {
    const match =
      (highlight === 'fertile'   && fertile)   ||
      (highlight === 'ovulation' && ovulation) ||
      (highlight !== 'fertile' && highlight !== 'ovulation' && phase === highlight)
    opacity = match ? 1 : 0.2
  }

  if (ovulation) {
    bg        = '#E8829A'
    textColor = '#F2EDE8'
    glow      = true
  } else if (phase === 'menstrual') {
    bg        = isPast ? 'rgba(232,130,154,0.6)' : 'rgba(232,130,154,0.25)'
    textColor = isPast ? '#F2EDE8' : 'rgba(59,51,48,0.55)'
  } else if (fertile) {
    border    = '#E8829A'
    bg        = 'rgba(232,130,154,0.1)'
  } else if (phase === 'follicular') {
    bg        = isPast ? 'rgba(143,165,140,0.35)' : 'rgba(143,165,140,0.15)'
  } else if (phase === 'luteal') {
    bg        = isPast ? 'rgba(196,175,168,0.45)' : 'rgba(196,175,168,0.2)'
  }

  if (isToday && !ovulation) {
    border = 'rgba(59,51,48,0.6)'
  }

  return (
    <button
      onClick={() => onClick(cell)}
      className="relative flex flex-col items-center justify-center w-9 h-9 rounded-full mx-auto transition-all"
      style={{
        background: bg,
        border: border !== 'transparent' ? `1.5px solid ${border}` : 'none',
        opacity,
        boxShadow: glow ? '0 0 10px 3px rgba(232,130,154,0.5)' : undefined,
      }}
    >
      <span className="font-garamond text-[11px] leading-none" style={{ color: textColor }}>
        {d}
      </span>
      {hasLog && (
        <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-rose" />
      )}
    </button>
  )
}

function DayDetailSheet({ cell, symptoms, phaseData, onClose, onQuickLog }) {
  const log = symptoms.find(s => s.logged_date === cell.dateStr)

  const phaseName = cell.phase ? phaseLabels[cell.phase] : '—'
  const phaseCol  = cell.phase ? phaseColors[cell.phase] : '#7A6A65'

  const loggedSymptoms = []
  if (log?.cramps)            loggedSymptoms.push('Cramps')
  if (log?.bloating)          loggedSymptoms.push('Bloating')
  if (log?.headache)          loggedSymptoms.push('Headache')
  if (log?.fatigue)           loggedSymptoms.push('Fatigue')
  if (log?.breast_tenderness) loggedSymptoms.push('Breast tenderness')
  if (Array.isArray(log?.symptoms_raw)) {
    log.symptoms_raw.forEach(s => { if (!loggedSymptoms.includes(s)) loggedSymptoms.push(s) })
  }

  const MOOD_LABELS = ['', 'Low', 'Anxious', 'Neutral', 'Good', 'Great']

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl p-6 pb-10"
        style={{
          background: 'rgba(242,237,232,0.97)',
          border: '1px solid rgba(196,175,168,0.4)',
          animation: 'sheetUp 0.28s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`@keyframes sheetUp { from { transform: translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }`}</style>

        <div className="w-10 h-0.5 rounded-full bg-brown/20 mx-auto mb-5" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-cinzel text-brown text-base tracking-wide">
              {format(cell.date, 'MMMM d, yyyy')}
            </p>
            <span
              className="font-cinzel text-[10px] tracking-widest uppercase"
              style={{ color: phaseCol }}
            >
              {cell.ovulation ? 'Ovulation · ' : cell.fertile ? 'Fertile window · ' : ''}{phaseName}
            </span>
          </div>
          <button onClick={onClose} className="text-brown/30 text-2xl leading-none">×</button>
        </div>

        {log ? (
          <div className="space-y-3">
            {log.flow_level && (
              <p className="font-garamond text-brown/70 text-sm">
                Flow: {'💧'.repeat(log.flow_level)}
              </p>
            )}
            {loggedSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {loggedSymptoms.map(s => (
                  <span key={s} className="font-garamond text-xs text-brown/60 border border-brown/15 px-2 py-0.5 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {log.mood && (
              <p className="font-garamond text-brown/70 text-sm">
                Mood: <span style={{ color: '#E8829A' }}>{MOOD_LABELS[log.mood]}</span>
              </p>
            )}
            {log.notes && (
              <p className="font-garamond italic text-brown/50 text-sm">&ldquo;{log.notes}&rdquo;</p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="font-garamond text-brown/40 text-sm mb-4">Nothing logged for this day.</p>
            <button
              onClick={() => { onClose(); onQuickLog(cell.date) }}
              className="font-cinzel text-[10px] tracking-widest uppercase text-rose border border-rose/40 px-5 py-2.5 rounded-xl hover:bg-rose/15 transition-colors"
            >
              Quick Log
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CalendarTab({ profile, phaseData, symptoms, onQuickLog }) {
  const [viewDate,   setViewDate]   = useState(new Date())
  const [selected,   setSelected]   = useState(null)
  const [highlight,  setHighlight]  = useState(null)

  const lastPeriodDate = profile?.last_period_date  ?? null
  const cycleLength    = profile?.cycle_length       ?? 28
  const periodDuration = profile?.period_duration    ?? 5
  const today          = new Date()

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const cells = buildDays(year, month, lastPeriodDate, cycleLength, periodDuration, symptoms)

  // ── Predictions strip ──────────────────────────────────────────────────────
  const predictions = []
  if (phaseData?.nextPeriodDate) {
    const d = differenceInDays(phaseData.nextPeriodDate, today)
    if (d > 0) predictions.push({ label: `Period in ${d} day${d === 1 ? '' : 's'}`, date: format(phaseData.nextPeriodDate, 'MMM d'), color: '#E8829A' })
  }
  if (phaseData?.fertileStart) {
    const d = differenceInDays(phaseData.fertileStart, today)
    if (d > 0) predictions.push({ label: `Fertile window in ${d} day${d === 1 ? '' : 's'}`, date: format(phaseData.fertileStart, 'MMM d'), color: '#E8829A' })
  }
  if (phaseData?.ovulationDay) {
    const d = differenceInDays(phaseData.ovulationDay, today)
    if (d > 0) predictions.push({ label: `Ovulation in ${d} day${d === 1 ? '' : 's'}`, date: format(phaseData.ovulationDay, 'MMM d'), color: '#E8829A' })
  }

  return (
    <>
      {/* ── Phase banner ────────────────────────────────────────────────────── */}
      {phaseData?.phase ? (
        <div
          className="flex items-start gap-3 p-3.5 rounded-xl mb-4"
          style={{
            background: `${phaseData.color}18`,
            border: `1px solid ${phaseData.color}35`,
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
            style={{ background: phaseData.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="font-cinzel text-sm tracking-wide" style={{ color: phaseData.color }}>
                {phaseData.label} Phase
              </span>
              <span className="font-garamond text-brown/50 text-xs">Day {phaseData.dayOfCycle}</span>
            </div>
            {phaseData.daysUntilNextPeriod != null && (
              <p className="font-garamond text-brown/50 text-xs mt-0.5">
                Next period in {phaseData.daysUntilNextPeriod} day{phaseData.daysUntilNextPeriod === 1 ? '' : 's'}
              </p>
            )}
            <p className="font-garamond italic text-brown/40 text-xs mt-1 leading-snug">
              {phaseData.phaseDescription}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-3 mb-4">
          <p className="font-garamond text-brown/35 text-sm">
            Set your last period date in Settings to see your cycle phases.
          </p>
        </div>
      )}

      {/* ── Month navigation ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewDate(d => addMonths(d, -1))}
          className="text-rose p-1 text-xl leading-none"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <span className="font-cinzel text-brown text-sm tracking-wider">
            {format(new Date(year, month, 1), 'MMMM yyyy')}
          </span>
          {!isSameMonth(viewDate, today) && (
            <button
              onClick={() => setViewDate(new Date())}
              className="font-cinzel text-[9px] tracking-widest text-rose border border-rose/30 px-2 py-0.5 rounded-full"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={() => setViewDate(d => addMonths(d, 1))}
          className="text-rose p-1 text-xl leading-none"
        >
          ›
        </button>
      </div>

      {/* ── Day-of-week headers ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <div key={d} className="text-center font-cinzel text-[9px] tracking-widest text-brown/30 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-y-1 mb-4">
        {cells.map((cell, i) =>
          cell ? (
            <DayCell key={cell.dateStr} cell={cell} highlight={highlight} onClick={setSelected} />
          ) : (
            <div key={`e-${i}`} />
          )
        )}
      </div>

      {/* ── Legend ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-around mb-4">
        {LEGEND.map(item => (
          <button
            key={item.label}
            onClick={() => setHighlight(h => h === item.phase ? null : item.phase)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: item.ring ? 'transparent' : item.color,
                border: item.ring ? `1.5px solid ${item.color}` : 'none',
                opacity: highlight && highlight !== item.phase ? 0.3 : 1,
              }}
            />
            <span className="font-garamond text-[9px] text-brown/45">{item.label}</span>
          </button>
        ))}
      </div>

      {/* ── Upcoming predictions ────────────────────────────────────────────── */}
      {predictions.length > 0 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 mb-2">
          {predictions.map((p, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-3 py-2 rounded-xl"
              style={{
                background: `${p.color}10`,
                border: `1px solid ${p.color}35`,
              }}
            >
              <p className="font-garamond text-brown/80 text-sm whitespace-nowrap">{p.label}</p>
              <p className="font-garamond text-rose text-xs">· {p.date}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Day detail sheet ────────────────────────────────────────────────── */}
      {selected && (
        <DayDetailSheet
          cell={selected}
          symptoms={symptoms}
          phaseData={phaseData}
          onClose={() => setSelected(null)}
          onQuickLog={onQuickLog}
        />
      )}
    </>
  )
}
