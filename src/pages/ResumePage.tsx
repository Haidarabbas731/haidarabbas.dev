import { Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import CustomCursor from '@/components/CustomCursor'
import GrainOverlay from '@/components/GrainOverlay'
import Navbar from '@/components/Navbar'
import { AccessModeSelector } from '@/components/resume/AccessModeSelector'
import { ChangesView } from '@/components/resume/ChangesView'
import { JobDescriptionInput } from '@/components/resume/JobDescriptionInput'
import { ModelSelector } from '@/components/resume/ModelSelector'
import { PdfPreview } from '@/components/resume/PdfPreview'
import { ResultTabs } from '@/components/resume/ResultTabs'
import { ResumeActions } from '@/components/resume/ResumeActions'
import { ResumeWarnings } from '@/components/resume/ResumeWarnings'
import { useResumeTailor } from '@/hooks/useResumeTailor'
import { saveLastModel } from '@/services/authService'
import { fetchModels } from '@/services/modelService'
import type { ModelInfo, Provider, ResumeConfig, ResumeSource } from '@/types/resume'

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
    cancel,
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

  // The model list feeds the picker in the ready bar, so the model can be changed in place
  const [models, setModels] = useState<ModelInfo[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  useEffect(() => {
    if (!isConfigured || !config.apiKey) return
    let stale = false
    setModelsLoading(true)
    fetchModels(config.provider, config.apiKey)
      .then((list) => {
        if (!stale) setModels(list)
      })
      .finally(() => {
        if (!stale) setModelsLoading(false)
      })
    return () => {
      stale = true
    }
  }, [isConfigured, config.provider, config.apiKey])

  const [pickerOpen, setPickerOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  // Set when the picker was opened from an error or a slow request, so choosing retries
  const retryAfterPick = useRef(false)
  const [retryPending, setRetryPending] = useState(false)

  function pickModel(retry: boolean) {
    retryAfterPick.current = retry
    barRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setPickerOpen(true)
  }

  function handlePickerOpenChange(open: boolean) {
    setPickerOpen(open)
    if (!open) retryAfterPick.current = false
  }

  function handleModelChange(model: string) {
    setConfig((c) => ({ ...c, model }))
    saveLastModel(config.provider, model)
    if (retryAfterPick.current) {
      retryAfterPick.current = false
      setRetryPending(true)
    }
  }

  // "tailor" is recreated when the model changes, so this runs with the newly chosen model
  useEffect(() => {
    if (!retryPending || !canTailor) return
    setRetryPending(false)
    void tailor()
  }, [retryPending, canTailor, tailor])

  // On phones the result sits below the inputs, so bring it into view when it is ready
  const previewRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (status !== 'done' || !window.matchMedia('(max-width: 1023px)').matches) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    previewRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }, [status])

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
            className="inline-flex items-center gap-2 mb-4 text-xs px-3 py-1.5 rounded-full border font-mono-jb"
            style={{
              color: 'hsl(var(--primary))',
              borderColor: 'hsl(var(--primary) / 0.25)',
              background: 'hsl(var(--primary) / 0.06)',
            }}
          >
            <Sparkles size={11} />
            <span>AI-Powered · Gemini & OpenRouter</span>
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
              ref={barRef}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 rounded-xl border"
              style={{
                background: 'hsl(var(--card) / 0.5)',
                borderColor: 'hsl(var(--primary) / 0.2)',
                boxShadow: '0 2px 16px hsl(var(--primary) / 0.06)',
              }}
            >
              <div className="flex items-center gap-3 text-xs sm:order-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
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
              </div>
              <div className="order-3 w-full basis-full sm:order-2 sm:w-72 sm:basis-auto">
                <ModelSelector
                  compact
                  models={models}
                  value={config.model}
                  onChange={handleModelChange}
                  isLoading={modelsLoading && models.length === 0}
                  placeholder={config.model || 'Select model...'}
                  open={pickerOpen}
                  onOpenChange={handlePickerOpenChange}
                  disabled={status === 'tailoring' || status === 'compiling'}
                />
              </div>
              <button
                type="button"
                onClick={handleReconfigure}
                className="ml-auto text-xs transition-colors hover:text-primary font-mono-jb sm:order-3"
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
                    onReconfigure={handleReconfigure}
                    onPickModel={pickModel}
                    onCancel={cancel}
                  />
                  <ResumeWarnings warnings={warnings} />
                </div>
              </div>

              {/* Right panel: PDF preview (60%) */}
              <div ref={previewRef} className="lg:col-span-3 scroll-mt-24">
                <div
                  className="rounded-xl border p-4"
                  style={{
                    background: 'hsl(var(--card) / 0.3)',
                    borderColor: 'hsl(var(--primary) / 0.1)',
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
