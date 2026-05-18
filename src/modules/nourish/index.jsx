import { Routes, Route, Navigate } from 'react-router-dom'
import Nourish from '../../pages/Nourish'

export default function NourishModule() {
  return (
    <Routes>
      <Route index element={<Nourish />} />
      <Route path="*" element={<Navigate to="/nourish" replace />} />
    </Routes>
  )
}
