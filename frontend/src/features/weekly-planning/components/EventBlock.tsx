import type { Task, TaskCategory } from '../types'

const CATEGORY_COLOR: Record<TaskCategory, string> = {
  work: 'var(--color-event-work)',
  personal: 'var(--color-event-personal)',
  health: 'var(--color-event-health)',
  shopping: 'var(--color-event-shopping)',
  other: 'var(--color-event-other)',
}

function parseTime(time: string): number {
  const parts = time.split(':')
  const h = parts[0] ? parseInt(parts[0], 10) : 0
  const m = parts[1] ? parseInt(parts[1], 10) : 0
  return h * 60 + m
}

function formatRange(timeStart: string, timeEnd?: string): string {
  if (!timeEnd) return timeStart
  return `${timeStart} – ${timeEnd}`
}

interface Props {
  task: Task
  onToggleStatus: (task: Task) => void
  onDeletePress: (task: Task) => void
}

export default function EventBlock({ task, onToggleStatus, onDeletePress }: Props) {
  const startMin = parseTime(task.timeStart!)
  const endMin = task.timeEnd ? parseTime(task.timeEnd) : startMin + 60
  const height = Math.max(20, endMin - startMin)

  const isDone = task.status === 'done'

  return (
    <div
      className="absolute right-1 left-1 overflow-hidden rounded"
      style={{
        top: `${startMin}px`,
        height: `${height}px`,
        backgroundColor: CATEGORY_COLOR[task.category ?? 'other'],
        opacity: isDone ? 'var(--color-done-opacity)' : undefined,
        zIndex: 2,
      }}
    >
      {/* Main body – toggle status */}
      <button
        type="button"
        className="absolute inset-0 flex flex-col items-start px-1.5 pt-0.5 text-left"
        onClick={() => onToggleStatus(task)}
        aria-label={`Cambiar estado: ${task.title}`}
      >
        <span
          className="text-[11px] leading-tight font-semibold text-white"
          style={{ textDecoration: isDone ? 'line-through' : undefined }}
        >
          {task.title}
        </span>
        {height >= 28 && (
          <span className="text-[10px] leading-tight text-white/85">
            {formatRange(task.timeStart!, task.timeEnd)}
          </span>
        )}
      </button>

      {/* Delete button */}
      <button
        type="button"
        onClick={e => {
          e.stopPropagation()
          onDeletePress(task)
        }}
        aria-label={`Eliminar ${task.title}`}
        className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded text-[10px] text-white/70 hover:text-white"
      >
        ×
      </button>
    </div>
  )
}
