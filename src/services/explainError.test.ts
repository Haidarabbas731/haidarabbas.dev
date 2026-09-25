import { describe, expect, it } from 'vitest'
import { explainError } from './explainError'

describe('explainError', () => {
  it('keeps our own key validation messages and points to settings only', () => {
    const msg = 'That is more than a single word, so it is not an API key. Paste only the key.'
    expect(explainError(msg)).toEqual({
      message: msg,
      canRetry: false,
      needsSettings: true,
      suggestModel: false,
    })
  })

  it('explains a rejected key from either provider', () => {
    for (const raw of [
      'Invalid OpenRouter API key.',
      'Invalid Gemini API key.',
      'Gemini API error: API key not valid. Please pass a valid API key.',
    ]) {
      const e = explainError(raw)
      expect(e.message).toMatch(/API key was rejected/)
      expect(e).toMatchObject({ canRetry: false, needsSettings: true, suggestModel: false })
    }
  })

  it('explains rate limits with a retry and a model switch, not the settings', () => {
    const e = explainError('Rate limited by Gemini. Please wait a moment and try again.')
    expect(e.message).toMatch(/busy|usage limit/)
    expect(e).toMatchObject({ canRetry: true, suggestModel: true, needsSettings: false })
  })

  it('treats a high-demand error from Gemini as a busy model', () => {
    const e = explainError(
      'Gemini API error: This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.'
    )
    expect(e.message).toMatch(/busy right now/)
    expect(e).toMatchObject({ canRetry: true, suggestModel: true, needsSettings: false })
  })

  it('recognises other overload wordings', () => {
    for (const raw of [
      'Provider returned error: overloaded',
      '503 Service Unavailable',
      'Model is at capacity',
    ]) {
      expect(explainError(raw).suggestModel).toBe(true)
    }
  })

  it('explains an unreadable AI reply and suggests another model', () => {
    const e = explainError('The AI response was cut off or malformed. Please try again.')
    expect(e.message).toMatch(/could not be read as a resume/)
    expect(e).toMatchObject({ canRetry: true, suggestModel: true })
    expect(explainError('The AI response was not a resume. Please try again.').canRetry).toBe(true)
  })

  it('keeps the truncation message, which is already actionable, and suggests another model', () => {
    const msg = 'The AI ran out of space before finishing. Try a shorter job description.'
    expect(explainError(msg)).toEqual({
      message: msg,
      canRetry: true,
      needsSettings: false,
      suggestModel: true,
    })
  })

  it('explains timeouts with a model switch, and network failures without one', () => {
    const slow = explainError('TimeoutError: The operation was aborted due to timeout')
    expect(slow.message).toMatch(/took too long/)
    expect(slow.suggestModel).toBe(true)

    const offline = explainError('Failed to fetch')
    expect(offline.message).toMatch(/Could not reach the service/)
    expect(offline.suggestModel).toBe(false)
  })

  it('does not offer a retry for a safety block, but does suggest another model', () => {
    const e = explainError('Content was filtered by safety settings. Try rephrasing.')
    expect(e.canRetry).toBe(false)
    expect(e.suggestModel).toBe(true)
  })

  it('hides a long LaTeX log behind details', () => {
    const log = `! Undefined control sequence.\n${'l.42 \\\\badmacro '.repeat(40)}`
    const e = explainError(log)
    expect(e.message).toMatch(/PDF could not be built/)
    expect(e.details).toBe(log.trim())
    expect(e.canRetry).toBe(true)
    expect(e.suggestModel).toBe(false)
  })

  it('passes short unknown errors through unchanged', () => {
    expect(explainError('Something odd happened')).toEqual({
      message: 'Something odd happened',
      canRetry: true,
      needsSettings: false,
      suggestModel: false,
    })
  })
})
