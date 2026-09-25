import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

/** 'reveal' = circular clip-path from the button, 'fade' = cross-fade. */
const THEME_TRANSITION: 'reveal' | 'fade' = 'reveal'

const REVEAL_MS = 450
const REVEAL_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)'
const THEME_COLOR = { dark: '#09090c', light: '#faf9f6' }

type Mode = 'light' | 'dark'

const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!resolvedTheme) return
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[resolvedTheme as Mode])
  }, [resolvedTheme])

  const isDark = resolvedTheme === 'dark'

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Mode = isDark ? 'light' : 'dark'
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (typeof document.startViewTransition !== 'function') {
      root.classList.add('theme-fading')
      setTheme(next)
      window.setTimeout(() => root.classList.remove('theme-fading'), 250)
      return
    }

    const mode = reduced ? 'fade-fast' : THEME_TRANSITION
    root.dataset.themeTransition = mode

    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })

    if (mode === 'reveal') {
      transition.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: REVEAL_MS, easing: REVEAL_EASE, pseudoElement: '::view-transition-new(root)' }
        )
      })
    }
    transition.finished.finally(() => {
      delete root.dataset.themeTransition
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? `Switch to ${isDark ? 'light' : 'dark'} theme` : 'Toggle theme'}
      className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-[transform,border-color,color] duration-150 ease-out active:scale-[0.97] hover:border-primary hover:text-primary ${className}`}
      style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
    >
      <Sun
        size={16}
        className={`absolute transition-[transform,opacity] duration-200 ease-out ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-45 scale-90'}`}
      />
      <Moon
        size={16}
        className={`absolute transition-[transform,opacity] duration-200 ease-out ${isDark ? 'opacity-0 rotate-45 scale-90' : 'opacity-100 rotate-0 scale-100'}`}
      />
    </button>
  )
}

export default ThemeToggle
