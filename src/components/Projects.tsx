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
import { siteButton } from '@/lib/ui'
import { cn } from '@/lib/utils'
import Reveal from './Reveal'
import Section from './Section'
import WindowChrome from './WindowChrome'

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
    <Section number="03" title="Featured Project" id="projects">
      <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">
        {screenshots.length > 0 && (
          <Reveal className="md:col-span-3">
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-[0_0_30px_hsl(var(--primary)/0.08)]">
              <WindowChrome>
                <span className="ml-3 px-3 py-1 text-xs rounded truncate bg-muted text-muted-foreground font-mono-jb">
                  {screenshots[current]?.label}
                </span>
              </WindowChrome>

              <Carousel setApi={handleApi} opts={{ loop: true }}>
                <CarouselContent className="ml-0">
                  {screenshots.map((shot) => (
                    <CarouselItem key={shot.label} className="pl-0">
                      <img
                        src={shot.src}
                        alt={`${project.title}: ${shot.label}`}
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
                <div className="flex items-center justify-center gap-3 p-3 border-t border-border">
                  {screenshots.map((shot, i) => (
                    <button
                      type="button"
                      key={shot.label}
                      onClick={() => api?.scrollTo(i)}
                      aria-label={`Show ${shot.label} screenshot`}
                      aria-current={current === i}
                      className={cn(
                        'w-14 h-9 rounded overflow-hidden border-2 transition-colors',
                        current === i ? 'border-primary' : 'border-border'
                      )}
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
          </Reveal>
        )}

        {/* Details */}
        <Reveal delay={100} className={screenshots.length > 0 ? 'md:col-span-2' : 'md:col-span-5'}>
          <h3 className="text-2xl font-bold mb-3 font-display">{project.title}</h3>
          <p className="text-sm leading-relaxed mb-5 text-foreground/75">{project.description}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-xs rounded-full border border-border text-foreground/60 font-mono-jb"
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
              className={siteButton({ variant: 'primary', size: 'md' })}
            >
              Live Demo
            </a>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                siteButton({ variant: 'outline', size: 'md' }),
                'hover:bg-primary hover:text-primary-foreground'
              )}
            >
              GitHub
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

export default Projects
