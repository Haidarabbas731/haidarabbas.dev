export interface Experience {
  company: string
  role: string
  period: string
  highlights: string[]
}

export const experiences: Experience[] = [
  {
    company: 'Popai Technologies',
    role: 'AI/ML Engineer',
    period: 'Mar 2025 — Present',
    highlights: [
      'Designed and deployed 5+ autonomous AI agents using Python and n8n, automating workflow processes that saved an estimated 10 hours of manual work per week',
      'Built and optimized intelligent task-handling systems by fine-tuning LLMs, resulting in a 40% faster processing time for complex queries',
      'Built and fine-tuned LLMs for intelligent task handling',
    ],
  },
  {
    company: 'MantiQ Infotech',
    role: 'AI Engineer',
    period: 'Jan 2025 — Mar 2025',
    highlights: [
      'Fine-tuned LLMs for text generation, enhancing accuracy',
      'Developed AI-driven solutions for chatbots and automation',
      'Deployed models on AWS/GCP for scalability',
    ],
  },
  {
    company: 'MantiQ Infotech',
    role: 'Node.js Developer & AI Researcher',
    period: 'July 2023 — Dec 2024',
    highlights: [
      'Developed backend services using Node.js and Express, optimizing API performance and enhancing system scalability',
      'Integrated MongoDB for efficient and scalable data storage solutions',
      'Implemented JWT/OAuth authentication to ensure secure user access',
      'Conducted AI research and developed machine learning models, integrating AI-driven features into backend systems to enhance automation, data analysis, and user experience',
    ],
  },
]
