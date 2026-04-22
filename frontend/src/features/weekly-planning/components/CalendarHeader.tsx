interface Props {
  selectedDate: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export default function CalendarHeader({ selectedDate, onPrev, onNext, onToday }: Props) {
  const date = new Date(`${selectedDate}T12:00:00`)
  const monthYear = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const label = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

  return (
    <header
      className="flex items-center gap-2 border-b px-4 py-3"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <span
        className="flex-1 text-[18px] font-normal"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label}
      </span>

      <button
        type="button"
        onClick={onToday}
        aria-label="Ir a hoy"
        className="rounded-full px-3 py-1 text-sm font-medium transition-colors"
        style={{ color: 'var(--color-primary)' }}
      >
        Hoy
      </button>

      <button
        type="button"
        onClick={onPrev}
        aria-label="Semana anterior"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label="Semana siguiente"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        ›
      </button>
    </header>
  )
}
