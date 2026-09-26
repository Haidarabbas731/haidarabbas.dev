import { sections } from '@/data/sections'

const Footer = () => (
  <footer className="border-t border-border py-8 px-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <span className="text-sm font-mono-jb text-muted-foreground">
        © {new Date().getFullYear()} HAIDARABBAS BALOSPURA. All rights reserved.
      </span>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-sm transition-colors hover:text-primary text-muted-foreground font-mono-jb"
          >
            {s.label}
          </a>
        ))}
      </div>

      <span className="text-xs text-muted-foreground">Built with ☕ + curiosity</span>
    </div>
  </footer>
)

export default Footer
