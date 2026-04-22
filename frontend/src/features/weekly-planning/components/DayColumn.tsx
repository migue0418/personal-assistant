import type { Task } from '@/features/weekly-planning/types'
import TaskCard from './TaskCard'

const DAY_NAMES = [
  'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb',
] as const

interface Props {
  date: string
  tasks: Task[]
  onAddTask: (date: string) => void
  onTaskChange: () => void
}

export default function DayColumn({
  date,
  tasks,
  onAddTask,
  onTaskChange,
}: Props) {
  const d = new Date(`${date}T12:00:00`)
  const dayName = DAY_NAMES[d.getDay()] ?? ''
  const dayNumber = d.getDate()

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.timeStart && !b.timeStart) return 0
    if (!a.timeStart) return 1
    if (!b.timeStart) return -1
    return a.timeStart.localeCompare(b.timeStart)
  })

  return (
    <div className="min-w-[80vw] snap-start flex-shrink-0 px-3 pb-6">
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {dayName}
        </p>
        <p className="text-2xl font-bold text-gray-900 leading-none mt-0.5">
          {dayNumber}
        </p>
      </div>

      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onTaskChange}
            onDelete={onTaskChange}
          />
        ))}
      </div>

      <button
        onClick={() => onAddTask(date)}
        className="mt-3 w-full min-h-[44px] flex items-center justify-center gap-1 text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg hover:text-gray-600 hover:border-gray-300 touch-manipulation"
      >
        + Añadir
      </button>
    </div>
  )
}
