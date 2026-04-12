import { useCallback, useEffect, useState } from 'react'
import { compileLaTeX, tailorResume } from '@/services/resumeService'
import type { ResumeConfig, TailorStatus } from '@/types/resume'

export function useResumeTailor(config: ResumeConfig) {
  const [jobDescription, setJobDescription] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [updatedLatex, setUpdatedLatex] = useState<string | null>(null)
  const [status, setStatus] = useState<TailorStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const { provider, model, apiKey, baseLatex } = config

  // Compile base PDF whenever baseLatex becomes available
  useEffect(() => {
    if (!baseLatex) return

    let cancelled = false

    async function loadBase() {
      try {
        setStatus('compiling')
        setError(null)
        const url = await compileLaTeX(baseLatex!)
        if (!cancelled) {
          setPdfUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return url
          })
          setStatus('idle')
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to compile base PDF')
          setStatus('error')
        }
      }
    }
    loadBase()

    return () => {
      cancelled = true
    }
  }, [baseLatex])

  const tailor = useCallback(async () => {
    if (!jobDescription.trim() || !apiKey || !baseLatex || !model) return

    setError(null)
    try {
      // Step 1: AI tailoring
      setStatus('tailoring')
      const latex = await tailorResume(
        provider,
        apiKey,
        model,
        baseLatex,
        jobDescription,
        additionalNotes
      )
      setUpdatedLatex(latex)

      // Step 2: PDF compilation (separate step with its own status)
      setStatus('compiling')
      const url = await compileLaTeX(latex)
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      setStatus('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStatus('error')
    }
  }, [provider, model, jobDescription, additionalNotes, apiKey, baseLatex])

  const reset = useCallback(async () => {
    setJobDescription('')
    setAdditionalNotes('')
    setUpdatedLatex(null)
    setError(null)
    if (!baseLatex) return
    try {
      setStatus('compiling')
      const url = await compileLaTeX(baseLatex)
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      setStatus('idle')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset')
      setStatus('error')
    }
  }, [baseLatex])

  const download = useCallback(() => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = 'Tailored_Resume.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [pdfUrl])

  // Cleanup any outstanding blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl])

  const canTailor =
    status !== 'tailoring' &&
    status !== 'compiling' &&
    !!jobDescription.trim() &&
    !!apiKey &&
    !!baseLatex &&
    !!model

  return {
    jobDescription,
    setJobDescription,
    additionalNotes,
    setAdditionalNotes,
    pdfUrl,
    updatedLatex,
    status,
    error,
    canTailor,
    tailor,
    reset,
    download,
  }
}
