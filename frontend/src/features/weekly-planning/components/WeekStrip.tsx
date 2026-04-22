import { useRef } from 'react'

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const TODAY = toISODate(new Date())

interface Props {
  weekDates: string[]
  selectedDate: string
  onSelectDate: (date: string) => void
  onSwipePrev: () => void
  onSwipeNext: () => void
}

export default function WeekStrip({
  weekDates,
  selectedDate,
  onSelectDate,
  onSwipePrev,
  onSwipeNext,
}: Props) {
  const touchStartX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    if (t) touchStartX.current = t.clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0]
    if (!t) return
    const dx = t.clientX - touchStartX.current
    if (dx > 50) onSwipePrev()
    else if (dx < -50) onSwipeNext()
  }

  return (
    <div
      className="flex border-b"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {weekDates.map((date, i) => {
        const isToday = date === TODAY
        const isSelected = date === selectedDate
        const dayNum = new Date(`${date}T12:00:00`).getDate()

        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelectDate(date)}
            className="flex flex-1 flex-col items-center gap-1 py-2"
            aria-label={`Seleccionar día ${dayNum}`}
            aria-pressed={isSelected}
          >
            <span
              className="text-[11px] font-medium tracking-tight uppercase"
              style={{ color: isToday ? 'var(--color-today)' : 'var(--color-text-secondary)' }}
            >
              {DAY_LABELS[i]}
            </span>
            <span
              className="justify-content-center flex h-7 w-7 items-center rounded-full text-[13px] font-medium"
              style={
                isSelected
                  ? {
                      backgroundColor: 'var(--color-today)',
                      color: 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  : {
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
              }
            >
              {dayNum}
            </span>
          </button>
        )
      })}
    </div>
  )
}
