import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import SectionTitle from './SectionTitle'

interface SectionProps {
  number: string
  title: string
  id: string
  /** Less top padding, for the first section under the hero */
  compact?: boolean
  children: ReactNode
}

const Section = ({ number, title, id, compact = false, children }: SectionProps) => (
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

export default Section
