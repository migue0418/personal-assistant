import { useState } from 'react'
import { planningRepo } from '@/db/repositories/planningRepo'
import type { Task } from '@/features/weekly-planning/types'

const CATEGORY_COLORS: Record<
  NonNullable<Task['category']>,
  string
> = {
  work:     'bg-blue-100 text-blue-700',
  personal: 'bg-purple-100 text-purple-700',
  health:   'bg-red-100 text-red-700',
  shopping: 'bg-orange-100 text-orange-700',
  other:    'bg-gray-100 text-gray-600',
}

const STATUS_CARD: Record<Task['status'], string> = {
  pending: 'bg-white border border-gray-200',
  done:    'bg-green-50 border border-green-200',
  skipped: 'bg-yellow-50 border border-yellow-200',
}

const STATUS_ICON: Record<Task['status'], string> = {
  pending: '○',
  done:    '✓',
  skipped: '—',
}

const STATUS_ARIA_LABEL: Record<Task['status'], string> = {
  pending: 'Marcar como hecha (pendiente)',
  done:    'Marcar como omitida (hecha)',
  skipped: 'Restablecer a pendiente (omitida)',
}

interface Props {
  task: Task
  onStatusChange: () => void
  onDelete: () => void
}

export default function TaskCard({ task, onStatusChange, onDelete }: Props) {
  const [actionError, setActionError] = useState<string | null>(null)

  const handleToggle = async () => {
    try {
      await planningRepo.toggleTaskStatus(task.id, task.status)
      onStatusChange()
    } catch {
      setActionError('No se pudo actualizar la tarea')
    }
  }

  const handleDelete = async () => {
    try {
      await planningRepo.deleteTask(task.id)
      onDelete()
    } catch {
      setActionError('No se pudo eliminar la tarea')
    }
  }

  const strikethrough = task.status !== 'pending'
  const cardClass = STATUS_CARD[task.status] ?? 'bg-white border border-gray-200'
  const iconLabel = STATUS_ICON[task.status] ?? '○'
  const toggleAriaLabel = STATUS_ARIA_LABEL[task.status] ?? 'Cambiar estado'
  const categoryColor = task.category
    ? (CATEGORY_COLORS[task.category] ?? 'bg-gray-100 text-gray-600')
    : null

  return (
    <div className={`rounded-lg p-3 flex items-start gap-2 ${cardClass}`}>
      <button
        onClick={() => void handleToggle()}
        className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm rounded-full border border-gray-300 hover:bg-gray-100 active:scale-95 touch-manipulation"
        aria-label={toggleAriaLabel}
      >
        {iconLabel}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium text-gray-800 break-words ${
            strikethrough ? 'line-through text-gray-400' : ''
          }`}
        >
          {task.title}
        </p>

        {(task.timeStart ?? task.timeEnd) && (
          <p className="text-xs text-gray-400 mt-0.5">
            {task.timeStart}
            {task.timeEnd ? ` – ${task.timeEnd}` : ''}
          </p>
        )}

        {categoryColor && (
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${categoryColor}`}
          >
            {task.category}
          </span>
        )}

        {actionError && (
          <p className="text-xs text-red-500 mt-1">{actionError}</p>
        )}
      </div>

      <button
        onClick={() => void handleDelete()}
        className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-lg text-gray-400 hover:text-red-500 active:scale-95 touch-manipulation"
        aria-label={`Eliminar "${task.title}"`}
      >
        ×
      </button>
    </div>
  )
}
