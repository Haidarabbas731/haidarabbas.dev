import type { ChangedLine, ResumeDiff } from '@/services/resumeDiff'

interface ChangesViewProps {
  diff: ResumeDiff
  keywords: string[]
}

const REMOVED = { background: 'hsl(var(--destructive) / 0.08)' }
const ADDED = { background: 'hsl(var(--success) / 0.09)' }

/** One diff row: a marker column and the text. The marker is decorative, so the meaning is in sr-only text. */
function Row({
  marker,
  label,
  text,
  style,
  muted,
}: {
  marker: string
  label: string
  text: string
  style?: React.CSSProperties
  muted?: boolean
}) {
  return (
    <li
      className="flex gap-2 rounded-sm px-2 py-1 text-xs leading-relaxed font-mono-jb"
      style={{
        ...style,
        color: muted ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground) / 0.85)',
      }}
    >
      <span aria-hidden="true" className="w-3 shrink-0 select-none opacity-70">
        {marker}
      </span>
      <span className="sr-only">{label}</span>
      <span className="min-w-0 break-words">{text}</span>
    </li>
  )
}

function Line({ line }: { line: ChangedLine }) {
  if (line.kind === 'same') return <Row marker=" " label="Unchanged:" text={line.text} muted />
  return (
    <>
      {line.kind === 'reworded' && line.original && (
        <Row marker="-" label="Original:" text={line.original} style={REMOVED} />
      )}
      <Row
        marker="+"
        label={line.kind === 'new' ? 'New:' : 'Tailored:'}
        text={line.text}
        style={ADDED}
      />
    </>
  )
}

const Stat = ({ n, label }: { n: number; label: string }) => (
  <span className="text-xs font-mono-jb" style={{ color: 'hsl(var(--muted-foreground))' }}>
    <span style={{ color: 'hsl(var(--foreground) / 0.85)' }}>{n}</span> {label}
  </span>
)

/** A code-review style list of what the tailoring changed, computed from the original text. */
export function ChangesView({ diff, keywords }: ChangesViewProps) {
  const { stats } = diff
  return (
    <div
      className="rounded-lg border overflow-y-auto p-4 space-y-5 animate-in fade-in duration-200"
      style={{
        minHeight: '500px',
        maxHeight: '760px',
        borderColor: 'hsl(var(--border) / 0.5)',
        background: 'hsl(var(--card) / 0.3)',
      }}
    >
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Stat n={stats.same} label="unchanged" />
        <Stat n={stats.reworded} label="reworded" />
        <Stat n={stats.added} label="new" />
        <Stat n={stats.dropped} label="removed" />
      </div>

      {keywords.length > 0 && (
        <div className="space-y-2">
          <h2
            className="text-xs uppercase tracking-widest font-mono-jb"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Matches the job
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {keywords.map((k) => (
              <li
                key={k}
                className="px-2 py-0.5 rounded-full border text-xs font-mono-jb"
                style={{
                  color: 'hsl(var(--primary))',
                  borderColor: 'hsl(var(--primary) / 0.3)',
                  background: 'hsl(var(--primary) / 0.06)',
                }}
              >
                {k}
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.sections.map((section) => (
        <section key={`${section.title}|${section.subtitle ?? ''}`} className="space-y-1.5">
          <div>
            <h2 className="text-sm font-bold font-display">{section.title}</h2>
            {section.subtitle && (
              <p className="text-xs font-mono-jb" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {section.subtitle}
              </p>
            )}
          </div>
          <ul className="space-y-1">
            {section.lines.map((line) => (
              <Line key={`${line.kind}:${line.text}`} line={line} />
            ))}
          </ul>
        </section>
      ))}

      {diff.dropped.length > 0 && (
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold font-display">Removed from your original</h2>
          <ul className="space-y-1">
            {diff.dropped.map((text) => (
              <Row key={text} marker="-" label="Removed:" text={text} style={REMOVED} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
