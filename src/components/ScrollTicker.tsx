const techs = [
  'PyTorch',
  'LangChain',
  'FastAPI',
  'Kubernetes',
  'Transformers',
  'RAG',
  'MLOps',
  'React',
  'Docker',
  'PostgreSQL',
  'TensorFlow',
  'AWS',
  'GCP',
  'Redis',
  'ONNX',
  'Hugging Face',
  'CI/CD',
  'GraphQL',
  'TypeScript',
  'MLflow',
]

const ScrollTicker = () => (
  <div className="w-full overflow-hidden border-y" style={{ borderColor: 'hsl(var(--border))' }}>
    <div className="flex animate-marquee whitespace-nowrap py-3">
      {[...techs, ...techs].map((tech, i) => (
        <span
          key={i}
          className="mx-6 text-sm tracking-widest uppercase"
          style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}
        >
          {tech} <span style={{ color: 'hsl(var(--primary))' }}>•</span>
        </span>
      ))}
    </div>
  </div>
)

export default ScrollTicker
