import GlassCard from '../components/GlassCard'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'

export default function CycleTracker() {
  const { phase, label, color, days } = usePhase()
  const { profile, updateProfile } = useProfile()

  async function logPeriodToday() {
    const today = new Date().toISOString().split('T')[0]
    await updateProfile({ last_period_date: today })
  }

  return (
    <div className="min-h-screen bg-[#060404] pb-20 px-4 pt-8 max-w-md mx-auto">
      <h2 className="font-cinzel text-2xl text-ivory tracking-widest mb-6">Cycle Tracker</h2>

      {phase ? (
        <GlassCard className="text-center mb-4">
          <p className="font-garamond text-ivory/40 text-xs uppercase tracking-widest mb-1">Current Phase</p>
          <p className="font-cinzel text-3xl mb-1" style={{ color }}>{label}</p>
          <p className="font-garamond text-ivory/50 text-sm">Days {days}</p>
        </GlassCard>
      ) : (
        <GlassCard className="mb-4">
          <p className="font-garamond text-ivory/60">Set your last period date to see your phase.</p>
        </GlassCard>
      )}

      <button
        onClick={logPeriodToday}
        className="w-full border border-crimson/40 text-crimson font-cinzel tracking-widest py-3 rounded-xl hover:bg-crimson/10 transition-colors"
      >
        LOG PERIOD TODAY
      </button>
    </div>
  )
}
