import { useState, useCallback } from 'react'
import { useWeekNavigation } from '../hooks/useWeekNavigation'
import { useWeeklyPlan } from '../hooks/useWeeklyPlan'
import { planningRepo } from '@/db/repositories/planningRepo'
import type { Task } from '../types'
import CalendarHeader from './CalendarHeader'
import WeekStrip from './WeekStrip'
import AllDayRow from './AllDayRow'
import TimeGrid from './TimeGrid'
import CreateEventModal from './CreateEventModal'
import DeleteRecurringModal from './DeleteRecurringModal'
import TopBar from '@/shared/components/TopBar'

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(isoDate: string, n: number): string {
  const d = new Date(`${isoDate}T12:00:00`)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export default function CalendarPage() {
  const { weekStart, weekDates, goToPrevWeek, goToNextWeek, goToCurrentWeek } = useWeekNavigation()
  const { plan, tasksByDate, isLoading, error, refresh } = useWeeklyPlan(weekStart)

  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()))
  const [createModal, setCreateModal] = useState<{ date: string; time?: string } | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)

  // Navigate to previous day, crossing week boundary if needed
  const goToPrevDay = useCallback(() => {
    const prev = addDays(selectedDate, -1)
    if (prev < weekStart) {
      goToPrevWeek()
    }
    setSelectedDate(prev)
  }, [selectedDate, weekStart, goToPrevWeek])

  // Navigate to next day, crossing week boundary if needed
  const goToNextDay = useCallback(() => {
    const next = addDays(selectedDate, 1)
    const weekEnd = addDays(weekStart, 6)
    if (next > weekEnd) {
      goToNextWeek()
    }
    setSelectedDate(next)
  }, [selectedDate, weekStart, goToNextWeek])

  // Navigate prev week: keep same day-of-week
  const handlePrevWeek = useCallback(() => {
    setSelectedDate(prev => addDays(prev, -7))
    goToPrevWeek()
  }, [goToPrevWeek])

  // Navigate next week: keep same day-of-week
  const handleNextWeek = useCallback(() => {
    setSelectedDate(prev => addDays(prev, 7))
    goToNextWeek()
  }, [goToNextWeek])

  // Go to today
  const handleToday = useCallback(() => {
    const today = toISODate(new Date())
    setSelectedDate(today)
    goToCurrentWeek()
  }, [goToCurrentWeek])

  const handleToggleStatus = useCallback(
    async (task: Task) => {
      await planningRepo.toggleTaskStatus(task.id, task.status)
      refresh()
    },
    [refresh]
  )

  const handleDeletePress = useCallback(
    async (task: Task) => {
      if (task.seriesId) {
        setDeleteTask(task)
      } else {
        await planningRepo.deleteTask(task.id)
        refresh()
      }
    },
    [refresh]
  )

  const tasks = tasksByDate[selectedDate] ?? []
  const allDayTasks = tasks.filter(t => !t.timeStart)
  const timedTasks = tasks.filter(t => !!t.timeStart)

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <TopBar title="Calendario" />
      <CalendarHeader
        selectedDate={selectedDate}
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
        onToday={handleToday}
      />

      <WeekStrip
        weekDates={weekDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onSwipePrev={goToPrevDay}
        onSwipeNext={goToNextDay}
      />

      <AllDayRow
        tasks={allDayTasks}
        onToggleStatus={task => void handleToggleStatus(task)}
        onDeletePress={task => void handleDeletePress(task)}
      />

      {isLoading && (
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Cargando…
        </div>
      )}

      {error && (
        <div
          className="flex flex-1 items-center justify-center text-sm"
          style={{ color: 'var(--color-current-time)' }}
        >
          Error al cargar los datos
        </div>
      )}

      {!isLoading && !error && (
        <TimeGrid
          tasks={timedTasks}
          onTimePress={time => setCreateModal({ date: selectedDate, time })}
          onToggleStatus={task => void handleToggleStatus(task)}
          onDeletePress={task => void handleDeletePress(task)}
          onSwipePrev={goToPrevDay}
          onSwipeNext={goToNextDay}
        />
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setCreateModal({ date: selectedDate })}
        aria-label="Añadir evento"
        className="fixed right-6 bottom-6 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-lg"
        style={{
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          zIndex: 10,
        }}
      >
        +
      </button>

      {/* Create event modal */}
      {createModal && plan && (
        <CreateEventModal
          date={createModal.date}
          planId={plan.id}
          {...(createModal.time !== undefined ? { initialTime: createModal.time } : {})}
          onSave={() => {
            refresh()
            setCreateModal(null)
          }}
          onClose={() => setCreateModal(null)}
        />
      )}

      {/* Delete modal – only shown for recurring tasks */}
      {deleteTask && (
        <DeleteRecurringModal
          task={deleteTask}
          onClose={() => setDeleteTask(null)}
          onDeleted={() => {
            refresh()
            setDeleteTask(null)
          }}
        />
      )}
    </div>
  )
}
