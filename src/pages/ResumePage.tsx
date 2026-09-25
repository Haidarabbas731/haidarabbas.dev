import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import CustomCursor from '@/components/CustomCursor'
import GrainOverlay from '@/components/GrainOverlay'
import Navbar from '@/components/Navbar'
import { AccessModeSelector } from '@/components/resume/AccessModeSelector'
import { ChangesView } from '@/components/resume/ChangesView'
import { JobDescriptionInput } from '@/components/resume/JobDescriptionInput'
import { PdfPreview } from '@/components/resume/PdfPreview'
import { ResultTabs } from '@/components/resume/ResultTabs'
import { ResumeActions } from '@/components/resume/ResumeActions'
import { ResumeWarnings } from '@/components/resume/ResumeWarnings'
import { useResumeTailor } from '@/hooks/useResumeTailor'
import type { Provider, ResumeConfig, ResumeSource } from '@/types/resume'

export default function ResumePage() {
  // Config set when user authenticates/configures
  const [config, setConfig] = useState<ResumeConfig>({
    mode: null,
    provider: 'openrouter',
    model: '',
    apiKey: null,
    source: null,
  })

  const [isConfigured, setIsConfigured] = useState(false)

  const {
    jobDescription,
    setJobDescription,
    additionalNotes,
    setAdditionalNotes,
    pdfUrl,
    status,
    error,
    canTailor,
    canDownload,
    showing,
    view,
    setView,
    originalUrl,
    tailoredUrl,
    changes,
    keywords,
    warnings,
    tailor,
    reset,
    download,
  } = useResumeTailor(config)

  // Tabs only appear once there is a tailored version and something to compare it with
  const showTabs = !!tailoredUrl && (!!originalUrl || !!changes)

  // The page owns the uploaded original's object URL, so it outlives the setup screen
  useEffect(() => {
    const url = config.source?.kind === 'text' ? config.source.originalPdfUrl : undefined
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [config.source])

  function handleReady(apiKey: string, provider: Provider, model: string, source: ResumeSource) {
    setConfig({ mode: null, provider, model, apiKey, source })
    setIsConfigured(true)
  }

  function handleReconfigure() {
    setIsConfigured(false)
    setConfig({ mode: null, provider: 'openrouter', model: '', apiKey: null, source: null })
  }

  return (
    <div className="relative min-h-screen">
      <CustomCursor />
      <GrainOverlay />
      <Navbar />

      {/* Ambient background glow */}
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
        }}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-36 md:pt-28 pb-20">
        {/* Page header */}
        <div className="mb-12 text-center">
          <div
            className="inline-flex items-center gap-2 mb-4 text-xs px-3 py-1.5 rounded-full border overflow-hidden relative font-mono-jb"
            style={{
              color: 'hsl(var(--primary))',
              borderColor: 'hsl(var(--primary) / 0.25)',
              background: 'hsl(var(--primary) / 0.06)',
            }}
          >
            <div
              className="absolute inset-0 animate-shimmer pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.12) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
            />
            <Sparkles size={11} className="relative z-10" />
            <span className="relative z-10">AI-Powered · Gemini & OpenRouter</span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-foreground via-primary/80 to-foreground bg-clip-text text-transparent font-display"
            style={{ letterSpacing: '-0.02em' }}
          >
            Resume Tailoring
          </h1>
          <p
            className="text-base max-w-xl mx-auto font-body"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Paste a job description. AI rewrites your resume to match the role. Same experience,
            perfectly positioned.
          </p>
        </div>

        {!isConfigured ? (
          /* ── Setup / Access Mode ── */
          <div className="flex flex-col items-center gap-6">
            <AccessModeSelector onReady={handleReady} />
          </div>
        ) : (
          /* ── Main tailoring UI ── */
          <div className="space-y-6">
            {/* Reconfigure bar */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl border"
              style={{
                background: 'hsl(var(--card) / 0.5)',
                borderColor: 'hsl(var(--primary) / 0.2)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 2px 16px hsl(var(--primary) / 0.06)',
              }}
            >
              <div className="flex items-center gap-3 text-xs">
                <span
                  className="w-2 h-2 rounded-full animate-pulse shrink-0"
                  style={{ background: 'hsl(var(--primary))' }}
                />
                <span className="font-mono-jb" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Ready
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium font-mono-jb"
                  style={{
                    background: 'hsl(var(--primary) / 0.12)',
                    color: 'hsl(var(--primary))',
                    border: '1px solid hsl(var(--primary) / 0.25)',
                  }}
                >
                  {config.provider === 'gemini' ? 'Gemini' : 'OpenRouter'}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium max-w-[160px] truncate hidden sm:inline-block font-mono-jb"
                  style={{
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground) / 0.7)',
                    border: '1px solid hsl(var(--border) / 0.5)',
                  }}
                >
                  {config.model}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReconfigure}
                className="text-xs transition-colors hover:text-primary font-mono-jb"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                ← Reconfigure
              </button>
            </div>

            {/* Two-panel layout */}
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left panel: inputs (40%) */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-xl border p-6 space-y-6 sticky top-24"
                  style={{
                    background: 'hsl(var(--card) / 0.5)',
                    borderColor: 'hsl(var(--primary) / 0.12)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <JobDescriptionInput
                    jobDescription={jobDescription}
                    onJobDescriptionChange={setJobDescription}
                    additionalNotes={additionalNotes}
                    onAdditionalNotesChange={setAdditionalNotes}
                    disabled={status === 'tailoring' || status === 'compiling'}
                  />
                  <ResumeActions
                    status={status}
                    error={error}
                    canTailor={canTailor}
                    hasPdf={canDownload}
                    onTailor={tailor}
                    onReset={reset}
                    onDownload={download}
                  />
                  <ResumeWarnings warnings={warnings} />
                </div>
              </div>

              {/* Right panel: PDF preview (60%) */}
              <div className="lg:col-span-3">
                <div
                  className="rounded-xl border p-4"
                  style={{
                    background: 'hsl(var(--card) / 0.3)',
                    borderColor: 'hsl(var(--primary) / 0.1)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {showTabs && (
                    <div className="mb-3">
                      <ResultTabs
                        value={view}
                        onChange={setView}
                        hasOriginal={!!originalUrl}
                        changeCount={
                          changes
                            ? changes.stats.reworded + changes.stats.added + changes.stats.dropped
                            : undefined
                        }
                      />
                    </div>
                  )}
                  {view === 'changes' && changes ? (
                    <ChangesView diff={changes} keywords={keywords} />
                  ) : (
                    <PdfPreview
                      pdfUrl={pdfUrl}
                      status={status}
                      hasSource={!!config.source}
                      showing={showTabs ? null : showing}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
