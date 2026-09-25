import '@testing-library/jest-dom'

// jsdom lacks these browser APIs, which popovers and command lists rely on
if (typeof window !== 'undefined') {
  const g = globalThis as { ResizeObserver?: unknown }
  if (typeof g.ResizeObserver === 'undefined') {
    g.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
  if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}
}

// Tests that opt into the Node environment have no window
if (typeof window !== 'undefined') {
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
}

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
