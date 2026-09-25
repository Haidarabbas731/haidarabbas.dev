import { describe, expect, it } from 'vitest'
import { BASE_RESUME_LATEX } from '@/data/baseResume'
import { stripEmDashes } from './resumeService'

describe('stripEmDashes', () => {
  it('replaces a spaced em dash with a comma', () => {
    expect(stripEmDashes('Built the API — cut latency by 40\\%')).toBe(
      'Built the API, cut latency by 40\\%'
    )
  })

  it('replaces an unspaced em dash', () => {
    expect(stripEmDashes('fast—reliable')).toBe('fast, reliable')
  })

  it('replaces the LaTeX em dash (---) in a title', () => {
    expect(stripEmDashes('{AI/ML Engineer --- Contractor}')).toBe('{AI/ML Engineer, Contractor}')
  })

  it('drops a dash used as a bullet marker', () => {
    expect(stripEmDashes('\\item — Led the team')).toBe('\\item Led the team')
    expect(stripEmDashes('  — Led the team')).toBe('  Led the team')
  })

  it('turns an empty {—} argument into {-}', () => {
    expect(stripEmDashes('\\cventry{2020}{—}')).toBe('\\cventry{2020}{-}')
  })

  it('leaves en dashes for date ranges and longer dash runs alone', () => {
    expect(stripEmDashes('Mar 2025 -- Present')).toBe('Mar 2025 -- Present')
    expect(stripEmDashes('%----------------')).toBe('%----------------')
    expect(stripEmDashes('well-known and state-of-the-art')).toBe('well-known and state-of-the-art')
  })

  it('keeps the default base resume free of em dashes', () => {
    expect(BASE_RESUME_LATEX).not.toMatch(/—|(?<!-)---(?!-)/)
    expect(stripEmDashes(BASE_RESUME_LATEX)).toBe(BASE_RESUME_LATEX)
  })
})
