import type { ReactNode } from 'react'

const dots = ['--dot-red', '--dot-yellow', '--dot-green']

interface WindowChromeProps {
  /** Title shown after the three window dots */
  children: ReactNode
  borderColor?: string
}

/** The fake window title bar: three coloured dots and a title. */
const WindowChrome = ({ children, borderColor = 'hsl(var(--border))' }: WindowChromeProps) => (
  <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor }}>
    {dots.map((dot) => (
      <span key={dot} className="w-3 h-3 rounded-full" style={{ background: `hsl(var(${dot}))` }} />
    ))}
    {children}
  </div>
)

export default WindowChrome
