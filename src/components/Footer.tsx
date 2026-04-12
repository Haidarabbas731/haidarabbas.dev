const navLinks = ['About', 'Skills', 'Projects', 'Experience', 'Contact']

const Footer = () => (
  <footer className="border-t py-8 px-6" style={{ borderColor: 'hsl(var(--border))' }}>
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <span
        className="text-sm"
        style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))' }}
      >
        © {new Date().getFullYear()} HAIDARABBAS BALOSPURA. All rights reserved.
      </span>

      <div className="flex gap-6">
        {navLinks.map((l) => (
          <a
            key={l}
            href={`#${l.toLowerCase()}`}
            className="text-sm transition-colors hover:text-primary"
            style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}
          >
            {l}
          </a>
        ))}
      </div>

      <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground) / 0.6)' }}>
        Built with ☕ + curiosity
      </span>
    </div>
  </footer>
)

export default Footer
