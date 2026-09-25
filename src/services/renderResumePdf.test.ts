// @vitest-environment node
import { type DocumentProps, renderToBuffer } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ResumeDocument } from '@/components/resume/ResumeDocument'
import { SAMPLE_DATA } from '@/test/fixtures/sampleResume'
import type { ResumeData } from '@/types/resumeData'
import { countPdfPages } from './pdfPages'
import { extractPdfText } from './pdfText'
import { renderFitted } from './renderResumePdf'

const bullet = (i: number) =>
  `Bullet ${i}: built and shipped a system that processes millions of events per day with high reliability and low latency across regions and teams.`

const withBullets = (n: number): ResumeData => {
  const d = structuredClone(SAMPLE_DATA)
  d.experience[0].bullets = Array.from({ length: n }, (_, i) => bullet(i))
  return d
}

const toBytes = async (data: ResumeData, scale = 1) => {
  const el = createElement(ResumeDocument, { data, scale }) as ReactElement<DocumentProps>
  return new Uint8Array(await renderToBuffer(el))
}

const renderer = (data: ResumeData) =>
  vi.fn(async (scale: number) => new Blob([await toBytes(data, scale)]))

describe('countPdfPages', () => {
  it('matches the real page count of generated PDFs', async () => {
    expect(countPdfPages(await toBytes(SAMPLE_DATA))).toBe(1)
    expect(countPdfPages(await toBytes(withBullets(14)))).toBe(2)
    expect(countPdfPages(await toBytes(withBullets(60)))).toBe(3)
  })
})

describe('renderFitted', () => {
  it('renders once at normal size when the resume already fits', async () => {
    const render = renderer(withBullets(6))
    const result = await renderFitted(render)
    expect(result).toMatchObject({ pages: 1, scale: 1 })
    expect(render).toHaveBeenCalledTimes(1)
  })

  it('tightens spacing just enough to pull a spilled resume back to one page', async () => {
    const render = renderer(withBullets(14))
    const result = await renderFitted(render)
    expect(result.pages).toBe(1)
    expect(result.scale).toBeLessThan(1)
    expect(result.scale).toBeGreaterThanOrEqual(0.84)
  })

  it('keeps the normal size when nothing makes it fit, instead of shrinking for no gain', async () => {
    const render = renderer(withBullets(60))
    const result = await renderFitted(render)
    expect(result.scale).toBe(1)
    expect(result.pages).toBe(3)
    expect(render).toHaveBeenCalledTimes(4)
  })
})

describe('contact line', () => {
  it('wraps between items without inserting a stray hyphen', async () => {
    const data = structuredClone(SAMPLE_DATA)
    data.contact = {
      location: 'Remote',
      email: 'haidarabbasbalospura@gmail.com',
      phone: '+91 955 861 4908',
      links: [
        { label: 'LinkedIn', url: 'https://linkedin.com/in/haidarabbas-balospura' },
        { label: 'GitHub', url: 'https://github.com/haidarabbas731' },
      ],
    }
    const bytes = await toBytes(data)
    const { text } = await extractPdfText(bytes.buffer.slice(0) as ArrayBuffer)
    expect(text).not.toMatch(/\|\s*-/)
    expect(text).toContain('linkedin.com/in/haidarabbas-balospura')
    expect(text).toContain('github.com/haidarabbas731')
    expect(text).toContain('haidarabbasbalospura@gmail.com')
  }, 20_000)
})
