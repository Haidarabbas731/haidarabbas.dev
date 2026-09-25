import { Key } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getLastModel, saveLastModel, savePublicConfig } from '@/services/authService'
import { fetchModels, getDefaultModel } from '@/services/modelService'
import type { ModelInfo, Provider, ResumeSource } from '@/types/resume'
import { LatexInput } from './LatexInput'
import { ModelSelector } from './ModelSelector'
import { ProviderSelector } from './ProviderSelector'
import { TrustBadge } from './TrustBadge'

interface PublicConfigProps {
  onReady: (apiKey: string, provider: Provider, model: string, source: ResumeSource) => void
  onClear: () => void
}

export function PublicConfig({ onReady, onClear }: PublicConfigProps) {
  const [provider, setProvider] = useState<Provider>('openrouter')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(getDefaultModel('openrouter'))
  const [models, setModels] = useState<ModelInfo[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [latex, setLatex] = useState('')

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

  function handleApply() {
    if (!apiKey.trim() || !latex.trim() || !model) return
    savePublicConfig(provider, apiKey.trim())
    onReady(apiKey.trim(), provider, model, { kind: 'latex', latex: latex.trim() })
  }

  const canApply = !!apiKey.trim() && !!latex.trim() && !!model

  return (
    <div className="space-y-5">
      {/* Provider selection */}
      <div className="space-y-2">
        <span
          className="text-xs uppercase tracking-widest font-mono-jb"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          AI Provider
        </span>
        <ProviderSelector value={provider} onChange={handleProviderChange} />
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="api-key-input"
            className="text-xs uppercase tracking-widest font-mono-jb"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            API Key
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
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground font-mono-jb"
            style={{ color: 'hsl(var(--foreground))' }}
            autoComplete="off"
          />
        </div>
        <p className="text-xs font-mono-jb" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {provider === 'gemini'
            ? 'Get a free key at aistudio.google.com/apikey'
            : 'Get a key at openrouter.ai/keys'}
        </p>
      </div>

      {/* Model selection */}
      <div className="space-y-2">
        <span
          className="text-xs uppercase tracking-widest font-mono-jb"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Model
        </span>
        <ModelSelector
          models={models}
          value={model}
          onChange={handleModelChange}
          isLoading={modelsLoading}
        />
      </div>

      {/* LaTeX resume input */}
      <LatexInput value={latex} onChange={setLatex} />

      {/* Apply button */}
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
        Load Preview →
      </button>

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
