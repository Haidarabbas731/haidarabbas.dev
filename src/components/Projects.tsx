import { projects } from '@/data/projects'
import SectionTitle from './SectionTitle'

const Projects = () => (
  <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
    <SectionTitle number="03" title="Featured Projects" id="projects" />

    <div className="grid md:grid-cols-2 gap-6">
      {projects.map((project, i) => (
        <div
          key={project.title}
          className={`group relative rounded-lg border overflow-hidden transition-all hover:border-primary/40 ${i === 0 ? 'md:col-span-2' : ''}`}
          style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
        >
          <div
            className="relative h-48 md:h-56 flex items-center justify-center overflow-hidden"
            style={{ background: 'hsl(var(--muted))' }}
          >
            <div
              className="absolute inset-0 animate-shimmer"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, hsl(var(--foreground) / 0.03) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
            />
            <span
              className="text-sm relative z-10"
              style={{ color: 'hsl(var(--foreground) / 0.4)', fontFamily: 'var(--font-mono)' }}
            >
              [PROJECT_IMAGE]
            </span>

            {project.featured && (
              <span
                className="absolute top-3 left-3 px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded"
                style={{
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Featured
              </span>
            )}

            <div
              className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'hsl(var(--background) / 0.85)' }}
            >
              <a
                href={project.liveUrl}
                className="px-4 py-2 text-sm rounded border transition-colors hover:bg-primary hover:text-primary-foreground"
                style={{ borderColor: 'hsl(var(--border))', fontFamily: 'var(--font-mono)' }}
              >
                Live Demo
              </a>
              <a
                href={project.githubUrl}
                className="px-4 py-2 text-sm rounded border transition-colors hover:bg-primary hover:text-primary-foreground"
                style={{ borderColor: 'hsl(var(--border))', fontFamily: 'var(--font-mono)' }}
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {project.title}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--foreground) / 0.7)' }}>
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-xs rounded-full border"
                  style={{
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground) / 0.6)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)

export default Projects
