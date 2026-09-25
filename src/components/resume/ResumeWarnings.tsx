import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import type { ResumeWarning } from '@/types/resumeData'

const VISIBLE = 5

interface ResumeWarningsProps {
  warnings: ResumeWarning[]
}

/** Things in the tailored resume that are not in the original, so the user can double-check. */
export function ResumeWarnings({ warnings }: ResumeWarningsProps) {
  const [expanded, setExpanded] = useState(false)
  if (warnings.length === 0) return null

  const shown = expanded ? warnings : warnings.slice(0, VISIBLE)
  const hidden = warnings.length - shown.length

  return (
    <div
      role="status"
      className="rounded-md border p-3 space-y-2 animate-in fade-in duration-200"
      style={{
        background: 'hsl(var(--card) / 0.4)',
        borderColor: 'hsl(var(--warning) / 0.45)',
      }}
    >
      <div className="flex items-center gap-2 text-xs font-medium font-mono-jb">
        <TriangleAlert size={13} style={{ color: 'hsl(var(--warning))' }} aria-hidden="true" />
        <span style={{ color: 'hsl(var(--foreground) / 0.9)' }}>
          Check these before you send ({warnings.length})
        </span>
      </div>
      <p className="text-xs font-body" style={{ color: 'hsl(var(--muted-foreground))' }}>
        The AI can make mistakes. These are not in your original resume, so make sure they are true.
      </p>
      <ul className="space-y-1">
        {shown.map((w) => (
          <li
            key={`${w.kind}:${w.value}`}
            className="text-xs font-mono-jb leading-relaxed"
            style={{ color: 'hsl(var(--foreground) / 0.8)' }}
          >
            {w.message}
          </li>
        ))}
      </ul>
      {(hidden > 0 || expanded) && warnings.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs underline underline-offset-4 transition-colors hover:text-primary font-mono-jb"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {expanded ? 'Show fewer' : `Show ${hidden} more`}
        </button>
      )}
    </div>
  )
}
