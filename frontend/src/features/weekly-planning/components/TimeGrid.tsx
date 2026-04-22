import { useRef, useEffect, useState } from 'react'
import type { Task } from '../types'
import EventBlock from './EventBlock'

const PX_PER_HOUR = 60
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function currentTimePx(): number {
  const now = new Date()
  return now.getHours() * PX_PER_HOUR + Math.round((now.getMinutes() / 60) * PX_PER_HOUR)
}

function pxToTime(px: number): string {
  const totalMin = Math.floor(px / (PX_PER_HOUR / 60))
  const hour = Math.floor(totalMin / 60)
  const minute = Math.floor((totalMin % 60) / 15) * 15
  return `${String(Math.min(hour, 23)).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

interface Props {
  tasks: Task[]
  onTimePress: (time: string) => void
  onToggleStatus: (task: Task) => void
  onDeletePress: (task: Task) => void
  onSwipePrev: () => void
  onSwipeNext: () => void
}

export default function TimeGrid({
  tasks,
  onTimePress,
  onToggleStatus,
  onDeletePress,
  onSwipePrev,
  onSwipeNext,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchMoved = useRef(false)
  const [nowPx, setNowPx] = useState(currentTimePx)

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, nowPx - 100)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update current time indicator every minute
  useEffect(() => {
    const id = setInterval(() => setNowPx(currentTimePx()), 60_000)
    return () => clearInterval(id)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    touchStartX.current = t.clientX
    touchStartY.current = t.clientY
    touchMoved.current = false
  }

  const handleTouchMove = () => {
    touchMoved.current = true
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0]
    if (!t) return
    const dx = t.clientX - touchStartX.current
    const dy = t.clientY - touchStartY.current
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) onSwipePrev()
      else onSwipeNext()
    }
  }

  const handleEventsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    const rect = e.currentTarget.getBoundingClientRect()
    const scrollTop = scrollRef.current?.scrollTop ?? 0
    const y = e.clientY - rect.top + scrollTop
    onTimePress(pxToTime(y))
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative flex" style={{ height: `${24 * PX_PER_HOUR}px` }}>
        {/* Hour labels */}
        <div className="w-12 shrink-0 select-none">
          {HOURS.map(h => (
            <div
              key={h}
              className="flex items-start justify-end pr-2 text-[10px]"
              style={{
                height: `${PX_PER_HOUR}px`,
                color: 'var(--color-text-secondary)',
                paddingTop: '2px',
              }}
            >
              {h === 0 ? '' : h}
            </div>
          ))}
        </div>

        {/* Events column */}
        <div
          className="relative flex-1 cursor-pointer"
          style={{ borderLeft: '1px solid var(--color-border)' }}
          onClick={handleEventsClick}
        >
          {/* Hour lines */}
          {HOURS.map(h => (
            <div
              key={h}
              className="absolute right-0 left-0 h-px"
              style={{ top: `${h * PX_PER_HOUR}px`, backgroundColor: 'var(--color-grid-line)' }}
            />
          ))}

          {/* Half-hour lines */}
          {HOURS.map(h => (
            <div
              key={`half-${h}`}
              className="absolute right-0 left-0"
              style={{
                top: `${h * PX_PER_HOUR + PX_PER_HOUR / 2}px`,
                borderTop: '1px dashed var(--color-grid-line-half)',
              }}
            />
          ))}

          {/* Current time indicator */}
          <div
            className="pointer-events-none absolute right-0 left-0 flex items-center"
            style={{ top: `${nowPx}px`, zIndex: 3 }}
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: 'var(--color-current-time)', marginLeft: '-5px' }}
            />
            <div
              className="h-0.5 flex-1"
              style={{ backgroundColor: 'var(--color-current-time)' }}
            />
          </div>

          {/* Event blocks */}
          {tasks.map(task => (
            <EventBlock
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onDeletePress={onDeletePress}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
