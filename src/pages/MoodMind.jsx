import { useState } from 'react'
import GlassCard from '../components/GlassCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePhase } from '../hooks/usePhase'

const emotions = ['happy', 'anxious', 'calm', 'irritable', 'motivated', 'sad', 'grateful', 'overwhelmed']

export default function MoodMind() {
  const { user } = useAuth()
  const { phase } = usePhase()
  const [mood, setMood] = useState(5)
  const [energy, setEnergy] = useState(5)
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleEmotion(e) {
    setSelected(s => s.includes(e) ? s.filter(x => x !== e) : [...s, e])
  }

  async function save() {
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('mood_logs').upsert({
      user_id: user.id,
      logged_date: today,
      mood_score: mood,
      energy_score: energy,
      emotions: selected,
      phase_at_time: phase,
    })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="min-h-screen bg-[#060404] pb-nav px-4 pt-8 max-w-md mx-auto">
      <h2 className="font-cinzel text-2xl text-ivory tracking-widest mb-6">Mood & Mind</h2>

      <GlassCard className="mb-4 space-y-4">
        <div>
          <p className="font-garamond text-ivory/60 text-sm mb-2">Mood: {mood}/10</p>
          <input type="range" min="1" max="10" value={mood} onChange={e => setMood(Number(e.target.value))} className="w-full accent-mauve" />
        </div>
        <div>
          <p className="font-garamond text-ivory/60 text-sm mb-2">Energy: {energy}/10</p>
          <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))} className="w-full accent-sage" />
        </div>
      </GlassCard>

      <GlassCard className="mb-4">
        <p className="font-garamond text-ivory/60 text-sm mb-3">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {emotions.map(e => (
            <button
              key={e}
              onClick={() => toggleEmotion(e)}
              className={`px-3 py-1.5 rounded-full font-garamond text-sm border transition-colors ${
                selected.includes(e) ? 'bg-mauve/30 border-mauve text-rose' : 'bg-white/5 border-white/10 text-ivory/50'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </GlassCard>

      <button
        onClick={save}
        disabled={saving || saved}
        className="w-full bg-mauve/80 hover:bg-mauve text-ivory font-cinzel tracking-widest py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {saved ? 'SAVED' : saving ? '...' : 'LOG MOOD'}
      </button>
    </div>
  )
}
