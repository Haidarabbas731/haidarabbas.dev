import { useState } from "react";
import SectionTitle from "./SectionTitle";

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText("haidarabbasbalospura@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
      <SectionTitle number="07" title="Get In Touch" id="contact" />

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-lg mb-6" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
            I build systems that learn. Let's build something worth remembering.
          </p>

          <div className="flex items-center gap-3 mb-6">
            <button onClick={copyEmail}
              className="px-4 py-2 text-sm rounded-md border transition-all hover:border-primary/50"
              style={{ borderColor: "hsl(var(--border))", fontFamily: "var(--font-mono)" }}>
              {copied ? "Copied!" : "haidarabbasbalospura@gmail.com"}
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <input type="text" placeholder="Name"
            className="w-full px-4 py-3 text-sm rounded-md border bg-transparent outline-none focus:border-primary/50 transition-colors"
            style={{ borderColor: "hsl(var(--border))", fontFamily: "var(--font-mono)" }} />
          <input type="email" placeholder="Email"
            className="w-full px-4 py-3 text-sm rounded-md border bg-transparent outline-none focus:border-primary/50 transition-colors"
            style={{ borderColor: "hsl(var(--border))", fontFamily: "var(--font-mono)" }} />
          <textarea placeholder="Message" rows={4}
            className="w-full px-4 py-3 text-sm rounded-md border bg-transparent outline-none focus:border-primary/50 transition-colors resize-none"
            style={{ borderColor: "hsl(var(--border))" }} />
          <button type="submit" className="px-6 py-3 text-sm font-medium rounded-md transition-all"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              fontFamily: "var(--font-mono)",
              boxShadow: "0 0 16px hsl(var(--primary) / 0.25)",
            }}>
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
