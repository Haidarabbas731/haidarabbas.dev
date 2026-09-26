import type { ReactNode } from 'react'
import { education } from '@/data/education'
import { skills } from '@/data/skills'
import Reveal from './Reveal'
import Section from './Section'

const SubHeading = ({ children }: { children: ReactNode }) => (
  <h3 className="text-sm uppercase tracking-widest mb-5 font-mono-jb text-primary">{children}</h3>
)

const Skills = () => (
  <Section number="02" title="Background" id="skills">
    <div className="grid md:grid-cols-2 gap-12 md:gap-16">
      {/* Education */}
      <div>
        <SubHeading>Education</SubHeading>
        <div className="space-y-4">
          {education.map((edu, i) => (
            <Reveal key={edu.degree} delay={i * 60}>
              <div className="rounded-lg border border-border bg-card p-5">
                <h4 className="text-base font-bold font-display">{edu.degree}</h4>
                <div className="text-sm mt-1 text-muted-foreground">{edu.institution}</div>
                <div className="text-xs mt-2 font-mono-jb text-primary">{edu.period}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Stack */}
      <div>
        <SubHeading>Stack</SubHeading>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {skills.map((skill, i) => (
            <Reveal key={skill.name} delay={Math.min(i, 8) * 40}>
              <a
                href={skill.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={skill.name}
                className="group flex h-full flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 transition hover:-translate-y-0.5 border-[hsl(var(--border))] hover:border-[var(--skill-color)] hover:shadow-[0_0_12px_var(--skill-glow)]"
                style={
                  {
                    '--skill-color': `color-mix(in srgb, ${skill.color} var(--skill-mix), hsl(var(--foreground)))`,
                    '--skill-glow': `${skill.color}33`,
                  } as React.CSSProperties
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 transition-colors fill-[hsl(var(--muted-foreground))] group-hover:fill-[var(--skill-color)]"
                >
                  <title>{skill.name}</title>
                  <path d={skill.path} />
                </svg>
                <span className="text-xs text-center text-muted-foreground font-mono-jb">
                  {skill.name}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  </Section>
)

export default Skills
