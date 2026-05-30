import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'

import BottomNav    from './components/BottomNav'
import WelcomeFlow  from './components/WelcomeFlow'
import { useSwipeNav } from './hooks/useSwipeNav'
import { useAdmin }    from './hooks/useAdmin'
import SwipeHint       from './components/SwipeHint'
import { ProfileProvider } from './contexts/ProfileContext'

const Login         = lazy(() => import('./pages/Login'))
const SeedPage      = lazy(() => import('./pages/SeedPage'))
const Onboarding    = lazy(() => import('./pages/Onboarding'))
const Dashboard     = lazy(() => import('./pages/Dashboard'))
const PilatesStudio = lazy(() => import('./pages/PilatesStudio'))
const Community     = lazy(() => import('./pages/Community'))
const CycleTracker  = lazy(() => import('./pages/CycleTracker'))
const MoodMind      = lazy(() => import('./pages/MoodMind'))
const Nourish       = lazy(() => import('./pages/Nourish'))
const Sleep         = lazy(() => import('./pages/Sleep'))
const Skin          = lazy(() => import('./pages/Skin'))
const Settings      = lazy(() => import('./pages/Settings'))
const AdminPanel    = lazy(() => import('./pages/AdminPanel'))

const PilatesModule = lazy(() => import('./modules/pilates'))
const CycleModule   = lazy(() => import('./modules/cycle'))
const MoodModule    = lazy(() => import('./modules/mood'))
const NourishModule = lazy(() => import('./modules/nourish'))
const SleepModule   = lazy(() => import('./modules/sleep'))
const SkinModule    = lazy(() => import('./modules/skin'))
const GroceryModule = lazy(() => import('./modules/grocery/GroceryModule'))

function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminGuard({ children }) {
  const { isAdmin, loading } = useAdmin()
  if (loading) return <Splash />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function OnboardingGuard({ children }) {
  const { profile, loading } = useProfile()
  if (loading) return <Splash />
  if (profile && !profile.preferences?.onboarding_done) return <Navigate to="/onboarding" replace />
  return children
}

function Splash() {
  return <div className="min-h-[100svh] bg-[#F3EAE7]" />
}

function WelcomeOverlay() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    function show() {
      setFading(false)
      setVisible(true)
    }
    window.addEventListener('athena:welcome', show)
    return () => window.removeEventListener('athena:welcome', show)
  }, [])

  useEffect(() => {
    if (!visible) return
    const t1 = setTimeout(() => setFading(true), 1600)
    const t2 = setTimeout(() => setVisible(false), 2350)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [visible])

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes wFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes wWordIn  {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: '#FFFAF6',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '10px',
        animation: fading ? 'wFadeOut 0.75s ease forwards' : 'wFadeIn 0.6s ease forwards',
        pointerEvents: 'none',
      }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '20px', fontWeight: 300,
          letterSpacing: '0.38em',
          color: '#3B3330',
          margin: 0,
          animation: 'wWordIn 1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both',
        }}>Welcome In</p>
        <div style={{
          width: '32px', height: '0.5px',
          background: 'rgba(196,133,154,0.45)',
          animation: 'wWordIn 1s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both',
        }} />
      </div>
    </>
  )
}

function AppShell({ children }) {
  useSwipeNav()
  return (
    <>
      {children}
      <BottomNav />
      <WelcomeFlow />
      <SwipeHint />
    </>
  )
}

/* ─── Phone frame wrapper ───────────────────────────────────────────────────
   On mobile  → full screen
   On desktop → centered phone-width column, pure-black surround, no chrome */
function PhoneFrame({ children }) {
  return (
    <div className="min-h-[100svh] bg-[#F3EAE7] flex items-stretch justify-center">
      <div className="relative w-full md:max-w-sm bg-[#F3EAE7] h-[100svh] flex flex-col overflow-hidden">
        {children}
        <WelcomeOverlay />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <PhoneFrame>
          <Suspense fallback={<Splash />}>
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
                        <Route path="nourish"   element={<Nourish />} />
                        <Route path="nourish/*" element={<NourishModule />} />
                        <Route path="sleep"     element={<Sleep />} />
                        <Route path="sleep/*"   element={<SleepModule />} />
                        <Route path="skin"      element={<Skin />} />
                        <Route path="skin/*"    element={<SkinModule />} />
                        <Route path="grocery"   element={<GroceryModule />} />
                        <Route path="settings"  element={<Settings />} />
                        <Route path="admin"     element={<AdminGuard><AdminPanel /></AdminGuard>} />
                        <Route path="seed"      element={<AdminGuard><SeedPage /></AdminGuard>} />
                        <Route path="*"         element={<Navigate to="/" replace />} />
                      </Routes>
                    </AppShell>
                  </OnboardingGuard>
                </AuthGuard>
              } />
            </Routes>
          </Suspense>
        </PhoneFrame>
      </ProfileProvider>
    </BrowserRouter>
  )
}
