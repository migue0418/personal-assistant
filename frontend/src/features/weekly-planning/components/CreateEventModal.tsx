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
        className="max-h-[96vh] w-full overflow-y-auto rounded-t-2xl"
        style={{ backgroundColor: 'var(--color-surface-variant)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Nav bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-w-[72px] text-[17px] disabled:opacity-40"
            style={{ color: 'var(--color-primary)' }}
          >
            Cancelar
          </button>
          <h2
            id="create-event-title"
            className="text-[15px] font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Nuevo evento
          </h2>
          <button
            type="submit"
            form="create-event-form"
            disabled={saving}
            className="min-w-[72px] text-right text-[17px] font-semibold disabled:opacity-40"
            style={{ color: 'var(--color-primary)' }}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>

        <form
          id="create-event-form"
          onSubmit={e => void handleSubmit(e)}
          className="space-y-3 px-4 pb-8"
        >
          {/* Card 1: Título */}
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                if (titleError) setTitleError('')
              }}
              placeholder="Título"
              className="w-full bg-transparent px-4 py-3.5 text-[17px] outline-none"
              style={{ color: 'var(--color-text-primary)' }}
              autoFocus
            />
          </div>
          {titleError && (
            <p className="px-1 text-xs" style={{ color: 'var(--color-current-time)' }}>
              {titleError}
            </p>
          )}

          {/* Card 2: Fecha y hora */}
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div
              className="flex min-h-[52px] items-center justify-between border-b px-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <label
                htmlFor="event-date"
                className="text-[17px]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Fecha
              </label>
              <input
                id="event-date"
                type="date"
                value={taskDate}
                onChange={e => setTaskDate(e.target.value)}
                className="bg-transparent text-right text-[17px] outline-none"
                style={{ color: 'var(--color-text-secondary)' }}
              />
            </div>
            <div
              className="flex min-h-[52px] items-center justify-between border-b px-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <label
                htmlFor="event-time-start"
                className="text-[17px]"
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
                className="bg-transparent text-right text-[17px] outline-none"
                style={{ color: 'var(--color-text-secondary)' }}
              />
            </div>
            <div className="flex min-h-[52px] items-center justify-between px-4">
              <label
                htmlFor="event-time-end"
                className="text-[17px]"
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
                className="bg-transparent text-right text-[17px] outline-none"
                style={{ color: 'var(--color-text-secondary)' }}
              />
            </div>
          </div>
          {timeError && (
            <p className="px-1 text-xs" style={{ color: 'var(--color-current-time)' }}>
              {timeError}
            </p>
          )}

          {/* Card 3: Categoría */}
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex min-h-[52px] items-center justify-between px-4">
              <label
                htmlFor="event-category"
                className="text-[17px]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Categoría
              </label>
              <select
                id="event-category"
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory | '')}
                className="appearance-none bg-transparent text-right text-[17px] outline-none"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <option value="">Sin categoría</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 4: Recordatorios */}
          <p
            className="px-1 text-xs font-semibold tracking-wider uppercase"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Recordatorios
          </p>
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <ReminderPicker
              selected={reminderOffsets}
              hasTimeStart={timeStart.length > 0}
              onChange={setReminderOffsets}
            />
          </div>
          {isRecurring && (
            <p className="px-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Los recordatorios no están disponibles para tareas recurrentes.
            </p>
          )}

          {/* Card 5: Se repite */}
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex min-h-[52px] items-center justify-between px-4">
              <span className="text-[17px]" style={{ color: 'var(--color-text-primary)' }}>
                Se repite
              </span>
              {/* iOS-style toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isRecurring}
                aria-label="Se repite"
                onClick={() => {
                  setIsRecurring(!isRecurring)
                  setRecurrenceError('')
                }}
                className="relative h-[31px] w-[51px] flex-shrink-0 rounded-full transition-colors duration-200"
                style={{ backgroundColor: isRecurring ? 'var(--color-primary)' : '#E5E5EA' }}
              >
                <span
                  className="absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: isRecurring ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            {isRecurring && (
              <>
                <div className="border-t px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
                  <label
                    htmlFor="recurrence-frequency"
                    className="mb-2 block text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Frecuencia
                  </label>
                  <select
                    id="recurrence-frequency"
                    value={frequency}
                    onChange={e => setFrequency(e.target.value as RecurrenceFrequency)}
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
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
                  <div
                    className="border-t px-4 py-3"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <p
                      className="mb-2 text-sm font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
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
                            aria-pressed={active}
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

                <div className="border-t px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
                  <p
                    className="mb-2 text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
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
                        className="w-16 rounded-lg border px-2 py-1.5 text-sm outline-none disabled:opacity-40"
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
                        className="flex-1 rounded-lg border px-2 py-1.5 text-sm outline-none disabled:opacity-40"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-primary)',
                        }}
                      />
                    </label>
                  </div>
                </div>

                {recurrenceError && (
                  <div
                    className="border-t px-4 py-3"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-xs" style={{ color: 'var(--color-current-time)' }}>
                      {recurrenceError}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
