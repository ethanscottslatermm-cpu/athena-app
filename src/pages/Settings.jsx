import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProfile } from '../hooks/useProfile'
import GlassCard from '../components/GlassCard'

export default function Settings() {
  const { profile } = useProfile()
  const navigate = useNavigate()

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#060404] pb-nav px-4 pt-8 max-w-md mx-auto">
      <h2 className="font-cinzel text-2xl text-ivory tracking-widest mb-6">Settings</h2>

      <GlassCard className="mb-4">
        <p className="font-garamond text-ivory/40 text-xs uppercase tracking-widest mb-1">Account</p>
        <p className="font-garamond text-ivory">{profile?.email}</p>
      </GlassCard>

      <button
        onClick={signOut}
        className="w-full border border-crimson/40 text-crimson/80 font-cinzel tracking-widest py-3 rounded-xl hover:bg-crimson/10 transition-colors"
      >
        SIGN OUT
      </button>
    </div>
  )
}
