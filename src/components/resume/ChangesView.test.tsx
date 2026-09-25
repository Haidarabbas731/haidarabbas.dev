import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ResumeDiff } from '@/services/resumeDiff'
import { ChangesView } from './ChangesView'
import { ResultTabs } from './ResultTabs'

const diff: ResumeDiff = {
  sections: [
    {
      title: 'Data Engineer',
      subtitle: 'Acme, 2022',
      lines: [
        { kind: 'same', text: 'Kept this bullet.' },
        { kind: 'reworded', text: 'Designed pipelines.', original: 'Built pipelines.' },
        { kind: 'new', text: 'Brand new bullet.' },
      ],
    },
  ],
  dropped: ['An old bullet.'],
  stats: { same: 1, reworded: 1, added: 1, dropped: 1 },
}

describe('ChangesView', () => {
  it('shows counts, keywords, section headings and every line', () => {
    render(<ChangesView diff={diff} keywords={['Python', 'Airflow']} />)
    expect(screen.getByText('Data Engineer')).toBeInTheDocument()
    expect(screen.getByText('Acme, 2022')).toBeInTheDocument()
    expect(screen.getByText('Kept this bullet.')).toBeInTheDocument()
    expect(screen.getByText('Built pipelines.')).toBeInTheDocument()
    expect(screen.getByText('Designed pipelines.')).toBeInTheDocument()
    expect(screen.getByText('Brand new bullet.')).toBeInTheDocument()
    expect(screen.getByText('An old bullet.')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Removed from your original')).toBeInTheDocument()
  })

  it('states the meaning of each row for screen readers, not just with a symbol', () => {
    render(<ChangesView diff={diff} keywords={[]} />)
    expect(screen.getByText('Unchanged:')).toBeInTheDocument()
    expect(screen.getByText('Original:')).toBeInTheDocument()
    expect(screen.getByText('Tailored:')).toBeInTheDocument()
    expect(screen.getByText('New:')).toBeInTheDocument()
    expect(screen.getAllByText('Removed:')).toHaveLength(1)
  })

  it('omits the keywords block when there are none', () => {
    render(<ChangesView diff={diff} keywords={[]} />)
    expect(screen.queryByText('Matches the job')).toBeNull()
  })
})

describe('ResultTabs', () => {
  it('offers only the views that exist and reports the active one', () => {
    const { rerender } = render(<ResultTabs value="tailored" onChange={() => {}} hasOriginal />)
    expect(screen.getByRole('button', { name: 'Tailored' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Original' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.queryByRole('button', { name: /Changes/ })).toBeNull()

    rerender(<ResultTabs value="changes" onChange={() => {}} hasOriginal={false} changeCount={4} />)
    expect(screen.queryByRole('button', { name: 'Original' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Changes (4)' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})
