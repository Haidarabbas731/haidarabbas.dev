import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildGeminiList,
  buildOpenRouterList,
  DEFAULT_GEMINI_MODELS,
  describePrice,
  fetchModels,
  type GeminiModel,
  getDefaultModel,
  isUsableGeminiModel,
  isUsableOpenRouterModel,
  type OpenRouterModel,
  pickRecommendedOpenRouter,
  pickValidModel,
} from './modelService'

const NOW = Date.parse('2026-09-25T12:00:00Z')
const secs = (iso: string) => Date.parse(iso) / 1000

/** A usable chat model, overridden per test. Prices are dollars per million input tokens. */
const orModel = (
  id: string,
  over: Partial<OpenRouterModel> & { price?: number } = {}
): OpenRouterModel => {
  const { price = 0.5, ...rest } = over
  return {
    id,
    name: id,
    created: secs('2026-08-01'),
    context_length: 1_000_000,
    supported_parameters: ['max_tokens', 'response_format'],
    pricing: { prompt: String(price / 1_000_000) },
    architecture: {
      input_modalities: ['text'],
      output_modalities: ['text'],
      modality: 'text->text',
    },
    ...rest,
  }
}

describe('isUsableOpenRouterModel', () => {
  it('keeps text models, including ones that also accept images and files', () => {
    expect(isUsableOpenRouterModel(orModel('a/plain'), NOW)).toBe(true)
    const multimodal = orModel('a/vision', {
      architecture: {
        input_modalities: ['text', 'image', 'file'],
        output_modalities: ['text'],
        modality: 'text+image+file->text',
      },
    })
    expect(isUsableOpenRouterModel(multimodal, NOW)).toBe(true)
  })

  it('drops models that generate images or audio', () => {
    for (const out of [['text', 'image'], ['text', 'audio'], ['image']]) {
      const m = orModel('a/gen', {
        architecture: { input_modalities: ['text'], output_modalities: out },
      })
      expect(isUsableOpenRouterModel(m, NOW)).toBe(false)
    }
  })

  it('falls back to the modality label when the modality arrays are missing', () => {
    const ok = orModel('a/old', { architecture: { modality: 'text+image->text' } })
    const bad = orModel('a/oldimg', { architecture: { modality: 'text+image->text+image' } })
    expect(isUsableOpenRouterModel(ok, NOW)).toBe(true)
    expect(isUsableOpenRouterModel(bad, NOW)).toBe(false)
  })

  it('drops the asynchronous batch tier, stealth tests, and non-chat classifiers', () => {
    for (const id of [
      'openai/gpt-6-luna:batch',
      'stealth/space-bunny-alpha',
      'meta-llama/llama-guard-4-12b',
      'nvidia/nemotron-3.5-content-safety',
      'openai/gpt-oss-safeguard-20b',
    ]) {
      expect(isUsableOpenRouterModel(orModel(id), NOW)).toBe(false)
    }
  })

  it('drops models with too little room, no max_tokens support, router pricing, or expired', () => {
    expect(isUsableOpenRouterModel(orModel('a/tiny', { context_length: 8192 }), NOW)).toBe(false)
    expect(isUsableOpenRouterModel(orModel('a/edge', { context_length: 16_000 }), NOW)).toBe(true)
    expect(
      isUsableOpenRouterModel(orModel('a/nomax', { supported_parameters: ['temperature'] }), NOW)
    ).toBe(false)
    expect(isUsableOpenRouterModel(orModel('r/router', { pricing: { prompt: '-1' } }), NOW)).toBe(
      false
    )
    expect(isUsableOpenRouterModel(orModel('a/gone', { expiration_date: '2026-09-01' }), NOW)).toBe(
      false
    )
    expect(isUsableOpenRouterModel(orModel('a/soon', { expiration_date: '2026-10-20' }), NOW)).toBe(
      true
    )
  })
})

describe('pickRecommendedOpenRouter', () => {
  it('takes the newest fast, affordable model for each trusted provider', () => {
    const models = [
      orModel('openai/gpt-6-luna', { created: secs('2026-09-22'), price: 0.1 }),
      orModel('openai/gpt-5-mini', { created: secs('2026-03-01'), price: 0.2 }),
      orModel('google/gemini-3.8-flash', { created: secs('2026-09-02'), price: 0.75 }),
      orModel('google/gemini-3.7-flash', { created: secs('2026-08-13'), price: 0.75 }),
      orModel('anthropic/claude-sonnet-5', { created: secs('2026-06-30'), price: 2 }),
    ]
    expect(pickRecommendedOpenRouter(models, NOW)).toEqual([
      'openai/gpt-6-luna',
      'google/gemini-3.8-flash',
      'anthropic/claude-sonnet-5',
    ])
  })

  it('skips expensive, reasoning, preview, coder and omni variants', () => {
    const models = [
      orModel('anthropic/claude-opus-5.5', { created: secs('2026-09-22'), price: 4 }),
      orModel('openai/gpt-6-luna-pro', { created: secs('2026-09-22'), price: 0.1 }),
      orModel('google/gemini-3.9-flash-preview', { created: secs('2026-09-20'), price: 0.5 }),
      orModel('qwen/qwen3.8-omni-flash', { created: secs('2026-09-21'), price: 0.15 }),
      orModel('deepseek/deepseek-v4-thinking', { created: secs('2026-09-10'), price: 0.3 }),
      orModel('x-ai/grok-code-fast', { created: secs('2026-09-10'), price: 0.3 }),
    ]
    expect(pickRecommendedOpenRouter(models, NOW)).toEqual([])
  })

  it('prefers the cheaper model when two were released on the same day', () => {
    const models = [
      orModel('openai/gpt-6-sol', { created: secs('2026-09-22'), price: 2 }),
      orModel('openai/gpt-6-luna', { created: secs('2026-09-22'), price: 0.1 }),
    ]
    expect(pickRecommendedOpenRouter(models, NOW)).toEqual(['openai/gpt-6-luna'])
  })

  it('ignores models that are a year old or about to be retired', () => {
    const models = [
      orModel('openai/gpt-4o-mini', { created: secs('2024-07-18'), price: 0.15 }),
      orModel('google/gemini-2.5-flash', {
        created: secs('2025-06-17'),
        price: 0.3,
        expiration_date: '2026-10-20',
      }),
    ]
    expect(pickRecommendedOpenRouter(models, NOW)).toEqual([])
  })

  it('never recommends a variant with a suffix such as :free', () => {
    const models = [orModel('qwen/qwen3.8-27b:free', { created: secs('2026-08-14'), price: 0 })]
    expect(pickRecommendedOpenRouter(models, NOW)).toEqual([])
  })
})

describe('buildOpenRouterList', () => {
  const raw = [
    orModel('openai/gpt-6-luna', { created: secs('2026-09-22'), price: 0.1 }),
    orModel('openai/gpt-6-luna:batch', { created: secs('2026-09-22'), price: 0.05 }),
    orModel('acme/newest', { created: secs('2026-09-24'), price: 3 }),
    orModel('acme/older', { created: secs('2026-01-01'), price: 1 }),
    orModel('acme/free-one:free', { created: secs('2026-05-01'), price: 0 }),
    orModel('acme/free-two:free', { created: secs('2026-07-01'), price: 0 }),
    orModel('acme/imagegen', {
      architecture: { input_modalities: ['text'], output_modalities: ['image', 'text'] },
    }),
  ]

  it('orders recommended, then free, then everything else newest first', () => {
    const list = buildOpenRouterList(raw, NOW)
    expect(list.map((m) => m.id)).toEqual([
      'openai/gpt-6-luna',
      'acme/free-two:free',
      'acme/free-one:free',
      'acme/newest',
      'acme/older',
    ])
    expect(list.map((m) => m.tag)).toEqual(['recommended', 'free', 'free', undefined, undefined])
  })

  it('carries prices through and leaves out unusable models', () => {
    const list = buildOpenRouterList(raw, NOW)
    expect(list.find((m) => m.id === 'openai/gpt-6-luna')?.price).toBeCloseTo(0.1)
    expect(list.find((m) => m.id.endsWith(':free'))?.price).toBe(0)
    expect(list.some((m) => m.id.endsWith(':batch') || m.id === 'acme/imagegen')).toBe(false)
  })
})

describe('describePrice', () => {
  it('reads naturally', () => {
    expect(describePrice(0)).toBe('Free')
    expect(describePrice(0.75)).toBe('$0.75 / 1M in')
    expect(describePrice(0.004)).toBe('<$0.01 / 1M in')
    expect(describePrice(undefined)).toBeNull()
  })
})

const gem = (id: string, over: Partial<GeminiModel> = {}): GeminiModel => ({
  name: `models/${id}`,
  displayName: id,
  supportedGenerationMethods: ['generateContent'],
  outputTokenLimit: 65_536,
  ...over,
})

describe('Gemini models', () => {
  it('keeps text generation models and drops speech, image, music and agent ones', () => {
    for (const id of [
      'gemini-3.8-flash',
      'gemini-2.5-pro',
      'gemma-4-31b-it',
      'gemini-flash-latest',
    ]) {
      expect(isUsableGeminiModel(gem(id))).toBe(true)
    }
    for (const id of [
      'gemini-2.5-flash-preview-tts',
      'gemini-3.1-flash-image',
      'nano-banana-pro-preview',
      'lyria-3-pro-preview',
      'gemini-3.5-transcribe',
      'gemini-robotics-er-2-preview',
      'gemini-2.5-computer-use-preview-10-2025',
      'antigravity-preview-latest',
      'deep-research-pro-preview-12-2025',
    ]) {
      expect(isUsableGeminiModel(gem(id))).toBe(false)
    }
  })

  it('requires generateContent and enough output room', () => {
    expect(
      isUsableGeminiModel(gem('embedding-x', { supportedGenerationMethods: ['embedContent'] }))
    ).toBe(false)
    expect(isUsableGeminiModel(gem('gemini-small', { outputTokenLimit: 4096 }))).toBe(false)
    expect(isUsableGeminiModel(gem('gemini-unknown-limit', { outputTokenLimit: undefined }))).toBe(
      true
    )
  })

  it('lists the always-current aliases first, then Gemini before Gemma, newest version first', () => {
    const list = buildGeminiList([
      gem('gemma-4-31b-it', { displayName: 'Gemma 4 31B IT' }),
      gem('gemini-2.5-pro', { displayName: 'Gemini 2.5 Pro' }),
      gem('gemini-3.8-flash', { displayName: 'Gemini 3.8 Flash' }),
      gem('gemini-flash-latest', { displayName: 'Gemini Flash Latest' }),
      gem('gemini-pro-latest', { displayName: 'Gemini Pro Latest' }),
      gem('gemini-2.5-flash-preview-tts'),
    ])
    expect(list.map((m) => m.id)).toEqual([
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-3.8-flash',
      'gemini-2.5-pro',
      'gemma-4-31b-it',
    ])
    expect(list.filter((m) => m.tag).map((m) => m.tag)).toEqual(['recommended', 'recommended'])
  })
})

describe('defaults', () => {
  it('starts from current models, using an alias for Gemini', () => {
    expect(getDefaultModel('gemini')).toBe('gemini-flash-latest')
    expect(getDefaultModel('openrouter')).toBe('google/gemini-3.8-flash')
  })

  it('keeps a listed model, and replaces a retired one with the first listed', () => {
    const models = [
      { id: 'a/new', name: 'New' },
      { id: 'b/other', name: 'Other' },
    ]
    expect(pickValidModel('b/other', models)).toBe('b/other')
    expect(pickValidModel('old/retired', models)).toBe('a/new')
    expect(pickValidModel('anything', [])).toBe('anything')
  })
})

describe('fetchModels', () => {
  afterEach(() => vi.unstubAllGlobals())
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 })

  it('filters the OpenRouter catalogue', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        json({
          data: [
            orModel('openai/gpt-6-luna', { created: Date.now() / 1000 - 86_400 * 3, price: 0.1 }),
            orModel('x/batch:batch'),
          ],
        })
      )
    )
    const list = await fetchModels('openrouter')
    expect(list.map((m) => m.id)).toEqual(['openai/gpt-6-luna'])
  })

  it('filters Gemini models and sends the key in a header', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(json({ models: [gem('gemini-3.8-flash'), gem('gemini-3.8-flash-tts')] }))
    vi.stubGlobal('fetch', fetchMock)
    const key = `AIza${'x'.repeat(35)}`
    const list = await fetchModels('gemini', key)
    expect(list.map((m) => m.id)).toEqual(['gemini-3.8-flash'])
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).not.toContain(key)
    expect(init.headers['x-goog-api-key']).toBe(key)
  })

  it('falls back to the defaults without a valid key or when the request fails', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await fetchModels('gemini')).toEqual(DEFAULT_GEMINI_MODELS)
    expect(await fetchModels('gemini', 'short')).toEqual(DEFAULT_GEMINI_MODELS)
    expect(fetchMock).not.toHaveBeenCalled()

    fetchMock.mockRejectedValue(new Error('offline'))
    expect(await fetchModels('gemini', `AIza${'x'.repeat(35)}`)).toEqual(DEFAULT_GEMINI_MODELS)
    expect(await fetchModels('openrouter')).toEqual([])
  })
})
