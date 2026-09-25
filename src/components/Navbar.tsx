import type { MouseEvent } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const navLinks = [
  { label: 'About', id: 'about' },
  { label: 'Skills', id: 'skills' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Contact', id: 'contact' },
]

function isPlainLeftClick(e: MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const goToSection = (id: string) => (e: MouseEvent) => {
    if (!isPlainLeftClick(e)) return
    e.preventDefault()
    setOpen(false)
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/', { state: { scrollTo: id } })
    }
  }

  const goHome = (e: MouseEvent) => {
    if (!isPlainLeftClick(e)) return
    e.preventDefault()
    setOpen(false)
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--primary))' }}
        >
          HB
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              onClick={goToSection(l.id)}
              className="text-sm tracking-wide transition-colors hover:text-primary"
              style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/resume"
            className="text-xs px-3 py-1.5 rounded-full border transition hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'hsl(var(--primary))',
              borderColor: 'hsl(var(--primary) / 0.35)',
              background: 'hsl(var(--primary) / 0.06)',
            }}
          >
            Resume AI ✦
          </Link>
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
        {navLinks.map((l) => (
          <a
            key={l.id}
            href={`/#${l.id}`}
            onClick={goToSection(l.id)}
            className="text-sm tracking-wide"
            style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}
          >
            {l.label}
          </a>
        ))}
        <Link
          to="/resume"
          onClick={() => setOpen(false)}
          className="text-xs px-3 py-1.5 rounded-full border w-fit transition"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'hsl(var(--primary))',
            borderColor: 'hsl(var(--primary) / 0.35)',
            background: 'hsl(var(--primary) / 0.06)',
          }}
        >
          Resume AI ✦
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  )
}

export default Navbar
