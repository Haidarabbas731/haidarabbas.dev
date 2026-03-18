import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import SectionTitle from "./SectionTitle";

const CONTRIBUTIONS_URL = "https://github-contributions-api.jogruber.de/v4/haidarabbas731?y=last";
const REPOS_URL = "https://api.github.com/users/haidarabbas731/repos?sort=updated&per_page=6";

const getColor = (count: number) => {
  if (count === 0) return "#1a1a1a";
  if (count <= 3) return "#0d4f4f";
  if (count <= 6) return "#00a896";
  return "#00f5d4";
};

const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5", TypeScript: "#3178c6", JavaScript: "#f1e05a",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", C: "#555555",
  "C++": "#f34b7d", HTML: "#e34c26", CSS: "#563d7c", Shell: "#89e051",
  Jupyter: "#DA5B0B", "Jupyter Notebook": "#DA5B0B",
};

interface ContribDay { date: string; count: number; level: number }
interface Repo { name: string; description: string | null; stargazers_count: number; language: string | null; html_url: string }

// Static fallbacks
const fallbackWeeks = Array.from({ length: 52 }, () =>
  Array.from({ length: 7 }, () => ({ count: Math.random() > 0.3 ? Math.floor(Math.random() * 4) : 0, date: "", level: 0 }))
);
const fallbackRepos = [
  { name: "neural-inference-engine", description: "High-perf LLM serving framework", stargazers_count: 2400, language: "Python", html_url: "#" },
  { name: "drift-detector", description: "Automated ML model drift detection toolkit", stargazers_count: 1800, language: "Python", html_url: "#" },
  { name: "prompt-forge", description: "Prompt engineering & testing framework", stargazers_count: 890, language: "TypeScript", html_url: "#" },
];

const groupIntoWeeks = (contributions: ContribDay[]) => {
  const sorted = [...contributions].sort((a, b) => a.date.localeCompare(b.date));
  const last364 = sorted.slice(-364);
  const weeks: ContribDay[][] = [];
  for (let i = 0; i < last364.length; i += 7) {
    weeks.push(last364.slice(i, i + 7));
  }
  return weeks;
};

const OpenSource = () => {
  const [weeks, setWeeks] = useState<{ count: number; date: string }[][] | null>(null);
  const [total, setTotal] = useState(0);
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await fetch(CONTRIBUTIONS_URL);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const allDays: ContribDay[] = data.contributions as Array<{ date: string; count: number; level: number }>;
        setWeeks(groupIntoWeeks(allDays));
        const totalObj: Record<string, number> = data.total;
        setTotal(Object.values(totalObj).reduce((a, b) => a + b, 0));
        setError(false);
      } catch {
        setError(true);
      }
    };

    const fetchRepos = async () => {
      try {
        const res = await fetch(REPOS_URL);
        if (!res.ok) throw new Error();
        setRepos(await res.json());
      } catch {
        // silent
      }
    };

    fetchContributions();
    fetchRepos();
  }, []);

  const displayWeeks = weeks ?? (error ? fallbackWeeks : null);
  const displayRepos = repos ?? (error ? fallbackRepos : null);
  const loading = !displayWeeks;

  return (
    <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
      <SectionTitle number="05" title="Open Source" id="opensource" />

      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <span style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))" }} className="text-sm">
          ▍<strong>{displayWeeks ? total.toLocaleString() : "—"}</strong> contributions in the last year
        </span>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto mb-12">
        {loading ? (
          <div className="inline-flex gap-[3px]">
            {Array.from({ length: 52 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="w-3 h-3 rounded-sm bg-muted animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="inline-flex gap-[3px]">
            {displayWeeks!.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="w-3 h-3 rounded-sm transition-colors"
                    style={{ background: getColor(day.count) }}
                    title={day.date ? `${format(parseISO(day.date), "MMM d")} · ${day.count} contribution${day.count !== 1 ? "s" : ""}` : undefined}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Repo cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {!displayRepos
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5 animate-pulse">
                <div className="h-4 w-2/3 rounded bg-muted mb-3" />
                <div className="h-3 w-full rounded bg-muted mb-2" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            ))
          : displayRepos.map((r) => (
              <a
                key={r.name}
                href={r.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30 block"
              >
                <span className="text-sm font-bold block mb-2" style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>
                  {r.name}
                </span>
                {r.description && (
                  <p className="text-sm mb-3 text-muted-foreground line-clamp-2">{r.description}</p>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                    ⭐ {r.stargazers_count.toLocaleString()}
                  </span>
                  {r.language && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: LANG_COLORS[r.language] ?? "hsl(var(--muted-foreground))" }} />
                      {r.language}
                    </span>
                  )}
                </div>
              </a>
            ))}
      </div>
    </section>
  );
};

export default OpenSource;
