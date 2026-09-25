import { describe, expect, it } from 'vitest'
import { checkApiKey } from './apiKey'

const GEMINI = `AIza${'x'.repeat(35)}`
const OPENROUTER = `sk-or-v1-${'a'.repeat(50)}`

describe('checkApiKey', () => {
  it('accepts real-looking keys without a hint', () => {
    expect(checkApiKey('gemini', GEMINI)).toEqual({ ok: true, key: GEMINI })
    expect(checkApiKey('openrouter', OPENROUTER)).toEqual({ ok: true, key: OPENROUTER })
  })

  it('trims whitespace and removes invisible characters picked up when copying', () => {
    const messy = `​ ${GEMINI}\n﻿`
    expect(checkApiKey('gemini', messy)).toEqual({ ok: true, key: GEMINI })
  })

  it('rejects pasted prose, such as a job description with bullets', () => {
    const jd =
      'Job description: We are hiring a data engineer.\n• Build pipelines in Python\n• Tune SQL'
    const result = checkApiKey('openrouter', jd)
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.message).toMatch(/single word/)
  })

  it('rejects a very long single token', () => {
    expect(checkApiKey('gemini', 'a'.repeat(400)).ok).toBe(false)
  })

  it('rejects non-ASCII characters that a request header cannot carry', () => {
    const result = checkApiKey('gemini', `AIza${'x'.repeat(20)}•${'y'.repeat(10)}`)
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.message).toMatch(/characters that are not allowed/)
  })

  it('rejects something too short to be a key', () => {
    expect(checkApiKey('gemini', 'abc123').ok).toBe(false)
  })

  it('accepts an unexpected prefix but says what to expect', () => {
    const result = checkApiKey('openrouter', 'a'.repeat(30))
    expect(result.ok).toBe(true)
    expect(result.ok && result.hint).toMatch(/usually start with sk-or-/)
  })
})
