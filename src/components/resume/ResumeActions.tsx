import { AlertCircle, CheckCircle2, Download, Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { explainError } from '@/services/explainError'
import type { TailorStatus } from '@/types/resume'

interface ResumeActionsProps {
  status: TailorStatus
  error: string | null
  canTailor: boolean
  hasPdf: boolean
  onTailor: () => void
  onReset: () => void
  onDownload: () => void
  /** Goes back to the provider, key and model settings. */
  onReconfigure: () => void
}

const PROGRESS: Partial<Record<TailorStatus, string>> = {
  tailoring: 'Reading the job and rewriting your resume...',
  compiling: 'Building your PDF...',
}

const linkButton =
  'text-xs underline underline-offset-4 transition-colors hover:text-primary font-mono-jb'

export function ResumeActions({
  status,
  error,
  canTailor,
  hasPdf,
  onTailor,
  onReset,
  onDownload,
  onReconfigure,
}: ResumeActionsProps) {
  const isProcessing = status === 'tailoring' || status === 'compiling'
  const problem = status === 'error' && error ? explainError(error) : null

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={onTailor}
        disabled={!canTailor || isProcessing}
        aria-busy={isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 h-auto text-sm font-medium transition-[transform,box-shadow,background-color] duration-150 ease-out active:scale-[0.97] font-mono-jb"
        style={{
          background:
            canTailor && !isProcessing ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)',
          color: 'hsl(var(--primary-foreground))',
          boxShadow: canTailor && !isProcessing ? '0 0 24px hsl(var(--primary) / 0.4)' : 'none',
        }}
      >
        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        Tailor resume
      </Button>

      <div
        className="flex gap-2 p-2 rounded-lg"
        style={{
          background: 'hsl(var(--card) / 0.3)',
          border: '1px solid hsl(var(--border) / 0.3)',
        }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={isProcessing}
          className="flex-1 gap-1.5 text-xs font-mono-jb active:scale-[0.97] transition-transform duration-150"
        >
          <RotateCcw size={12} />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={!hasPdf || isProcessing}
          className="flex-1 gap-1.5 text-xs font-mono-jb active:scale-[0.97] transition-transform duration-150"
          style={{
            borderColor: hasPdf && !isProcessing ? 'hsl(var(--primary) / 0.4)' : undefined,
            color: hasPdf && !isProcessing ? 'hsl(var(--primary))' : undefined,
          }}
        >
          <Download size={12} />
          Download
        </Button>
      </div>

      {/* One place says what is happening: progress, then the result, or what went wrong */}
      <div role="status" aria-live="polite">
        {PROGRESS[status] && (
          <div
            className="flex items-center gap-2 text-xs py-2 px-3 rounded-md font-mono-jb"
            style={{
              color: 'hsl(var(--primary))',
              background: 'hsl(var(--primary) / 0.08)',
              border: '1px solid hsl(var(--primary) / 0.25)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'hsl(var(--primary))' }}
            />
            <span>{PROGRESS[status]}</span>
          </div>
        )}

        {status === 'done' && (
          <div
            className="flex items-center gap-2 text-xs py-2 px-3 rounded-md font-mono-jb animate-in fade-in duration-200"
            style={{
              color: 'hsl(var(--success))',
              background: 'hsl(var(--success) / 0.08)',
              border: '1px solid hsl(var(--success) / 0.25)',
            }}
          >
            <CheckCircle2 size={12} />
            <span>Resume tailored</span>
          </div>
        )}
      </div>

      {problem && (
        <div
          role="alert"
          className="space-y-2.5 text-xs py-2.5 px-3 rounded-md font-mono-jb animate-in fade-in duration-200"
          style={{
            color: 'hsl(var(--foreground) / 0.85)',
            background: 'hsl(var(--destructive) / 0.08)',
            border: '1px solid hsl(var(--destructive) / 0.3)',
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle
              size={12}
              className="shrink-0 mt-0.5"
              style={{ color: 'hsl(var(--destructive))' }}
            />
            <span className="leading-relaxed">{problem.message}</span>
          </div>

          {problem.details && (
            <details>
              <summary className={`cursor-pointer ${linkButton}`}>Show details</summary>
              <pre
                className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-[11px]"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {problem.details}
              </pre>
            </details>
          )}

          {(problem.canRetry || problem.needsSettings) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-5">
              {problem.canRetry && canTailor && (
                <button type="button" onClick={onTailor} className={linkButton}>
                  Try again
                </button>
              )}
              {problem.needsSettings && (
                <button type="button" onClick={onReconfigure} className={linkButton}>
                  Change settings
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
