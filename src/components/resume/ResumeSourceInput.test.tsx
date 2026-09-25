import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { RESUME_TEMPLATE } from '@/data/resumeTemplate'
import { ResumeSourceInput, type SourceDraft } from './ResumeSourceInput'

function Harness({ initial }: { initial: SourceDraft }) {
  const [draft, setDraft] = useState<SourceDraft>(initial)
  return <ResumeSourceInput value={draft} onChange={setDraft} />
}

const box = () => screen.getByPlaceholderText('Paste your resume here...') as HTMLTextAreaElement

describe('ResumeSourceInput template', () => {
  it('offers a template when empty and fills the box with an editable starting point', () => {
    render(<Harness initial={{ kind: 'text', text: '' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'No resume yet? Start from a template' }))
    expect(box().value).toBe(RESUME_TEMPLATE)
    // Once there is text, the offer goes away
    expect(screen.queryByRole('button', { name: /Start from a template/ })).toBeNull()
  })

  it('does not offer the template once the user has typed something', () => {
    render(<Harness initial={{ kind: 'text', text: 'My own resume' }} />)
    expect(screen.queryByRole('button', { name: /Start from a template/ })).toBeNull()
  })

  it('keeps LaTeX behind an Advanced link and can switch back', () => {
    render(<Harness initial={{ kind: 'text', text: '' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Advanced: use LaTeX' }))
    expect(screen.getByLabelText('Your LaTeX Resume')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Use a PDF or plain text instead' }))
    expect(box()).toBeInTheDocument()
  })

  it('uses no em dashes in the template, matching the rest of the site', () => {
    expect(RESUME_TEMPLATE).not.toContain('—')
  })
})
