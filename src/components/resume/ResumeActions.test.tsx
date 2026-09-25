import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TailorStatus } from '@/types/resume'
import { ResumeActions, SLOW_AFTER_MS } from './ResumeActions'

function setup(status: TailorStatus, error: string | null = null, canTailor = true) {
  const handlers = {
    onTailor: vi.fn(),
    onReset: vi.fn(),
    onDownload: vi.fn(),
    onReconfigure: vi.fn(),
    onPickModel: vi.fn(),
    onCancel: vi.fn(),
  }
  const utils = render(
    <ResumeActions
      status={status}
      error={error}
      canTailor={canTailor}
      hasPdf={status === 'done'}
      {...handlers}
    />
  )
  return { ...handlers, ...utils }
}

afterEach(() => vi.useRealTimers())

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
  it('offers retry and a model switch, not the settings, for a rate limit', () => {
    const h = setup('error', 'Rate limited by Gemini. Please wait a moment and try again.')
    expect(screen.getByRole('alert')).toHaveTextContent(/busy|usage limit/)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    fireEvent.click(screen.getByRole('button', { name: 'Choose another model' }))
    expect(h.onTailor).toHaveBeenCalledTimes(1)
    expect(h.onPickModel).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('button', { name: 'Change settings' })).toBeNull()
  })

  it('handles the Gemini high-demand message with a way to switch model', () => {
    const h = setup(
      'error',
      'Gemini API error: This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.'
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/busy right now/)
    fireEvent.click(screen.getByRole('button', { name: 'Choose another model' }))
    expect(h.onPickModel).toHaveBeenCalledWith(true)
  })

  it('offers only the settings for a rejected key', () => {
    const h = setup('error', 'Invalid OpenRouter API key.')
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Choose another model' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Change settings' }))
    expect(h.onReconfigure).toHaveBeenCalledTimes(1)
  })

  it('still lets you pick a model when there is no job description, without retrying', () => {
    const h = setup('error', 'Rate limited by Gemini.', false)
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Choose another model' }))
    expect(h.onPickModel).toHaveBeenCalledWith(false)
  })

  it('tucks a long log behind a details toggle', () => {
    setup('error', `! Undefined control sequence.\n${'l.42 badmacro '.repeat(40)}`)
    expect(screen.getByText(/PDF could not be built/)).toBeInTheDocument()
    expect(screen.getByText('Show details')).toBeInTheDocument()
  })
})

describe('ResumeActions slow requests', () => {
  it('stays quiet at first, then offers to stop and switch model', () => {
    vi.useFakeTimers()
    const h = setup('tailoring')
    expect(screen.queryByText(/taking longer than usual/i)).toBeNull()

    act(() => {
      vi.advanceTimersByTime(SLOW_AFTER_MS - 1)
    })
    expect(screen.queryByText(/taking longer than usual/i)).toBeNull()

    act(() => {
      vi.advanceTimersByTime(2)
    })
    expect(screen.getByText(/taking longer than usual/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Stop and choose another model' }))
    expect(h.onCancel).toHaveBeenCalledTimes(1)
    expect(h.onPickModel).toHaveBeenCalledWith(true)
  })

  it('keeps counting through the tailoring to PDF step, and clears once finished', () => {
    vi.useFakeTimers()
    const { rerender, ...h } = setup('tailoring')
    act(() => {
      vi.advanceTimersByTime(SLOW_AFTER_MS / 2)
    })
    rerender(
      <ResumeActions
        status="compiling"
        error={null}
        canTailor
        hasPdf={false}
        onTailor={h.onTailor}
        onReset={h.onReset}
        onDownload={h.onDownload}
        onReconfigure={h.onReconfigure}
        onPickModel={h.onPickModel}
        onCancel={h.onCancel}
      />
    )
    act(() => {
      vi.advanceTimersByTime(SLOW_AFTER_MS / 2 + 1)
    })
    expect(screen.getByText(/taking longer than usual/i)).toBeInTheDocument()

    rerender(
      <ResumeActions
        status="done"
        error={null}
        canTailor
        hasPdf
        onTailor={h.onTailor}
        onReset={h.onReset}
        onDownload={h.onDownload}
        onReconfigure={h.onReconfigure}
        onPickModel={h.onPickModel}
        onCancel={h.onCancel}
      />
    )
    expect(screen.queryByText(/taking longer than usual/i)).toBeNull()
  })

  it('never shows the hint when nothing is running', () => {
    vi.useFakeTimers()
    setup('idle')
    act(() => {
      vi.advanceTimersByTime(SLOW_AFTER_MS * 2)
    })
    expect(screen.queryByText(/taking longer than usual/i)).toBeNull()
  })
})
