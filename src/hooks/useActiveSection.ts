import { useEffect, useState } from 'react'

/** Fraction of the viewport height where a section counts as "reached" */
const TRIGGER = 0.4

/**
 * The id of the last section whose top has scrolled above the trigger line, or null before the first.
 * Pass enabled=false where the sections aren't on the page.
 */
export function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join(',')

  useEffect(() => {
    if (!enabled) {
      setActive(null)
      return
    }
    const list = key.split(',')
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * TRIGGER
      let current: string | null = null
      for (const id of list) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled, key])

  return active
}
