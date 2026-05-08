// Cycle module — sub-routes live here
// e.g. /cycle/log  /cycle/history  /cycle/insights
import { Routes, Route } from 'react-router-dom'

function SymptomLog() {
  return <ModuleShell title="Log Symptoms" />
}

function CycleHistory() {
  return <ModuleShell title="Cycle History" />
}

function CycleInsights() {
  return <ModuleShell title="Insights" />
}

function ModuleShell({ title }) {
  return (
    <div className="min-h-screen bg-[#060404] pb-20 px-4 pt-8 max-w-md mx-auto">
      <p className="font-cinzel text-crimson tracking-widest text-xs uppercase mb-2">Cycle</p>
      <h3 className="font-cinzel text-2xl text-ivory tracking-wide mb-6">{title}</h3>
      <p className="font-garamond text-ivory/30 text-sm">— design this section —</p>
    </div>
  )
}

export default function CycleModule() {
  return (
    <Routes>
      <Route path="log"      element={<SymptomLog />} />
      <Route path="history"  element={<CycleHistory />} />
      <Route path="insights" element={<CycleInsights />} />
    </Routes>
  )
}
