import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { socials } from '@/data/socials'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { siteButton } from '@/lib/ui'
import { cn } from '@/lib/utils'

const roles = ['AI/ML Engineer', 'Full Stack Developer', 'LLM Architect']

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [roleIndex, setRoleIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  // Typewriter effect
  useEffect(() => {
    const role = roles[roleIndex]
    let timer: ReturnType<typeof setTimeout>

    if (!deleting) {
      if (text.length < role.length) {
        timer = setTimeout(() => setText(role.slice(0, text.length + 1)), 80)
      } else {
        timer = setTimeout(() => setDeleting(true), 2000)
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), 40)
      } else {
        setDeleting(false)
        setRoleIndex((roleIndex + 1) % roles.length)
      }
    }
    return () => clearTimeout(timer)
  }, [text, deleting, roleIndex])

  // Particle network
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (reducedMotion) return

    let animId: number | null = null
    let running = false

    // Colours come from CSS tokens so the network follows the theme
    let dotColor = ''
    let lineRgb = ''
    let lineAlpha = 0.15
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement)
      const hsl = cs.getPropertyValue('--particle').trim()
      const dotAlpha = cs.getPropertyValue('--particle-dot-alpha').trim() || '0.4'
      lineAlpha = Number.parseFloat(cs.getPropertyValue('--particle-line-alpha')) || 0.15
      dotColor = `hsl(${hsl} / ${dotAlpha})`
      lineRgb = hsl
    }
    readColors()
    const themeObserver = new MutationObserver(readColors)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    const particles: { x: number; y: number; vx: number; vy: number }[] = []
    const count = 45
    const maxDist = 120
    const maxDistSq = maxDist * maxDist

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < count; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = dotColor
        ctx.fill()

        for (let j = i + 1; j < count; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const distSq = dx * dx + dy * dy
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `hsl(${lineRgb} / ${lineAlpha * (1 - dist / maxDist)})`
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }

    const start = () => {
      if (running) return
      running = true
      draw()
    }
    const stop = () => {
      running = false
      if (animId !== null) cancelAnimationFrame(animId)
      animId = null
    }

    let isIntersecting = false
    const sync = () => {
      if (isIntersecting && !document.hidden) start()
      else stop()
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting
        sync()
      },
      { threshold: 0 }
    )
    io.observe(canvas)
    document.addEventListener('visibilitychange', sync)

    return () => {
      stop()
      themeObserver.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('resize', resize)
    }
  }, [reducedMotion])

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 pt-20 md:pt-24 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="relative z-10 text-center max-w-3xl">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 font-display tracking-[-0.02em]">
          HAIDARABBAS BALOSPURA
        </h1>

        <div className="h-8 mb-8">
          <span className="text-lg md:text-xl font-mono-jb text-primary">
            {text}
            <span className="animate-pulse">|</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a href="#projects" className={siteButton({ variant: 'primary', size: 'lg' })}>
            View My Work
          </a>
          <Link
            to="/resume"
            className={cn(siteButton({ variant: 'outline', size: 'lg' }), 'hover:bg-accent/10')}
          >
            Try Resume AI
          </Link>
        </div>

        {/* Social links */}
        <div className="flex gap-6 justify-center">
          {socials.map(({ label, href, Icon, hover }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center transition text-muted-foreground hover:text-[color:var(--social-hover)] hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
              style={{ '--social-hover': hover ?? 'hsl(var(--foreground))' } as React.CSSProperties}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
