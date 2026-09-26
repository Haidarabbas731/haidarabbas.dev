import { Fragment, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { siteButton } from '@/lib/ui'
import { cn } from '@/lib/utils'

const roles = ['AI/ML Engineer', 'Full Stack Developer', 'LLM Architect']

/** Position in the entrance sequence; the hero-in animation spaces each step 60ms apart */
const step = (i: number) => ({ '--i': i }) as React.CSSProperties

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()

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

    // Drawing happens in CSS pixels; the backing store is scaled by the device pixel ratio so it stays sharp
    let width = 0
    let height = 0
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      for (const p of particles) {
        p.x = Math.min(p.x, width)
        p.y = Math.min(p.y, height)
      }
    }
    resize()

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      })
    }

    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 150)
    })
    resizeObserver.observe(canvas)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < count; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

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
      clearTimeout(resizeTimer)
      themeObserver.disconnect()
      resizeObserver.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [reducedMotion])

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 pt-20 md:pt-24 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />

      <div className="relative z-10 text-center max-w-3xl">
        <h1
          className="hero-in text-5xl md:text-7xl lg:text-8xl font-black mb-6 font-display tracking-[-0.02em]"
          style={step(0)}
        >
          HAIDARABBAS BALOSPURA
        </h1>

        <p
          className="hero-in mb-8 flex flex-wrap justify-center gap-x-3 gap-y-1 text-lg md:text-xl font-mono-jb text-primary"
          style={step(1)}
        >
          {roles.map((role, i) => (
            <Fragment key={role}>
              {i > 0 && (
                <span aria-hidden="true" className="opacity-40">
                  ·
                </span>
              )}
              <span>{role}</span>
            </Fragment>
          ))}
        </p>

        <div className="hero-in flex flex-col sm:flex-row gap-4 justify-center" style={step(2)}>
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
      </div>
    </section>
  )
}

export default Hero
