import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { planningRepo } from '@/db/repositories/planningRepo'
import type { Task, TaskCategory, RecurrenceFrequency } from '@/features/weekly-planning/types'

const CATEGORIES: TaskCategory[] = ['work', 'personal', 'health', 'shopping', 'other']

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  work: 'Trabajo',
  personal: 'Personal',
  health: 'Salud',
  shopping: 'Compras',
  other: 'Otro',
}

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: 'Cada día',
  weekdays: 'Días laborables (lun–vie)',
  weekly: 'Cada semana',
  monthly: 'Cada mes',
  custom: 'Días específicos',
}

// 0=Dom, 1=Lun, ..., 6=Sáb — mostrados empezando en lunes
const WEEK_DAYS: { value: number; label: string }[] = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
]

interface Props {
  date: string
  planId: number
  onSave: () => void
  onClose: () => void
}

export default function AddTaskModal({ date, planId, onSave, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [taskDate, setTaskDate] = useState(date)
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [category, setCategory] = useState<TaskCategory | ''>('')
  const [titleError, setTitleError] = useState('')
  const [timeError, setTimeError] = useState('')
  const [saving, setSaving] = useState(false)

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('weekly')
  const [endType, setEndType] = useState<'count' | 'date'>('count')
  const [endCount, setEndCount] = useState(10)
  const [endDate, setEndDate] = useState('')
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5]) // lun, mié, vie por defecto
  const [recurrenceError, setRecurrenceError] = useState('')

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
    if (isRecurring) {
      if (frequency === 'custom' && customDays.length === 0) {
        setRecurrenceError('Selecciona al menos un día')
        return
      }
      if (endType === 'date' && (!endDate || endDate < taskDate)) {
        setRecurrenceError('La fecha de fin debe ser igual o posterior a la fecha de inicio')
        return
      }
      if (endType === 'count' && (endCount < 1 || endCount > 730)) {
        setRecurrenceError('El número de repeticiones debe estar entre 1 y 730')
        return
      }
    }

    setSaving(true)
    try {
      if (isRecurring) {
        const seriesBase = {
          frequency,
          endCondition:
            endType === 'date'
              ? ({ type: 'date', until: endDate } as const)
              : ({ type: 'count', times: endCount } as const),
          templateTitle: title.trim(),
        }
        await planningRepo.addRecurringTaskSeries(
          {
            ...seriesBase,
            ...(frequency === 'custom' ? { customDays } : {}),
            ...(timeStart ? { templateTimeStart: timeStart } : {}),
            ...(timeEnd ? { templateTimeEnd: timeEnd } : {}),
            ...(category ? { templateCategory: category } : {}),
          },
          {
            title: title.trim(),
            ...(timeStart ? { timeStart } : {}),
            ...(timeEnd ? { timeEnd } : {}),
            ...(category ? { category } : {}),
          },
          taskDate
        )
      } else {
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
      }
      onSave()
    } catch {
      setTitleError('No se pudo guardar la tarea. Inténtalo de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        className="max-h-[90vh] w-full space-y-4 overflow-y-auto rounded-t-2xl bg-white p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="add-task-title" className="text-lg font-semibold text-gray-900">
          Nueva tarea
        </h2>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="mb-1 block text-sm font-medium text-gray-700">
              Título *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                if (titleError) setTitleError('')
              }}
              placeholder="¿Qué hay que hacer?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              autoFocus
            />
            {titleError && <p className="mt-1 text-xs text-red-500">{titleError}</p>}
          </div>

          <div>
            <label htmlFor="task-date" className="mb-1 block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              id="task-date"
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="task-time-start"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Inicio
              </label>
              <input
                id="task-time-start"
                type="time"
                value={timeStart}
                onChange={e => {
                  setTimeStart(e.target.value)
                  if (timeError) setTimeError('')
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="task-time-end"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Fin
              </label>
              <input
                id="task-time-end"
                type="time"
                value={timeEnd}
                onChange={e => {
                  setTimeEnd(e.target.value)
                  if (timeError) setTimeError('')
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
              />
            </div>
          </div>
          {timeError && <p className="-mt-2 text-xs text-red-500">{timeError}</p>}

          <div>
            <label htmlFor="task-category" className="mb-1 block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="task-category"
              value={category}
              onChange={e => setCategory(e.target.value as TaskCategory | '')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence section */}
          <div className="border-t border-gray-100 pt-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => {
                  setIsRecurring(e.target.checked)
                  setRecurrenceError('')
                }}
                className="h-4 w-4 accent-slate-900"
              />
              <span className="text-sm font-medium text-gray-700">Se repite</span>
            </label>

            {isRecurring && (
              <div className="mt-3 space-y-3 pl-1">
                <div>
                  <label
                    htmlFor="recurrence-frequency"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Frecuencia
                  </label>
                  <select
                    id="recurrence-frequency"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  >
                    {(Object.entries(FREQUENCY_LABELS) as [RecurrenceFrequency, string][]).map(
                      ([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {frequency === 'custom' && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">Días</p>
                    <div className="flex gap-2">
                      {WEEK_DAYS.map(({ value, label }) => {
                        const active = customDays.includes(value)
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setCustomDays(prev =>
                                active ? prev.filter(d => d !== value) : [...prev, value]
                              )
                              setRecurrenceError('')
                            }}
                            className={`h-9 w-9 touch-manipulation rounded-full text-sm font-medium transition-colors ${
                              active ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">Finaliza</p>
                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name="end-type"
                        value="count"
                        checked={endType === 'count'}
                        onChange={() => {
                          setEndType('count')
                          setRecurrenceError('')
                        }}
                        className="accent-slate-900"
                      />
                      <span className="text-sm text-gray-700">Después de</span>
                      <input
                        type="number"
                        min={1}
                        max={730}
                        value={endCount}
                        onChange={e => {
                          setEndCount(Number(e.target.value))
                          setRecurrenceError('')
                        }}
                        disabled={endType !== 'count'}
                        className="w-16 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-40"
                      />
                      <span className="text-sm text-gray-700">veces</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name="end-type"
                        value="date"
                        checked={endType === 'date'}
                        onChange={() => {
                          setEndType('date')
                          setRecurrenceError('')
                        }}
                        className="accent-slate-900"
                      />
                      <span className="text-sm text-gray-700">El día</span>
                      <input
                        type="date"
                        value={endDate}
                        min={taskDate}
                        onChange={e => {
                          setEndDate(e.target.value)
                          setRecurrenceError('')
                        }}
                        disabled={endType !== 'date'}
                        className="flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-40"
                      />
                    </label>
                  </div>
                </div>

                {recurrenceError && <p className="text-xs text-red-500">{recurrenceError}</p>}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-[44px] flex-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] flex-1 rounded-lg bg-slate-900 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
