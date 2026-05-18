import { Routes, Route, Navigate } from 'react-router-dom'
import Skin from '../../pages/Skin'

export default function SkinModule() {
  return (
    <Routes>
      <Route index element={<Skin />} />
      <Route path="*" element={<Navigate to="/skin" replace />} />
    </Routes>
  )
}
