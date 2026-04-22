import { useState, useEffect } from 'react'
import { planningRepo } from '@/db/repositories/planningRepo'
import type { Task, DeleteScope } from '@/features/weekly-planning/types'

interface Props {
  task: Task
  onClose: () => void
  onDeleted: () => void
}

const OPTIONS: { value: DeleteScope; label: string; description: string }[] = [
  {
    value: 'only',
    label: 'Solo esta tarea',
    description: 'El resto de la serie no se ve afectado.',
  },
  {
    value: 'following',
    label: 'Esta tarea y las siguientes',
    description: 'Se eliminarán esta y todas las ocurrencias posteriores.',
  },
  {
    value: 'all',
    label: 'Toda la serie',
    description: 'Se eliminarán todas las ocurrencias, pasadas y futuras.',
  },
]

export default function DeleteRecurringModal({ task, onClose, onDeleted }: Props) {
  const [scope, setScope] = useState<DeleteScope>('only')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await planningRepo.deleteRecurringTasks(task, scope)
      onDeleted()
      onClose()
    } catch {
      setError('No se pudo eliminar. Inténtalo de nuevo.')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-recurring-title"
        className="w-full space-y-4 rounded-t-2xl bg-white p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="delete-recurring-title" className="text-lg font-semibold text-gray-900">
          Eliminar tarea recurrente
        </h2>

        <div className="space-y-2">
          {OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                scope === opt.value ? 'border-slate-900 bg-slate-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="delete-scope"
                value={opt.value}
                checked={scope === opt.value}
                onChange={() => setScope(opt.value)}
                className="mt-0.5 accent-slate-900"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="min-h-[44px] flex-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={deleting}
            className="min-h-[44px] flex-1 rounded-lg bg-red-600 text-sm font-medium text-white disabled:opacity-50"
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
