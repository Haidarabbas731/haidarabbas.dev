import { useCallback, useEffect, useRef, useState } from 'react'
import { renderResumePdf } from '@/services/renderResumePdf'
import { compileLaTeX, tailorResume } from '@/services/resumeService'
import { tailorStructured } from '@/services/structuredTailor'
import type { ResumeConfig, TailorStatus } from '@/types/resume'
import type { ResumeData, ResumeWarning } from '@/types/resumeData'

type Showing = 'original' | 'tailored' | null

/** What the right-hand panel is showing. */
export type ResultView = 'tailored' | 'original' | 'changes'

interface TailorResult {
  data: ResumeData
  warnings: ResumeWarning[]
}

function downloadName(data: ResumeData | null): string {
  const base = (data?.name ?? '')
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
  return base ? `${base}_Resume.pdf` : 'Tailored_Resume.pdf'
}

export function useResumeTailor(config: ResumeConfig) {
  const [jobDescription, setJobDescription] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [tailoredUrl, setTailoredUrl] = useState<string | null>(null)
  const [view, setView] = useState<ResultView>('original')
  const [updatedLatex, setUpdatedLatex] = useState<string | null>(null)
  const [result, setResult] = useState<TailorResult | null>(null)
  const [status, setStatus] = useState<TailorStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const { provider, model, apiKey, source } = config

  // Only object URLs created here are revoked here. An uploaded original belongs to the page.
  const ownedOriginal = useRef<string | null>(null)
  const ownedTailored = useRef<string | null>(null)
  // Bumped whenever a result should be discarded (new run, reset, new source)
  const runId = useRef(0)

  const setOriginal = useCallback((url: string | null, owned: boolean) => {
    if (ownedOriginal.current && ownedOriginal.current !== url) {
      URL.revokeObjectURL(ownedOriginal.current)
    }
    ownedOriginal.current = owned ? url : null
    setOriginalUrl(url)
  }, [])

  const setTailored = useCallback((url: string | null) => {
    if (ownedTailored.current && ownedTailored.current !== url) {
      URL.revokeObjectURL(ownedTailored.current)
    }
    ownedTailored.current = url
    setTailoredUrl(url)
  }, [])

  useEffect(
    () => () => {
      if (ownedOriginal.current) URL.revokeObjectURL(ownedOriginal.current)
      if (ownedTailored.current) URL.revokeObjectURL(ownedTailored.current)
    },
    []
  )

  /** Shows the original resume: the uploaded PDF, or a compiled preview of the LaTeX. */
  const loadOriginal = useCallback(
    async (run: number) => {
      if (!source) {
        setOriginal(null, false)
        return
      }
      if (source.kind === 'text') {
        setOriginal(source.originalPdfUrl ?? null, false)
        setStatus('idle')
        return
      }
      try {
        setStatus('compiling')
        const url = await compileLaTeX(source.latex)
        if (run !== runId.current) {
          URL.revokeObjectURL(url)
          return
        }
        setOriginal(url, true)
        setStatus('idle')
      } catch (err: unknown) {
        if (run !== runId.current) return
        setError(err instanceof Error ? err.message : 'Failed to compile base PDF')
        setStatus('error')
      }
    },
    [source, setOriginal]
  )

  // Load the original whenever the source changes
  useEffect(() => {
    const run = ++runId.current
    setResult(null)
    setUpdatedLatex(null)
    setError(null)
    setTailored(null)
    setView('original')
    void loadOriginal(run)
    return () => {
      runId.current++
    }
  }, [loadOriginal, setTailored])

  const tailor = useCallback(async () => {
    if (!source || !jobDescription.trim() || !apiKey || !model) return

    const run = ++runId.current
    setError(null)
    setResult(null)
    try {
      setStatus('tailoring')
      if (source.kind === 'text') {
        const tailored = await tailorStructured(
          provider,
          apiKey,
          model,
          source.text,
          jobDescription,
          additionalNotes
        )
        if (run !== runId.current) return

        setStatus('compiling')
        const url = URL.createObjectURL(await renderResumePdf(tailored.data))
        if (run !== runId.current) {
          URL.revokeObjectURL(url)
          return
        }
        setResult(tailored)
        setTailored(url)
        setView('tailored')
      } else {
        const latex = await tailorResume(
          provider,
          apiKey,
          model,
          source.latex,
          jobDescription,
          additionalNotes
        )
        if (run !== runId.current) return
        setUpdatedLatex(latex)

        setStatus('compiling')
        const url = await compileLaTeX(latex)
        if (run !== runId.current) {
          URL.revokeObjectURL(url)
          return
        }
        setTailored(url)
        setView('tailored')
      }
      setStatus('done')
    } catch (err: unknown) {
      if (run !== runId.current) return
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStatus('error')
    }
  }, [provider, model, jobDescription, additionalNotes, apiKey, source, setTailored])

  const reset = useCallback(async () => {
    const run = ++runId.current
    setJobDescription('')
    setAdditionalNotes('')
    setResult(null)
    setUpdatedLatex(null)
    setError(null)
    setStatus('idle')
    setTailored(null)
    setView('original')
    await loadOriginal(run)
  }, [loadOriginal, setTailored])

  const download = useCallback(() => {
    if (!tailoredUrl) return
    const a = document.createElement('a')
    a.href = tailoredUrl
    a.download = downloadName(result?.data ?? null)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [tailoredUrl, result])

  // The PDF panel follows the chosen view. "Changes" is drawn by the page, so it keeps the tailored PDF.
  const pdfUrl = view === 'original' ? originalUrl : (tailoredUrl ?? originalUrl)
  const showing: Showing = pdfUrl ? (pdfUrl === tailoredUrl ? 'tailored' : 'original') : null

  const hasSource =
    !!source && (source.kind === 'text' ? !!source.text.trim() : !!source.latex.trim())

  const canTailor =
    status !== 'tailoring' &&
    status !== 'compiling' &&
    !!jobDescription.trim() &&
    !!apiKey &&
    hasSource &&
    !!model

  return {
    jobDescription,
    setJobDescription,
    additionalNotes,
    setAdditionalNotes,
    pdfUrl,
    showing,
    view,
    setView,
    originalUrl,
    tailoredUrl,
    updatedLatex,
    resumeData: result?.data ?? null,
    warnings: result?.warnings ?? [],
    status,
    error,
    canTailor,
    canDownload: !!tailoredUrl,
    canCompare: !!tailoredUrl && !!originalUrl,
    tailor,
    reset,
    download,
  }
}
