import { useMemo, useState } from 'react'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { projects } from '@/data/projects'
import { resolveAsset } from '@/lib/resolveAsset'
import SectionTitle from './SectionTitle'

const Projects = () => {
  const project = projects[0]
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const screenshots = useMemo(
    () =>
      project.screenshots
        .map((shot) => ({ src: resolveAsset(shot.path), label: shot.label }))
        .filter((shot): shot is { src: string; label: string } => Boolean(shot.src)),
    []
  )

  const handleApi = (nextApi: CarouselApi) => {
    setApi(nextApi)
    if (!nextApi) return
    setCurrent(nextApi.selectedScrollSnap())
    nextApi.on('select', () => setCurrent(nextApi.selectedScrollSnap()))
  }

  return (
    <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
      <SectionTitle number="03" title="Featured Project" id="projects" />

      <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
        {screenshots.length > 0 && (
          <div
            className="md:col-span-3 rounded-lg border overflow-hidden"
            style={{
              borderColor: 'hsl(var(--border))',
              background: 'hsl(var(--card))',
              boxShadow: '0 0 30px hsl(var(--primary) / 0.08)',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: 'hsl(var(--border))' }}
            >
              <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <span
                className="ml-3 px-3 py-1 text-xs rounded truncate"
                style={{
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {screenshots[current]?.label}
              </span>
            </div>

            <Carousel setApi={handleApi} opts={{ loop: true }}>
              <CarouselContent className="ml-0">
                {screenshots.map((shot) => (
                  <CarouselItem key={shot.label} className="pl-0">
                    <img
                      src={shot.src}
                      alt={`${project.title} — ${shot.label}`}
                      className="w-full h-auto"
                      loading="lazy"
                      decoding="async"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {screenshots.length > 1 && (
                <>
                  <CarouselPrevious className="left-3" />
                  <CarouselNext className="right-3" />
                </>
              )}
            </Carousel>

            {screenshots.length > 1 && (
              <div
                className="flex items-center justify-center gap-3 p-3 border-t"
                style={{ borderColor: 'hsl(var(--border))' }}
              >
                {screenshots.map((shot, i) => (
                  <button
                    type="button"
                    key={shot.label}
                    onClick={() => api?.scrollTo(i)}
                    aria-label={`Show ${shot.label} screenshot`}
                    aria-current={current === i}
                    className="w-14 h-9 rounded overflow-hidden border-2 transition-colors"
                    style={{
                      borderColor: current === i ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    }}
                  >
                    <img
                      src={shot.src}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details */}
        <div className={screenshots.length > 0 ? 'md:col-span-2' : 'md:col-span-5'}>
          <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            {project.title}
          </h3>
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: 'hsl(var(--foreground) / 0.75)' }}
          >
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
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
          <div className="flex gap-3">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-md transition-all"
              style={{
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                fontFamily: 'var(--font-mono)',
                boxShadow: '0 0 16px hsl(var(--primary) / 0.25)',
              }}
            >
              Live Demo
            </a>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm rounded-md border transition-colors hover:bg-primary hover:text-primary-foreground"
              style={{ borderColor: 'hsl(var(--border))', fontFamily: 'var(--font-mono)' }}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Projects
