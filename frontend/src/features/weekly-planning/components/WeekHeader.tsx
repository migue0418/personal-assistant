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

export default function WeekHeader({
  weekStart,
  onPrev,
  onNext,
  onToday,
}: Props) {
  return (
    <header className="flex items-center justify-between px-2 py-2 border-b border-gray-100 bg-white sticky top-0 z-10">
      <button
        onClick={onPrev}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xl text-gray-500 hover:bg-gray-100 rounded-lg touch-manipulation"
        aria-label="Semana anterior"
      >
        ‹
      </button>

      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 leading-tight">
          {formatWeekRange(weekStart)}
        </p>
        <button
          onClick={onToday}
          className="text-xs text-slate-400 hover:text-slate-600 touch-manipulation min-h-[44px] px-3 flex items-center"
        >
          Hoy
        </button>
      </div>

      <button
        onClick={onNext}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xl text-gray-500 hover:bg-gray-100 rounded-lg touch-manipulation"
        aria-label="Semana siguiente"
      >
        ›
      </button>
    </header>
  )
}
