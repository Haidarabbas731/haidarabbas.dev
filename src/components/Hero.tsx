import { Github, Linkedin, Twitter } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const DiscordIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
)

const roles = ['AI/ML Engineer', 'Full Stack Developer', 'LLM Architect']

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [roleIndex, setRoleIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

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

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number }[] = []
    const count = 80
    const maxDist = 120

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
        ctx.fillStyle = 'hsla(175, 80%, 60%, 0.4)'
        ctx.fill()

        for (let j = i + 1; j < count; j++) {
          const q = particles[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `hsla(175, 80%, 60%, ${0.15 * (1 - dist / maxDist)})`
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-6 pt-20 md:pt-24 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="relative z-10 text-center max-w-3xl">
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
        >
          HAIDARABBAS BALOSPURA
        </h1>

        <div className="h-8 mb-8">
          <span
            className="text-lg md:text-xl"
            style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--primary))' }}
          >
            {text}
            <span className="animate-pulse">|</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a
            href="#projects"
            className="px-6 py-3 text-sm font-medium rounded-md transition-all"
            style={{
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
            }}
          >
            View My Work
          </a>
          <a
            href="#"
            className="px-6 py-3 text-sm font-medium rounded-md border transition-all hover:bg-accent/10"
            style={{ borderColor: 'hsl(var(--border))', fontFamily: 'var(--font-mono)' }}
          >
            Download Resume
          </a>
        </div>

        {/* Social links */}
        <div className="flex gap-6 justify-center">
          {[
            {
              label: 'GitHub',
              href: 'https://github.com/haidarabbas731',
              icon: <Github size={18} />,
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/haidarabbas-balospura/',
              icon: <Linkedin size={18} />,
            },
            { label: 'X', href: 'https://x.com/itz_hb_731', icon: <Twitter size={18} /> },
            {
              label: 'Discord',
              href: 'https://discord.com/users/782117153699659816',
              icon: <DiscordIcon size={18} />,
            },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:border-primary hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
