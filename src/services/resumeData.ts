import type {
  ResumeContact,
  ResumeData,
  ResumeEducation,
  ResumeExtra,
  ResumeJob,
  ResumeLink,
  ResumeProject,
  ResumeSkillGroup,
} from '@/types/resumeData'

export class ResumeParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResumeParseError'
  }
}

// ── Text cleanup ───────────────────────────────────────────────────────────

/** Em dashes make text read as AI-written. Swap them for a comma (a hyphen in date ranges). */
export function cleanText(value: string, isPeriod = false): string {
  return value
    .replace(/\s*—\s*/g, isPeriod ? ' - ' : ', ')
    .replace(/,\s*,/g, ',')
    .trim()
}

const text = (v: unknown, isPeriod = false): string => {
  if (typeof v === 'string') return cleanText(v, isPeriod)
  if (typeof v === 'number') return String(v)
  return ''
}

const optional = (v: unknown, isPeriod = false): string | undefined =>
  text(v, isPeriod) || undefined

const list = (v: unknown): string[] => {
  const items = Array.isArray(v) ? v : typeof v === 'string' ? [v] : []
  return items.map((i) => text(i)).filter(Boolean)
}

const objects = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v)
    ? v.filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
    : []

// ── Normalisation ──────────────────────────────────────────────────────────

function toLinks(v: unknown): ResumeLink[] {
  if (!Array.isArray(v)) return []
  return v
    .map((item): ResumeLink | null => {
      if (typeof item === 'string') {
        const url = text(item)
        return url ? { label: url, url } : null
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>
        const url = text(o.url)
        return url ? { label: text(o.label) || url, url } : null
      }
      return null
    })
    .filter((l): l is ResumeLink => l !== null)
}

function toContact(v: unknown): ResumeContact {
  const o = v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
  return {
    email: optional(o.email),
    phone: optional(o.phone),
    location: optional(o.location),
    links: toLinks(o.links),
  }
}

/** Coerces untrusted model output into a well-formed ResumeData. */
export function normalizeResume(input: unknown): ResumeData {
  if (!input || typeof input !== 'object') {
    throw new ResumeParseError('The AI response was not a resume. Please try again.')
  }
  const o = input as Record<string, unknown>

  const experience: ResumeJob[] = objects(o.experience)
    .map((j) => ({
      company: text(j.company),
      role: text(j.role),
      location: optional(j.location),
      period: text(j.period, true),
      bullets: list(j.bullets),
    }))
    .filter((j) => j.company || j.role)

  const projects: ResumeProject[] = objects(o.projects)
    .map((p) => ({
      name: text(p.name),
      link: optional(p.link),
      period: optional(p.period, true),
      bullets: list(p.bullets),
    }))
    .filter((p) => p.name)

  const skills: ResumeSkillGroup[] = objects(o.skills)
    .map((s) => ({ group: text(s.group), items: list(s.items) }))
    .filter((s) => s.items.length > 0)

  const education: ResumeEducation[] = objects(o.education)
    .map((e) => ({
      school: text(e.school),
      degree: text(e.degree),
      location: optional(e.location),
      period: optional(e.period, true),
      details: list(e.details),
    }))
    .filter((e) => e.school || e.degree)

  const extras: ResumeExtra[] = objects(o.extras)
    .map((x) => ({ title: text(x.title), items: list(x.items) }))
    .filter((x) => x.title && x.items.length > 0)

  const data: ResumeData = {
    name: text(o.name),
    contact: toContact(o.contact),
    summary: optional(o.summary),
    experience,
    projects,
    skills,
    education,
    extras,
  }

  if (!data.name && experience.length === 0 && education.length === 0 && projects.length === 0) {
    throw new ResumeParseError('The AI response did not contain a resume. Please try again.')
  }
  return data
}

// ── Parsing model output ───────────────────────────────────────────────────

/** Pulls the outermost JSON object out of a reply that may have fences or chatter around it. */
export function extractJsonObject(raw: string): string {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start === -1) {
    throw new ResumeParseError('The AI response was not a resume. Please try again.')
  }
  // An object that opens but never closes is a truncated reply
  if (end <= start) {
    throw new ResumeParseError('The AI response was cut off or malformed. Please try again.')
  }
  return stripped.slice(start, end + 1)
}

export function parseResumeJson(raw: string): ResumeData {
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonObject(raw))
  } catch (err) {
    if (err instanceof ResumeParseError) throw err
    throw new ResumeParseError('The AI response was cut off or malformed. Please try again.')
  }
  return normalizeResume(parsed)
}
