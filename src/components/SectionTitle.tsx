interface SectionTitleProps {
  number: string
  title: string
  id: string
}

const SectionTitle = ({ number, title, id }: SectionTitleProps) => (
  <div id={id} className="relative mb-12 md:mb-16">
    <span
      aria-hidden="true"
      className="absolute -top-8 -left-2 text-[8rem] md:text-[12rem] font-bold leading-none select-none pointer-events-none font-mono-jb"
      style={{ color: 'hsl(var(--primary) / 0.04)' }}
    >
      {number}
    </span>
    <h2 className="relative text-3xl md:text-5xl font-bold font-display">{title}</h2>
  </div>
)

export default SectionTitle
