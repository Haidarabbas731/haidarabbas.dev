import type { DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import type { PaperSize } from '@/components/resume/ResumeDocument'
import type { ResumeData } from '@/types/resumeData'

/**
 * Builds the tailored resume as a PDF in the browser. The PDF library is loaded on demand,
 * so it stays out of the main bundle and nothing is sent to a server.
 */
export async function renderResumePdf(
  data: ResumeData,
  paper: PaperSize = 'LETTER'
): Promise<Blob> {
  const [{ pdf }, { ResumeDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/resume/ResumeDocument'),
  ])
  // ResumeDocument renders a <Document>, which is what pdf() expects
  const element = createElement(ResumeDocument, { data, paper }) as ReactElement<DocumentProps>
  return pdf(element).toBlob()
}
