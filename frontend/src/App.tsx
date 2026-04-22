import { Routes, Route, Navigate } from 'react-router-dom'
import CalendarPage from '@/features/weekly-planning/components/CalendarPage'

function NotFound() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
      404 — Página no encontrada
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/planning" replace />} />
      <Route path="/planning" element={<CalendarPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
