export class PdfReadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PdfReadError'
  }
}

/** The parts of a pdf.js text item that line building needs. */
export interface PdfTextItem {
  str: string
  /** [scaleX, skewY, skewX, scaleY, x, y] */
  transform: number[]
  width: number
  height: number
}

const MAX_BYTES = 10 * 1024 * 1024
const MAX_PAGES = 6
const MIN_TEXT_LENGTH = 40

/**
 * Rebuilds reading-order lines from positioned text fragments: top to bottom, left to right,
 * with a space wherever there is a visible gap. Two-column layouts are not untangled.
 */
export function buildTextFromItems(items: PdfTextItem[]): string {
  const placed = items
    .filter((i) => i.str.length > 0)
    .map((i) => ({ ...i, x: i.transform[4], y: i.transform[5] }))
    .sort((a, b) => b.y - a.y || a.x - b.x)

  const lines: (typeof placed)[] = []
  for (const item of placed) {
    const line = lines[lines.length - 1]
    const tolerance = Math.max(2, (item.height || 10) * 0.4)
    if (line && Math.abs(line[0].y - item.y) <= tolerance) line.push(item)
    else lines.push([item])
  }

  return lines
    .map((line) => {
      const sorted = [...line].sort((a, b) => a.x - b.x)
      let out = ''
      let prevEnd = Number.NEGATIVE_INFINITY
      for (const item of sorted) {
        const gap = item.x - prevEnd
        const needsSpace =
          out.length > 0 &&
          gap > (item.height || 10) * 0.2 &&
          !/\s$/.test(out) &&
          !/^\s/.test(item.str)
        out += (needsSpace ? ' ' : '') + item.str
        prevEnd = item.x + item.width
      }
      return out.replace(/[ \t]+/g, ' ').trim()
    })
    .filter(Boolean)
    .join('\n')
}

export interface PdfTextResult {
  text: string
  pages: number
  /** Hyperlink targets found in the PDF, which plain text extraction would otherwise lose. */
  links: string[]
}

/** Reads the text and hyperlinks out of a PDF, entirely in the browser. */
export async function extractPdfText(file: File | ArrayBuffer): Promise<PdfTextResult> {
  const buffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer()
  if (buffer.byteLength > MAX_BYTES) {
    throw new PdfReadError('That PDF is larger than 10 MB. Try a smaller file or paste your text.')
  }

  // The legacy build works in older browsers too. The modern build needs very recent JavaScript
  // features (such as Uint8Array.toHex) and would fail to read any PDF on older Chrome and Safari.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  // In a browser, pdf.js needs its worker file. In tests (no Worker) it runs without one.
  if (typeof Worker !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    const { default: workerUrl } = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  }

  const task = pdfjs.getDocument({ data: new Uint8Array(buffer), verbosity: 0 })
  const pageTexts: string[] = []
  const links = new Set<string>()
  let totalPages = 0

  try {
    const doc = await task.promise
    totalPages = doc.numPages
    const pageCount = Math.min(totalPages, MAX_PAGES)

    for (let n = 1; n <= pageCount; n++) {
      const page = await doc.getPage(n)
      const content = await page.getTextContent()
      const items = content.items.filter(
        (i): i is (typeof content.items)[number] & PdfTextItem => 'str' in i
      )
      pageTexts.push(buildTextFromItems(items))

      for (const a of await page.getAnnotations()) {
        if (a.subtype === 'Link' && typeof a.url === 'string') links.add(a.url)
      }
    }
  } catch (err) {
    const name = (err as { name?: string })?.name
    if (name === 'PasswordException') {
      throw new PdfReadError(
        'That PDF is password-protected. Remove the password or paste your text.'
      )
    }
    throw new PdfReadError(
      'That file could not be read as a PDF. Try another file or paste your text.'
    )
  } finally {
    await task.destroy()
  }

  const body = pageTexts.filter(Boolean).join('\n\n')
  if (body.replace(/\s/g, '').length < MIN_TEXT_LENGTH) {
    throw new PdfReadError(
      'No readable text found. This looks like a scanned image. Paste your resume text instead.'
    )
  }

  const linkList = [...links]
  const text = linkList.length ? `${body}\n\nLinks in this PDF:\n${linkList.join('\n')}` : body
  return { text, pages: totalPages, links: linkList }
}
