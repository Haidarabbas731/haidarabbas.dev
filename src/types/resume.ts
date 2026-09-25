export type AccessMode = 'owner' | 'public' | null

export type Provider = 'gemini' | 'openrouter'

export type TailorStatus = 'idle' | 'tailoring' | 'compiling' | 'done' | 'error'

export interface ModelInfo {
  id: string
  name: string
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
