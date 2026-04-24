// frontend/src/features/shopping-list/components/ShoppingListDetail.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { shoppingRepo } from '@/db/repositories/shoppingRepo'
import { useShoppingListDetail } from '../hooks/useShoppingList'
import ShoppingItemRow from './ShoppingItemRow'
import AddItemSearch from './AddItemSearch'
import type { ShoppingList } from '../types'

export default function ShoppingListDetail() {
  const { id } = useParams<{ id: string }>()
  const listId = Number(id)
  const navigate = useNavigate()
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const { items, isLoading, refresh } = useShoppingListDetail(listId)
  const [list, setList] = useState<ShoppingList | null>(null)

  useEffect(() => {
    void shoppingRepo.getAllLists().then(all => {
      const found = all.find(l => l.id === listId)
      if (found) setList(found)
    })
  }, [listId])

  const checkedCount = items.filter(i => i.checked).length
  const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)
  const hasPrices = items.some(i => i.price !== undefined)

  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.category ?? ''
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    if (a === '') return 1
    if (b === '') return -1
    return a.localeCompare(b, 'es')
  })

  async function handleUncheckAll() {
    await shoppingRepo.uncheckAllItems(listId)
    refresh()
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Header */}
      <header
        className="flex items-center gap-3 border-b px-4 py-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          type="button"
          onClick={() => void navigate('/shopping')}
          aria-label="Volver"
          className="flex h-9 w-9 items-center justify-center rounded-full"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span
          className="flex-1 truncate text-base font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {list?.name ?? '…'}
        </span>

        {hasPrices && (
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            ~{total.toFixed(2).replace('.', ',')} €
          </span>
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Abrir menú"
          className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full"
        >
          <span
            className="block h-[1.5px] w-4 rounded"
            style={{ backgroundColor: 'var(--color-text-secondary)' }}
          />
          <span
            className="block h-[1.5px] w-4 rounded"
            style={{ backgroundColor: 'var(--color-text-secondary)' }}
          />
          <span
            className="block h-[1.5px] w-4 rounded"
            style={{ backgroundColor: 'var(--color-text-secondary)' }}
          />
        </button>
      </header>

      {/* Search */}
      <AddItemSearch listId={listId} onItemAdded={refresh} />

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Cargando…
          </p>
        ) : items.length === 0 ? (
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Añade el primer producto con la barra de búsqueda.
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
              {(grouped[cat] ?? [])
                .sort((a, b) => a.name.localeCompare(b.name, 'es'))
                .map(item => (
                  <ShoppingItemRow key={item.id} item={item} onRefresh={refresh} />
                ))}
            </div>
          ))
        )}
      </div>

      {/* Uncheck all footer */}
      {checkedCount >= 1 && (
        <div className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={() => void handleUncheckAll()}
            className="w-full rounded-xl border py-2.5 text-sm font-medium"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Desmarcar todo ({checkedCount})
          </button>
        </div>
      )}
    </div>
  )
}
