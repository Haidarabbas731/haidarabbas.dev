import { FileText, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface LatexInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function LatexInput({ value, onChange, disabled }: LatexInputProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.tex')) {
      alert('Please upload a .tex file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      onChange(event.target?.result as string)
    }
    reader.readAsText(file)
    // Reset input so same file can be re-uploaded
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="latex-input"
          className="text-sm font-medium font-mono-jb"
          style={{ color: 'hsl(var(--foreground) / 0.8)' }}
        >
          Your LaTeX Resume
        </Label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-all duration-200 disabled:opacity-40 hover:scale-105 font-mono-jb"
          style={{
            borderColor: 'hsl(var(--primary) / 0.3)',
            color: 'hsl(var(--primary))',
            background: 'hsl(var(--primary) / 0.05)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.boxShadow =
              '0 0 12px hsl(var(--primary) / 0.25)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
          }}
        >
          <Upload size={11} />
          Upload .tex
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".tex"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="relative">
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2 z-10 transition-opacity duration-200"
          style={{ color: 'hsl(var(--muted-foreground))', opacity: value ? 0 : 1 }}
        >
          <FileText size={24} className="opacity-30" />
          <span className="text-xs font-mono-jb">Paste your .tex code or upload a file above</span>
        </div>
        <Textarea
          id="latex-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="font-mono-jb text-xs min-h-[160px] resize-none transition-all"
          style={{
            background: 'hsl(var(--card) / 0.4)',
            borderColor: value ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--border) / 0.5)',
            color: 'hsl(var(--foreground) / 0.85)',
          }}
          spellCheck={false}
        />
      </div>
      {value && (
        <div className="flex items-center gap-2">
          <div
            className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border-l-2 font-mono-jb"
            style={{
              borderLeftColor: 'hsl(var(--primary) / 0.5)',
              background: 'hsl(var(--card) / 0.5)',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            <span>{value.split('\n').length} lines</span>
            <span style={{ color: 'hsl(var(--border))' }}>·</span>
            <span>{value.length.toLocaleString()} chars</span>
          </div>
        </div>
      )}
    </div>
  )
}
