import type { ResultView } from '@/hooks/useResumeTailor'

interface ResultTabsProps {
  value: ResultView
  onChange: (view: ResultView) => void
  /** Whether there is an original PDF to show. Pasted text has none. */
  hasOriginal: boolean
  /** Number of differences, shown next to "Changes". Omit to hide that option. */
  changeCount?: number
}

/** Switches the result panel between the tailored PDF, the original PDF and the list of changes. */
export function ResultTabs({ value, onChange, hasOriginal, changeCount }: ResultTabsProps) {
  const options: { id: ResultView; label: string }[] = [
    { id: 'tailored', label: 'Tailored' },
    ...(hasOriginal ? [{ id: 'original' as const, label: 'Original' }] : []),
    ...(changeCount === undefined
      ? []
      : [{ id: 'changes' as const, label: `Changes (${changeCount})` }]),
  ]

  return (
    <fieldset
      className="inline-flex rounded-md border p-0.5 gap-0.5 m-0 min-w-0"
      style={{ borderColor: 'hsl(var(--border) / 0.6)', background: 'hsl(var(--card) / 0.4)' }}
    >
      <legend className="sr-only">Resume view</legend>
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className="px-3 py-1 rounded text-xs font-mono-jb transition-colors duration-150"
            style={{
              background: active ? 'hsl(var(--primary) / 0.12)' : 'transparent',
              color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </fieldset>
  )
}
