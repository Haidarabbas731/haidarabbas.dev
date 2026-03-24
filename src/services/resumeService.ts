import type { Provider } from "@/types/resume";

// ── Prompt builder ─────────────────────────────────────────────────────────

function buildPrompt(
  baseLatex: string,
  jobDescription: string,
  additionalNotes: string
): string {
  return `You are a senior technical recruiter and ATS optimization expert with 15+ years tailoring resumes for top tech companies. Your task is to rewrite the provided LaTeX resume so it passes ATS screening and strongly resonates with the human reviewer — all without inventing anything.

════════════════════════════════════════
OUTPUT RULES (non-negotiable)
════════════════════════════════════════
1. Output ONLY the complete, compilable LaTeX source. Zero explanations, zero markdown fences, zero commentary before or after.
2. Preserve every LaTeX command, custom macro, document class, and preamble definition exactly. The document must compile without errors.
3. Do NOT invent experience, skills, metrics, technologies, or achievements. Every claim must already exist in the base resume — you may only reword, reorder, or reframe.
4. Do NOT alter: company names, job titles, dates, institutions, GPA, contact info, or URLs.

════════════════════════════════════════
ATS OPTIMIZATION (apply to every bullet)
════════════════════════════════════════
5. Extract the 10–15 highest-signal keywords and skill phrases from the job description (tools, languages, methodologies, domain terms). Weave them verbatim or near-verbatim into bullet points where the candidate genuinely has that experience.
6. Use the exact job title terminology where applicable (e.g., if the JD says "Machine Learning Engineer", prefer that phrasing over "AI Developer" in the summary).
7. Avoid keyword stuffing — integrate naturally so the bullet still reads fluently.
8. Prioritize hard skills, tools, and quantifiable outcomes over soft-skill language (ATS ignores "team player", "fast learner").

════════════════════════════════════════
CONTENT REWRITING STRATEGY
════════════════════════════════════════
9. Summary / Objective: Rewrite entirely to mirror the role's core requirements in 2–3 tight sentences. Lead with the most relevant title/function, then highlight 2 key differentiators that match the JD.
10. Experience bullets: For each role, reorder bullets so the most JD-relevant achievement comes first. Strengthen weak bullets by adding specificity, action verbs, and measurable impact where the base resume is vague (but only using facts already present).
11. Skills section: Reorder skill groups and individual skills so those most mentioned in the JD appear first. Do not add skills the candidate doesn't have.
12. Projects: Surface the most relevant project(s) first. Tweak descriptions to emphasize the aspect most aligned with the JD (e.g., if JD is about backend scaling, lead with the scale/architecture detail, not the UI).
13. One page constraint: Keep the total document length unchanged. If rewording adds length, trim less-relevant bullets rather than overflow.

════════════════════════════════════════
FORMATTING INTEGRITY
════════════════════════════════════════
14. Keep every \\section, \\subsection, \\cventry, \\item, \\begin/\\end block, and spacing command exactly as structured. Only change text content inside those commands.
15. Do not add, remove, or rename sections.
16. Escape all special LaTeX characters (&, %, $, #, _, {, }) that appear in new text.

════════════════════════════════════════
BASE RESUME (LaTeX source)
════════════════════════════════════════
${baseLatex}

════════════════════════════════════════
JOB DESCRIPTION
════════════════════════════════════════
${jobDescription}

${additionalNotes ? `════════════════════════════════════════\nADDITIONAL NOTES FROM CANDIDATE\n════════════════════════════════════════\n${additionalNotes}\n` : ""}
Now output the complete tailored LaTeX document:`;
}

// ── Clean AI output ────────────────────────────────────────────────────────

function cleanLatex(raw: string): string {
  return raw
    .replace(/^```(?:latex|tex)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
}

// ── Gemini ─────────────────────────────────────────────────────────────────

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
      }),
      signal: AbortSignal.timeout(60_000),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = (err as any)?.error?.message as string | undefined;
    if (response.status === 429) throw new Error("Rate limited by Gemini. Please wait a moment and try again.");
    if (response.status === 401 || response.status === 403) throw new Error("Invalid Gemini API key.");
    throw new Error(`Gemini API error: ${msg ?? "Unknown error"}`);
  }

  const data = await response.json();
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("Gemini returned no candidates. Please retry.");
  }
  if (candidates[0].finishReason === "SAFETY") {
    throw new Error("Content was filtered by safety settings. Try rephrasing the job description.");
  }

  return cleanLatex(candidates[0].content.parts[0].text as string);
}

// ── OpenRouter ─────────────────────────────────────────────────────────────

async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Resume Tailor",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 8192,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = (err as any)?.error?.message as string | undefined;
    if (response.status === 429) throw new Error("Rate limited by OpenRouter. Please wait a moment and try again.");
    if (response.status === 401 || response.status === 403) throw new Error("Invalid OpenRouter API key.");
    throw new Error(`OpenRouter API error: ${msg ?? "Unknown error"}`);
  }

  const data = await response.json();
  const choices = data.choices;
  if (!choices || choices.length === 0) {
    throw new Error("OpenRouter returned no choices. Please retry.");
  }

  return cleanLatex(choices[0].message.content as string);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Provider-agnostic resume tailoring.
 * Routes to the correct AI provider based on the selected provider.
 */
export async function tailorResume(
  provider: Provider,
  apiKey: string,
  model: string,
  baseLatex: string,
  jobDescription: string,
  additionalNotes = ""
): Promise<string> {
  const prompt = buildPrompt(baseLatex, jobDescription, additionalNotes);
  if (provider === "gemini") {
    return callGemini(apiKey, model, prompt);
  }
  return callOpenRouter(apiKey, model, prompt);
}

/**
 * Compile LaTeX to PDF via LaTeX-on-HTTP.
 * Returns a blob URL for the resulting PDF.
 */
export async function compileLaTeX(latexContent: string): Promise<string> {
  const response = await fetch("https://latex.ytotech.com/builds/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      compiler: "pdflatex",
      resources: [{ main: true, content: latexContent }],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    let errorMsg = "LaTeX compilation failed. The LaTeX code may have errors.";
    try {
      const errData = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorMsg = (errData as any).logs ?? (errData as any).error ?? errorMsg;
    } catch { /* ignore parse errors */ }
    throw new Error(errorMsg);
  }

  const pdfBlob = await response.blob();
  return URL.createObjectURL(pdfBlob);
}
