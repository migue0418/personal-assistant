// frontend/src/features/shopping-list/components/ShoppingListsPage.tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '@/shared/components/TopBar'
import { shoppingRepo } from '@/db/repositories/shoppingRepo'
import { useShoppingLists } from '../hooks/useShoppingList'
import type { ShoppingList, ShoppingItem } from '../types'

interface ListCardProps {
  list: ShoppingList
  itemCount: number
  totalPrice: number
  hasPrices: boolean
  onClick: () => void
  onDelete: () => void
}

function ListCard({ list, itemCount, totalPrice, hasPrices, onClick, onDelete }: ListCardProps) {
  const touchStartX = useRef(0)
  const [showDelete, setShowDelete] = useState(false)

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    if (touch) touchStartX.current = touch.clientX
    setShowDelete(false)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const touch = e.changedTouches[0]
    if (!touch) return
    const delta = touch.clientX - touchStartX.current
    if (delta < -60) setShowDelete(true)
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{ backgroundColor: 'var(--color-surface-variant)' }}
    >
      {showDelete && (
        <div className="absolute inset-y-0 right-0 z-10 flex items-center">
          <button
            type="button"
            onClick={onDelete}
            className="flex h-full items-center px-5 text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-current-time)' }}
          >
            Eliminar
          </button>
        </div>
      )}

      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={onClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {list.name}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {itemCount} {itemCount === 1 ? 'ítem' : 'ítems'}
            {hasPrices ? ` · ~${totalPrice.toFixed(2).replace('.', ',')} €` : ''}
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--color-text-disabled)', flexShrink: 0 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}

function ListCardWithItems({
  list,
  onClick,
  onDelete,
}: {
  list: ShoppingList
  onClick: () => void
  onDelete: () => void
}) {
  const [meta, setMeta] = useState({ count: 0, total: 0, hasPrices: false })

  useEffect(() => {
    if (!list.id) return
    void shoppingRepo.getItemsByList(list.id).then((items: ShoppingItem[]) => {
      const hasPrices = items.some(i => i.price !== undefined)
      const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)
      setMeta({ count: items.length, total, hasPrices })
    })
  }, [list.id])

  return (
    <ListCard
      list={list}
      itemCount={meta.count}
      totalPrice={meta.total}
      hasPrices={meta.hasPrices}
      onClick={onClick}
      onDelete={onDelete}
    />
  )
}

export default function ShoppingListsPage() {
  const navigate = useNavigate()
  const { lists, isLoading, refresh } = useShoppingLists()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!newListName.trim()) return
    setCreating(true)
    const id = await shoppingRepo.createList(newListName.trim())
    setCreating(false)
    setShowCreateModal(false)
    setNewListName('')
    void navigate(`/shopping/${id}`)
  }

  async function handleDelete(list: ShoppingList) {
    if (!list.id) return
    if (!window.confirm(`¿Eliminar la lista "${list.name}"?`)) return
    await shoppingRepo.deleteList(list.id)
    refresh()
  }

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      <TopBar title="Lista de la compra" />

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Cargando…
          </p>
        ) : lists.length === 0 ? (
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No hay listas todavía. Crea una nueva.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {lists.map(list => (
              <ListCardWithItems
                key={list.id}
                list={list}
                onClick={() => void navigate(`/shopping/${list.id}`)}
                onDelete={() => void handleDelete(list)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-4" style={{ borderColor: 'var(--color-border)' }}>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
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
          Nueva lista
        </button>
      </div>

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div
            className="w-full rounded-t-2xl p-6"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div
              className="mx-auto mb-4 h-1 w-8 rounded-full"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
            <p
              className="mb-4 text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Nueva lista
            </p>
            <input
              type="text"
              autoFocus
              placeholder="Nombre de la lista"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') void handleCreate()
              }}
              className="mb-4 w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false)
                  setNewListName('')
                }}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={!newListName.trim() || creating}
                className="flex-[2] rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
