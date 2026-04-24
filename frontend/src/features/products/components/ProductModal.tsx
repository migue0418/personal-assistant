// frontend/src/features/products/components/ProductModal.tsx
import { useState } from 'react'
import { productsRepo } from '@/db/repositories/productsRepo'
import type { Product } from '../types'

interface Props {
  product: Product | undefined
  existingCategories: string[]
  onSaved: () => void
  onClose: () => void
}

export default function ProductModal({ product, existingCategories, onSaved, onClose }: Props) {
  const [name, setName] = useState(product?.name ?? '')
  const [priceStr, setPriceStr] = useState(
    product?.price !== undefined ? String(product.price) : ''
  )
  const [category, setCategory] = useState(product?.category ?? '')
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState('')

  const isEdit = product?.id !== undefined

  async function handleSave() {
    if (!name.trim()) {
      setNameError('El nombre es obligatorio')
      return
    }
    const finalCategory = showCustomInput ? customCategory.trim() : category.trim()
    const parsedPrice = priceStr.trim() ? parseFloat(priceStr.replace(',', '.')) : undefined

    setSaving(true)
    const data: Omit<Product, 'id'> = {
      name: name.trim(),
      ...(parsedPrice !== undefined && !isNaN(parsedPrice) ? { price: parsedPrice } : {}),
      ...(finalCategory ? { category: finalCategory } : {}),
    }

    if (isEdit) {
      await productsRepo.updateProduct(product.id!, data)
    } else {
      await productsRepo.createProduct(data)
    }
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="w-full rounded-t-2xl px-5 pt-4 pb-8"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div
          className="mx-auto mb-5 h-1 w-8 rounded-full"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <p className="mb-5 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </p>

        {/* Name */}
        <div className="mb-4">
          <label
            className="mb-1 block text-xs font-semibold tracking-wider uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Nombre *
          </label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={e => {
              setName(e.target.value)
              setNameError('')
            }}
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
            style={{
              borderColor: nameError ? 'var(--color-current-time)' : 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />
          {nameError && (
            <p className="mt-1 text-xs" style={{ color: 'var(--color-current-time)' }}>
              {nameError}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mb-4">
          <label
            className="mb-1 block text-xs font-semibold tracking-wider uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Precio por unidad (opcional)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={priceStr}
              onChange={e => setPriceStr(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              €
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label
            className="mb-1 block text-xs font-semibold tracking-wider uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Categoría (opcional)
          </label>
          {showCustomInput ? (
            <input
              type="text"
              autoFocus
              placeholder="Nueva categoría"
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          ) : (
            <select
              value={category}
              onChange={e => {
                if (e.target.value === '__new__') {
                  setShowCustomInput(true)
                  setCategory('')
                } else {
                  setCategory(e.target.value)
                }
              }}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{
                borderColor: 'var(--color-border)',
                color: category ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <option value="">Sin categoría</option>
              {existingCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__new__">Nueva categoría…</option>
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex-[2] rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
