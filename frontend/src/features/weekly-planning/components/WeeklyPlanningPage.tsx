import { useState } from 'react'
import { useWeekNavigation } from '@/features/weekly-planning/hooks/useWeekNavigation'
import { useWeeklyPlan } from '@/features/weekly-planning/hooks/useWeeklyPlan'
import WeekHeader from './WeekHeader'
import DayColumn from './DayColumn'
import AddTaskModal from './AddTaskModal'

export default function WeeklyPlanningPage() {
  const { weekStart, weekDates, goToPrevWeek, goToNextWeek, goToCurrentWeek } = useWeekNavigation()
  const { plan, tasksByDate, isLoading, error, refresh } = useWeeklyPlan(weekStart)
  const [modalDate, setModalDate] = useState<string | null>(null)

  const handlePrevWeek = () => {
    setModalDate(null)
    goToPrevWeek()
  }
  const handleNextWeek = () => {
    setModalDate(null)
    goToNextWeek()
  }
  const handleToday = () => {
    setModalDate(null)
    goToCurrentWeek()
  }

  const handleAddTask = (date: string) => setModalDate(date)
  const handleModalClose = () => setModalDate(null)
  const handleTaskSaved = () => {
    setModalDate(null)
    refresh()
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">Cargando…</div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-500">
        Error al cargar el plan: {error.message}
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <WeekHeader
        weekStart={weekStart}
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
        onToday={handleToday}
      />

      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full min-h-0 snap-x snap-mandatory pt-4">
          {weekDates.map(date => (
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
