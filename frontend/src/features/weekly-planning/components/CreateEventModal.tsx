import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { planningRepo } from '@/db/repositories/planningRepo'
import type {
  Task,
  TaskCategory,
  RecurrenceFrequency,
  ReminderOffset,
} from '@/features/weekly-planning/types'
import { scheduleReminders } from '@/features/weekly-planning/utils/reminderUtils'
import ReminderPicker from '@/features/weekly-planning/components/ReminderPicker'

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
  initialTime?: string
  onSave: () => void
  onClose: () => void
}

export default function CreateEventModal({ date, planId, initialTime, onSave, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [taskDate, setTaskDate] = useState(date)
  const [timeStart, setTimeStart] = useState(initialTime ?? '')
  const [timeEnd, setTimeEnd] = useState('')
  const [category, setCategory] = useState<TaskCategory | ''>('')
  const [titleError, setTitleError] = useState('')
  const [timeError, setTimeError] = useState('')
  const [saving, setSaving] = useState(false)

  const [reminderOffsets, setReminderOffsets] = useState<ReminderOffset[]>([])

  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('weekly')
  const [endType, setEndType] = useState<'count' | 'date'>('count')
  const [endCount, setEndCount] = useState(10)
  const [endDate, setEndDate] = useState('')
  const [customDays, setCustomDays] = useState<number[]>([1, 3, 5])
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
        await planningRepo.addRecurringTaskSeries(
          {
            frequency,
            endCondition:
              endType === 'date'
                ? ({ type: 'date', until: endDate } as const)
                : ({ type: 'count', times: endCount } as const),
            templateTitle: title.trim(),
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
        const id = await planningRepo.addTask(newTask)
        await scheduleReminders({ ...newTask, id }, reminderOffsets)
      }
      onSave()
    } catch {
      setTitleError('No se pudo guardar. Inténtalo de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-event-title"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl p-6"
        style={{ backgroundColor: 'var(--color-surface)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div
          className="mx-auto mb-4 h-1 w-10 rounded-full"
          style={{ backgroundColor: 'var(--color-border)' }}
        />

        <h2
          id="create-event-title"
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Nuevo evento
        </h2>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
          <div>
            <label
              htmlFor="event-title"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Título *
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                if (titleError) setTitleError('')
              }}
              placeholder="¿Qué hay que hacer?"
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
              autoFocus
            />
            {titleError && (
              <p className="mt-1 text-xs" style={{ color: 'var(--color-current-time)' }}>
                {titleError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="event-date"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Fecha
            </label>
            <input
              id="event-date"
              type="date"
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label
                htmlFor="event-time-start"
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Inicio
              </label>
              <input
                id="event-time-start"
                type="time"
                value={timeStart}
                onChange={e => {
                  setTimeStart(e.target.value)
                  if (timeError) setTimeError('')
                }}
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="event-time-end"
                className="mb-1 block text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Fin
              </label>
              <input
                id="event-time-end"
                type="time"
                value={timeEnd}
                onChange={e => {
                  setTimeEnd(e.target.value)
                  if (timeError) setTimeError('')
                }}
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>
          </div>
          {timeError && (
            <p className="-mt-2 text-xs" style={{ color: 'var(--color-current-time)' }}>
              {timeError}
            </p>
          )}

          <div>
            <label
              htmlFor="event-category"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Categoría
            </label>
            <select
              id="event-category"
              value={category}
              onChange={e => setCategory(e.target.value as TaskCategory | '')}
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <option value="">Sin categoría</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            <ReminderPicker
              selected={reminderOffsets}
              hasTimeStart={timeStart.length > 0}
              onChange={setReminderOffsets}
            />
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => {
                  setIsRecurring(e.target.checked)
                  setRecurrenceError('')
                }}
                className="h-4 w-4"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Se repite
              </span>
            </label>

            {isRecurring && (
              <div className="mt-3 space-y-3 pl-1">
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Los recordatorios no están disponibles para tareas recurrentes.
                </p>
                <div>
                  <label
                    htmlFor="recurrence-frequency"
                    className="mb-1 block text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Frecuencia
                  </label>
                  <select
                    id="recurrence-frequency"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
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
                    <p
                      className="mb-2 text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Días
                    </p>
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
                            className="h-9 w-9 touch-manipulation rounded-full text-sm font-medium transition-colors"
                            style={
                              active
                                ? {
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'var(--color-surface)',
                                  }
                                : {
                                    backgroundColor: 'var(--color-surface-variant)',
                                    color: 'var(--color-text-secondary)',
                                  }
                            }
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <p
                    className="mb-2 text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Finaliza
                  </p>
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
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        Después de
                      </span>
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
                        className="w-16 rounded-lg border px-2 py-1.5 text-sm focus:outline-none disabled:opacity-40"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        veces
                      </span>
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
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        El día
                      </span>
                      <input
                        type="date"
                        value={endDate}
                        min={taskDate}
                        onChange={e => {
                          setEndDate(e.target.value)
                          setRecurrenceError('')
                        }}
                        disabled={endType !== 'date'}
                        className="flex-1 rounded-lg border px-2 py-1.5 text-sm focus:outline-none disabled:opacity-40"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </label>
                  </div>
                </div>

                {recurrenceError && (
                  <p className="text-xs" style={{ color: 'var(--color-current-time)' }}>
                    {recurrenceError}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-[44px] flex-1 rounded-lg border text-sm font-medium disabled:opacity-50"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] flex-1 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
