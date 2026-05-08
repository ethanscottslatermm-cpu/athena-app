// Nourish module — sub-routes live here
// e.g. /nourish  /nourish/log  /nourish/history  /nourish/recipes
import { Routes, Route } from 'react-router-dom'

function NourishHome() {
  return <ModuleShell title="Nourish" />
}

function FoodLog() {
  return <ModuleShell title="Food Log" />
}

function FoodHistory() {
  return <ModuleShell title="History" />
}

function Recipes() {
  return <ModuleShell title="Recipes" />
}

function ModuleShell({ title }) {
  return (
    <div className="min-h-screen bg-[#060404] pb-20 px-4 pt-8 max-w-md mx-auto">
      <p className="font-cinzel text-sage tracking-widest text-xs uppercase mb-2">Nourish</p>
      <h3 className="font-cinzel text-2xl text-ivory tracking-wide mb-6">{title}</h3>
      <p className="font-garamond text-ivory/30 text-sm">— design this section —</p>
    </div>
  )
}

export default function NourishModule() {
  return (
    <Routes>
      <Route index          element={<NourishHome />} />
      <Route path="log"     element={<FoodLog />} />
      <Route path="history" element={<FoodHistory />} />
      <Route path="recipes" element={<Recipes />} />
    </Routes>
  )
}
