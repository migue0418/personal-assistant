import type { ReminderOffset } from '@/features/weekly-planning/types'
import { REMINDER_OFFSETS } from '@/features/weekly-planning/utils/reminderUtils'

interface Props {
  selected: ReminderOffset[]
  hasTimeStart: boolean
  onChange: (offsets: ReminderOffset[]) => void
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
    <div className="space-y-1">
      <p className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        Recordatorios
      </p>
      {REMINDER_OFFSETS.map(({ value, label, requiresTime }) => {
        const disabled = requiresTime && !hasTimeStart
        return (
          <label
            key={value}
            className={`flex min-h-[44px] items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded accent-[var(--color-primary)]"
              checked={selected.includes(value)}
              disabled={disabled}
              onChange={() => {
                if (!disabled) toggle(value)
              }}
            />
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {label}
              {disabled && (
                <span className="ml-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  (requiere hora de inicio)
                </span>
              )}
            </span>
          </label>
        )
      })}
    </div>
  )
}
