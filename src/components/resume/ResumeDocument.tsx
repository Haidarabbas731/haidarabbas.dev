import { Document, Font, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { toPdfSafe as t } from '@/services/pdfSafeText'
import type { ResumeData } from '@/types/resumeData'

export type PaperSize = 'LETTER' | 'A4'

// Never break a word with a hyphen: it would corrupt emails and URLs for ATS parsers
Font.registerHyphenationCallback((word) => [word])

const INK = '#111111'
const MUTED = '#444444'

/** All sizes and spacing scale together, so a long resume can be tightened evenly. */
function makeStyles(k: number) {
  return StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 9.5 * k,
      lineHeight: 1.35,
      color: INK,
      paddingTop: 34 * k,
      paddingBottom: 34 * k * k,
      paddingHorizontal: 40 * k,
    },
    name: { fontFamily: 'Helvetica-Bold', fontSize: 20 * k, lineHeight: 1.2, textAlign: 'center' },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 4 * k,
    },
    contactItem: { flexDirection: 'row' },
    contact: { fontSize: 9 * k, color: MUTED },
    contactSeparator: { fontSize: 9 * k, color: MUTED, marginHorizontal: 6 * k },
    section: { marginTop: 9 * k },
    sectionTitle: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 10.5 * k,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      borderBottomWidth: 0.75,
      borderBottomColor: INK,
      paddingBottom: 1.5 * k * k,
      marginBottom: 5 * k,
    },
    entry: { marginBottom: 5 * k },
    lastEntry: { marginBottom: 0 * k },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    bold: { fontFamily: 'Helvetica-Bold' },
    italic: { fontFamily: 'Helvetica-Oblique', color: MUTED },
    period: { color: MUTED, fontSize: 9 * k },
    bullet: { flexDirection: 'row', marginTop: 1.5 * k, paddingLeft: 4 * k },
    bulletMark: { width: 10 * k },
    bulletText: { flex: 1 },
    link: { color: MUTED, textDecoration: 'none' },
  })
}

type Styles = ReturnType<typeof makeStyles>

const displayUrl = (url: string) =>
  url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
const hrefOf = (url: string) => (/^(https?:|mailto:|tel:)/i.test(url) ? url : `https://${url}`)

const Bullets = ({ items, s }: { items: string[]; s: Styles }) => (
  <>
    {items.map((b) => (
      <View key={b} style={s.bullet} wrap={false}>
        <Text style={s.bulletMark}>{'•'}</Text>
        <Text style={s.bulletText}>{t(b)}</Text>
      </View>
    ))}
  </>
)

const Section = ({ title, s, children }: { title: string; s: Styles; children: ReactNode }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{t(title)}</Text>
    {children}
  </View>
)

function ContactLine({ data, s }: { data: ResumeData; s: Styles }) {
  const { email, phone, location, links } = data.contact
  const parts: ReactNode[] = []
  if (location) parts.push(t(location))
  if (email) {
    parts.push(
      <Link key="email" src={`mailto:${email}`} style={s.link}>
        {t(email)}
      </Link>
    )
  }
  if (phone) parts.push(t(phone))
  for (const l of links) {
    parts.push(
      <Link key={l.url} src={hrefOf(l.url)} style={s.link}>
        {t(displayUrl(l.url))}
      </Link>
    )
  }
  if (parts.length === 0) return null
  // Each item is its own flex child, so a long line wraps between items. Letting the text
  // engine wrap inside one run inserted a stray hyphen before the next item.
  return (
    <View style={s.contactRow}>
      {parts.map((p, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed, ordered list of contact parts
        <View key={i} style={s.contactItem}>
          <Text style={s.contact}>{p}</Text>
          {i < parts.length - 1 ? <Text style={s.contactSeparator}>|</Text> : null}
        </View>
      ))}
    </View>
  )
}

export function ResumeDocument({
  data,
  paper = 'LETTER',
  scale = 1,
}: {
  data: ResumeData
  paper?: PaperSize
  /** 1 is the normal size. Smaller values tighten fonts and spacing evenly. */
  scale?: number
}) {
  const s = makeStyles(scale)
  return (
    <Document title={t(data.name ? `${data.name} - Resume` : 'Resume')} author={t(data.name)}>
      <Page size={paper} style={s.page}>
        <Text style={s.name}>{t(data.name)}</Text>
        <ContactLine data={data} s={s} />

        {data.summary ? (
          <Section s={s} title="Summary">
            <Text>{t(data.summary)}</Text>
          </Section>
        ) : null}

        {data.experience.length > 0 && (
          <Section s={s} title="Experience">
            {data.experience.map((job, i, all) => (
              <View
                key={`${job.company}|${job.role}|${job.period}`}
                style={i === all.length - 1 ? s.lastEntry : s.entry}
              >
                {/* The header and first bullet never split from each other across pages */}
                <View wrap={false}>
                  <View style={s.row}>
                    <Text style={s.bold}>{t(job.role)}</Text>
                    <Text style={s.period}>{t(job.period)}</Text>
                  </View>
                  {job.company || job.location ? (
                    <Text style={s.italic}>
                      {t([job.company, job.location].filter(Boolean).join(', '))}
                    </Text>
                  ) : null}
                  <Bullets s={s} items={job.bullets.slice(0, 1)} />
                </View>
                <Bullets s={s} items={job.bullets.slice(1)} />
              </View>
            ))}
          </Section>
        )}

        {data.projects.length > 0 && (
          <Section s={s} title="Projects">
            {data.projects.map((p, i, all) => (
              <View key={p.name} style={i === all.length - 1 ? s.lastEntry : s.entry}>
                <View style={s.row} wrap={false} minPresenceAhead={30}>
                  <Text>
                    <Text style={s.bold}>{t(p.name)}</Text>
                    {p.link ? (
                      <Link src={hrefOf(p.link)} style={s.link}>
                        {`  ${t(displayUrl(p.link))}`}
                      </Link>
                    ) : null}
                  </Text>
                  {p.period ? <Text style={s.period}>{t(p.period)}</Text> : null}
                </View>
                <Bullets s={s} items={p.bullets} />
              </View>
            ))}
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section s={s} title="Skills">
            {data.skills.map((g) => (
              <Text key={`${g.group}|${g.items.join(',')}`} style={{ marginTop: 1.5 }}>
                {g.group ? <Text style={s.bold}>{t(g.group)}: </Text> : null}
                {t(g.items.join(', '))}
              </Text>
            ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section s={s} title="Education">
            {data.education.map((e, i, all) => (
              <View
                key={`${e.school}|${e.degree}`}
                style={i === all.length - 1 ? s.lastEntry : s.entry}
                wrap={false}
              >
                <View style={s.row}>
                  <Text style={s.bold}>{t(e.school)}</Text>
                  {e.period ? <Text style={s.period}>{t(e.period)}</Text> : null}
                </View>
                <Text style={s.italic}>{t([e.degree, e.location].filter(Boolean).join(', '))}</Text>
                <Bullets s={s} items={e.details} />
              </View>
            ))}
          </Section>
        )}

        {data.extras.map((x) => (
          <Section key={x.title} s={s} title={x.title}>
            <Bullets s={s} items={x.items} />
          </Section>
        ))}
      </Page>
    </Document>
  )
}
