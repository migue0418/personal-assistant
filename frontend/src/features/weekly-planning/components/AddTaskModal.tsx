import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { planningRepo } from '@/db/repositories/planningRepo'
import type { Task, TaskCategory } from '@/features/weekly-planning/types'

const CATEGORIES: TaskCategory[] = [
  'work',
  'personal',
  'health',
  'shopping',
  'other',
]

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work:     'Trabajo',
  personal: 'Personal',
  health:   'Salud',
  shopping: 'Compras',
  other:    'Otro',
}

interface Props {
  date: string
  planId: number
  onSave: () => void
  onClose: () => void
}

export default function AddTaskModal({
  date,
  planId,
  onSave,
  onClose,
}: Props) {
  const [title, setTitle] = useState('')
  const [taskDate, setTaskDate] = useState(date)
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [category, setCategory] = useState<TaskCategory | ''>('')
  const [titleError, setTitleError] = useState('')
  const [timeError, setTimeError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('El título es obligatorio')
      return
    }
    if (timeStart && timeEnd && timeEnd <= timeStart) {
      setTimeError('La hora de fin debe ser posterior al inicio')
      return
    }
    setSaving(true)
    try {
      const newTask: Omit<Task, 'id'> = {
        planId,
        date: taskDate,
        title: title.trim(),
        status: 'pending',
      }
      if (timeStart) newTask.timeStart = timeStart
      if (timeEnd) newTask.timeEnd = timeEnd
      if (category) newTask.category = category
      await planningRepo.addTask(newTask)
      onSave()
    } catch {
      setTitleError('No se pudo guardar la tarea. Inténtalo de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end z-50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        className="w-full bg-white rounded-t-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-task-title" className="text-lg font-semibold text-gray-900">
          Nueva tarea
        </h2>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError('')
              }}
              placeholder="¿Qué hay que hacer?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              autoFocus
            />
            {titleError && (
              <p className="text-xs text-red-500 mt-1">{titleError}</p>
            )}
          </div>

          <div>
            <label htmlFor="task-date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              id="task-date"
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="task-time-start" className="block text-sm font-medium text-gray-700 mb-1">
                Inicio
              </label>
              <input
                id="task-time-start"
                type="time"
                value={timeStart}
                onChange={(e) => {
                  setTimeStart(e.target.value)
                  if (timeError) setTimeError('')
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="task-time-end" className="block text-sm font-medium text-gray-700 mb-1">
                Fin
              </label>
              <input
                id="task-time-end"
                type="time"
                value={timeEnd}
                onChange={(e) => {
                  setTimeEnd(e.target.value)
                  if (timeError) setTimeError('')
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
          {timeError && (
            <p className="text-xs text-red-500 -mt-2">{timeError}</p>
          )}

          <div>
            <label htmlFor="task-category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory | '')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 min-h-[44px] border border-gray-300 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-h-[44px] bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
