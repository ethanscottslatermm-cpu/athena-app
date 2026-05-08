// Pilates module — sub-routes live here
// e.g. /pilates/session/:id  /pilates/history  /pilates/favorites
import { Routes, Route } from 'react-router-dom'

function SessionDetail() {
  return <ModuleShell title="Session" />
}

function History() {
  return <ModuleShell title="History" />
}

function Favorites() {
  return <ModuleShell title="Favorites" />
}

function ModuleShell({ title }) {
  return (
    <div className="min-h-screen bg-[#060404] pb-nav px-4 pt-8 max-w-md mx-auto">
      <p className="font-cinzel text-gold tracking-widest text-xs uppercase mb-2">Pilates</p>
      <h3 className="font-cinzel text-2xl text-ivory tracking-wide mb-6">{title}</h3>
      <p className="font-garamond text-ivory/30 text-sm">— design this section —</p>
    </div>
  )
}

export default function PilatesModule() {
  return (
    <Routes>
      <Route path="session/:id" element={<SessionDetail />} />
      <Route path="history"     element={<History />} />
      <Route path="favorites"   element={<Favorites />} />
    </Routes>
  )
}
