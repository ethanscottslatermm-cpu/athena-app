import GlassCard from '../components/GlassCard'
import PhaseBar from '../components/PhaseBar'
import { usePhase } from '../hooks/usePhase'
import { useProfile } from '../hooks/useProfile'

export default function Dashboard() {
  const { label, color } = usePhase()
  const { profile } = useProfile()

  return (
    <div className="min-h-screen bg-[#060404] pb-20">
      <PhaseBar />
      <div className="px-4 pt-8 space-y-4 max-w-md mx-auto">
        <h2 className="font-cinzel text-2xl text-ivory tracking-widest">
          {profile?.full_name ? `Welcome, ${profile.full_name.split(' ')[0]}` : 'Welcome'}
        </h2>
        {label && (
          <GlassCard>
            <p className="font-garamond text-ivory/60 text-sm uppercase tracking-widest mb-1">Current Phase</p>
            <p className="font-cinzel text-xl" style={{ color }}>{label}</p>
          </GlassCard>
        )}
        <GlassCard>
          <p className="font-garamond text-ivory/60 text-sm">Your Athena dashboard is ready. Start tracking your cycle, mood, and movement.</p>
        </GlassCard>
      </div>
    </div>
  )
}
