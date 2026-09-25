import { useCallback, useEffect, useRef, useState } from 'react'
import { renderResumePdf } from '@/services/renderResumePdf'
import { compileLaTeX, tailorResume } from '@/services/resumeService'
import { tailorStructured } from '@/services/structuredTailor'
import type { ResumeConfig, TailorStatus } from '@/types/resume'
import type { ResumeData, ResumeWarning } from '@/types/resumeData'

type Showing = 'original' | 'tailored' | null

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [showing, setShowing] = useState<Showing>(null)
  const [updatedLatex, setUpdatedLatex] = useState<string | null>(null)
  const [result, setResult] = useState<TailorResult | null>(null)
  const [status, setStatus] = useState<TailorStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const { provider, model, apiKey, source } = config

  // Only object URLs created here are revoked here. An uploaded original belongs to the page.
  const ownedUrl = useRef<string | null>(null)
  // Bumped whenever a result should be discarded (new run, reset, new source)
  const runId = useRef(0)

  const showPdf = useCallback((url: string | null, owned: boolean, kind: Showing) => {
    if (ownedUrl.current && ownedUrl.current !== url) URL.revokeObjectURL(ownedUrl.current)
    ownedUrl.current = owned ? url : null
    setPdfUrl(url)
    setShowing(kind)
  }, [])

  useEffect(
    () => () => {
      if (ownedUrl.current) URL.revokeObjectURL(ownedUrl.current)
    },
    []
  )

  /** Shows the original resume: the uploaded PDF, or a compiled preview of the LaTeX. */
  const loadOriginal = useCallback(
    async (run: number) => {
      if (!source) {
        showPdf(null, false, null)
        return
      }
      if (source.kind === 'text') {
        showPdf(source.originalPdfUrl ?? null, false, source.originalPdfUrl ? 'original' : null)
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
        showPdf(url, true, 'original')
        setStatus('idle')
      } catch (err: unknown) {
        if (run !== runId.current) return
        setError(err instanceof Error ? err.message : 'Failed to compile base PDF')
        setStatus('error')
      }
    },
    [source, showPdf]
  )

  // Load the original whenever the source changes
  useEffect(() => {
    const run = ++runId.current
    setResult(null)
    setUpdatedLatex(null)
    setError(null)
    void loadOriginal(run)
    return () => {
      runId.current++
    }
  }, [loadOriginal])

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
        showPdf(url, true, 'tailored')
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
        showPdf(url, true, 'tailored')
      }
      setStatus('done')
    } catch (err: unknown) {
      if (run !== runId.current) return
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStatus('error')
    }
  }, [provider, model, jobDescription, additionalNotes, apiKey, source, showPdf])

  const reset = useCallback(async () => {
    const run = ++runId.current
    setJobDescription('')
    setAdditionalNotes('')
    setResult(null)
    setUpdatedLatex(null)
    setError(null)
    setStatus('idle')
    await loadOriginal(run)
  }, [loadOriginal])

  const download = useCallback(() => {
    if (!pdfUrl || showing !== 'tailored') return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = downloadName(result?.data ?? null)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [pdfUrl, showing, result])

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
    updatedLatex,
    resumeData: result?.data ?? null,
    warnings: result?.warnings ?? [],
    status,
    error,
    canTailor,
    canDownload: showing === 'tailored',
    tailor,
    reset,
    download,
  }
}
