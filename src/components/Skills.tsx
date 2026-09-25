import { education } from '@/data/education'
import { skills } from '@/data/skills'
import SectionTitle from './SectionTitle'

const Skills = () => (
  <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
    <SectionTitle number="02" title="Background" id="skills" />

    <div className="grid md:grid-cols-2 gap-12 md:gap-16">
      {/* Education */}
      <div>
        <h3
          className="text-sm uppercase tracking-widest mb-5"
          style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}
        >
          Education
        </h3>
        <div className="space-y-4">
          {education.map((edu) => (
            <div
              key={edu.degree}
              className="rounded-lg border p-5"
              style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
            >
              <h4 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                {edu.degree}
              </h4>
              <div className="text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {edu.institution}
              </div>
              <div
                className="text-xs mt-2"
                style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}
              >
                {edu.period}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stack */}
      <div>
        <h3
          className="text-sm uppercase tracking-widest mb-5"
          style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}
        >
          Stack
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {skills.map((skill) => (
            <a
              key={skill.name}
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={skill.name}
              className="group flex flex-col items-center justify-center gap-2 rounded-lg border p-4 transition-all hover:-translate-y-0.5 border-[hsl(var(--border))] hover:border-[var(--skill-color)] hover:shadow-[0_0_12px_var(--skill-glow)]"
              style={
                {
                  background: 'hsl(var(--card))',
                  '--skill-color': skill.color,
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
              <span
                className="text-xs text-center"
                style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}
              >
                {skill.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  </section>
)

export default Skills
