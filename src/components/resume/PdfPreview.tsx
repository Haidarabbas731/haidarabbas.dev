import { ExternalLink, FileText } from 'lucide-react'
import type { TailorStatus } from '@/types/resume'

interface PdfPreviewProps {
  pdfUrl: string | null
  status: TailorStatus
  hasSource: boolean
  /** Which version the preview is showing, so it is never mistaken for the other. */
  showing?: 'original' | 'tailored' | null
}

const steps = [
  { label: 'Configure', key: 'configure' },
  { label: 'Enter JD', key: 'enter-jd' },
  { label: 'Tailor', key: 'tailor' },
] as const

function getActiveStep(hasSource: boolean, _pdfUrl: string | null, status: TailorStatus) {
  if (status === 'tailoring' || status === 'compiling' || status === 'done') return 'tailor'
  if (hasSource) return 'enter-jd'
  return 'configure'
}

function getLoadingPhaseLabel(status: TailorStatus) {
  if (status === 'tailoring') return 'Analyzing & Rewriting...'
  if (status === 'compiling') return 'Compiling PDF...'
  return 'Processing...'
}

export function PdfPreview({ pdfUrl, status, hasSource, showing }: PdfPreviewProps) {
  const isLoading = status === 'compiling' || status === 'tailoring'
  const activeStep = getActiveStep(hasSource, pdfUrl, status)

  return (
    <div className="flex flex-col h-full gap-3">
      {pdfUrl && showing && (
        <div className="flex items-center">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-mono-jb border"
            style={
              showing === 'tailored'
                ? {
                    color: 'hsl(var(--primary))',
                    borderColor: 'hsl(var(--primary) / 0.35)',
                    background: 'hsl(var(--primary) / 0.08)',
                  }
                : {
                    color: 'hsl(var(--muted-foreground))',
                    borderColor: 'hsl(var(--border))',
                    background: 'hsl(var(--card) / 0.5)',
                  }
            }
          >
            {showing === 'tailored' ? 'Tailored resume' : 'Original resume'}
          </span>
        </div>
      )}

      {/* Preview area */}
      <div
        className="relative flex-1 rounded-lg overflow-hidden border transition duration-500"
        style={{
          minHeight: '500px',
          borderColor: pdfUrl ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border) / 0.4)',
          boxShadow: pdfUrl
            ? '0 0 40px hsl(var(--primary) / 0.1), inset 0 0 40px hsl(var(--primary) / 0.02)'
            : 'none',
          background: 'hsl(var(--card) / 0.3)',
        }}
      >
        {/* Document skeleton loading overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex flex-col p-8 gap-4"
            style={{ background: 'hsl(var(--background) / 0.92)', backdropFilter: 'blur(8px)' }}
          >
            {/* Header skeleton */}
            <div className="flex flex-col items-center gap-2 mb-2">
              <div
                className="h-5 rounded animate-shimmer"
                style={{
                  width: '55%',
                  background:
                    'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--border)) 50%, hsl(var(--muted)) 100%)',
                  backgroundSize: '200% 100%',
                }}
              />
              <div
                className="h-3.5 rounded animate-shimmer"
                style={{
                  width: '35%',
                  background:
                    'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--border)) 50%, hsl(var(--muted)) 100%)',
                  backgroundSize: '200% 100%',
                  opacity: 0.7,
                }}
              />
              <div
                className="h-3 rounded animate-shimmer mt-1"
                style={{
                  width: '50%',
                  background:
                    'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--border)) 50%, hsl(var(--muted)) 100%)',
                  backgroundSize: '200% 100%',
                  opacity: 0.5,
                }}
              />
            </div>
            {/* Divider */}
            <div
              className="h-px w-full rounded"
              style={{ background: 'hsl(var(--border) / 0.4)' }}
            />
            {/* Section blocks */}
            {[
              { label: 60, lines: [85, 70, 75] },
              { label: 55, lines: [90, 65] },
              { label: 50, lines: [80, 72, 68, 60] },
            ].map((block) => (
              <div key={block.label} className="space-y-1.5">
                <div
                  className="h-3 rounded animate-shimmer"
                  style={{
                    width: `${block.label}%`,
                    background:
                      'linear-gradient(90deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.08) 50%, hsl(var(--primary) / 0.2) 100%)',
                    backgroundSize: '200% 100%',
                  }}
                />
                {block.lines.map((w) => (
                  <div
                    key={w}
                    className="h-2.5 rounded animate-shimmer"
                    style={{
                      width: `${w}%`,
                      background:
                        'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--border)) 50%, hsl(var(--muted)) 100%)',
                      backgroundSize: '200% 100%',
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
            ))}
            {/* Phase label */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <p className="text-xs font-mono-jb" style={{ color: 'hsl(var(--primary))' }}>
                {getLoadingPhaseLabel(status)}
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!pdfUrl && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
            {/* Dot-grid background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center animate-float"
                style={{
                  borderColor: 'hsl(var(--primary) / 0.3)',
                  background: 'hsl(var(--primary) / 0.05)',
                }}
              >
                <FileText size={28} style={{ color: 'hsl(var(--primary) / 0.5)' }} />
              </div>
              <p
                className="text-sm text-center max-w-[200px] font-mono-jb"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {!hasSource
                  ? 'Configure your settings to load a preview'
                  : 'Enter a job description and tailor'}
              </p>
            </div>

            {/* Step indicator */}
            <div className="relative z-10 flex items-center gap-1 mt-2">
              {steps.map((step, i) => {
                const isActive = step.key === activeStep
                const isPast = steps.findIndex((s) => s.key === activeStep) > i
                return (
                  <div key={step.key} className="flex items-center gap-1">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition font-mono-jb"
                        style={{
                          background: isActive
                            ? 'hsl(var(--primary))'
                            : isPast
                              ? 'hsl(var(--primary) / 0.3)'
                              : 'hsl(var(--muted))',
                          color: isActive
                            ? 'hsl(var(--primary-foreground))'
                            : 'hsl(var(--muted-foreground))',
                          boxShadow: isActive ? '0 0 8px hsl(var(--primary) / 0.4)' : 'none',
                        }}
                      >
                        {i + 1}
                      </div>
                      <span
                        className="text-[9px] whitespace-nowrap font-mono-jb"
                        style={{
                          color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className="w-6 h-px mb-4 transition"
                        style={{
                          background: isPast
                            ? 'hsl(var(--primary) / 0.4)'
                            : 'hsl(var(--border) / 0.5)',
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PDF iframe */}
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            title="Resume PDF Preview"
            className="w-full h-full border-0"
            style={{ minHeight: '500px' }}
          />
        )}
      </div>

      {/* Open in new tab, always visible when PDF is ready */}
      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs py-1.5 transition-colors font-mono-jb"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <ExternalLink size={11} />
          Open in new tab
        </a>
      )}
    </div>
  )
}
