import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PublicConfig } from './PublicConfig'

vi.mock('@/services/modelService', () => ({
  fetchModels: vi.fn().mockResolvedValue([{ id: 'test/model', name: 'Test Model' }]),
  getDefaultModel: () => 'test/model',
}))

const VALID_KEY = `sk-or-v1-${'a'.repeat(50)}`
const JOB_TEXT = 'Job description: Data Engineer\n• Build pipelines in Python\n• Tune SQL'

const setup = (onReady = () => {}) =>
  render(
    <TooltipProvider>
      <PublicConfig onReady={onReady} onClear={() => {}} />
    </TooltipProvider>
  )

const keyInput = () => screen.getByLabelText('API key') as HTMLInputElement
const resumeBox = () => screen.getByPlaceholderText('Paste your resume here...')
const continueBtn = () => screen.getByRole('button', { name: /Continue/ })

beforeEach(() => localStorage.clear())

describe('PublicConfig API key validation', () => {
  it('explains the problem and blocks Continue when the key field holds pasted text', async () => {
    setup()
    fireEvent.change(resumeBox(), { target: { value: 'My resume text' } })
    fireEvent.change(keyInput(), { target: { value: JOB_TEXT } })

    expect(await screen.findByRole('alert')).toHaveTextContent(/single word/)
    expect(keyInput()).toHaveAttribute('aria-invalid', 'true')
    expect(continueBtn()).toBeDisabled()
    expect(screen.getByText('Fix your API key to continue')).toBeInTheDocument()
  })

  it('does not save an invalid key', () => {
    setup()
    fireEvent.change(keyInput(), { target: { value: JOB_TEXT } })
    fireEvent.click(continueBtn())
    expect(localStorage.getItem('resume_tailor_api_key_openrouter')).toBeNull()
  })

  it('continues with a cleaned key and the pasted resume once everything is valid', async () => {
    const onReady = vi.fn()
    setup(onReady)
    fireEvent.change(keyInput(), { target: { value: `  ${VALID_KEY}\n` } })
    fireEvent.change(resumeBox(), { target: { value: '  My resume text  ' } })

    await waitFor(() => expect(continueBtn()).toBeEnabled())
    expect(screen.queryByRole('alert')).toBeNull()
    fireEvent.click(continueBtn())

    expect(onReady).toHaveBeenCalledWith(VALID_KEY, 'openrouter', 'test/model', {
      kind: 'text',
      text: 'My resume text',
      originalPdfUrl: undefined,
    })
    expect(localStorage.getItem('resume_tailor_api_key_openrouter')).toBe(VALID_KEY)
  })
})
