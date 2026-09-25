import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ModelInfo } from '@/types/resume'

interface ModelSelectorProps {
  models: ModelInfo[]
  value: string
  onChange: (modelId: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  /** Smaller trigger, for use in a toolbar. */
  compact?: boolean
  /** Set both to control the popover from outside, for example to open it from an error. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ModelSelector({
  models,
  value,
  onChange,
  isLoading,
  disabled,
  placeholder = 'Select model...',
  compact,
  open: controlledOpen,
  onOpenChange,
}: ModelSelectorProps) {
  const [innerOpen, setInnerOpen] = useState(false)
  const open = controlledOpen ?? innerOpen
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInnerOpen(next)
    onOpenChange?.(next)
  }

  const selectedModel = models.find((m) => m.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || isLoading}
          className={cn(
            'w-full flex items-center justify-between rounded-md border transition font-mono-jb',
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2.5 text-sm',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            open ? 'border-primary/50' : 'border-border/50 hover:border-primary/30'
          )}
          style={{
            background: 'hsl(var(--card) / 0.6)',
            color: selectedModel ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
            boxShadow: open ? '0 0 12px hsl(var(--primary) / 0.1)' : 'none',
          }}
          aria-expanded={open}
        >
          <span className="truncate text-left">
            {isLoading ? (
              <span
                className="flex items-center gap-2"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <span
                  className="w-24 h-3 rounded animate-shimmer inline-block"
                  style={{
                    background:
                      'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--border)) 50%, hsl(var(--muted)) 100%)',
                    backgroundSize: '200% 100%',
                  }}
                />
              </span>
            ) : (
              (selectedModel?.name ?? placeholder)
            )}
          </span>
          <ChevronDown
            size={14}
            className={cn('shrink-0 transition-transform ml-2', open && 'rotate-180')}
            style={{ color: 'hsl(var(--muted-foreground))' }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[300px]"
        style={{
          background: 'hsl(var(--card))',
          borderColor: 'hsl(var(--primary) / 0.3)',
          boxShadow: 'var(--shadow-popover)',
        }}
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search models..."
            className="text-xs font-mono-jb"
            aria-label="Search models"
          />
          <CommandList className="max-h-60">
            {isLoading ? (
              <div className="p-2 space-y-1">
                {['a', 'b', 'c', 'd', 'e'].map((id, i) => (
                  <div key={id} className="flex flex-col gap-1 px-3 py-2.5 rounded-md">
                    <div
                      className="h-3.5 rounded animate-shimmer"
                      style={{
                        width: `${60 + (i % 3) * 15}%`,
                        background:
                          'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--border)) 50%, hsl(var(--muted)) 100%)',
                        backgroundSize: '200% 100%',
                      }}
                    />
                    <div
                      className="h-2.5 rounded animate-shimmer"
                      style={{
                        width: `${40 + (i % 2) * 20}%`,
                        background:
                          'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--border)) 50%, hsl(var(--muted)) 100%)',
                        backgroundSize: '200% 100%',
                        opacity: 0.6,
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <CommandEmpty
                  className="px-3 py-4 text-xs text-center font-mono-jb"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  No models found
                </CommandEmpty>
                <CommandGroup>
                  {models.map((m) => (
                    <CommandItem
                      key={m.id}
                      value={`${m.name} ${m.id}`}
                      onSelect={() => {
                        onChange(m.id)
                        setOpen(false)
                      }}
                      className="flex items-start justify-between gap-3 px-3 py-2.5 cursor-pointer font-mono-jb"
                    >
                      <div>
                        <div
                          className="font-medium text-sm"
                          style={{ color: 'hsl(var(--foreground))' }}
                        >
                          {m.name}
                        </div>
                        <div
                          className="text-xs opacity-50 mt-0.5"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        >
                          {m.id}
                        </div>
                      </div>
                      {m.id === value && (
                        <Check
                          size={12}
                          className="shrink-0 mt-1"
                          style={{ color: 'hsl(var(--primary))' }}
                        />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
