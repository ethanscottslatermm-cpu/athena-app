// Sleep module — sub-routes live here
// e.g. /sleep  /sleep/log  /sleep/history
import { Routes, Route } from 'react-router-dom'

function SleepHome() {
  return <ModuleShell title="Sleep" />
}

function SleepLog() {
  return <ModuleShell title="Log Sleep" />
}

function SleepHistory() {
  return <ModuleShell title="Sleep History" />
}

function ModuleShell({ title }) {
  return (
    <div className="min-h-screen bg-[#060404] pb-20 px-4 pt-8 max-w-md mx-auto">
      <p className="font-cinzel text-gold/70 tracking-widest text-xs uppercase mb-2">Sleep</p>
      <h3 className="font-cinzel text-2xl text-ivory tracking-wide mb-6">{title}</h3>
      <p className="font-garamond text-ivory/30 text-sm">— design this section —</p>
    </div>
  )
}

export default function SleepModule() {
  return (
    <Routes>
      <Route index          element={<SleepHome />} />
      <Route path="log"     element={<SleepLog />} />
      <Route path="history" element={<SleepHistory />} />
    </Routes>
  )
}
