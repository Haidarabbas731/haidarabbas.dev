import type { MouseEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { sections } from '@/data/sections'
import { useActiveSection } from '@/hooks/useActiveSection'
import { scrollBehavior } from '@/lib/scroll'
import { cn } from '@/lib/utils'
import ThemeToggle from './ThemeToggle'

const sectionIds = sections.map((s) => s.id)

function isPlainLeftClick(e: MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

interface NavLinksProps {
  onSelect: (id: string) => (e: MouseEvent) => void
  activeId: string | null
  className?: string
}

const NavLinks = ({ onSelect, activeId, className }: NavLinksProps) => (
  <>
    {sections.map((s) => (
      <a
        key={s.id}
        href={`/#${s.id}`}
        onClick={onSelect(s.id)}
        aria-current={s.id === activeId ? 'location' : undefined}
        className={cn(
          'text-sm tracking-wide font-mono-jb text-muted-foreground aria-[current=location]:text-primary',
          className
        )}
      >
        {s.label}
      </a>
    ))}
  </>
)

interface ResumeLinkProps {
  onClick?: () => void
  className?: string
}

const ResumeLink = ({ onClick, className }: ResumeLinkProps) => (
  <Link
    to="/resume"
    onClick={onClick}
    className={cn(
      'text-xs px-3 py-1.5 rounded-full border transition-[transform,box-shadow] duration-[160ms] ease-out-strong active:scale-[0.97] font-mono-jb text-primary border-primary/[0.35] bg-primary/[0.06]',
      className
    )}
  >
    Resume AI ✦
  </Link>
)

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const activeId = useActiveSection(sectionIds, location.pathname === '/')

  const goToSection = (id: string) => (e: MouseEvent) => {
    if (!isPlainLeftClick(e)) return
    e.preventDefault()
    setOpen(false)
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior() })
    } else {
      navigate('/', { state: { scrollTo: id } })
    }
  }

  const goHome = (e: MouseEvent) => {
    if (!isPlainLeftClick(e)) return
    e.preventDefault()
    setOpen(false)
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: scrollBehavior() })
    } else {
      navigate('/')
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b"
      style={{
        background: 'hsl(var(--background) / 0.7)',
        borderColor: 'hsl(var(--border) / 0.3)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a
          href="/"
          onClick={goHome}
          className="text-2xl font-bold tracking-tight font-mono-jb text-primary"
        >
          HB
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <NavLinks
            onSelect={goToSection}
            activeId={activeId}
            className="relative transition-colors duration-150 hover:text-primary after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200 after:ease-out-strong aria-[current=location]:after:scale-x-100 motion-reduce:after:transition-none"
          />
          <ResumeLink className="hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)]" />
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span
            className={`block w-6 h-0.5 bg-foreground transition-transform ${open ? 'rotate-45 translate-y-2' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-foreground transition-opacity ${open ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-foreground transition-transform ${open ? '-rotate-45 -translate-y-2' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        data-open={open}
        className="mobile-menu md:hidden absolute top-full left-0 right-0 px-6 pt-4 pb-6 flex flex-col gap-4 border-b"
        style={{
          background: 'hsl(var(--background) / 0.95)',
          borderColor: 'hsl(var(--border) / 0.3)',
        }}
      >
        <NavLinks onSelect={goToSection} activeId={activeId} />
        <ResumeLink onClick={() => setOpen(false)} className="w-fit" />
        <ThemeToggle />
      </div>
    </nav>
  )
}

export default Navbar
