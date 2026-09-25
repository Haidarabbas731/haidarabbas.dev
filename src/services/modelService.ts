import type { ModelInfo, Provider } from '@/types/resume'
import { checkApiKey } from './apiKey'

// Static fallback for Gemini, shown before an API key is entered. The "latest" aliases never go
// stale, because Google points them at the newest model of each kind.
export const DEFAULT_GEMINI_MODELS: ModelInfo[] = [
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', tag: 'recommended' },
  { id: 'gemini-pro-latest', name: 'Gemini Pro Latest', tag: 'recommended' },
]

const DAY_MS = 86_400_000

/** A tailored resume needs about 8k tokens of prompt and up to 8k of reply. */
export const MIN_CONTEXT_TOKENS = 16_000
const MIN_OUTPUT_TOKENS = 8192

// ── OpenRouter ─────────────────────────────────────────────────────────────

export interface OpenRouterModel {
  id: string
  name: string
  created?: number
  context_length?: number
  expiration_date?: string | null
  pricing?: { prompt?: string }
  supported_parameters?: string[]
  architecture?: {
    modality?: string
    input_modalities?: string[]
    output_modalities?: string[]
  }
}

/** "text+image->text" becomes ["text", "image"] for side 0 and ["text"] for side 1. */
const modalitySide = (modality: string | undefined, side: 0 | 1): string[] =>
  modality?.split('->')[side]?.split('+') ?? []

/** Safety classifiers, embedding and reward models: they take text but do not write resumes. */
const NOT_A_CHAT_MODEL = /(guard|safeguard|content-safety|moderation|embed|reward)/i

/**
 * Keeps models that take text in and give plain text back, and that can serve a live request.
 * Models that also accept images or files are fine (most leading models do), but ones that
 * generate images or audio are not.
 */
export function isUsableOpenRouterModel(m: OpenRouterModel, now = Date.now()): boolean {
  const arch = m.architecture ?? {}
  const inputs = arch.input_modalities ?? modalitySide(arch.modality, 0)
  const outputs = arch.output_modalities ?? modalitySide(arch.modality, 1)
  if (!inputs.includes('text') || outputs.length !== 1 || outputs[0] !== 'text') return false

  // ":batch" is the asynchronous half-price tier, and "stealth/" models are unreleased tests
  if (m.id.endsWith(':batch') || m.id.startsWith('stealth/')) return false
  if (NOT_A_CHAT_MODEL.test(m.id)) return false

  if (m.context_length !== undefined && m.context_length < MIN_CONTEXT_TOKENS) return false
  if (m.supported_parameters && !m.supported_parameters.includes('max_tokens')) return false
  // Routers report a price of -1 because the real model is picked per request
  if (m.pricing?.prompt?.startsWith('-')) return false
  if (m.expiration_date && Date.parse(m.expiration_date) < now) return false
  return true
}

/** Input price in dollars per million tokens, or undefined when the provider does not say. */
export function pricePerMillion(m: OpenRouterModel): number | undefined {
  const perToken = Number(m.pricing?.prompt)
  return Number.isFinite(perToken) && perToken >= 0 ? perToken * 1_000_000 : undefined
}

/** Short text for the picker: "Free", "$0.75 / 1M in", or nothing when the price is unknown. */
export function describePrice(price: number | undefined): string | null {
  if (price === undefined) return null
  if (price === 0) return 'Free'
  return price < 0.01 ? '<$0.01 / 1M in' : `$${price.toFixed(2)} / 1M in`
}

// Recommendations are computed from the live catalogue, so they stay current as models change
const RECOMMEND_FROM = ['google', 'openai', 'anthropic', 'deepseek', 'x-ai', 'qwen']
/** Fast and affordable: a resume costs a few cents at this price, and replies come quickly. */
const MAX_RECOMMENDED_PRICE = 2.5
const NOT_FOR_RECOMMENDING =
  /(-pro\b|thinking|reasoning|-max\b|prime|ultra|code|coder|vision|-exp\b|preview|omni)/i

/**
 * For each trusted provider, the newest fast and affordable model: released within a year, not a
 * reasoning or preview variant, and not about to be retired. Ties go to the cheaper model.
 */
export function pickRecommendedOpenRouter(models: OpenRouterModel[], now = Date.now()): string[] {
  const picks: OpenRouterModel[] = []
  for (const provider of RECOMMEND_FROM) {
    const best = models
      .filter((m) => m.id.startsWith(`${provider}/`) && !m.id.includes(':'))
      .filter((m) => !NOT_FOR_RECOMMENDING.test(m.id))
      .filter((m) => (pricePerMillion(m) ?? Number.POSITIVE_INFINITY) <= MAX_RECOMMENDED_PRICE)
      .filter((m) => m.created !== undefined && now - m.created * 1000 <= 365 * DAY_MS)
      .filter((m) => !m.expiration_date || Date.parse(m.expiration_date) - now > 90 * DAY_MS)
      .sort(
        (a, b) =>
          (b.created ?? 0) - (a.created ?? 0) ||
          (pricePerMillion(a) ?? 0) - (pricePerMillion(b) ?? 0)
      )[0]
    if (best) picks.push(best)
  }
  return picks.sort((a, b) => (b.created ?? 0) - (a.created ?? 0)).map((m) => m.id)
}

/** Filters, tags and orders OpenRouter's catalogue: recommended, then free, then newest first. */
export function buildOpenRouterList(raw: OpenRouterModel[], now = Date.now()): ModelInfo[] {
  const usable = raw.filter((m) => isUsableOpenRouterModel(m, now))
  const recommendedIds = pickRecommendedOpenRouter(usable, now)
  const info = (m: OpenRouterModel): ModelInfo => ({
    id: m.id,
    name: m.name,
    created: m.created,
    price: pricePerMillion(m),
  })

  const byId = new Map(usable.map((m) => [m.id, m]))
  const recommended = recommendedIds
    .map((id) => byId.get(id))
    .filter((m): m is OpenRouterModel => m !== undefined)
    .map((m) => ({ ...info(m), tag: 'recommended' as const }))

  const picked = new Set(recommendedIds)
  const newestFirst = (a: ModelInfo, b: ModelInfo) => (b.created ?? 0) - (a.created ?? 0)
  const rest = usable
    .filter((m) => !picked.has(m.id))
    .map(info)
    .sort(newestFirst)
  const free = rest
    .filter((m) => m.id.endsWith(':free'))
    .map((m) => ({ ...m, tag: 'free' as const }))
  const others = rest.filter((m) => !m.id.endsWith(':free'))
  return [...recommended, ...free, ...others]
}

// ── Gemini ─────────────────────────────────────────────────────────────────

export interface GeminiModel {
  name: string
  displayName?: string
  supportedGenerationMethods?: string[]
  outputTokenLimit?: number
}

/**
 * Gemini's model list has no modality field, so families that are not text generation are
 * recognised by name: speech, image, music, transcription, robotics, agents and similar.
 */
const NOT_TEXT_GENERATION =
  /(tts|image|imagen|nano-banana|lyria|transcribe|robotics|computer-use|antigravity|deep-research|omni|live|audio|embedding|veo|aqa)/i

export function isUsableGeminiModel(m: GeminiModel): boolean {
  if (!m.supportedGenerationMethods?.includes('generateContent')) return false
  const id = m.name.replace('models/', '')
  if (NOT_TEXT_GENERATION.test(id)) return false
  return m.outputTokenLimit === undefined || m.outputTokenLimit >= MIN_OUTPUT_TOKENS
}

/** Google keeps these aliases pointed at its newest model of each kind, so they never go stale. */
const GEMINI_RECOMMENDED = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-pro-latest']

/** Gemini models first, then others such as Gemma, each with the newest versions on top. */
const geminiOrder = (a: ModelInfo, b: ModelInfo) => {
  const rank = (m: ModelInfo) => (m.id.startsWith('gemini') ? 0 : 1)
  return rank(a) - rank(b) || b.name.localeCompare(a.name, undefined, { numeric: true })
}

export function buildGeminiList(raw: GeminiModel[]): ModelInfo[] {
  const models: ModelInfo[] = raw.filter(isUsableGeminiModel).map((m) => {
    const id = m.name.replace('models/', '')
    return { id, name: m.displayName ?? id }
  })
  const byId = new Map(models.map((m) => [m.id, m]))
  const recommended = GEMINI_RECOMMENDED.map((id) => byId.get(id))
    .filter((m): m is ModelInfo => m !== undefined)
    .map((m) => ({ ...m, tag: 'recommended' as const }))
  const picked = new Set(recommended.map((m) => m.id))
  return [...recommended, ...models.filter((m) => !picked.has(m.id)).sort(geminiOrder)]
}

// ── Fetching ───────────────────────────────────────────────────────────────

/**
 * Fetch available models for a given provider, limited to ones that can read and write text.
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
  // Partial or invalid keys (for example while typing) just get the default list
  const check = apiKey ? checkApiKey('gemini', apiKey) : null
  if (!check?.ok) return DEFAULT_GEMINI_MODELS

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200',
      { headers: { 'x-goog-api-key': check.key } }
    )
    if (!response.ok) return DEFAULT_GEMINI_MODELS

    const data = (await response.json()) as { models?: GeminiModel[] }
    const list = buildGeminiList(data.models ?? [])
    return list.length > 0 ? list : DEFAULT_GEMINI_MODELS
  } catch {
    return DEFAULT_GEMINI_MODELS
  }
}

async function fetchOpenRouterModels(): Promise<ModelInfo[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models')
    if (!response.ok) return []

    const data = (await response.json()) as { data?: OpenRouterModel[] }
    return buildOpenRouterList(data.data ?? [])
  } catch {
    return []
  }
}

// ── Defaults ───────────────────────────────────────────────────────────────

/**
 * A starting point before the model list has loaded. Once it has, `pickValidModel` swaps it for
 * a listed model if this one has been renamed or retired, so it never needs to be exact.
 */
export function getDefaultModel(provider: Provider): string {
  return provider === 'gemini' ? 'gemini-flash-latest' : 'google/gemini-3.8-flash'
}

/** Keeps the current model if it is still listed, otherwise falls back to the first listed one. */
export function pickValidModel(current: string, models: ModelInfo[]): string {
  if (models.length === 0 || models.some((m) => m.id === current)) return current
  return models[0].id
}
