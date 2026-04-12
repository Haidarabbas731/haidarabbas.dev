import { AlertCircle, CheckCircle2, Download, Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TailorStatus } from '@/types/resume'

interface ResumeActionsProps {
  status: TailorStatus
  error: string | null
  canTailor: boolean
  hasPdf: boolean
  onTailor: () => void
  onReset: () => void
  onDownload: () => void
}

const statusConfig: Record<TailorStatus, { label: string; color: string } | null> = {
  idle: null,
  tailoring: { label: 'AI is tailoring your resume...', color: 'hsl(var(--primary))' },
  compiling: { label: 'Compiling PDF...', color: 'hsl(var(--primary))' },
  done: { label: 'Resume tailored successfully', color: 'hsl(175 80% 50%)' },
  error: { label: '', color: 'hsl(var(--destructive))' },
}

export function ResumeActions({
  status,
  error,
  canTailor,
  hasPdf,
  onTailor,
  onReset,
  onDownload,
}: ResumeActionsProps) {
  const isProcessing = status === 'tailoring' || status === 'compiling'
  const info = statusConfig[status]

  return (
    <div className="space-y-4">
      {/* Primary action */}
      <Button
        type="button"
        onClick={onTailor}
        disabled={!canTailor || isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 h-auto text-sm font-medium transition-all duration-200 hover:scale-[1.01] font-mono-jb"
        style={{
          background:
            canTailor && !isProcessing ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)',
          color: 'hsl(var(--primary-foreground))',
          boxShadow: canTailor && !isProcessing ? '0 0 24px hsl(var(--primary) / 0.4)' : 'none',
        }}
      >
        {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {isProcessing
          ? status === 'tailoring'
            ? 'Tailoring...'
            : 'Compiling...'
          : 'Tailor Resume'}
      </Button>

      {/* Secondary actions */}
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
          className="flex-1 gap-1.5 text-xs font-mono-jb"
        >
          <RotateCcw size={12} />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={!hasPdf || isProcessing}
          className="flex-1 gap-1.5 text-xs font-mono-jb"
          style={{
            borderColor: hasPdf && !isProcessing ? 'hsl(var(--primary) / 0.4)' : undefined,
            color: hasPdf && !isProcessing ? 'hsl(var(--primary))' : undefined,
          }}
        >
          <Download size={12} />
          Download
        </Button>
      </div>

      {/* Status indicator */}
      {info && (
        <div
          className={`flex items-center gap-2 text-xs py-2 px-3 rounded-md transition-all duration-300 font-mono-jb ${status === 'done' ? 'animate-in fade-in zoom-in-95' : ''}`}
          style={{
            color: info.color,
            background: `${info.color}10`,
            border: `1px solid ${info.color}30`,
          }}
        >
          {isProcessing && (
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: info.color }}
            />
          )}
          {status === 'done' && (
            <CheckCircle2 size={12} className="animate-in zoom-in-50 duration-300" />
          )}
          <span>{info.label}</span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div
          className="flex items-start gap-2 text-xs py-2.5 px-3 rounded-md font-mono-jb"
          style={{
            color: 'hsl(var(--destructive))',
            background: 'hsl(var(--destructive) / 0.08)',
            border: '1px solid hsl(var(--destructive) / 0.3)',
          }}
        >
          <AlertCircle size={12} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
