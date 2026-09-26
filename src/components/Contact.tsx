import { ArrowUpRight, Check, Copy, Mail, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { socials } from '@/data/socials'
import { siteButton } from '@/lib/ui'
import { cn } from '@/lib/utils'
import Reveal from './Reveal'
import Section from './Section'

const EMAIL = 'haidarabbasbalospura@gmail.com'

type CopyState = 'idle' | 'copied' | 'failed'

/** Both labels sit in one grid cell so the button keeps its width while they crossfade */
const labelClass = (visible: boolean) =>
  cn(
    'col-start-1 row-start-1 flex items-center justify-center gap-2 transition-[opacity,filter] duration-150 ease-out-strong',
    visible ? 'opacity-100' : 'opacity-0 blur-[2px]'
  )

const Contact = () => {
  const [copy, setCopy] = useState<CopyState>('idle')
  const resetTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopy('copied')
    } catch {
      setCopy('failed')
    }
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => setCopy('idle'), 2000)
  }

  return (
    <Section title="Get In Touch" id="contact">
      <div className="grid gap-12 md:grid-cols-5 md:items-center md:gap-16">
        <div className="md:col-span-3">
          <Reveal>
            <p className="text-balance font-display text-3xl leading-[1.15] tracking-[-0.02em] md:text-5xl">
              Have something worth building? Let's talk.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${EMAIL}`}
                className={cn(
                  siteButton({ variant: 'primary', size: 'md' }),
                  'inline-flex items-center justify-center gap-2'
                )}
              >
                <Mail size={16} aria-hidden="true" />
                Email me
              </a>

              <button
                type="button"
                onClick={copyEmail}
                className={cn(
                  siteButton({ variant: 'outline', size: 'md' }),
                  'grid hover:border-primary/50'
                )}
              >
                <span className={labelClass(copy === 'idle')}>
                  <Copy size={16} aria-hidden="true" />
                  {EMAIL}
                </span>
                <span aria-hidden="true" className={labelClass(copy !== 'idle')}>
                  {copy === 'failed' ? (
                    <>
                      <X size={16} />
                      Copy failed
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  )}
                </span>
              </button>

              <span role="status" className="sr-only">
                {copy === 'copied' && 'Email address copied'}
                {copy === 'failed' && 'Could not copy the email address'}
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="md:col-span-2">
          <ul className="divide-y divide-border border-y border-border">
            {socials.map(({ label, href, Icon, hover }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 py-4 active:opacity-70 transition-opacity duration-[160ms]"
                  style={
                    { '--social-hover': hover ?? 'hsl(var(--foreground))' } as React.CSSProperties
                  }
                >
                  <span className="text-muted-foreground transition-colors duration-150 group-hover:text-[color:var(--social-hover)]">
                    <Icon size={20} />
                  </span>
                  <span className="text-base">{label}</span>
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className="ml-auto text-muted-foreground transition-[transform,color] duration-200 ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}

export default Contact
