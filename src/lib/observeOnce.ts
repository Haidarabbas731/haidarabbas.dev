// One IntersectionObserver serves every element that wants to know when it first scrolls into view
const onEnter = new WeakMap<Element, () => void>()
let sharedObserver: IntersectionObserver | null = null

function getObserver() {
  sharedObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        onEnter.get(entry.target)?.()
        onEnter.delete(entry.target)
        sharedObserver?.unobserve(entry.target)
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  )
  return sharedObserver
}

/** Calls `callback` once, the first time `el` scrolls into view. Returns a cleanup function. */
export function observeOnce(el: Element, callback: () => void) {
  if (typeof IntersectionObserver === 'undefined') {
    callback()
    return () => {}
  }
  const observer = getObserver()
  onEnter.set(el, callback)
  observer.observe(el)
  return () => {
    observer.unobserve(el)
    onEnter.delete(el)
  }
}
