import type { ReminderOffset } from '@/features/weekly-planning/types'
import { REMINDER_OFFSETS } from '@/features/weekly-planning/utils/reminderUtils'

interface Props {
  selected: ReminderOffset[]
  hasTimeStart: boolean
  onChange: (offsets: ReminderOffset[]) => void
}

const CHIP_LABELS: Record<ReminderOffset, string> = {
  10: '10 min',
  60: '1 hora',
  1440: '1 día',
  10080: '1 semana',
}

export default function ReminderPicker({ selected, hasTimeStart, onChange }: Props) {
  const toggle = (offset: ReminderOffset) => {
    if (selected.includes(offset)) {
      onChange(selected.filter(o => o !== offset))
    } else {
      onChange([...selected, offset])
    }
  }

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {REMINDER_OFFSETS.map(({ value, requiresTime }) => {
        const disabled = requiresTime && !hasTimeStart
        const active = selected.includes(value)
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => toggle(value)}
            aria-pressed={active}
            className="min-h-[36px] rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={
              active
                ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                : {
                    backgroundColor: 'var(--color-surface-variant)',
                    color: 'var(--color-text-secondary)',
                  }
            }
          >
            {CHIP_LABELS[value]}
          </button>
        )
      })}
    </div>
  )
}
