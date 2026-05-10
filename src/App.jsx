import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'

import BottomNav from './components/BottomNav'

import Login        from './pages/Login'
import Onboarding   from './pages/Onboarding'
import Dashboard    from './pages/Dashboard'
import PilatesStudio from './pages/PilatesStudio'
import Community    from './pages/Community'
import CycleTracker from './pages/CycleTracker'
import MoodMind     from './pages/MoodMind'
import Settings     from './pages/Settings'

import PilatesModule from './modules/pilates'
import CycleModule   from './modules/cycle'
import MoodModule    from './modules/mood'
import NourishModule from './modules/nourish'
import SleepModule   from './modules/sleep'
import SkinModule    from './modules/skin'

function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function OnboardingGuard({ children }) {
  const { profile, loading } = useProfile()
  if (loading) return <Splash />
  if (profile && !profile.preferences?.onboarding_done) return <Navigate to="/onboarding" replace />
  return children
}

function Splash() {
  return <div className="min-h-[100svh] bg-[#060404]" />
}

function AppShell({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}

/* ─── Phone frame wrapper ───────────────────────────────────────────────────
   On mobile  → full screen
   On desktop → centered phone-width column, pure-black surround, no chrome */
function PhoneFrame({ children }) {
  return (
    <div className="min-h-[100svh] bg-[#060404] flex items-stretch justify-center">
      <div className="relative w-full md:max-w-sm md:overflow-hidden bg-[#060404] min-h-[100svh] flex flex-col">
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PhoneFrame>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            <AuthGuard><Onboarding /></AuthGuard>
          } />

          {/* Protected */}
          <Route path="/*" element={
            <AuthGuard>
              <OnboardingGuard>
                <AppShell>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="pilates"   element={<PilatesStudio />} />
                    <Route path="pilates/*" element={<PilatesModule />} />
                    <Route path="community" element={<Community />} />
                    <Route path="cycle"     element={<CycleTracker />} />
                    <Route path="cycle/*"   element={<CycleModule />} />
                    <Route path="mood"      element={<MoodMind />} />
                    <Route path="mood/*"    element={<MoodModule />} />
                    <Route path="nourish/*" element={<NourishModule />} />
                    <Route path="sleep/*"   element={<SleepModule />} />
                    <Route path="skin/*"    element={<SkinModule />} />
                    <Route path="settings"  element={<Settings />} />
                    <Route path="*"         element={<Navigate to="/" replace />} />
                  </Routes>
                </AppShell>
              </OnboardingGuard>
            </AuthGuard>
          } />
        </Routes>
      </PhoneFrame>
    </BrowserRouter>
  )
}
