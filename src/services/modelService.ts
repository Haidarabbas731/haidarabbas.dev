import type { ModelInfo, Provider } from '@/types/resume'

// Static fallback for Gemini, shown before API key is entered
export const DEFAULT_GEMINI_MODELS: ModelInfo[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
]

/**
 * Fetch available models for a given provider.
 * - Gemini: requires API key; shows fallback if not provided or on error
 * - OpenRouter: public endpoint, no key needed
 */
export async function fetchModels(provider: Provider, apiKey?: string): Promise<ModelInfo[]> {
  if (provider === 'gemini') {
    return fetchGeminiModels(apiKey)
  }
  return fetchOpenRouterModels()
}

async function fetchGeminiModels(apiKey?: string): Promise<ModelInfo[]> {
  if (!apiKey) return DEFAULT_GEMINI_MODELS

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )
    if (!response.ok) return DEFAULT_GEMINI_MODELS

    const data = await response.json()
    const models: ModelInfo[] = (data.models ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter(
        (m: any) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes('generateContent')
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((m: any) => ({
        id: (m.name as string).replace('models/', ''),
        name: m.displayName as string,
      }))

    return models.length > 0 ? models : DEFAULT_GEMINI_MODELS
  } catch {
    return DEFAULT_GEMINI_MODELS
  }
}

async function fetchOpenRouterModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models')
    if (!response.ok) return []

    const data = await response.json()
    return (
      (data.data ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((m: any) => m.architecture?.modality === 'text->text')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => (a.name as string).localeCompare(b.name as string))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => ({
          id: m.id as string,
          name: m.name as string,
        }))
    )
  } catch {
    return []
  }
}

/**
 * Return a sensible default model ID for a given provider.
 */
export function getDefaultModel(provider: Provider): string {
  return provider === 'gemini' ? 'gemini-2.5-flash' : 'anthropic/claude-sonnet-4'
}
