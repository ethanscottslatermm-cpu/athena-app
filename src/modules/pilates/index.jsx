// Pilates sub-routes — all session navigation is handled via overlay state
// inside PilatesStudio.jsx rather than URL routing, so this module is minimal.
import { Navigate } from 'react-router-dom'

export default function PilatesModule() {
  return <Navigate to="/pilates" replace />
}
