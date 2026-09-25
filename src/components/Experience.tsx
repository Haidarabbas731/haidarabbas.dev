import { experiences } from '@/data/experience'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

const TimelineEntry = ({ exp, index }: { exp: (typeof experiences)[0]; index: number }) => {
  const isLeft = index % 2 === 0

  return (
    <Reveal className="relative flex md:items-center mb-12">
      <div
        className={`hidden md:block w-1/2 ${isLeft ? 'pr-12 text-right' : 'pl-12 text-left order-2'}`}
      >
        <div
          className="rounded-lg border p-6"
          style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
        >
          <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            {exp.role}
          </h3>
          <div
            className="text-sm mb-3"
            style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}
          >
            {exp.companyUrl ? (
              <a
                href={exp.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {exp.company}
              </a>
            ) : (
              exp.company
            )}{' '}
            · {exp.period}
          </div>
          <ul
            className={`space-y-2 text-sm ${isLeft ? 'text-right' : 'text-left'}`}
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {exp.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10"
        style={{
          background: 'hsl(var(--primary))',
          boxShadow: '0 0 8px hsl(var(--primary) / 0.4)',
        }}
      />

      <div className={`hidden md:block w-1/2 ${isLeft ? 'order-2' : ''}`} />

      <div className="md:hidden pl-8 border-l" style={{ borderColor: 'hsl(var(--border))' }}>
        <div
          className="absolute left-0 top-0 w-3 h-3 rounded-full -translate-x-1.5"
          style={{ background: 'hsl(var(--primary))' }}
        />
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          {exp.role}
        </h3>
        <div
          className="text-sm mb-2"
          style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}
        >
          {exp.companyUrl ? (
            <a
              href={exp.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {exp.company}
            </a>
          ) : (
            exp.company
          )}{' '}
          · {exp.period}
        </div>
        <ul className="space-y-1 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {exp.highlights.map((h) => (
            <li key={h}>• {h}</li>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}

const Experience = () => (
  <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
    <SectionTitle number="04" title="Experience" id="experience" />
    <div className="relative">
      <div
        className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px"
        style={{ background: 'hsl(var(--border))' }}
      />
      {experiences.map((exp, i) => (
        <TimelineEntry key={`${exp.company}-${exp.period}`} exp={exp} index={i} />
      ))}
    </div>
  </section>
)

export default Experience
