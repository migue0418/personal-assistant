// frontend/src/features/shopping-list/components/AddItemSearch.tsx
import { useState, useEffect, useRef } from 'react'
import { productsRepo } from '@/db/repositories/productsRepo'
import { shoppingRepo } from '@/db/repositories/shoppingRepo'
import type { Product } from '@/features/products/types'

interface Props {
  listId: number
  onItemAdded: () => void
}

export default function AddItemSearch({ listId, onItemAdded }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      return
    }
    void productsRepo.searchProducts(query).then(setResults)
  }, [query])

  const hasExactMatch = results.some(p => p.name.toLowerCase() === query.trim().toLowerCase())

  async function selectProduct(product: Product) {
    await shoppingRepo.addItem({
      listId,
      ...(product.id !== undefined ? { productId: product.id } : {}),
      name: product.name,
      ...(product.price !== undefined ? { price: product.price } : {}),
      quantity: 1,
      ...(product.category !== undefined ? { category: product.category } : {}),
      checked: false,
    })
    setQuery('')
    setShowDropdown(false)
    onItemAdded()
  }

  async function createAndAdd() {
    const name = query.trim()
    if (!name) return
    const productId = await productsRepo.createProduct({ name })
    await shoppingRepo.addItem({
      listId,
      productId,
      name,
      quantity: 1,
      checked: false,
    })
    setQuery('')
    setShowDropdown(false)
    onItemAdded()
  }

  return (
    <div className="relative border-b px-4 py-2" style={{ borderColor: 'var(--color-border)' }}>
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2"
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
          ref={inputRef}
          type="text"
          placeholder="Buscar o añadir producto..."
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setShowDropdown(false)
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
              style={{ color: 'var(--color-text-disabled)' }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && query.trim().length > 0 && (
        <div
          className="absolute right-4 left-4 z-30 mt-1 overflow-hidden rounded-xl border shadow-lg"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {results.map(product => (
            <button
              key={product.id}
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
              style={{
                borderBottom: '1px solid var(--color-grid-line)',
                color: 'var(--color-text-primary)',
              }}
              onMouseDown={e => {
                e.preventDefault()
                void selectProduct(product)
              }}
            >
              <span>{product.name}</span>
              {product.price !== undefined && (
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {product.price.toFixed(2).replace('.', ',')} €
                </span>
              )}
            </button>
          ))}
          {!hasExactMatch && query.trim() && (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
              onMouseDown={e => {
                e.preventDefault()
                void createAndAdd()
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
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Crear "{query.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}
