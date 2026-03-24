import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MAX_JD_CHARS = 5000;

interface JobDescriptionInputProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  additionalNotes: string;
  onAdditionalNotesChange: (value: string) => void;
  disabled?: boolean;
}

export function JobDescriptionInput({
  jobDescription,
  onJobDescriptionChange,
  additionalNotes,
  onAdditionalNotesChange,
  disabled,
}: JobDescriptionInputProps) {
  const isOverLimit = jobDescription.length > MAX_JD_CHARS;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="job-description"
            className="text-sm font-medium font-mono-jb"
            style={{ color: "hsl(var(--foreground) / 0.8)" }}
          >
            Job Description
          </Label>
          <span
            className="text-xs font-mono-jb"
            style={{
              color: isOverLimit ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))",
            }}
          >
            {jobDescription.length.toLocaleString()}/{MAX_JD_CHARS.toLocaleString()}
          </span>
        </div>
        <Textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value.slice(0, MAX_JD_CHARS))}
          disabled={disabled}
          placeholder="Paste the full job description here..."
          className="min-h-[220px] resize-none text-sm leading-relaxed transition-all font-body"
          style={{
            background: "hsl(var(--card) / 0.4)",
            borderColor: isOverLimit
              ? "hsl(var(--destructive) / 0.5)"
              : "hsl(var(--border) / 0.5)",
            color: "hsl(var(--foreground) / 0.85)",
          }}
        />
        {/* Progress bar */}
        <div className="h-0.5 w-full rounded-full overflow-hidden" style={{ background: "hsl(var(--border) / 0.4)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((jobDescription.length / MAX_JD_CHARS) * 100, 100)}%`,
              background: isOverLimit ? "hsl(var(--destructive))" : "hsl(var(--primary))",
            }}
          />
        </div>
        {isOverLimit && (
          <p className="text-xs font-mono-jb" style={{ color: "hsl(var(--destructive))" }}>
            Trimmed to {MAX_JD_CHARS} characters for optimal AI performance
          </p>
        )}
      </div>

      {/* Optional divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "hsl(var(--border) / 0.4)" }} />
        <span className="text-[10px] uppercase tracking-widest px-2 font-mono-jb" style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>Optional</span>
        <div className="flex-1 h-px" style={{ background: "hsl(var(--border) / 0.4)" }} />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="additional-notes"
          className="text-sm font-medium font-mono-jb"
          style={{ color: "hsl(var(--foreground) / 0.8)" }}
        >
          Additional Notes{" "}
          <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 400 }}>(optional)</span>
        </Label>
        <Textarea
          id="additional-notes"
          value={additionalNotes}
          onChange={(e) => onAdditionalNotesChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g. Emphasize Python experience, tone down research focus..."
          className="min-h-[80px] resize-none text-sm leading-relaxed transition-all font-body"
          style={{
            background: "hsl(var(--card) / 0.4)",
            borderColor: "hsl(var(--border) / 0.5)",
            color: "hsl(var(--foreground) / 0.85)",
          }}
        />
      </div>
    </div>
  );
}
