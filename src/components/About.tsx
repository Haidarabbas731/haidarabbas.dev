import SectionTitle from './SectionTitle'

const About = () => (
  <section className="pt-4 md:pt-8 pb-16 md:pb-20 px-6 max-w-6xl mx-auto">
    <SectionTitle number="01" title="About" id="about" />

    <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
      {/* Terminal Card */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          background: '#111',
          borderColor: 'hsl(var(--primary) / 0.3)',
          boxShadow: '0 0 30px hsl(var(--primary) / 0.1)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          <span className="ml-3 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            about.py
          </span>
        </div>
        {/* Code */}
        <pre className="p-5 text-sm leading-relaxed overflow-x-auto">
          <code>
            <span style={{ color: 'hsl(var(--foreground))' }}>haidar</span>{' '}
            <span style={{ color: 'hsl(var(--primary))' }}>=</span> {'{\n'}
            {'    '}
            <span style={{ color: 'hsl(var(--primary))' }}>"role"</span>:{' '}
            <span style={{ color: '#a5d6a7' }}>"AI/ML Engineer"</span>,{'\n'}
            {'    '}
            <span style={{ color: 'hsl(var(--primary))' }}>"location"</span>:{' '}
            <span style={{ color: '#a5d6a7' }}>"Gujarat, India 🇮🇳"</span>,{'\n'}
            {'    '}
            <span style={{ color: 'hsl(var(--primary))' }}>"focus"</span>: {'['}
            <span style={{ color: '#a5d6a7' }}>"LLMs"</span>,{' '}
            <span style={{ color: '#a5d6a7' }}>"NLP"</span>,{' '}
            <span style={{ color: '#a5d6a7' }}>"Agents"</span>
            {']'},{'\n'}
            {'    '}
            <span style={{ color: 'hsl(var(--primary))' }}>"currently_building"</span>:{' '}
            <span style={{ color: '#a5d6a7' }}>"Autonomous AI systems"</span>,{'\n'}
            {'    '}
            <span style={{ color: 'hsl(var(--primary))' }}>"open_to_work"</span>:{' '}
            <span style={{ color: '#f48fb1' }}>True</span>
            {'\n'}
            {'}'}
            <span className="animate-blink" style={{ color: 'hsl(var(--primary))' }}>
              ▌
            </span>
          </code>
        </pre>
      </div>

      {/* Bio */}
      <div>
        <p
          className="text-lg leading-relaxed mb-4"
          style={{ color: 'hsl(var(--foreground) / 0.85)' }}
        >
          A 21-year-old AI/ML engineer based in Gujarat, India, focused on building production-ready
          AI systems.
        </p>
        <p
          className="text-lg leading-relaxed mb-4"
          style={{ color: 'hsl(var(--foreground) / 0.85)' }}
        >
          I work with large language models, fine-tuning pipelines, and autonomous agents — creating
          systems that integrate into real workflows and operate reliably at scale.
        </p>
        <p className="text-lg leading-relaxed" style={{ color: 'hsl(var(--foreground) / 0.85)' }}>
          My focus is on making AI practical: systems that perform consistently, automate meaningful
          tasks, and hold up in real-world use.
        </p>
      </div>
    </div>
  </section>
)

export default About
