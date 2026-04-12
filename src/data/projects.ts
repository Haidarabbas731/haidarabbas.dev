export interface Project {
  title: string
  description: string
  longDescription: string
  techStack: string[]
  liveUrl: string
  githubUrl: string
  featured: boolean
}

export const projects: Project[] = [
  {
    title: 'NeuralFlow',
    description:
      'Real-time LLM inference API with streaming, RAG pipeline, and observability dashboard.',
    longDescription:
      'Built a production-grade inference service handling 10k+ req/s with sub-200ms P99 latency. Integrated retrieval-augmented generation with vector search and real-time monitoring.',
    techStack: ['Python', 'FastAPI', 'LangChain', 'Redis', 'PostgreSQL', 'Docker', 'Grafana'],
    liveUrl: '#',
    githubUrl: '#',
    featured: true,
  },
  {
    title: 'PixelMind',
    description: 'Multimodal image-text classification system deployed on GCP with 99.2% uptime.',
    longDescription:
      'End-to-end multimodal pipeline processing 50k+ images daily. Fine-tuned CLIP-based models with custom contrastive learning objectives.',
    techStack: ['PyTorch', 'GCP', 'Kubernetes', 'TensorFlow', 'React', 'BigQuery'],
    liveUrl: '#',
    githubUrl: '#',
    featured: false,
  },
  {
    title: 'DataForge',
    description:
      'End-to-end MLOps pipeline with automated retraining, drift detection, and A/B testing.',
    longDescription:
      'Designed an automated ML lifecycle platform reducing model deployment time from weeks to hours. Integrated drift monitoring with automated rollback capabilities.',
    techStack: ['MLflow', 'Airflow', 'AWS', 'Python', 'Docker', 'Weights & Biases'],
    liveUrl: '#',
    githubUrl: '#',
    featured: false,
  },
]
