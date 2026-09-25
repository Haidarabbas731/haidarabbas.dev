// @vitest-environment node
import { type DocumentProps, renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { ResumeDocument } from '@/components/resume/ResumeDocument'
import { SAMPLE_DATA } from '@/test/fixtures/sampleResume'
import { extractPdfText } from './pdfText'
import { checkAgainstSource } from './resumeChecks'

async function render(data = SAMPLE_DATA) {
  const el = createElement(ResumeDocument, { data }) as ReactElement<DocumentProps>
  const buf = await renderToBuffer(el)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

describe('resume PDF round trip', () => {
  it('renders a real PDF', async () => {
    const bytes = new Uint8Array(await render())
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe('%PDF-')
  })

  it('reads its own text back in order, with hyperlinks', async () => {
    const { text, links, pages } = await extractPdfText(await render())
    expect(pages).toBe(1)
    expect(text).toContain('Priya Nair')
    expect(text).toContain('priya.nair@example.com')
    expect(text).toContain('Built ETL pipelines in Python and Airflow')
    expect(text).toContain('Jan 2022 - Present')
    expect(text.indexOf('EXPERIENCE')).toBeLessThan(text.indexOf('EDUCATION'))
    expect(links).toContain('https://github.com/priyanair')
  }, 20_000)

  it('passes the invented-fact check against its own extracted text', async () => {
    const { text } = await extractPdfText(await render())
    expect(checkAgainstSource(SAMPLE_DATA, text)).toEqual([])
  }, 20_000)

  it('rejects a file that is not a PDF', async () => {
    await expect(
      extractPdfText(new TextEncoder().encode('hello').buffer as ArrayBuffer)
    ).rejects.toThrow(/could not be read as a PDF/)
  })
})
