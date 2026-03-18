import { useState } from "react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b"
      style={{ background: "hsl(var(--background) / 0.7)", borderColor: "hsl(var(--border) / 0.3)" }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="#" className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--primary))" }}>
          HB
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="text-sm tracking-wide transition-colors hover:text-primary"
              style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5" aria-label="Toggle menu">
          <span className={`block w-6 h-0.5 bg-foreground transition-transform ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-foreground transition-transform ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ background: "hsl(var(--background) / 0.95)" }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm tracking-wide" style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
