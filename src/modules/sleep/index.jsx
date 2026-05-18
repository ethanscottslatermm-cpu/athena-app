import { Routes, Route, Navigate } from 'react-router-dom'
import Sleep from '../../pages/Sleep'

export default function SleepModule() {
  return (
    <Routes>
      <Route index element={<Sleep />} />
      <Route path="*" element={<Navigate to="/sleep" replace />} />
    </Routes>
  )
}
