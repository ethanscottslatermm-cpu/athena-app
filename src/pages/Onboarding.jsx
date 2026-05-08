import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'

const steps = ['Name', 'Cycle', 'Goals', 'Done']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({ full_name: '', last_period_date: '', cycle_length: 28, goals: [] })
  const { updateProfile } = useProfile()
  const navigate = useNavigate()

  const goalOptions = ['fitness', 'mental_health', 'skin', 'nutrition', 'sleep', 'community']

  function toggleGoal(g) {
    setData(d => ({
      ...d,
      goals: d.goals.includes(g) ? d.goals.filter(x => x !== g) : [...d.goals, g]
    }))
  }

  async function finish() {
    await updateProfile({ ...data, onboarding_done: true })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#060404] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-gold' : 'bg-white/10'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-cinzel text-2xl text-ivory">What should we call you?</h2>
            <input
              type="text"
              placeholder="Your name"
              value={data.full_name}
              onChange={e => setData(d => ({ ...d, full_name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder-white/30 focus:outline-none focus:border-gold/60 font-garamond"
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-cinzel text-2xl text-ivory">Your cycle</h2>
            <label className="block font-garamond text-ivory/60 text-sm">Last period start date</label>
            <input
              type="date"
              value={data.last_period_date}
              onChange={e => setData(d => ({ ...d, last_period_date: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory focus:outline-none focus:border-gold/60 font-garamond"
            />
            <label className="block font-garamond text-ivory/60 text-sm">Average cycle length: {data.cycle_length} days</label>
            <input
              type="range" min="21" max="35"
              value={data.cycle_length}
              onChange={e => setData(d => ({ ...d, cycle_length: Number(e.target.value) }))}
              className="w-full accent-gold"
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-cinzel text-2xl text-ivory">Your goals</h2>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map(g => (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={`px-4 py-2 rounded-full font-garamond text-sm border transition-colors ${
                    data.goals.includes(g)
                      ? 'bg-gold/20 border-gold text-gold'
                      : 'bg-white/5 border-white/10 text-ivory/60'
                  }`}
                >
                  {g.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <h2 className="font-cinzel text-3xl text-gold">You're ready.</h2>
            <p className="font-garamond text-ivory/60">Athena will guide you through every phase.</p>
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-white/10 text-ivory/60 font-cinzel tracking-widest py-3 rounded-xl"
            >
              BACK
            </button>
          )}
          <button
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : finish()}
            className="flex-1 bg-gold/90 hover:bg-gold text-[#060404] font-cinzel tracking-widest py-3 rounded-xl transition-colors"
          >
            {step === steps.length - 1 ? 'BEGIN' : 'NEXT'}
          </button>
        </div>
      </div>
    </div>
  )
}
