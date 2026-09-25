import { cn } from '@/lib/utils'
import type { Provider } from '@/types/resume'

interface ProviderSelectorProps {
  value: Provider
  onChange: (provider: Provider) => void
  disabled?: boolean
}

const providers: { id: Provider; label: string; description: string }[] = [
  { id: 'openrouter', label: 'OpenRouter', description: '200+ models' },
  { id: 'gemini', label: 'Gemini', description: 'Google AI' },
]

export function ProviderSelector({ value, onChange, disabled }: ProviderSelectorProps) {
  return (
    <div className="flex gap-2">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(p.id)}
          aria-pressed={value === p.id}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-md border text-sm transition duration-300 active:scale-[0.98] font-mono-jb',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            value === p.id
              ? 'border-primary/60 text-primary'
              : 'border-border/50 hover:border-primary/30'
          )}
          style={{
            background: value === p.id ? 'hsl(var(--primary) / 0.08)' : 'hsl(var(--card) / 0.5)',
            boxShadow:
              value === p.id
                ? '0 0 16px hsl(var(--primary) / 0.2), inset 0 0 12px hsl(var(--primary) / 0.05)'
                : 'none',
            color: value === p.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
          }}
        >
          <div className="font-medium">{p.label}</div>
          <div className="text-xs opacity-60 font-body">{p.description}</div>
        </button>
      ))}
    </div>
  )
}
