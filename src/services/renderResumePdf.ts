import type { DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { PaperSize } from '@/components/resume/ResumeDocument'
import type { ResumeData } from '@/types/resumeData'
import { countPdfPages } from './pdfPages'

/** From normal size down to the smallest that still reads comfortably (about 8 pt). */
export const FIT_SCALES = [1, 0.94, 0.88, 0.84]

/**
 * Renders at normal size first. If that spills onto a second page, tightens fonts and spacing
 * step by step until it fits on one. If it never fits, the normal-size result is kept, since
 * smaller text would gain nothing.
 */
export async function renderFitted(render: (scale: number) => Promise<Blob>): Promise<{
  blob: Blob
  pages: number
  scale: number
}> {
  let normal: { blob: Blob; pages: number; scale: number } | null = null
  for (const scale of FIT_SCALES) {
    const blob = await render(scale)
    const pages = countPdfPages(new Uint8Array(await blob.arrayBuffer()))
    const result = { blob, pages, scale }
    if (pages <= 1) return result
    normal ??= result
  }
  return normal as { blob: Blob; pages: number; scale: number }
}

/**
 * Builds the tailored resume as a PDF in the browser, fitted to one page where possible. The PDF
 * library is loaded on demand, so it stays out of the main bundle and nothing is sent to a server.
 */
export async function renderResumePdf(
  data: ResumeData,
  paper: PaperSize = 'LETTER'
): Promise<Blob> {
  const [{ pdf }, { ResumeDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/resume/ResumeDocument'),
  ])
  const { blob } = await renderFitted((scale) => {
    // ResumeDocument renders a <Document>, which is what pdf() expects
    const element = createElement(ResumeDocument, {
      data,
      paper,
      scale,
    }) as ReactElement<DocumentProps>
    return pdf(element).toBlob()
  })
  return blob
}
