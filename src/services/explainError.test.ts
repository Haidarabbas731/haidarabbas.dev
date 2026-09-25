import { describe, expect, it } from 'vitest'
import { explainError } from './explainError'

describe('explainError', () => {
  it('keeps our own key validation messages and points to settings', () => {
    const msg = 'That is more than a single word, so it is not an API key. Paste only the key.'
    expect(explainError(msg)).toEqual({ message: msg, canRetry: false, needsSettings: true })
  })

  it('explains a rejected key from either provider', () => {
    for (const raw of [
      'Invalid OpenRouter API key.',
      'Invalid Gemini API key.',
      'Gemini API error: API key not valid. Please pass a valid API key.',
    ]) {
      const e = explainError(raw)
      expect(e.message).toMatch(/API key was rejected/)
      expect(e.canRetry).toBe(false)
      expect(e.needsSettings).toBe(true)
    }
  })

  it('explains rate limits and offers a retry', () => {
    const e = explainError('Rate limited by Gemini. Please wait a moment and try again.')
    expect(e.message).toMatch(/busy|usage limit/)
    expect(e.canRetry).toBe(true)
    expect(e.needsSettings).toBe(true)
  })

  it('explains an unreadable AI reply', () => {
    expect(
      explainError('The AI response was cut off or malformed. Please try again.').message
    ).toMatch(/could not be read as a resume/)
    expect(explainError('The AI response was not a resume. Please try again.').canRetry).toBe(true)
  })

  it('keeps the truncation message, which is already actionable', () => {
    const msg = 'The AI ran out of space before finishing. Try a shorter job description.'
    expect(explainError(msg)).toEqual({ message: msg, canRetry: true, needsSettings: true })
  })

  it('explains timeouts and network failures', () => {
    expect(explainError('TimeoutError: The operation was aborted due to timeout').message).toMatch(
      /took too long/
    )
    expect(explainError('Failed to fetch').message).toMatch(/Could not reach the service/)
  })

  it('does not offer a retry for a safety block', () => {
    expect(explainError('Content was filtered by safety settings. Try rephrasing.').canRetry).toBe(
      false
    )
  })

  it('hides a long LaTeX log behind details', () => {
    const log = `! Undefined control sequence.\n${'l.42 \\\\badmacro '.repeat(40)}`
    const e = explainError(log)
    expect(e.message).toMatch(/PDF could not be built/)
    expect(e.details).toBe(log.trim())
    expect(e.canRetry).toBe(true)
  })

  it('passes short unknown errors through unchanged', () => {
    expect(explainError('Something odd happened')).toEqual({
      message: 'Something odd happened',
      canRetry: true,
      needsSettings: false,
    })
  })
})
