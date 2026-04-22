import { useState } from 'react'
import { planningRepo } from '@/db/repositories/planningRepo'
import type { Task } from '@/features/weekly-planning/types'
import DeleteRecurringModal from './DeleteRecurringModal'

const CATEGORY_COLORS: Record<NonNullable<Task['category']>, string> = {
  work: 'bg-blue-100 text-blue-700',
  personal: 'bg-purple-100 text-purple-700',
  health: 'bg-red-100 text-red-700',
  shopping: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-600',
}

const STATUS_CARD: Record<Task['status'], string> = {
  pending: 'bg-white border border-gray-200',
  done: 'bg-green-50 border border-green-200',
  skipped: 'bg-yellow-50 border border-yellow-200',
}

const STATUS_ICON: Record<Task['status'], string> = {
  pending: '○',
  done: '✓',
  skipped: '—',
}

const STATUS_ARIA_LABEL: Record<Task['status'], string> = {
  pending: 'Marcar como hecha (pendiente)',
  done: 'Marcar como omitida (hecha)',
  skipped: 'Restablecer a pendiente (omitida)',
}

interface Props {
  task: Task
  onStatusChange: () => void
  onDelete: () => void
}

export default function TaskCard({ task, onStatusChange, onDelete }: Props) {
  const [actionError, setActionError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleToggle = async () => {
    try {
      await planningRepo.toggleTaskStatus(task.id, task.status)
      onStatusChange()
    } catch {
      setActionError('No se pudo actualizar la tarea')
    }
  }

  const handleDeleteClick = async () => {
    if (task.seriesId !== undefined) {
      setShowDeleteModal(true)
    } else {
      try {
        await planningRepo.deleteTask(task.id)
        onDelete()
      } catch {
        setActionError('No se pudo eliminar la tarea')
      }
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
    <>
      <div className={`flex items-start gap-2 rounded-lg p-3 ${cardClass}`}>
        <button
          onClick={() => void handleToggle()}
          className="flex min-h-[44px] min-w-[44px] flex-shrink-0 touch-manipulation items-center justify-center rounded-full border border-gray-300 text-sm hover:bg-gray-100 active:scale-95"
          aria-label={toggleAriaLabel}
        >
          {iconLabel}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium break-words text-gray-800 ${
              strikethrough ? 'text-gray-400 line-through' : ''
            }`}
          >
            {task.seriesId !== undefined && (
              <span className="mr-1 text-xs text-gray-400" aria-label="Tarea recurrente">
                ↻
              </span>
            )}
            {task.title}
          </p>

          {(task.timeStart ?? task.timeEnd) && (
            <p className="mt-0.5 text-xs text-gray-400">
              {task.timeStart}
              {task.timeEnd ? ` – ${task.timeEnd}` : ''}
            </p>
          )}

          {categoryColor && (
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor}`}
            >
              {task.category}
            </span>
          )}

          {actionError && <p className="mt-1 text-xs text-red-500">{actionError}</p>}
        </div>

        <button
          onClick={() => void handleDeleteClick()}
          className="flex min-h-[44px] min-w-[44px] flex-shrink-0 touch-manipulation items-center justify-center text-lg text-gray-400 hover:text-red-500 active:scale-95"
          aria-label={`Eliminar "${task.title}"`}
        >
          ×
        </button>
      </div>

      {showDeleteModal && (
        <DeleteRecurringModal
          task={task}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={onDelete}
        />
      )}
    </>
  )
}
