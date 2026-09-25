import '@testing-library/jest-dom'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// jsdom does not implement AbortSignal.timeout, which every real browser has
if (typeof AbortSignal.timeout !== 'function') {
  AbortSignal.timeout = (ms: number) => {
    const controller = new AbortController()
    const timer = setTimeout(
      () => controller.abort(new DOMException('Timeout', 'TimeoutError')),
      ms
    )
    ;(timer as unknown as { unref?: () => void }).unref?.()
    return controller.signal
  }
}
