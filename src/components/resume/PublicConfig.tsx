import { Key } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getLastModel, saveLastModel, savePublicConfig } from '@/services/authService'
import { fetchModels, getDefaultModel } from '@/services/modelService'
import type { ModelInfo, Provider, ResumeSource } from '@/types/resume'
import { ModelSelector } from './ModelSelector'
import { ProviderSelector } from './ProviderSelector'
import { ResumeSourceInput, type SourceDraft } from './ResumeSourceInput'
import { TrustBadge } from './TrustBadge'

interface PublicConfigProps {
  onReady: (apiKey: string, provider: Provider, model: string, source: ResumeSource) => void
  onClear: () => void
}

const KEY_LINKS: Record<Provider, { href: string; label: string }> = {
  gemini: { href: 'https://aistudio.google.com/apikey', label: 'aistudio.google.com/apikey' },
  openrouter: { href: 'https://openrouter.ai/keys', label: 'openrouter.ai/keys' },
}

const draftHasContent = (d: SourceDraft) => (d.kind === 'text' ? !!d.text.trim() : !!d.latex.trim())

export function PublicConfig({ onReady, onClear }: PublicConfigProps) {
  const [provider, setProvider] = useState<Provider>('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(getDefaultModel('openrouter'))
  const [models, setModels] = useState<ModelInfo[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [draft, setDraft] = useState<SourceDraft>({ kind: 'text', text: '' })

  // Load models whenever provider or api key changes
  useEffect(() => {
    setModelsLoading(true)
    setModel(getLastModel(provider) ?? getDefaultModel(provider))
    fetchModels(provider, apiKey || undefined)
      .then((m) => setModels(m))
      .finally(() => setModelsLoading(false))
  }, [provider, apiKey])

  function handleProviderChange(p: Provider) {
    setProvider(p)
    setApiKey('')
  }

  function handleModelChange(m: string) {
    setModel(m)
    saveLastModel(provider, m)
  }

  const hasKey = !!apiKey.trim()
  const hasResume = draftHasContent(draft)
  const canApply = hasKey && hasResume && !!model

  function handleApply() {
    if (!canApply) return
    savePublicConfig(provider, apiKey.trim())
    // The page takes ownership of the uploaded PDF's object URL and revokes it when done
    const source: ResumeSource =
      draft.kind === 'latex'
        ? { kind: 'latex', latex: draft.latex.trim() }
        : {
            kind: 'text',
            text: draft.text.trim(),
            originalPdfUrl: draft.file ? URL.createObjectURL(draft.file) : undefined,
          }
    onReady(apiKey.trim(), provider, model, source)
  }

  const modelName = models.find((m) => m.id === model)?.name ?? model
  const keyLink = KEY_LINKS[provider]
  const missing = !hasKey
    ? 'Add your API key to continue'
    : !hasResume
      ? 'Add your resume to continue'
      : null

  return (
    <div className="space-y-6">
      {/* AI settings */}
      <div className="space-y-3">
        <ProviderSelector value={provider} onChange={handleProviderChange} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="api-key-input"
              className="text-xs uppercase tracking-widest font-mono-jb"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              API key
            </label>
            <TrustBadge />
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-md border transition"
            style={{
              background: 'hsl(var(--card) / 0.4)',
              borderColor: apiKey ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border) / 0.5)',
              boxShadow: apiKey ? '0 0 12px hsl(var(--primary) / 0.1)' : 'none',
            }}
          >
            <Key size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
            <input
              id="api-key-input"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-or-...'}
              className="flex-1 bg-transparent text-base md:text-sm outline-none placeholder:text-muted-foreground font-mono-jb"
              style={{ color: 'hsl(var(--foreground))' }}
              autoComplete="off"
            />
          </div>
          <p className="text-xs font-mono-jb" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {provider === 'gemini' ? 'Get a free key at ' : 'Get a key at '}
            <a
              href={keyLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-primary"
            >
              {keyLink.label}
            </a>
          </p>
        </div>

        {/* Model: a sensible default, with the full list one click away */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs font-mono-jb">
            <span className="min-w-0 truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Model{' '}
              <span style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
                {modelsLoading ? '...' : modelName}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowModels((v) => !v)}
              aria-expanded={showModels}
              className="shrink-0 underline underline-offset-4 transition-colors hover:text-primary"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {showModels ? 'Done' : 'Change'}
            </button>
          </div>
          {showModels && (
            <ModelSelector
              models={models}
              value={model}
              onChange={handleModelChange}
              isLoading={modelsLoading}
            />
          )}
        </div>
      </div>

      {/* Resume */}
      <ResumeSourceInput value={draft} onChange={setDraft} />

      {/* Continue */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleApply}
          disabled={!canApply}
          className="w-full py-2.5 rounded-md text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed font-mono-jb"
          style={{
            background: canApply ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)',
            color: 'hsl(var(--primary-foreground))',
            boxShadow: canApply ? '0 0 20px hsl(var(--primary) / 0.35)' : 'none',
          }}
        >
          Continue →
        </button>
        {missing && (
          <p
            className="text-center text-xs font-mono-jb"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {missing}
          </p>
        )}
      </div>

      {/* Clear data */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onClear}
          className="text-xs transition-colors hover:text-destructive font-mono-jb"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Clear my saved data
        </button>
      </div>
    </div>
  )
}
