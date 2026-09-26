import type { ReactNode } from 'react'
import { sections } from '@/data/sections'
import { cn } from '@/lib/utils'
import SectionTitle from './SectionTitle'

interface SectionProps {
  title: string
  /** Must match an id in data/sections.ts; the section's number comes from its position there */
  id: string
  /** Less top padding, for the first section under the hero */
  compact?: boolean
  children: ReactNode
}

const Section = ({ title, id, compact = false, children }: SectionProps) => {
  const number = String(sections.findIndex((s) => s.id === id) + 1).padStart(2, '0')

  return (
    <section
      className={cn(
        'px-6 max-w-6xl mx-auto',
        compact ? 'pt-4 md:pt-8 pb-16 md:pb-20' : 'py-16 md:py-20'
      )}
    >
      <SectionTitle number={number} title={title} id={id} />
      {children}
    </section>
  )
}

export default Section
