export interface FriendlyError {
  message: string
  /** Raw technical text, such as a LaTeX log, for people who want to see it. */
  details?: string
  canRetry: boolean
  /** The fix is in the provider, key or model, so offer a way back to the settings. */
  needsSettings: boolean
}

const LONG = 240

/** Turns raw errors from the AI providers and the PDF services into plain advice. */
export function explainError(raw: string): FriendlyError {
  const text = raw.trim()

  // Our own key checks already say exactly what to do
  if (/API key/i.test(text) && /(single word|not allowed|too long|too short)/i.test(text)) {
    return { message: text, canRetry: false, needsSettings: true }
  }
  if (/(invalid .*api key|api key not valid|api_key_invalid|unauthorized|401|403)/i.test(text)) {
    return {
      message: 'Your API key was rejected. Check that it is correct and still has access.',
      canRetry: false,
      needsSettings: true,
    }
  }
  if (/(rate limit|429|quota|too many requests)/i.test(text)) {
    return {
      message:
        'The AI provider is busy, or you have reached its usage limit. Wait a minute and try again, or choose another model.',
      canRetry: true,
      needsSettings: true,
    }
  }
  if (/ran out of space/i.test(text)) {
    return { message: text, canRetry: true, needsSettings: true }
  }
  if (/(not a resume|cut off or malformed|not valid json)/i.test(text)) {
    return {
      message:
        'The AI reply could not be read as a resume. Try again, or choose a different model.',
      canRetry: true,
      needsSettings: true,
    }
  }
  if (/filtered by safety/i.test(text)) {
    return { message: text, canRetry: false, needsSettings: false }
  }
  if (/(timed? ?out|timeouterror|aborted)/i.test(text)) {
    return {
      message: 'The AI took too long to answer. Try again, or choose a faster model.',
      canRetry: true,
      needsSettings: true,
    }
  }
  if (/(failed to fetch|networkerror|load failed|network request failed)/i.test(text)) {
    return {
      message: 'Could not reach the service. Check your connection and try again.',
      canRetry: true,
      needsSettings: false,
    }
  }
  if (text.length > LONG) {
    const latex = /(latex|compil|\\documentclass|! )/i.test(text)
    return {
      message: latex
        ? 'The PDF could not be built. The details below may show which line is at fault.'
        : 'Something went wrong. The details are below.',
      details: text,
      canRetry: true,
      needsSettings: false,
    }
  }
  return { message: text || 'Something went wrong.', canRetry: true, needsSettings: false }
}
