import { experiences } from '@/data/experience'
import { cn } from '@/lib/utils'
import Reveal from './Reveal'
import Section from './Section'

type ExperienceEntry = (typeof experiences)[0]

const CompanyName = ({ exp }: { exp: ExperienceEntry }) =>
  exp.companyUrl ? (
    <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
      {exp.company}
    </a>
  ) : (
    <>{exp.company}</>
  )

/** One markup for every breakpoint: a left-ruled column on phones, an alternating card from md up. */
const TimelineEntry = ({ exp, index }: { exp: ExperienceEntry; index: number }) => {
  const isLeft = index % 2 === 0

  return (
    <Reveal className="relative flex md:items-center mb-12">
      <div className="absolute left-0 top-0 -translate-x-1.5 w-3 h-3 rounded-full z-10 bg-primary md:left-1/2 md:top-auto md:-translate-x-1/2 md:shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />

      <div
        className={cn(
          'w-full md:w-1/2',
          isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left md:order-2'
        )}
      >
        <div className="border-l border-border pl-8 md:rounded-lg md:border md:bg-card md:p-6">
          <h3 className="text-lg font-bold font-display">{exp.role}</h3>
          <div className="text-sm mb-2 md:mb-3 font-mono-jb text-primary">
            <CompanyName exp={exp} /> · {exp.period}
          </div>
          <ul className="space-y-1 md:space-y-2 text-sm text-muted-foreground">
            {exp.highlights.map((h) => (
              <li key={h} className="before:content-['•_'] md:before:content-none">
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn('hidden md:block w-1/2', isLeft && 'order-2')} />
    </Reveal>
  )
}

const Experience = () => (
  <Section number="04" title="Experience" id="experience">
    <div className="relative">
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />
      {experiences.map((exp, i) => (
        <TimelineEntry key={`${exp.company}-${exp.period}`} exp={exp} index={i} />
      ))}
    </div>
  </Section>
)

export default Experience
