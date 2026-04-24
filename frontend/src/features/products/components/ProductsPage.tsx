// frontend/src/features/products/components/ProductsPage.tsx
import { useState, useMemo } from 'react'
import TopBar from '@/shared/components/TopBar'
import { productsRepo } from '@/db/repositories/productsRepo'
import { useProducts } from '../hooks/useProducts'
import ProductModal from './ProductModal'
import type { Product } from '../types'

export default function ProductsPage() {
  const { products, isLoading, refresh } = useProducts()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [modalProduct, setModalProduct] = useState<Product | 'new' | null>(null)

  const categories = useMemo(
    () =>
      [...new Set(products.map(p => p.category).filter((c): c is string => c !== undefined))].sort(
        (a, b) => a.localeCompare(b, 'es')
      ),
    [products]
  )

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCat = !filterCategory || p.category === filterCategory
    return matchesSearch && matchesCat
  })

  const grouped = filtered.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.category ?? ''
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === '') return 1
    if (b === '') return -1
    return a.localeCompare(b, 'es')
  })

  async function handleDelete(product: Product) {
    if (!product.id) return
    const inUse = await productsRepo.isProductInUse(product.id)
    if (inUse) {
      alert(`"${product.name}" está en uso en una lista de la compra y no se puede eliminar.`)
      return
    }
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return
    await productsRepo.deleteProduct(product.id)
    refresh()
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      <TopBar title="Productos" />

      {/* Search + filter */}
      <div className="flex gap-2 border-b px-4 py-2" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-variant)',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-text-disabled)', flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>
        {categories.length > 0 && (
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface-variant)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <option value="">Todas</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Cargando…
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {products.length === 0 ? 'No hay productos todavía.' : 'Sin resultados.'}
          </p>
        ) : (
          sortedCategories.map(cat => (
            <div key={cat}>
              <p
                className="mt-4 mb-1 text-xs font-semibold tracking-wider uppercase"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {cat === '' ? 'Sin categoría' : cat}
              </p>
              {(grouped[cat] ?? []).map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 border-b py-3"
                  style={{ borderColor: 'var(--color-grid-line)' }}
                >
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {product.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {product.price !== undefined
                        ? product.price.toFixed(2).replace('.', ',') + ' €/ud'
                        : 'Sin precio'}
                    </p>
                  </div>
                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => setModalProduct(product)}
                    aria-label="Editar"
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => void handleDelete(product)}
                    aria-label="Eliminar"
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* New product button */}
      <div className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
        <button
          type="button"
          onClick={() => setModalProduct('new')}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo producto
        </button>
      </div>

      {/* Modal */}
      {modalProduct !== null && (
        <ProductModal
          product={modalProduct === 'new' ? undefined : modalProduct}
          existingCategories={categories}
          onSaved={refresh}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  )
}
