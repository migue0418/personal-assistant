// frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import CalendarPage from '@/features/weekly-planning/components/CalendarPage'
import { useNotifications } from '@/shared/hooks/useNotifications'

const ShoppingListsPage = lazy(
  () => import('@/features/shopping-list/components/ShoppingListsPage')
)
const ShoppingListDetail = lazy(
  () => import('@/features/shopping-list/components/ShoppingListDetail')
)
const ProductsPage = lazy(() => import('@/features/products/components/ProductsPage'))

function NotFound() {
  return (
    <div
      className="flex h-full items-center justify-center text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      404 — Página no encontrada
    </div>
  )
}

function Loading() {
  return (
    <div
      className="flex h-full items-center justify-center text-sm"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      Cargando…
    </div>
  )
}

export default function App() {
  useNotifications()

  return (
    <>
      <Sidebar />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/planning" replace />} />
          <Route path="/planning" element={<CalendarPage />} />
          <Route path="/shopping" element={<ShoppingListsPage />} />
          <Route path="/shopping/:id" element={<ShoppingListDetail />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}
