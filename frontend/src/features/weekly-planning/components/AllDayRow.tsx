import { useState } from 'react'
import type { Task, TaskCategory } from '../types'

const CATEGORY_COLOR: Record<TaskCategory, string> = {
  work: 'var(--color-event-work)',
  personal: 'var(--color-event-personal)',
  health: 'var(--color-event-health)',
  shopping: 'var(--color-event-shopping)',
  other: 'var(--color-event-other)',
}

interface Props {
  tasks: Task[]
  onToggleStatus: (task: Task) => void
  onDeletePress: (task: Task) => void
}

const MAX_VISIBLE = 3

export default function AllDayRow({ tasks, onToggleStatus, onDeletePress }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (tasks.length === 0) return null

  const visible = expanded ? tasks : tasks.slice(0, MAX_VISIBLE)
  const hidden = tasks.length - MAX_VISIBLE

  return (
    <div
      className="flex items-start border-b"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div
        className="w-12 shrink-0 py-2 pr-2 text-right text-[10px] leading-tight"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Todo
        <br />
        el día
      </div>

      <div className="flex flex-1 flex-wrap gap-1 px-1 py-2">
        {visible.map(task => (
          <span
            key={task.id}
            className="flex items-center gap-0.5 rounded px-2 py-0.5 text-[11px] font-medium text-white"
            style={{
              backgroundColor: CATEGORY_COLOR[task.category ?? 'other'],
              opacity: task.status === 'done' ? 'var(--color-done-opacity)' : undefined,
            }}
          >
            <button
              type="button"
              onClick={() => onToggleStatus(task)}
              aria-label={`Cambiar estado: ${task.title}`}
              style={{ textDecoration: task.status === 'done' ? 'line-through' : undefined }}
            >
              {task.title}
            </button>
            <button
              type="button"
              onClick={() => onDeletePress(task)}
              aria-label={`Eliminar ${task.title}`}
              className="ml-1 text-white/80 hover:text-white"
            >
              ×
            </button>
          </span>
        ))}

        {!expanded && hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded px-2 py-0.5 text-[11px]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            +{hidden} más
          </button>
        )}
      </div>
    </div>
  )
}
