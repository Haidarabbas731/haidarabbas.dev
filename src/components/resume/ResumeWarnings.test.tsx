import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { ResumeWarning } from '@/types/resumeData'
import { ResumeWarnings } from './ResumeWarnings'

const make = (n: number): ResumeWarning[] =>
  Array.from({ length: n }, (_, i) => ({
    kind: 'number',
    value: String(i),
    message: `Warning number ${i}`,
  }))

describe('ResumeWarnings', () => {
  it('renders nothing when there are no warnings', () => {
    const { container } = render(<ResumeWarnings warnings={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists the messages with a count and announces itself politely', () => {
    render(<ResumeWarnings warnings={make(2)} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Check these before you send (2)')).toBeInTheDocument()
    expect(screen.getByText('Warning number 0')).toBeInTheDocument()
    expect(screen.getByText('Warning number 1')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows five, then the rest on request', () => {
    render(<ResumeWarnings warnings={make(8)} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: 'Show 3 more' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(8)
    fireEvent.click(screen.getByRole('button', { name: 'Show fewer' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
  })
})
