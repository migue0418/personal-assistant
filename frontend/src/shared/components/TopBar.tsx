// frontend/src/shared/components/TopBar.tsx
import { useUIStore } from '@/store/uiStore'

interface Props {
  title: string
}

export default function TopBar({ title }: Props) {
  const toggleSidebar = useUIStore(s => s.toggleSidebar)

  return (
    <header
      className="flex items-center justify-between border-b px-4 py-3"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <span className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </span>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Abrir menú"
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full"
      >
        <span
          className="block h-[1.5px] w-4 rounded"
          style={{ backgroundColor: 'var(--color-text-secondary)' }}
        />
        <span
          className="block h-[1.5px] w-4 rounded"
          style={{ backgroundColor: 'var(--color-text-secondary)' }}
        />
        <span
          className="block h-[1.5px] w-4 rounded"
          style={{ backgroundColor: 'var(--color-text-secondary)' }}
        />
      </button>
    </header>
  )
}
