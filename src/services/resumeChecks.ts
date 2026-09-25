import type { ResumeData, ResumeWarning, ResumeWarningKind } from '@/types/resumeData'
import { hasPhrase, words } from './textMatch'

// Compare letters and digits only, so "AI/ML Engineer" matches "AI ML  engineer".
const squash = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

const NUMBER = /(?<![\p{L}\d])\d[\d,]*(?:\.\d+)?/gu
const YEAR = /\b(?:19|20)\d{2}\b/g

const numbersIn = (s: string) => (s.match(NUMBER) ?? []).map((n) => n.replace(/,/g, ''))
const yearsIn = (s: string) => s.match(YEAR) ?? []

const stripUrl = (u: string) =>
  u
    .toLowerCase()
    .replace(/^mailto:/, '')
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/+$/, '')

/**
 * Finds things in the tailored resume that do not appear in the original text:
 * numbers, years, employers, titles, schools, skills and contact details.
 * These are hints for the user to double-check, not proof of a mistake.
 */
export function checkAgainstSource(data: ResumeData, source: string): ResumeWarning[] {
  const sourceSquashed = squash(source)
  const sourceWords = new Set(source.toLowerCase().match(/[\p{L}\p{N}+#.]+/gu) ?? [])
  const sourceNumbers = new Set(numbersIn(source))
  const sourceYears = new Set(yearsIn(source))

  const warnings: ResumeWarning[] = []
  const seen = new Set<string>()
  const warn = (kind: ResumeWarningKind, value: string, message: string) => {
    const key = `${kind}:${value}`
    if (seen.has(key) || !value) return
    seen.add(key)
    warnings.push({ kind, value, message })
  }

  const inSource = (value: string) => {
    const v = squash(value)
    return v.length < 2 || sourceSquashed.includes(v)
  }

  // Skills can be reworded a little (for example "RAG" to "RAG pipelines"), so also accept
  // an item whose every word appears somewhere in the original.
  const sourceWordList = words(source)
  const skillInSource = (item: string) => {
    const itemWords = words(item)
    if (hasPhrase(sourceWordList, itemWords)) return true
    return itemWords.length > 0 && itemWords.every((w) => w.length < 3 || sourceWords.has(w))
  }

  const checkContent = (line: string) => {
    for (const n of numbersIn(line)) {
      if (!sourceNumbers.has(n))
        warn('number', n, `The number ${n} is not in your original resume.`)
    }
  }

  const checkYears = (value?: string) => {
    for (const y of yearsIn(value ?? '')) {
      if (!sourceYears.has(y)) warn('year', y, `The year ${y} is not in your original resume.`)
    }
  }

  const summary = data.summary ?? ''
  checkContent(summary)

  for (const job of data.experience) {
    if (job.company && !inSource(job.company)) {
      warn('company', job.company, `Employer "${job.company}" is not in your original resume.`)
    }
    if (job.role && !inSource(job.role)) {
      warn('title', job.role, `Job title "${job.role}" is not in your original resume.`)
    }
    checkYears(job.period)
    for (const b of job.bullets) checkContent(b)
  }

  for (const p of data.projects) {
    if (!inSource(p.name)) warn('project', p.name, `Project "${p.name}" is not in your original.`)
    if (p.link && !sourceSquashed.includes(squash(stripUrl(p.link)))) {
      warn('link', p.link, `The link ${p.link} is not in your original resume.`)
    }
    checkYears(p.period)
    for (const b of p.bullets) checkContent(b)
  }

  for (const group of data.skills) {
    for (const item of group.items) {
      if (!skillInSource(item)) warn('skill', item, `The skill "${item}" is not in your original.`)
    }
  }

  for (const e of data.education) {
    if (e.school && !inSource(e.school)) {
      warn('school', e.school, `School "${e.school}" is not in your original resume.`)
    }
    if (e.degree && !inSource(e.degree)) {
      warn('degree', e.degree, `Degree "${e.degree}" is not in your original resume.`)
    }
    checkYears(e.period)
    for (const d of e.details) checkContent(d)
  }

  for (const x of data.extras) for (const i of x.items) checkContent(i)

  const { email, phone } = data.contact
  if (email && !sourceSquashed.includes(squash(email))) {
    warn('contact', email, `The email ${email} is not in your original resume.`)
  }
  if (phone && !sourceSquashed.includes(squash(phone))) {
    warn('contact', phone, `The phone number ${phone} is not in your original resume.`)
  }
  for (const link of data.contact.links) {
    if (!sourceSquashed.includes(squash(stripUrl(link.url)))) {
      warn('link', link.url, `The link ${link.url} is not in your original resume.`)
    }
  }

  return warnings
}
