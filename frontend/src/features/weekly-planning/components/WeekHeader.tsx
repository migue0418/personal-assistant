interface Props {
  weekStart: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(`${weekStart}T12:00:00`)
  const end = new Date(`${weekStart}T12:00:00`)
  end.setDate(end.getDate() + 6)

  const startDay = start.toLocaleDateString('es-ES', { day: 'numeric' })
  const endStr = end.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `${startDay} – ${endStr}`
}

export default function WeekHeader({ weekStart, onPrev, onNext, onToday }: Props) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-2 py-2">
      <button
        onClick={onPrev}
        className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100"
        aria-label="Semana anterior"
      >
        ‹
      </button>

      <div className="text-center">
        <p className="text-sm leading-tight font-semibold text-gray-900">
          {formatWeekRange(weekStart)}
        </p>
        <button
          onClick={onToday}
          className="flex min-h-[44px] touch-manipulation items-center px-3 text-xs text-slate-400 hover:text-slate-600"
        >
          Hoy
        </button>
      </div>

      <button
        onClick={onNext}
        className="flex min-h-[44px] min-w-[44px] touch-manipulation items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100"
        aria-label="Semana siguiente"
      >
        ›
      </button>
    </header>
  )
}
