import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fn = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })

    const { error: authError } = await fn
    if (authError) setError(authError.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#060404] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-cinzel text-4xl text-gold text-center mb-2 tracking-widest">ATHENA</h1>
        <p className="font-garamond text-ivory/60 text-center mb-10 tracking-wide">
          Your strength. Your cycle. Your story.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder-white/30 focus:outline-none focus:border-gold/60 font-garamond"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-ivory placeholder-white/30 focus:outline-none focus:border-gold/60 font-garamond"
          />

          {error && (
            <p className="text-crimson text-sm font-garamond text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold/90 hover:bg-gold text-[#060404] font-cinzel tracking-widest py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'ENTER' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <button
          onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
          className="w-full mt-4 text-ivory/40 hover:text-ivory/70 font-garamond text-sm text-center transition-colors"
        >
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
