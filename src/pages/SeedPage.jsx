import { useState } from 'react'
import { seedPilates } from '../lib/seedPilates'

export default function SeedPage() {
  const [log,     setLog]     = useState([])
  const [running, setRunning] = useState(false)
  const [done,    setDone]    = useState(false)

  async function handleSeed() {
    setRunning(true)
    setLog([])

    const origLog     = console.log
    const origError   = console.error
    const lines       = []

    console.log   = (...args) => { origLog(...args);   lines.push({ ok: true,  msg: args.join(' ') }); setLog([...lines]) }
    console.error = (...args) => { origError(...args); lines.push({ ok: false, msg: args.join(' ') }); setLog([...lines]) }

    await seedPilates()

    console.log   = origLog
    console.error = origError
    setRunning(false)
    setDone(true)
  }

  return (
    <div className="min-h-[100svh] bg-[#060404] px-6 pt-16 pb-10 max-w-md mx-auto">
      <p className="font-cinzel text-gold text-xs tracking-widest uppercase mb-1">Dev Tool</p>
      <h2 className="font-cinzel text-ivory text-2xl mb-2">Seed Pilates Data</h2>
      <p className="font-garamond text-ivory/45 text-sm mb-8">
        Inserts 20 sessions, ~120 exercises, and 5 challenges into Supabase.
        Run once — delete this page after.
      </p>

      {!done ? (
        <button
          onClick={handleSeed}
          disabled={running}
          className="w-full py-4 rounded-xl font-cinzel tracking-widest text-sm mb-6"
          style={{
            background: running ? 'rgba(201,168,108,0.08)' : 'rgba(201,168,108,0.15)',
            border: '1px solid rgba(201,168,108,0.5)',
            color: '#C9A86C',
          }}
        >
          {running ? 'Seeding…' : 'Seed Pilates Data'}
        </button>
      ) : (
        <div
          className="w-full py-4 rounded-xl font-cinzel tracking-widest text-sm text-center mb-6"
          style={{ background: 'rgba(143,175,138,0.12)', border: '1px solid rgba(143,175,138,0.4)', color: '#8FAF8A' }}
        >
          ✓ Done — navigate to /pilates
        </div>
      )}

      {log.length > 0 && (
        <div
          className="rounded-xl p-4 space-y-1"
          style={{ background: 'rgba(8,5,4,0.7)', border: '1px solid rgba(244,239,230,0.08)' }}
        >
          {log.map((l, i) => (
            <p key={i} className="font-garamond text-sm" style={{ color: l.ok ? '#8FAF8A' : '#C49A9A' }}>
              {l.msg}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
