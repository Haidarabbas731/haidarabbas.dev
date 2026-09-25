import type { Provider } from '@/types/resume'

const MIN_LENGTH = 16
const MAX_LENGTH = 300

export type ApiKeyCheck = { ok: true; key: string; hint?: string } | { ok: false; message: string }

const PREFIX: Record<Provider, { start: string; example: string }> = {
  gemini: { start: 'AIza', example: 'AIza...' },
  openrouter: { start: 'sk-or-', example: 'sk-or-...' },
}

/** Zero-width characters, BOM and non-breaking spaces that sneak in when copying a key. */
const INVISIBLE = /[​-‍⁠﻿ ]/g

/**
 * Cleans and validates an API key before it goes into a request header. Headers only accept
 * plain ASCII, and anything else (such as pasted text) would fail with a confusing browser error.
 */
export function checkApiKey(provider: Provider, raw: string): ApiKeyCheck {
  const key = raw.replace(INVISIBLE, '').trim()

  if (/\s/.test(key)) {
    return {
      ok: false,
      message:
        'That is more than a single word, so it is not an API key. Paste only the key, with no spaces or line breaks.',
    }
  }
  if (key.length > MAX_LENGTH) {
    return {
      ok: false,
      message: 'That is far too long to be an API key. Copy just the key from your provider.',
    }
  }
  if (!/^[\x21-\x7e]*$/.test(key)) {
    return {
      ok: false,
      message: 'The key has characters that are not allowed. Copy it again and paste only the key.',
    }
  }
  if (key.length < MIN_LENGTH) {
    return { ok: false, message: 'That looks too short to be an API key.' }
  }

  const { start, example } = PREFIX[provider]
  return key.startsWith(start)
    ? { ok: true, key }
    : {
        ok: true,
        key,
        hint: `${provider === 'gemini' ? 'Gemini' : 'OpenRouter'} keys usually start with ${example}`,
      }
}
