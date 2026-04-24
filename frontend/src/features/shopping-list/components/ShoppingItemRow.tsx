// frontend/src/features/shopping-list/components/ShoppingItemRow.tsx
import { useState, useRef } from 'react'
import { shoppingRepo } from '@/db/repositories/shoppingRepo'
import type { ShoppingItem } from '../types'

interface Props {
  item: ShoppingItem
  onRefresh: () => void
}

export default function ShoppingItemRow({ item, onRefresh }: Props) {
  const [editingQty, setEditingQty] = useState(false)
  const [qtyInput, setQtyInput] = useState(String(item.quantity))
  const touchStartX = useRef(0)

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0]
    if (!touch) return
    touchStartX.current = touch.clientX
  }

  async function handleTouchEnd(e: React.TouchEvent) {
    const touch = e.changedTouches[0]
    if (!touch) return
    const delta = touch.clientX - touchStartX.current
    if (delta < -60) {
      await shoppingRepo.deleteItem(item.id!)
      onRefresh()
    }
  }

  async function handleToggle() {
    await shoppingRepo.updateItem(item.id!, { checked: !item.checked })
    onRefresh()
  }

  async function handleQtySave() {
    const qty = parseInt(qtyInput, 10)
    if (!isNaN(qty) && qty > 0) {
      await shoppingRepo.updateItem(item.id!, { quantity: qty })
    }
    setEditingQty(false)
    onRefresh()
  }

  const linePrice =
    item.price !== undefined
      ? (item.price * item.quantity).toFixed(2).replace('.', ',') + ' €'
      : null

  return (
    <div
      className="flex items-center gap-3 border-b py-3"
      style={{ borderColor: 'var(--color-grid-line)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={e => void handleTouchEnd(e)}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => void handleToggle()}
        aria-label={item.checked ? 'Desmarcar' : 'Marcar'}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border"
        style={{
          borderColor: item.checked ? 'var(--color-primary)' : 'var(--color-border)',
          backgroundColor: item.checked ? 'var(--color-primary)' : 'transparent',
        }}
      >
        {item.checked && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Name */}
      <span
        className="flex-1 text-sm"
        style={{
          color: item.checked ? 'var(--color-text-disabled)' : 'var(--color-text-primary)',
          textDecoration: item.checked ? 'line-through' : 'none',
        }}
      >
        {item.name}
      </span>

      {/* Quantity badge */}
      {editingQty ? (
        <input
          type="number"
          min="1"
          autoFocus
          value={qtyInput}
          onChange={e => setQtyInput(e.target.value)}
          onBlur={() => void handleQtySave()}
          onKeyDown={e => {
            if (e.key === 'Enter') void handleQtySave()
          }}
          className="w-14 rounded border px-2 py-0.5 text-center text-sm"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-text-primary)' }}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setQtyInput(String(item.quantity))
            setEditingQty(true)
          }}
          className="rounded px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: 'var(--color-surface-variant)',
            color: 'var(--color-text-secondary)',
          }}
        >
          ×{item.quantity}
        </button>
      )}

      {/* Price */}
      {linePrice && (
        <span
          className="w-14 text-right text-xs"
          style={{
            color: item.checked ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)',
          }}
        >
          {linePrice}
        </span>
      )}
    </div>
  )
}
