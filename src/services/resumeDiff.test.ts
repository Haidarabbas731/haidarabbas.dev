import { describe, expect, it } from 'vitest'
import { SAMPLE_DATA, SAMPLE_SOURCE } from '@/test/fixtures/sampleResume'
import { diffResume, matchedKeywords } from './resumeDiff'

const clone = () => structuredClone(SAMPLE_DATA)

describe('diffResume', () => {
  it('reports a near-copy as unchanged, apart from the two lines the fixture words differently', () => {
    const diff = diffResume(SAMPLE_DATA, SAMPLE_SOURCE)
    // The fixture's summary and its Logwise bullet are phrased slightly differently on purpose
    expect(diff.sections.filter((s) => s.lines.some((l) => l.kind === 'reworded'))).toHaveLength(2)
    expect(diff.stats.added).toBe(0)
    expect(diff.stats.same).toBe(3)
    expect(diff.dropped).toEqual([])
  })

  it('shows the original for a reworded bullet', () => {
    const data = clone()
    data.experience[0].bullets[0] =
      'Designed and operated ETL pipelines in Python and Airflow, processing 2 million events per day.'
    const line = diffResume(data, SAMPLE_SOURCE).sections[1].lines[0]
    expect(line.kind).toBe('reworded')
    expect(line.original).toBe(
      'Built ETL pipelines in Python and Airflow that process 2 million events per day.'
    )
  })

  it('marks a bullet with no counterpart as new', () => {
    const data = clone()
    data.experience[0].bullets.push('Mentored two junior engineers on code review practices.')
    const lines = diffResume(data, SAMPLE_SOURCE).sections[1].lines
    expect(lines.at(-1)?.kind).toBe('new')
  })

  it('lists original bullets that were dropped', () => {
    const data = clone()
    data.experience[0].bullets = data.experience[0].bullets.slice(0, 1)
    const diff = diffResume(data, SAMPLE_SOURCE)
    expect(diff.dropped).toEqual(['Cut nightly batch time by 35% by moving joins into Postgres.'])
    expect(diff.stats.dropped).toBe(1)
  })

  it('matches a bullet that wrapped across two lines in the PDF text', () => {
    const wrapped = SAMPLE_SOURCE.replace(
      '- Built ETL pipelines in Python and Airflow that process 2 million events per day.',
      '- Built ETL pipelines in Python and Airflow that process\n2 million events per day.'
    )
    const diff = diffResume(SAMPLE_DATA, wrapped)
    expect(diff.sections[1].lines.every((l) => l.kind === 'same')).toBe(true)
    expect(diff.dropped).toEqual([])
  })

  it('ignores the hyperlinks the PDF reader appends', () => {
    const withLinks = `${SAMPLE_SOURCE}\n\nLinks in this PDF:\nhttps://github.com/priyanair`
    expect(diffResume(SAMPLE_DATA, withLinks).dropped).toEqual([])
  })

  it('titles each section by role, with company and period underneath', () => {
    const [summary, job] = diffResume(SAMPLE_DATA, SAMPLE_SOURCE).sections
    expect(summary.title).toBe('Summary')
    expect(job.title).toBe('Data Engineer')
    expect(job.subtitle).toBe('Acme Analytics, Jan 2022 - Present')
  })
})

describe('matchedKeywords', () => {
  it('returns skills that the job description also mentions, once each', () => {
    const jd = 'We use Python, Airflow and PostgreSQL daily. Python is a must.'
    expect(matchedKeywords(SAMPLE_DATA, jd)).toEqual(['Python', 'Airflow', 'PostgreSQL'])
  })

  it('matches whole words only, so SQL does not match PostgreSQL', () => {
    expect(matchedKeywords(SAMPLE_DATA, 'Deep PostgreSQL knowledge required')).toEqual([
      'PostgreSQL',
    ])
  })

  it('ignores skills the job does not mention and respects the limit', () => {
    expect(matchedKeywords(SAMPLE_DATA, 'Looking for a Rust developer')).toEqual([])
    expect(matchedKeywords(SAMPLE_DATA, 'python sql airflow fastapi docker react', 2)).toHaveLength(
      2
    )
  })
})
