import { ShieldCheck } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function TrustBadge() {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="group inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border transition duration-200 font-mono-jb hover:border-primary/40 hover:text-primary"
          style={{
            color: 'hsl(var(--muted-foreground))',
            borderColor: 'hsl(var(--border) / 0.4)',
            background: 'hsl(var(--card) / 0.3)',
          }}
        >
          <ShieldCheck
            size={11}
            className="transition-colors duration-200 group-hover:text-primary"
            style={{ color: 'hsl(var(--primary) / 0.6)' }}
          />
          How is my data stored?
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="end"
        sideOffset={8}
        className="max-w-[300px] p-0 border-0 shadow-none bg-transparent"
      >
        <div
          className="rounded-xl border p-4 text-xs leading-relaxed font-body"
          style={{
            background: 'hsl(var(--card))',
            borderColor: 'hsl(var(--primary) / 0.2)',
            boxShadow: 'var(--shadow-popover-strong)',
            color: 'hsl(var(--foreground) / 0.75)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{
                background: 'hsl(var(--primary) / 0.12)',
                border: '1px solid hsl(var(--primary) / 0.25)',
              }}
            >
              <ShieldCheck size={13} style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <span
              className="text-xs font-semibold font-mono-jb"
              style={{ color: 'hsl(var(--foreground) / 0.9)' }}
            >
              Where your data goes
            </span>
          </div>

          {/* Body */}
          <p style={{ color: 'hsl(var(--foreground) / 0.65)' }}>
            Your API key and resume are stored{' '}
            <strong style={{ color: 'hsl(var(--primary) / 0.9)', fontWeight: 600 }}>
              only in your browser's local storage
            </strong>
            . We store nothing on our servers. To do the job, your resume text is sent from your
            browser to your chosen AI provider (Google or OpenRouter) to be rewritten, and to a
            third-party LaTeX service (latex.ytotech.com) to build the PDF.
          </p>

          {/* Divider + footer pill */}
          <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid hsl(var(--border) / 0.4)' }}>
            <div
              className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-mono-jb"
              style={{
                background: 'hsl(var(--primary) / 0.08)',
                color: 'hsl(var(--primary) / 0.8)',
                border: '1px solid hsl(var(--primary) / 0.15)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(var(--primary))' }}
              />
              Nothing stored by us
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
