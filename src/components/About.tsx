import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import Reveal from './Reveal'
import Section from './Section'
import WindowChrome from './WindowChrome'

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
const FULL_TEXT = TOKENS.map((t) => t.text).join('')
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
  const reducedMotion = usePrefersReducedMotion()

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
      className="rounded-lg border overflow-hidden font-mono-jb"
      style={{
        background: 'hsl(var(--terminal-bg))',
        borderColor: 'hsl(var(--terminal-key) / 0.3)',
        boxShadow: '0 0 30px hsl(var(--terminal-key) / 0.1)',
      }}
    >
      <WindowChrome borderColor="hsl(var(--terminal-border))">
        <span className="ml-3 text-xs" style={{ color: 'hsl(var(--terminal-muted))' }}>
          about.py
        </span>
      </WindowChrome>
      {/* Code */}
      {/* The finished text sits invisibly in the same grid cell, so the card is its final size from
          the first frame and typing never pushes the page down */}
      <pre className="grid p-5 text-sm leading-relaxed overflow-x-auto">
        <code aria-hidden="true" className="invisible" style={{ gridArea: '1 / 1' }}>
          {FULL_TEXT}▌
        </code>
        <code style={{ gridArea: '1 / 1' }}>
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
  <Section title="About" id="about" compact>
    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
      <Reveal>
        <TerminalCard />
      </Reveal>

      {/* Bio */}
      <Reveal delay={100}>
        <p className="text-lg leading-relaxed mb-4 text-foreground/85">
          A 21-year-old AI/ML engineer based in Gujarat, India, focused on building production-ready
          AI systems.
        </p>
        <p className="text-lg leading-relaxed mb-4 text-foreground/85">
          I work with large language models, fine-tuning pipelines, and autonomous agents, creating
          systems that integrate into real workflows and operate reliably at scale.
        </p>
        <p className="text-lg leading-relaxed text-foreground/85">
          My focus is on making AI practical: systems that perform consistently, automate meaningful
          tasks, and hold up in real-world use.
        </p>
      </Reveal>
    </div>
  </Section>
)

export default About
