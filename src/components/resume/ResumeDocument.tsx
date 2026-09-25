import { Document, Font, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { toPdfSafe as t } from '@/services/pdfSafeText'
import type { ResumeData } from '@/types/resumeData'

export type PaperSize = 'LETTER' | 'A4'

// Never break a word with a hyphen: it would corrupt emails and URLs for ATS parsers
Font.registerHyphenationCallback((word) => [word])

const INK = '#111111'
const MUTED = '#444444'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.35,
    color: INK,
    paddingTop: 34,
    paddingBottom: 34,
    paddingHorizontal: 40,
  },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 20, lineHeight: 1.2, textAlign: 'center' },
  contact: { fontSize: 9, textAlign: 'center', color: MUTED, marginTop: 4 },
  section: { marginTop: 9 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    borderBottomWidth: 0.75,
    borderBottomColor: INK,
    paddingBottom: 1.5,
    marginBottom: 5,
  },
  entry: { marginBottom: 5 },
  lastEntry: { marginBottom: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique', color: MUTED },
  period: { color: MUTED, fontSize: 9 },
  bullet: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 4 },
  bulletMark: { width: 10 },
  bulletText: { flex: 1 },
  link: { color: MUTED, textDecoration: 'none' },
})

const displayUrl = (url: string) =>
  url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
const hrefOf = (url: string) => (/^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`)

const Bullets = ({ items }: { items: string[] }) => (
  <>
    {items.map((b) => (
      <View key={b} style={styles.bullet} wrap={false}>
        <Text style={styles.bulletMark}>{'•'}</Text>
        <Text style={styles.bulletText}>{t(b)}</Text>
      </View>
    ))}
  </>
)

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{t(title)}</Text>
    {children}
  </View>
)

function ContactLine({ data }: { data: ResumeData }) {
  const { email, phone, location, links } = data.contact
  const parts: ReactNode[] = []
  if (location) parts.push(t(location))
  if (email) {
    parts.push(
      <Link key="email" src={`mailto:${email}`} style={styles.link}>
        {t(email)}
      </Link>
    )
  }
  if (phone) parts.push(t(phone))
  for (const l of links) {
    parts.push(
      <Link key={l.url} src={hrefOf(l.url)} style={styles.link}>
        {t(displayUrl(l.url))}
      </Link>
    )
  }
  if (parts.length === 0) return null
  return (
    <Text style={styles.contact}>
      {parts.map((p, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered list of contact parts
        <Text key={i}>
          {i > 0 ? '  |  ' : ''}
          {p}
        </Text>
      ))}
    </Text>
  )
}

export function ResumeDocument({
  data,
  paper = 'LETTER',
}: {
  data: ResumeData
  paper?: PaperSize
}) {
  return (
    <Document title={t(data.name ? `${data.name} - Resume` : 'Resume')} author={t(data.name)}>
      <Page size={paper} style={styles.page}>
        <Text style={styles.name}>{t(data.name)}</Text>
        <ContactLine data={data} />

        {data.summary ? (
          <Section title="Summary">
            <Text>{t(data.summary)}</Text>
          </Section>
        ) : null}

        {data.experience.length > 0 && (
          <Section title="Experience">
            {data.experience.map((job, i, all) => (
              <View
                key={`${job.company}|${job.role}|${job.period}`}
                style={i === all.length - 1 ? styles.lastEntry : styles.entry}
              >
                {/* The header and first bullet never split from each other across pages */}
                <View wrap={false}>
                  <View style={styles.row}>
                    <Text style={styles.bold}>{t(job.role)}</Text>
                    <Text style={styles.period}>{t(job.period)}</Text>
                  </View>
                  {job.company || job.location ? (
                    <Text style={styles.italic}>
                      {t([job.company, job.location].filter(Boolean).join(', '))}
                    </Text>
                  ) : null}
                  <Bullets items={job.bullets.slice(0, 1)} />
                </View>
                <Bullets items={job.bullets.slice(1)} />
              </View>
            ))}
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section title="Projects">
            {data.projects.map((p, i, all) => (
              <View key={p.name} style={i === all.length - 1 ? styles.lastEntry : styles.entry}>
                <View style={styles.row} wrap={false} minPresenceAhead={30}>
                  <Text>
                    <Text style={styles.bold}>{t(p.name)}</Text>
                    {p.link ? (
                      <Link src={hrefOf(p.link)} style={styles.link}>
                        {`  ${t(displayUrl(p.link))}`}
                      </Link>
                    ) : null}
                  </Text>
                  {p.period ? <Text style={styles.period}>{t(p.period)}</Text> : null}
                </View>
                <Bullets items={p.bullets} />
              </View>
            ))}
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title="Skills">
            {data.skills.map((g) => (
              <Text key={`${g.group}|${g.items.join(',')}`} style={{ marginTop: 1.5 }}>
                {g.group ? <Text style={styles.bold}>{t(g.group)}: </Text> : null}
                {t(g.items.join(', '))}
              </Text>
            ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((e, i, all) => (
              <View
                key={`${e.school}|${e.degree}`}
                style={i === all.length - 1 ? styles.lastEntry : styles.entry}
                wrap={false}
              >
                <View style={styles.row}>
                  <Text style={styles.bold}>{t(e.school)}</Text>
                  {e.period ? <Text style={styles.period}>{t(e.period)}</Text> : null}
                </View>
                <Text style={styles.italic}>
                  {t([e.degree, e.location].filter(Boolean).join(', '))}
                </Text>
                <Bullets items={e.details} />
              </View>
            ))}
          </Section>
        )}

        {data.extras.map((x) => (
          <Section key={x.title} title={x.title}>
            <Bullets items={x.items} />
          </Section>
        ))}
      </Page>
    </Document>
  )
}
