import { describe, expect, it } from 'vitest'
import { toPdfSafe } from './pdfSafeText'

describe('toPdfSafe', () => {
  it('keeps ordinary Latin text, accents and curly quotes', () => {
    expect(toPdfSafe('José Müller, “résumé” – ok • 100%')).toBe('José Müller, “résumé” – ok • 100%')
  })

  it('transliterates letters that do not decompose', () => {
    expect(toPdfSafe('Łukasiewicz Đorđević')).toBe('Lukasiewicz Dordevic')
  })

  it('strips accents that the standard fonts cannot draw', () => {
    expect(toPdfSafe('Nguyễn Čapek')).toBe('Nguyen Čapek'.replace('Č', 'C'))
  })

  it('replaces non-Latin scripts with a question mark', () => {
    expect(toPdfSafe('会社 Acme')).toBe('?? Acme')
  })

  it('removes invisible characters and normalises odd spaces and hyphens', () => {
    expect(toPdfSafe(`a${String.fromCodePoint(0x200b)}b${String.fromCodePoint(0x2011)}c`)).toBe(
      'ab-c'
    )
    expect(toPdfSafe(`x${String.fromCodePoint(0x202f)}y`)).toBe('x y')
  })
})
