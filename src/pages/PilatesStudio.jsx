import GlassCard from '../components/GlassCard'
import { usePhase } from '../hooks/usePhase'

export default function PilatesStudio() {
  const { label, color } = usePhase()

  return (
    <div className="min-h-screen bg-[#060404] pb-20 px-4 pt-8 max-w-md mx-auto">
      <h2 className="font-cinzel text-2xl text-ivory tracking-widest mb-2">Pilates Studio</h2>
      {label && (
        <p className="font-garamond text-sm mb-6" style={{ color }}>
          Sessions curated for your {label} phase
        </p>
      )}
      <GlassCard>
        <p className="font-garamond text-ivory/60">Phase-matched sessions coming soon.</p>
      </GlassCard>
    </div>
  )
}
