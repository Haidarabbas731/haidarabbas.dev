import { useState } from 'react'
import { fieldClass, siteButton } from '@/lib/ui'
import { cn } from '@/lib/utils'
import Reveal from './Reveal'
import Section from './Section'

const Contact = () => {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('haidarabbasbalospura@gmail.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Section number="07" title="Get In Touch" id="contact">
      <div className="grid md:grid-cols-2 gap-12">
        <Reveal>
          <p className="text-lg mb-6 text-foreground/85">
            I build systems that learn. Let's build something worth remembering.
          </p>

          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={copyEmail}
              className={cn(
                siteButton({ variant: 'outline', size: 'md' }),
                'hover:border-primary/50'
              )}
            >
              {copied ? 'Copied!' : 'haidarabbasbalospura@gmail.com'}
            </button>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Name"
              aria-label="Name"
              className={cn(fieldClass, 'font-mono-jb')}
            />
            <input
              type="email"
              placeholder="Email"
              aria-label="Email"
              className={cn(fieldClass, 'font-mono-jb')}
            />
            <textarea
              placeholder="Message"
              rows={4}
              aria-label="Message"
              className={cn(fieldClass, 'resize-none')}
            />
            <button type="submit" className={siteButton({ variant: 'primary', size: 'lg' })}>
              Send Message
            </button>
          </form>
        </Reveal>
      </div>
    </Section>
  )
}

export default Contact
