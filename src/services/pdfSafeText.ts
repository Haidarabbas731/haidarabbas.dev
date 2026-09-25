// PDF's built-in fonts cover Latin text (WinAnsi). Anything else would print as garbage,
// so map look-alikes to safe characters and replace the rest with "?".
// Code points are written as numbers on purpose: several of these characters are invisible.

/** Characters above Latin-1 that WinAnsi still has, such as curly quotes, bullets and the euro. */
const WINANSI_EXTRA = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152,
  0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
  0x0153, 0x017e, 0x0178,
])

const REPLACEMENTS = new Map<number, string>([
  [0x2010, '-'], // hyphen
  [0x2011, '-'], // non-breaking hyphen
  [0x2212, '-'], // minus sign
  [0x202f, ' '], // narrow no-break space
  [0x2009, ' '], // thin space
  [0x2192, '->'], // right arrow
  [0x2713, ''], // check mark
  // Latin letters that do not decompose into a base letter plus an accent
  [0x0141, 'L'],
  [0x0142, 'l'],
  [0x0110, 'D'],
  [0x0111, 'd'],
  [0x0126, 'H'],
  [0x0127, 'h'],
  [0x0131, 'i'],
  [0x0166, 'T'],
  [0x0167, 't'],
])

/** Zero-width characters and the soft hyphen, which should simply disappear. */
const INVISIBLE = new Set([0x200b, 0x200c, 0x200d, 0xfeff, 0x00ad])

const isAllowed = (code: number) =>
  code === 9 ||
  code === 10 ||
  (code >= 32 && code <= 126) ||
  (code >= 160 && code <= 255) ||
  WINANSI_EXTRA.has(code)

/** Makes text safe for the standard PDF fonts. Non-Latin characters become "?". */
export function toPdfSafe(input: string): string {
  let out = ''
  for (const ch of input.normalize('NFC')) {
    const code = ch.codePointAt(0) as number
    const mapped = REPLACEMENTS.get(code)
    if (mapped !== undefined) out += mapped
    else if (INVISIBLE.has(code)) continue
    else if (isAllowed(code)) out += ch
    else {
      const base = ch.normalize('NFD').replace(/\p{M}/gu, '')
      const ok = base.length > 0 && [...base].every((c) => isAllowed(c.codePointAt(0) as number))
      out += ok ? base : '?'
    }
  }
  return out
}
