import { type ReactNode, useEffect, useRef, useState } from 'react'
import { observeOnce } from '@/lib/observeOnce'

interface RevealProps {
  children: ReactNode
  /** Stagger offset in ms, applied when the element enters. */
  delay?: number
  className?: string
}

/** Fades and lifts its children in once, the first time they scroll into view. */
const Reveal = ({ children, delay = 0, className = '' }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observeOnce(el, () => setVisible(true))
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export default Reveal
