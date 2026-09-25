import { describe, expect, it } from 'vitest'
import { buildTextFromItems, type PdfTextItem } from './pdfText'

const item = (str: string, x: number, y: number, width = str.length * 5): PdfTextItem => ({
  str,
  transform: [10, 0, 0, 10, x, y],
  width,
  height: 10,
})

describe('buildTextFromItems', () => {
  it('reads top to bottom, and left to right within a line', () => {
    const text = buildTextFromItems([
      item('World', 75, 700),
      item('Second line', 40, 680),
      item('Hello', 40, 700),
    ])
    expect(text).toBe('Hello World\nSecond line')
  })

  it('joins fragments with no gap and spaces fragments with a gap', () => {
    const text = buildTextFromItems([
      item('Py', 40, 700, 10),
      item('thon', 50, 700, 20),
      item('SQL', 80, 700, 15),
    ])
    expect(text).toBe('Python SQL')
  })

  it('treats slightly different baselines as one line', () => {
    const text = buildTextFromItems([item('Engineer', 40, 700), item('2022', 300, 698)])
    expect(text).toBe('Engineer 2022')
  })

  it('ignores empty fragments and returns an empty string for no items', () => {
    expect(buildTextFromItems([item('', 40, 700)])).toBe('')
    expect(buildTextFromItems([])).toBe('')
  })
})
