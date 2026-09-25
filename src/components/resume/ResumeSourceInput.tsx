import { FileText, Loader2, Upload, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { extractPdfText } from '@/services/pdfText'
import { LatexInput } from './LatexInput'

/** What the user has provided so far, before they continue. */
export type SourceDraft =
  | { kind: 'text'; text: string; file?: File }
  | { kind: 'latex'; latex: string }

interface ResumeSourceInputProps {
  value: SourceDraft
  onChange: (value: SourceDraft) => void
  disabled?: boolean
}

const linkButton =
  'text-xs underline-offset-4 transition-colors hover:text-primary hover:underline font-mono-jb'

export function ResumeSourceInput({ value, onChange, disabled }: ResumeSourceInputProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const textId = useId()
  const [reading, setReading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pages, setPages] = useState<number | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setError('Please choose a PDF file, or paste your resume text below.')
      return
    }
    setError(null)
    setReading(true)
    try {
      const result = await extractPdfText(file)
      setPages(result.pages)
      onChange({ kind: 'text', text: result.text, file })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That file could not be read.')
    } finally {
      setReading(false)
    }
  }

  function clearFile() {
    setPages(null)
    setError(null)
    onChange({ kind: 'text', text: '' })
  }

  if (value.kind === 'latex') {
    return (
      <div className="space-y-3">
        <LatexInput
          value={value.latex}
          onChange={(latex) => onChange({ kind: 'latex', latex })}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => onChange({ kind: 'text', text: '' })}
          className={linkButton}
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Use a PDF or plain text instead
        </button>
      </div>
    )
  }

  const busy = disabled || reading

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label
          htmlFor={textId}
          className="text-sm font-medium font-mono-jb"
          style={{ color: 'hsl(var(--foreground) / 0.8)' }}
        >
          Your resume
        </Label>
        <button
          type="button"
          onClick={() => onChange({ kind: 'latex', latex: '' })}
          className={linkButton}
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Advanced: use LaTeX
        </button>
      </div>

      {value.file ? (
        <div
          className="flex items-center gap-3 rounded-md border px-3 py-2.5"
          style={{
            background: 'hsl(var(--card) / 0.4)',
            borderColor: 'hsl(var(--primary) / 0.3)',
          }}
        >
          <FileText size={16} style={{ color: 'hsl(var(--primary))' }} aria-hidden="true" />
          <div className="min-w-0 flex-1 text-xs font-mono-jb">
            <div className="truncate" style={{ color: 'hsl(var(--foreground) / 0.85)' }}>
              {value.file.name}
            </div>
            <div style={{ color: 'hsl(var(--muted-foreground))' }}>
              {pages ? `${pages} ${pages === 1 ? 'page' : 'pages'}, read in your browser` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            aria-label="Remove the uploaded PDF"
            disabled={busy}
            className="p-1 rounded transition-colors hover:text-destructive disabled:opacity-40"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          onDragEnter={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void handleFile(e.dataTransfer.files[0])
          }}
          className="w-full flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors duration-150 disabled:opacity-60 hover:border-primary/50"
          style={{
            background: dragging ? 'hsl(var(--primary) / 0.06)' : 'hsl(var(--card) / 0.3)',
            borderColor: dragging ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--border))',
          }}
        >
          {reading ? (
            <Loader2 size={20} className="animate-spin" style={{ color: 'hsl(var(--primary))' }} />
          ) : (
            <Upload size={20} style={{ color: 'hsl(var(--primary) / 0.7)' }} aria-hidden="true" />
          )}
          <span className="text-sm font-mono-jb" style={{ color: 'hsl(var(--foreground) / 0.85)' }}>
            {reading ? 'Reading your PDF...' : 'Drop your resume PDF here, or click to browse'}
          </span>
          <span className="text-xs font-mono-jb" style={{ color: 'hsl(var(--muted-foreground))' }}>
            PDF up to 10 MB. It is read in your browser.
          </span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {error && (
        <p
          role="alert"
          className="text-xs font-mono-jb"
          style={{ color: 'hsl(var(--destructive))' }}
        >
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <span className="text-xs font-mono-jb" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {value.file
            ? 'Check the text below. PDFs can be read out of order, and you can fix anything.'
            : 'Or paste your resume text'}
        </span>
        <Textarea
          id={textId}
          value={value.text}
          onChange={(e) => onChange({ kind: 'text', text: e.target.value, file: value.file })}
          disabled={busy}
          placeholder="Paste your resume here..."
          spellCheck={false}
          className="min-h-[160px] resize-y text-base md:text-sm leading-relaxed font-body"
          style={{
            background: 'hsl(var(--card) / 0.4)',
            borderColor: value.text ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border) / 0.5)',
            color: 'hsl(var(--foreground) / 0.85)',
          }}
        />
      </div>
    </div>
  )
}
