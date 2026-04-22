import { useState, useEffect } from 'react'
import { useWeekNavigation } from '@/features/weekly-planning/hooks/useWeekNavigation'
import { useWeeklyPlan } from '@/features/weekly-planning/hooks/useWeeklyPlan'
import WeekHeader from './WeekHeader'
import DayColumn from './DayColumn'
import AddTaskModal from './AddTaskModal'

export default function WeeklyPlanningPage() {
  const { weekStart, weekDates, goToPrevWeek, goToNextWeek, goToCurrentWeek } =
    useWeekNavigation()
  const { plan, tasksByDate, isLoading, error, refresh } =
    useWeeklyPlan(weekStart)
  const [modalDate, setModalDate] = useState<string | null>(null)

  useEffect(() => {
    setModalDate(null)
  }, [weekStart])

  const handleAddTask = (date: string) => setModalDate(date)
  const handleModalClose = () => setModalDate(null)
  const handleTaskSaved = () => {
    setModalDate(null)
    refresh()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Cargando…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 px-6 text-center text-sm">
        Error al cargar el plan: {error.message}
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <WeekHeader
        weekStart={weekStart}
        onPrev={goToPrevWeek}
        onNext={goToNextWeek}
        onToday={goToCurrentWeek}
      />

      <div className="flex-1 overflow-x-auto">
        <div className="flex snap-x snap-mandatory h-full pt-4 min-h-0">
          {weekDates.map((date) => (
            <DayColumn
              key={date}
              date={date}
              tasks={tasksByDate[date] ?? []}
              onAddTask={handleAddTask}
              onTaskChange={refresh}
            />
          ))}
        </div>
      </div>

      {modalDate !== null && (
        <AddTaskModal
          date={modalDate}
          planId={plan.id}
          onSave={handleTaskSaved}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
