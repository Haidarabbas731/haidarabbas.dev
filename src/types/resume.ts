export type AccessMode = 'owner' | 'public' | null

export type Provider = 'gemini' | 'openrouter'

export type TailorStatus = 'idle' | 'tailoring' | 'compiling' | 'done' | 'error'

export interface ModelInfo {
  id: string
  name: string
  /** Groups the model in the picker. Untagged models fall under "All models". */
  tag?: 'recommended' | 'free'
  /** Release time in seconds since 1970, used to list the newest models first. */
  created?: number
  /** Input price in US dollars per million tokens. Zero for free models. */
  price?: number
}

export interface ProviderConfig {
  apiKey: string
}

export interface AuthResult {
  authorized: boolean
  providers?: {
    gemini?: ProviderConfig
    openrouter?: ProviderConfig
  }
  defaultProvider?: Provider
  error?: string
}

/** Where the resume to tailor comes from. */
export type ResumeSource =
  | {
      kind: 'text'
      text: string
      /** Object URL of the uploaded PDF, shown as the "original" preview. Owned by the page. */
      originalPdfUrl?: string
    }
  | { kind: 'latex'; latex: string }

export interface ResumeConfig {
  mode: AccessMode
  provider: Provider
  model: string
  apiKey: string | null
  source: ResumeSource | null
}
