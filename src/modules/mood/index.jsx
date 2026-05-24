// Mood module — sub-routes live here
// e.g. /mood/journal  /mood/history  /mood/gratitude
import { Routes, Route } from 'react-router-dom'

function Journal() {
  return <ModuleShell title="Journal" />
}

function MoodHistory() {
  return <ModuleShell title="Mood History" />
}

function Gratitude() {
  return <ModuleShell title="Gratitude" />
}

function ModuleShell({ title }) {
  return (
    <div className="min-h-screen bg-[#F5E4E1] pb-nav px-4 pt-8 max-w-md mx-auto">
      <p className="font-cinzel text-rose tracking-widest text-xs uppercase mb-2">Mood & Mind</p>
      <h3 className="font-cinzel text-2xl text-brown tracking-wide mb-6">{title}</h3>
      <p className="font-garamond text-brown/30 text-sm">— design this section —</p>
    </div>
  )
}

export default function MoodModule() {
  return (
    <Routes>
      <Route path="journal"   element={<Journal />} />
      <Route path="history"   element={<MoodHistory />} />
      <Route path="gratitude" element={<Gratitude />} />
    </Routes>
  )
}
