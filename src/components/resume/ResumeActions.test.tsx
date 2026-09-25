import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TailorStatus } from '@/types/resume'
import { ResumeActions } from './ResumeActions'

function setup(status: TailorStatus, error: string | null = null, canTailor = true) {
  const handlers = {
    onTailor: vi.fn(),
    onReset: vi.fn(),
    onDownload: vi.fn(),
    onReconfigure: vi.fn(),
  }
  render(
    <ResumeActions
      status={status}
      error={error}
      canTailor={canTailor}
      hasPdf={status === 'done'}
      {...handlers}
    />
  )
  return handlers
}

describe('ResumeActions status', () => {
  it('keeps one stable button label and says progress once, in the status line', () => {
    setup('tailoring')
    expect(screen.getByRole('button', { name: 'Tailor resume' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Tailor resume' })).toHaveAttribute(
      'aria-busy',
      'true'
    )
    expect(screen.getByText('Reading the job and rewriting your resume...')).toBeInTheDocument()
    expect(screen.queryByText('Tailoring...')).toBeNull()
  })

  it('shows the PDF step while building', () => {
    setup('compiling')
    expect(screen.getByText('Building your PDF...')).toBeInTheDocument()
  })

  it('confirms with the same verb as the action', () => {
    setup('done')
    expect(screen.getByText('Resume tailored')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Download/ })).toBeEnabled()
  })

  it('shows nothing extra when idle', () => {
    setup('idle')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('button', { name: /Download/ })).toBeDisabled()
  })
})

describe('ResumeActions errors', () => {
  it('offers retry and settings for a rate limit', () => {
    const h = setup('error', 'Rate limited by Gemini. Please wait a moment and try again.')
    expect(screen.getByRole('alert')).toHaveTextContent(/busy|usage limit/)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    fireEvent.click(screen.getByRole('button', { name: 'Change settings' }))
    expect(h.onTailor).toHaveBeenCalledTimes(1)
    expect(h.onReconfigure).toHaveBeenCalledTimes(1)
  })

  it('offers only settings for a rejected key', () => {
    setup('error', 'Invalid OpenRouter API key.')
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Change settings' })).toBeInTheDocument()
  })

  it('tucks a long log behind a details toggle', () => {
    setup('error', `! Undefined control sequence.\n${'l.42 badmacro '.repeat(40)}`)
    expect(screen.getByText(/PDF could not be built/)).toBeInTheDocument()
    expect(screen.getByText('Show details')).toBeInTheDocument()
  })

  it('hides Try again when the job description is missing', () => {
    setup('error', 'Something odd happened', false)
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  })
})
