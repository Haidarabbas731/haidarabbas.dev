import { describe, expect, it } from 'vitest'
import { SAMPLE_DATA, SAMPLE_SOURCE } from '@/test/fixtures/sampleResume'
import { checkAgainstSource } from './resumeChecks'
import { cleanText, extractJsonObject, parseResumeJson, ResumeParseError } from './resumeData'

describe('cleanText', () => {
  it('turns em dashes into commas, or a hyphen inside date ranges', () => {
    expect(cleanText('Built it — cut cost')).toBe('Built it, cut cost')
    expect(cleanText('Mar 2025 — Present', true)).toBe('Mar 2025 - Present')
  })
})

describe('extractJsonObject', () => {
  it('strips code fences and surrounding chatter', () => {
    expect(extractJsonObject('```json\n{"a":1}\n```')).toBe('{"a":1}')
    expect(extractJsonObject('Here you go: {"a":1} Hope that helps')).toBe('{"a":1}')
  })

  it('rejects text with no object', () => {
    expect(() => extractJsonObject('Sorry, I cannot help')).toThrow(ResumeParseError)
  })
})

describe('parseResumeJson', () => {
  it('round-trips a well-formed resume', () => {
    expect(parseResumeJson(JSON.stringify(SAMPLE_DATA))).toEqual({
      ...SAMPLE_DATA,
      contact: { ...SAMPLE_DATA.contact },
    })
  })

  it('fills defaults for missing sections and drops empty entries', () => {
    const data = parseResumeJson(
      '{"name":"Sam","experience":[{"company":"","role":""},{"company":"Acme","role":"Dev","bullets":"One bullet"}]}'
    )
    expect(data.projects).toEqual([])
    expect(data.contact.links).toEqual([])
    expect(data.experience).toHaveLength(1)
    expect(data.experience[0].bullets).toEqual(['One bullet'])
  })

  it('removes em dashes from every field', () => {
    const data = parseResumeJson(
      JSON.stringify({
        name: 'Sam',
        summary: 'Engineer — builder',
        experience: [
          { company: 'Acme', role: 'Dev', period: 'Jan 2020 — Present', bullets: ['A — B'] },
        ],
      })
    )
    expect(data.summary).toBe('Engineer, builder')
    expect(data.experience[0].period).toBe('Jan 2020 - Present')
    expect(data.experience[0].bullets[0]).toBe('A, B')
  })

  it('rejects JSON that is not a resume', () => {
    expect(() => parseResumeJson('{"foo":1}')).toThrow(ResumeParseError)
    expect(() => parseResumeJson('{"name":')).toThrow(/cut off or malformed/)
  })
})

describe('checkAgainstSource', () => {
  it('has no warnings for a faithful resume', () => {
    expect(checkAgainstSource(SAMPLE_DATA, SAMPLE_SOURCE)).toEqual([])
  })

  it('flags an invented number, year, employer, title, skill and link', () => {
    const tampered = structuredClone(SAMPLE_DATA)
    tampered.experience[0].bullets.push('Reduced costs by 60% across 9 teams.')
    tampered.experience[0].period = 'Jan 2019 - Present'
    tampered.experience[1].company = 'Globex Corporation'
    tampered.experience[1].role = 'Principal Architect'
    tampered.skills[1].items.push('Kubernetes')
    tampered.contact.links.push({ label: 'Site', url: 'https://example.org/priya' })

    const kinds = checkAgainstSource(tampered, SAMPLE_SOURCE).map((w) => `${w.kind}:${w.value}`)
    expect(kinds).toEqual(
      expect.arrayContaining([
        'number:60',
        'number:9',
        'year:2019',
        'company:Globex Corporation',
        'title:Principal Architect',
        'skill:Kubernetes',
        'link:https://example.org/priya',
      ])
    )
  })

  it('tolerates reformatting: number commas, casing and punctuation', () => {
    const data = structuredClone(SAMPLE_DATA)
    data.experience[0].bullets = ['Processed 2,000,000 events per day.']
    data.experience[0].role = 'data engineer'
    const src = `${SAMPLE_SOURCE}\nProcessed 2000000 events`
    expect(checkAgainstSource(data, src)).toEqual([])
  })

  it('accepts a lightly reworded skill when its words are in the original', () => {
    const data = structuredClone(SAMPLE_DATA)
    data.skills[0].items = ['Python scripting', 'SQL']
    expect(checkAgainstSource(data, SAMPLE_SOURCE).map((w) => w.value)).toEqual([
      'Python scripting',
    ])
  })
})
