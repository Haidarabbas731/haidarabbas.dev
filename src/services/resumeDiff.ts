import type { ResumeData } from '@/types/resumeData'
import { hasPhrase, words } from './textMatch'

export type ChangeKind = 'same' | 'reworded' | 'new'

export interface ChangedLine {
  kind: ChangeKind
  text: string
  /** The closest line in the original resume, when the wording changed. */
  original?: string
}

export interface DiffSection {
  title: string
  subtitle?: string
  lines: ChangedLine[]
}

export interface ResumeDiff {
  sections: DiffSection[]
  /** Bullets from the original resume that no longer appear in the tailored one. */
  dropped: string[]
  stats: { same: number; reworded: number; added: number; dropped: number }
}

const SAME_AT = 0.9
const REWORDED_AT = 0.35
const MAX_WINDOW = 3

const STOPWORDS = new Set(
  'a an the and or of in to for with on by at as is was were are be per from that this into using via'.split(
    ' '
  )
)

const BULLET_MARK = /^\s*[-•*–·▪●◦]\s*/u

const tokens = (s: string): Set<string> => {
  const words = s.toLowerCase().match(/[\p{L}\p{N}+#.]+/gu) ?? []
  return new Set(
    words.map((w) => w.replace(/^\.+|\.+$/g, '')).filter((w) => w && !STOPWORDS.has(w))
  )
}

const jaccard = (a: Set<string>, b: Set<string>): number => {
  if (a.size === 0 || b.size === 0) return 0
  let common = 0
  for (const t of a) if (b.has(t)) common++
  return common / (a.size + b.size - common)
}

interface SourceLine {
  text: string
  tokens: Set<string>
  /** Looks like a bullet or sentence rather than a heading, date or contact line. */
  bulletLike: boolean
}

function readSource(source: string): SourceLine[] {
  // The reader appends the PDF's hyperlinks after the body. They are not resume content.
  const body = source.split(/\n\s*Links in this PDF:/)[0]
  return body
    .split('\n')
    .map((raw): SourceLine | null => {
      const marked = BULLET_MARK.test(raw)
      const text = raw.replace(BULLET_MARK, '').trim()
      if (text.length < 8) return null
      const words = text.split(/\s+/).length
      return {
        text,
        tokens: tokens(text),
        bulletLike: marked || (words >= 8 && /[.!]$/.test(text)),
      }
    })
    .filter((l): l is SourceLine => l !== null)
}

interface Match {
  score: number
  text: string
  used: number[]
}

/** Best match for a tailored line, allowing a wrapped original bullet of up to three lines. */
function bestMatch(target: Set<string>, lines: SourceLine[]): Match {
  let best: Match = { score: 0, text: '', used: [] }
  for (let start = 0; start < lines.length; start++) {
    for (let size = 1; size <= MAX_WINDOW && start + size <= lines.length; size++) {
      const window = lines.slice(start, start + size)
      const merged = new Set<string>()
      for (const l of window) for (const t of l.tokens) merged.add(t)
      const score = jaccard(target, merged)
      if (score > best.score) {
        best = {
          score,
          text: window.map((l) => l.text).join(' '),
          used: window.map((_, i) => start + i),
        }
      }
    }
  }
  return best
}

/** Compares the tailored resume against the text of the original, line by line. */
export function diffResume(data: ResumeData, source: string): ResumeDiff {
  const lines = readSource(source)
  const used = new Set<number>()

  const classify = (text: string): ChangedLine => {
    const match = bestMatch(tokens(text), lines)
    if (match.score >= SAME_AT) {
      for (const i of match.used) used.add(i)
      return { kind: 'same', text }
    }
    if (match.score >= REWORDED_AT) {
      for (const i of match.used) used.add(i)
      return { kind: 'reworded', text, original: match.text }
    }
    return { kind: 'new', text }
  }

  const sections: DiffSection[] = []
  const add = (title: string, items: string[], subtitle?: string) => {
    if (items.length > 0) sections.push({ title, subtitle, lines: items.map(classify) })
  }

  if (data.summary) add('Summary', [data.summary])
  for (const job of data.experience) {
    add(job.role || job.company, job.bullets, [job.company, job.period].filter(Boolean).join(', '))
  }
  for (const p of data.projects) add(p.name, p.bullets, 'Project')
  for (const e of data.education) add(e.school, e.details, e.degree)
  for (const x of data.extras) add(x.title, x.items)

  const dropped = lines.filter((l, i) => l.bulletLike && !used.has(i)).map((l) => l.text)

  const all = sections.flatMap((s) => s.lines)
  return {
    sections,
    dropped,
    stats: {
      same: all.filter((l) => l.kind === 'same').length,
      reworded: all.filter((l) => l.kind === 'reworded').length,
      added: all.filter((l) => l.kind === 'new').length,
      dropped: dropped.length,
    },
  }
}

/** Skills from the tailored resume that the job description also mentions. */
export function matchedKeywords(data: ResumeData, jobDescription: string, limit = 12): string[] {
  const jd = words(jobDescription)
  const seen = new Set<string>()
  const out: string[] = []
  for (const group of data.skills) {
    for (const item of group.items) {
      const key = words(item).join(' ')
      if (!key || seen.has(key) || !hasPhrase(jd, words(item))) continue
      seen.add(key)
      out.push(item)
    }
  }
  return out.slice(0, limit)
}
