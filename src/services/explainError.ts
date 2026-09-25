export interface FriendlyError {
  message: string
  /** Raw technical text, such as a LaTeX log, for people who want to see it. */
  details?: string
  canRetry: boolean
  /** The key or provider is the problem, so offer a way back to the settings. */
  needsSettings: boolean
  /** Another model would likely help (busy, slow, or an unusable reply), so offer a quick switch. */
  suggestModel: boolean
}

const LONG = 240

const BUSY =
  /(rate limit|429|quota|too many requests|high demand|overloaded|unavailable|503|at capacity|try again later)/i

/** Turns raw errors from the AI providers and the PDF services into plain advice. */
export function explainError(raw: string): FriendlyError {
  const text = raw.trim()

  // Our own key checks already say exactly what to do
  if (/API key/i.test(text) && /(single word|not allowed|too long|too short)/i.test(text)) {
    return { message: text, canRetry: false, needsSettings: true, suggestModel: false }
  }
  if (/(invalid .*api key|api key not valid|api_key_invalid|unauthorized|401|403)/i.test(text)) {
    return {
      message: 'Your API key was rejected. Check that it is correct and still has access.',
      canRetry: false,
      needsSettings: true,
      suggestModel: false,
    }
  }
  if (BUSY.test(text)) {
    return {
      message:
        'This model is busy right now, or you have reached its usage limit. Wait a moment and try again, or switch to another model.',
      canRetry: true,
      needsSettings: false,
      suggestModel: true,
    }
  }
  if (/ran out of space/i.test(text)) {
    return { message: text, canRetry: true, needsSettings: false, suggestModel: true }
  }
  if (/(not a resume|cut off or malformed|not valid json)/i.test(text)) {
    return {
      message:
        'The AI reply could not be read as a resume. Try again, or choose a different model.',
      canRetry: true,
      needsSettings: false,
      suggestModel: true,
    }
  }
  if (/filtered by safety/i.test(text)) {
    return { message: text, canRetry: false, needsSettings: false, suggestModel: true }
  }
  if (/(timed? ?out|timeouterror|aborted)/i.test(text)) {
    return {
      message: 'The AI took too long to answer. Try again, or switch to a faster model.',
      canRetry: true,
      needsSettings: false,
      suggestModel: true,
    }
  }
  if (/(failed to fetch|networkerror|load failed|network request failed)/i.test(text)) {
    return {
      message: 'Could not reach the service. Check your connection and try again.',
      canRetry: true,
      needsSettings: false,
      suggestModel: false,
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
      suggestModel: false,
    }
  }
  return {
    message: text || 'Something went wrong.',
    canRetry: true,
    needsSettings: false,
    suggestModel: false,
  }
}
