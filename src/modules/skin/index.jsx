// Skin module — sub-routes live here
// e.g. /skin  /skin/log  /skin/history  /skin/routine
import { Routes, Route } from 'react-router-dom'

function SkinHome() {
  return <ModuleShell title="Skin Journal" />
}

function SkinLog() {
  return <ModuleShell title="Log Skin" />
}

function SkinHistory() {
  return <ModuleShell title="Skin History" />
}

function Routine() {
  return <ModuleShell title="My Routine" />
}

function ModuleShell({ title }) {
  return (
    <div className="min-h-screen bg-[#060404] pb-20 px-4 pt-8 max-w-md mx-auto">
      <p className="font-cinzel text-rose tracking-widest text-xs uppercase mb-2">Skin</p>
      <h3 className="font-cinzel text-2xl text-ivory tracking-wide mb-6">{title}</h3>
      <p className="font-garamond text-ivory/30 text-sm">— design this section —</p>
    </div>
  )
}

export default function SkinModule() {
  return (
    <Routes>
      <Route index          element={<SkinHome />} />
      <Route path="log"     element={<SkinLog />} />
      <Route path="history" element={<SkinHistory />} />
      <Route path="routine" element={<Routine />} />
    </Routes>
  )
}
