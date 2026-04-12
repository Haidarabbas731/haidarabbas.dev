import type { AuthResult, Provider } from '@/types/resume'

const STORAGE_PREFIX = 'resume_tailor_'

/**
 * Owner mode: authenticate via Netlify Function.
 * Returns available providers and their API keys.
 */
export async function authenticateOwner(password: string): Promise<AuthResult> {
  const response = await fetch('/.netlify/functions/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })

  // Try to parse JSON — if it fails, the function likely crashed
  let data: AuthResult
  try {
    data = await response.json()
  } catch {
    throw new Error(
      `Auth server error (HTTP ${response.status}). Make sure you're accessing the app via http://localhost:8888 (not 8080).`
    )
  }

  return data
}

/**
 * Public mode: save provider and API key to localStorage.
 */
export function savePublicConfig(provider: Provider, apiKey: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}provider`, provider)
  localStorage.setItem(`${STORAGE_PREFIX}api_key_${provider}`, apiKey)
}

/**
 * Public mode: load saved provider config from localStorage.
 */
export function getPublicConfig(): { provider: Provider | null; apiKey: string | null } {
  const provider = localStorage.getItem(`${STORAGE_PREFIX}provider`) as Provider | null
  const apiKey = provider ? localStorage.getItem(`${STORAGE_PREFIX}api_key_${provider}`) : null
  return { provider, apiKey }
}

/**
 * Save the last selected model per provider.
 */
export function saveLastModel(provider: Provider, modelId: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}last_model_${provider}`, modelId)
}

/**
 * Get the last selected model for a provider.
 */
export function getLastModel(provider: Provider): string | null {
  return localStorage.getItem(`${STORAGE_PREFIX}last_model_${provider}`)
}

/**
 * Clear all stored resume tailor data from localStorage.
 */
export function clearStoredData(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX))
  keys.forEach((k) => localStorage.removeItem(k))
}
