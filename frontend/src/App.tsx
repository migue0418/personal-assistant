import { Routes, Route, Navigate } from 'react-router-dom'
import WeeklyPlanningPage from '@/features/weekly-planning/components/WeeklyPlanningPage'

function NotFound() {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      404 — Página no encontrada
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/planning" replace />} />
      <Route path="/planning" element={<WeeklyPlanningPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
