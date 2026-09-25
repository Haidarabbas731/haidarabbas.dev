import { useEffect, useRef, useState } from 'react'
import SectionTitle from './SectionTitle'

type Token = { id: number; text: string; color: string }

const FG = 'hsl(var(--terminal-fg))'
const KEY = 'hsl(var(--terminal-key))'
const STR = 'hsl(var(--terminal-str))'

const TOKENS: Token[] = [
  { text: 'haidar', color: FG },
  { text: ' ', color: FG },
  { text: '=', color: KEY },
  { text: ' {\n', color: FG },
  { text: '    ', color: FG },
  { text: '"role"', color: KEY },
  { text: ': ', color: FG },
  { text: '"AI/ML Engineer"', color: STR },
  { text: ',\n', color: FG },
  { text: '    ', color: FG },
  { text: '"location"', color: KEY },
  { text: ': ', color: FG },
  { text: '"Gujarat, India 🇮🇳"', color: STR },
  { text: ',\n', color: FG },
  { text: '    ', color: FG },
  { text: '"focus"', color: KEY },
  { text: ': [', color: FG },
  { text: '"LLMs"', color: STR },
  { text: ', ', color: FG },
  { text: '"NLP"', color: STR },
  { text: ', ', color: FG },
  { text: '"Agents"', color: STR },
  { text: '],\n', color: FG },
  { text: '    ', color: FG },
  { text: '"currently_building"', color: KEY },
  { text: ': ', color: FG },
  { text: '"Autonomous AI systems"', color: STR },
  { text: '\n}', color: FG },
].map((tok, id) => ({ ...tok, id }))

const FULL_LENGTH = TOKENS.reduce((n, t) => n + t.text.length, 0)
const TICKS = 150
const TICK_MS = 16
const CHARS_PER_TICK = Math.ceil(FULL_LENGTH / TICKS)

function visibleTokens(count: number): Token[] {
  let remaining = count
  const out: Token[] = []
  for (const tok of TOKENS) {
    if (remaining <= 0) break
    const take = Math.min(tok.text.length, remaining)
    out.push({ id: tok.id, text: tok.text.slice(0, take), color: tok.color })
    remaining -= take
  }
  return out
}

const TerminalCard = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [typedCount, setTypedCount] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setTypedCount(FULL_LENGTH)
      return
    }

    const el = containerRef.current
    if (!el) return

    let intervalId: ReturnType<typeof setInterval> | null = null

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || intervalId !== null) return
        intervalId = setInterval(() => {
          setTypedCount((prev) => {
            const next = prev + CHARS_PER_TICK
            if (next >= FULL_LENGTH && intervalId !== null) {
              clearInterval(intervalId)
              intervalId = null
            }
            return Math.min(next, FULL_LENGTH)
          })
        }, TICK_MS)
        io.disconnect()
      },
      { threshold: 0.3 }
    )
    io.observe(el)

    return () => {
      io.disconnect()
      if (intervalId !== null) clearInterval(intervalId)
    }
  }, [reducedMotion])

  const done = typedCount >= FULL_LENGTH

  return (
    <div
      ref={containerRef}
      className="rounded-lg border overflow-hidden"
      style={{
        background: 'hsl(var(--terminal-bg))',
        borderColor: 'hsl(var(--terminal-key) / 0.3)',
        boxShadow: '0 0 30px hsl(var(--terminal-key) / 0.1)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: 'hsl(var(--terminal-border))' }}
      >
        <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--dot-red))' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--dot-yellow))' }} />
        <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--dot-green))' }} />
        <span className="ml-3 text-xs" style={{ color: 'hsl(var(--terminal-muted))' }}>
          about.py
        </span>
      </div>
      {/* Code */}
      <pre className="p-5 text-sm leading-relaxed overflow-x-auto">
        <code>
          {visibleTokens(typedCount).map((tok) => (
            <span key={tok.id} style={{ color: tok.color }}>
              {tok.text}
            </span>
          ))}
          <span
            className={done && !reducedMotion ? 'animate-blink' : ''}
            style={{ color: 'hsl(var(--terminal-key))' }}
          >
            ▌
          </span>
        </code>
      </pre>
    </div>
  )
}

const About = () => (
  <section className="pt-4 md:pt-8 pb-16 md:pb-20 px-6 max-w-6xl mx-auto">
    <SectionTitle number="01" title="About" id="about" />

    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
      <TerminalCard />

      {/* Bio */}
      <div>
        <p
          className="text-lg leading-relaxed mb-4"
          style={{ color: 'hsl(var(--foreground) / 0.85)' }}
        >
          A 21-year-old AI/ML engineer based in Gujarat, India, focused on building production-ready
          AI systems.
        </p>
        <p
          className="text-lg leading-relaxed mb-4"
          style={{ color: 'hsl(var(--foreground) / 0.85)' }}
        >
          I work with large language models, fine-tuning pipelines, and autonomous agents — creating
          systems that integrate into real workflows and operate reliably at scale.
        </p>
        <p className="text-lg leading-relaxed" style={{ color: 'hsl(var(--foreground) / 0.85)' }}>
          My focus is on making AI practical: systems that perform consistently, automate meaningful
          tasks, and hold up in real-world use.
        </p>
      </div>
    </div>
  </section>
)

export default About
