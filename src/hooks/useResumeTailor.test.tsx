import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SAMPLE_DATA } from '@/test/fixtures/sampleResume'
import type { ResumeConfig, ResumeSource } from '@/types/resume'
import { useResumeTailor } from './useResumeTailor'

const mocks = vi.hoisted(() => ({
  tailorStructured: vi.fn(),
  renderResumePdf: vi.fn(),
  tailorResume: vi.fn(),
  compileLaTeX: vi.fn(),
}))

vi.mock('@/services/structuredTailor', () => ({ tailorStructured: mocks.tailorStructured }))
vi.mock('@/services/renderResumePdf', () => ({ renderResumePdf: mocks.renderResumePdf }))
vi.mock('@/services/resumeService', () => ({
  tailorResume: mocks.tailorResume,
  compileLaTeX: mocks.compileLaTeX,
}))

const WARNING = {
  kind: 'number' as const,
  value: '73',
  message: 'The number 73 is not in your original resume.',
}

const textSource: ResumeSource = {
  kind: 'text',
  text: 'Priya Nair resume text',
  originalPdfUrl: 'blob:original',
}

const config = (source: ResumeSource | null): ResumeConfig => ({
  mode: null,
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  apiKey: 'key',
  source,
})

let urlCounter = 0
const created: string[] = []
const revoked: string[] = []

beforeEach(() => {
  vi.resetAllMocks()
  urlCounter = 0
  created.length = 0
  revoked.length = 0
  URL.createObjectURL = vi.fn(() => {
    const u = `blob:made-${++urlCounter}`
    created.push(u)
    return u
  })
  URL.revokeObjectURL = vi.fn((u: string) => {
    revoked.push(u)
  })
  mocks.tailorStructured.mockResolvedValue({ data: SAMPLE_DATA, warnings: [WARNING] })
  mocks.renderResumePdf.mockResolvedValue(new Blob(['%PDF']))
  mocks.tailorResume.mockResolvedValue('\\documentclass{article}')
  mocks.compileLaTeX.mockResolvedValue('blob:compiled')
})

async function setup(source: ResumeSource | null) {
  const hook = renderHook(() => useResumeTailor(config(source)))
  await waitFor(() => expect(hook.result.current.status).toBe('idle'))
  return hook
}

function fill(hook: Awaited<ReturnType<typeof setup>>) {
  act(() => hook.result.current.setJobDescription('Data engineer role'))
  act(() => hook.result.current.setAdditionalNotes('Lead with Python'))
}

describe('useResumeTailor with a text source', () => {
  it('shows the uploaded PDF as the original and does not compile anything', async () => {
    const { result } = await setup(textSource)
    expect(result.current.pdfUrl).toBe('blob:original')
    expect(result.current.showing).toBe('original')
    expect(result.current.canDownload).toBe(false)
    expect(mocks.compileLaTeX).not.toHaveBeenCalled()
  })

  it('has no preview when the resume was pasted, and cannot tailor without a job description', async () => {
    const { result } = await setup({ kind: 'text', text: 'pasted text' })
    expect(result.current.pdfUrl).toBeNull()
    expect(result.current.canTailor).toBe(false)
  })

  it('tailors, builds a PDF, and keeps the uploaded original untouched', async () => {
    const hook = await setup(textSource)
    fill(hook)
    expect(hook.result.current.canTailor).toBe(true)

    await act(() => hook.result.current.tailor())

    expect(mocks.tailorStructured).toHaveBeenCalledWith(
      'gemini',
      'key',
      'gemini-2.5-flash',
      'Priya Nair resume text',
      'Data engineer role',
      'Lead with Python'
    )
    expect(hook.result.current.status).toBe('done')
    expect(hook.result.current.pdfUrl).toBe('blob:made-1')
    expect(hook.result.current.showing).toBe('tailored')
    expect(hook.result.current.canDownload).toBe(true)
    expect(hook.result.current.warnings).toEqual([WARNING])
    expect(hook.result.current.resumeData?.name).toBe('Priya Nair')
    expect(revoked).not.toContain('blob:original')
  })

  it('revokes the previous tailored PDF on a second run, never the original', async () => {
    const hook = await setup(textSource)
    fill(hook)
    await act(() => hook.result.current.tailor())
    await act(() => hook.result.current.tailor())
    expect(hook.result.current.pdfUrl).toBe('blob:made-2')
    expect(revoked).toEqual(['blob:made-1'])
  })

  it('reset returns to the original and clears inputs and results', async () => {
    const hook = await setup(textSource)
    fill(hook)
    await act(() => hook.result.current.tailor())
    await act(() => hook.result.current.reset())

    expect(hook.result.current.pdfUrl).toBe('blob:original')
    expect(hook.result.current.showing).toBe('original')
    expect(hook.result.current.jobDescription).toBe('')
    expect(hook.result.current.warnings).toEqual([])
    expect(hook.result.current.status).toBe('idle')
    expect(revoked).toEqual(['blob:made-1'])
  })

  it('reports errors from the AI call', async () => {
    mocks.tailorStructured.mockRejectedValue(new Error('Rate limited by Gemini.'))
    const hook = await setup(textSource)
    fill(hook)
    await act(() => hook.result.current.tailor())
    expect(hook.result.current.status).toBe('error')
    expect(hook.result.current.error).toBe('Rate limited by Gemini.')
  })

  it('ignores a slow result that finishes after a reset', async () => {
    let finish: (v: unknown) => void = () => {}
    mocks.tailorStructured.mockReturnValue(new Promise((r) => (finish = r)))
    const hook = await setup(textSource)
    fill(hook)

    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = hook.result.current.tailor()
    })
    await act(() => hook.result.current.reset())
    await act(async () => {
      finish({ data: SAMPLE_DATA, warnings: [] })
      await pending
    })

    expect(hook.result.current.status).toBe('idle')
    expect(hook.result.current.pdfUrl).toBe('blob:original')
    expect(hook.result.current.resumeData).toBeNull()
    expect(mocks.renderResumePdf).not.toHaveBeenCalled()
  })

  it('names the download after the person', async () => {
    const hook = await setup(textSource)
    fill(hook)
    await act(() => hook.result.current.tailor())

    let name = ''
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      name = this.download
    })
    act(() => hook.result.current.download())
    expect(name).toBe('Priya_Nair_Resume.pdf')
    click.mockRestore()
  })
})

describe('useResumeTailor with a LaTeX source', () => {
  const latex: ResumeSource = { kind: 'latex', latex: '\\documentclass{article}' }

  it('compiles the original on load and owns that preview', async () => {
    const { result, unmount } = await setup(latex)
    expect(mocks.compileLaTeX).toHaveBeenCalledWith('\\documentclass{article}')
    expect(result.current.pdfUrl).toBe('blob:compiled')
    expect(result.current.showing).toBe('original')
    expect(result.current.canDownload).toBe(false)
    unmount()
    expect(revoked).toContain('blob:compiled')
  })

  it('tailors through the LaTeX path', async () => {
    mocks.compileLaTeX.mockResolvedValueOnce('blob:base').mockResolvedValueOnce('blob:tailored')
    const hook = await setup(latex)
    fill(hook)
    await act(() => hook.result.current.tailor())

    expect(mocks.tailorResume).toHaveBeenCalled()
    expect(mocks.tailorStructured).not.toHaveBeenCalled()
    expect(hook.result.current.updatedLatex).toBe('\\documentclass{article}')
    expect(hook.result.current.pdfUrl).toBe('blob:tailored')
    expect(hook.result.current.canDownload).toBe(true)
    expect(revoked).toContain('blob:base')
  })
})
