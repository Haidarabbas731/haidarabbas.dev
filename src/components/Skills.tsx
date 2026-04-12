import { useState } from 'react'
import { skillGroups } from '@/data/skills'
import SectionTitle from './SectionTitle'

const Skills = () => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  return (
    <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
      <SectionTitle number="02" title="Weapons of Choice" id="skills" />

      <div className="grid md:grid-cols-2 gap-10">
        {skillGroups.map((group) => (
          <div key={group.category}>
            <h3
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-mono)' }}
            >
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="relative"
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <span
                    className="inline-block px-3 py-1.5 text-sm rounded-md border cursor-default transition-all hover:border-primary/50 hover:shadow-[0_0_8px_hsl(var(--primary)/0.15)]"
                    style={{
                      borderColor: 'hsl(var(--border))',
                      background: 'hsl(var(--card))',
                      fontFamily: 'var(--font-mono)',
                      color: 'hsl(var(--foreground) / 0.8)',
                    }}
                  >
                    {skill.name}
                  </span>
                  {hoveredSkill === skill.name && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs rounded whitespace-nowrap z-50"
                      style={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {skill.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skills
