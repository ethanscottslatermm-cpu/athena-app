import { useState } from 'react'
import { differenceInDays, format, addDays } from 'date-fns'
import { supabase } from '../../lib/supabase'

const PHASE_COLORS = {
  menstrual: '#8B1A1A',
  follicular: '#8FAF8A',
  ovulation: '#C9A86C',
  luteal: '#6B4F6B',
}

function Toast({ msg, onDone }) {
  return (
    <div
      className="fixed top-safe left-4 right-4 z-50 flex items-center justify-between px-4 py-3 rounded-xl"
      style={{
        top: 'max(env(safe-area-inset-top, 0px), 16px)',
        background: 'rgba(8,5,4,0.96)',
        border: '1px solid rgba(201,168,108,0.4)',
        animation: 'cycleSlideDown 0.3s ease-out',
      }}
    >
      <span className="font-garamond text-ivory/85 text-sm">{msg}</span>
      <button onClick={onDone} className="text-ivory/40 ml-4 text-xl">×</button>
    </div>
  )
}

export default function ChallengesTab({
  challenges = [],
  challengeEntries = [],
  phaseData,
  user,
  onRefresh,
}) {
  const [toast, setToast] = useState(null)
  const [joining, setJoining] = useState(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Split into active, available, completed
  const myEntries = challengeEntries.filter(e => e.user_id === user?.id)
  const activeEntries = myEntries.filter(e => !e.completed_at)
  const completedEntries = myEntries.filter(e => e.completed_at)
  const joinedIds = new Set(myEntries.map(e => e.challenge_id))

  // Challenges with entry data merged
  const available = challenges.filter(c => !joinedIds.has(c.id))
  const active = activeEntries.map(e => ({
    entry: e,
    challenge: challenges.find(c => c.id === e.challenge_id),
  })).filter(x => x.challenge)
  const completed = completedEntries.map(e => ({
    entry: e,
    challenge: challenges.find(c => c.id === e.challenge_id),
  })).filter(x => x.challenge)

  async function handleJoin(challenge) {
    if (!user || joining) return
    setJoining(challenge.id)
    const { error } = await supabase.from('challenge_entries').insert({
      user_id:       user.id,
      challenge_id:  challenge.id,
      joined_at:     new Date().toISOString(),
      sessions_completed: 0,
    })
    if (error) {
      showToast('Could not join challenge')
    } else {
      showToast(`✦ Joined "${challenge.name}"`)
      onRefresh?.()
    }
    setJoining(null)
  }

  const pc = PHASE_COLORS[phaseData?.phase] ?? '#C9A86C'
  const phaseLabel = phaseData?.phase
    ? phaseData.phase.charAt(0).toUpperCase() + phaseData.phase.slice(1)
    : null

  return (
    <div className="space-y-5 pb-4">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── Phase solidarity banner ──────────────────────────────────── */}
      {phaseLabel && (
        <div
          className="py-3 px-4 rounded-xl text-center"
          style={{
            background: `${pc}12`,
            border: `1px solid ${pc}25`,
            animation: 'goldPulse 2s ease-in-out infinite',
          }}
        >
          <p className="font-garamond italic text-sm" style={{ color: pc }}>
            ◯ Women worldwide are in their <strong>{phaseLabel}</strong> phase with you today
          </p>
        </div>
      )}

      {/* ── Active challenges ────────────────────────────────────────── */}
      {active.map(({ entry, challenge }) => {
        const joined    = new Date(entry.joined_at)
        const endDate   = addDays(joined, challenge.duration_days ?? 28)
        const daysLeft  = Math.max(0, differenceInDays(endDate, new Date()))
        const pct       = Math.round(
          ((entry.sessions_completed ?? 0) / (challenge.sessions_required ?? 1)) * 100
        )
        const phaseC    = PHASE_COLORS[challenge.phase] ?? '#C9A86C'

        return (
          <div
            key={entry.id}
            className="rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${phaseC}20 0%, rgba(8,5,4,0.6) 100%)`,
              border: `1px solid ${phaseC}35`,
            }}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-cinzel text-ivory/40 text-[10px] tracking-widest uppercase mb-0.5">
                  Active Challenge
                </p>
                <h3 className="font-cinzel text-ivory text-base">{challenge.name}</h3>
              </div>
              <span className="font-garamond text-ivory/35 text-xs shrink-0 ml-3">
                Ends in {daysLeft}d
              </span>
            </div>
            <p className="font-garamond text-ivory/45 text-sm mb-3">
              {entry.sessions_completed ?? 0} of {challenge.sessions_required} sessions completed
            </p>
            <div className="h-1.5 rounded-full mb-3" style={{ background: 'rgba(244,239,230,0.08)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: phaseC }}
              />
            </div>
            <button
              className="w-full py-3 rounded-xl font-cinzel text-xs tracking-widest"
              style={{
                background: 'linear-gradient(90deg, rgba(201,168,108,0.18) 0%, rgba(201,168,108,0.36) 50%, rgba(201,168,108,0.18) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmerSlide 2.5s infinite',
                border: '1px solid rgba(201,168,108,0.5)',
                color: '#C9A86C',
              }}
            >
              CONTINUE CHALLENGE
            </button>
          </div>
        )
      })}

      {/* ── Available challenges ─────────────────────────────────────── */}
      {available.length > 0 && (
        <div>
          <p className="font-cinzel text-ivory/35 text-[10px] tracking-widest uppercase mb-2">
            Available Challenges
          </p>
          <div className="grid grid-cols-2 gap-3">
            {available.map(c => {
              const cpc = PHASE_COLORS[c.phase] ?? '#C9A86C'
              return (
                <div
                  key={c.id}
                  className="rounded-xl p-3"
                  style={{
                    background: `${cpc}10`,
                    border: `1px solid ${cpc}25`,
                  }}
                >
                  <h4 className="font-cinzel text-ivory text-[13px] leading-tight mb-1">{c.name}</h4>
                  <p className="font-garamond text-ivory/40 text-xs mb-0.5">
                    {c.duration_days} days
                  </p>
                  <p className="font-garamond text-ivory/35 text-xs mb-3">
                    {c.sessions_required} sessions
                  </p>
                  {c.phase && (
                    <span
                      className="inline-block font-garamond text-[10px] px-2 py-0.5 rounded-full capitalize mb-2"
                      style={{ background: `${cpc}20`, color: cpc, border: `1px solid ${cpc}35` }}
                    >
                      {c.phase}
                    </span>
                  )}
                  <button
                    onClick={() => handleJoin(c)}
                    disabled={joining === c.id}
                    className="w-full py-2 rounded-lg font-garamond text-xs transition-all"
                    style={{
                      background: 'transparent',
                      border: `1px solid ${cpc}45`,
                      color: cpc,
                      opacity: joining === c.id ? 0.5 : 1,
                    }}
                  >
                    {joining === c.id ? '···' : 'Join'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!challenges.length && (
        <div
          className="py-10 flex flex-col items-center rounded-2xl"
          style={{ background: 'rgba(201,168,108,0.04)', border: '1px solid rgba(201,168,108,0.1)' }}
        >
          <p className="font-garamond text-ivory/30 text-sm">No challenges available yet</p>
          <p className="font-garamond italic text-ivory/20 text-xs mt-1">Check back soon</p>
        </div>
      )}

      {/* ── Completed challenges ─────────────────────────────────────── */}
      {completed.length > 0 && (
        <div>
          <p className="font-cinzel text-ivory/35 text-[10px] tracking-widest uppercase mb-2">
            Completed
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            {completed.map(({ entry, challenge }) => (
              <div
                key={entry.id}
                className="shrink-0 rounded-xl p-3 flex flex-col items-center gap-1"
                style={{
                  width: 140,
                  background: 'rgba(201,168,108,0.08)',
                  border: '1px solid rgba(201,168,108,0.2)',
                }}
              >
                <span className="text-2xl">🛡</span>
                <p className="font-cinzel text-ivory/70 text-[11px] text-center leading-tight">
                  {challenge.name}
                </p>
                <p className="font-garamond text-ivory/30 text-[10px]">
                  {entry.completed_at ? format(new Date(entry.completed_at), 'MMM d') : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
