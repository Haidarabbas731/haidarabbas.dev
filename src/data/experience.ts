export interface Experience {
  company: string
  companyUrl?: string
  role: string
  period: string
  highlights: string[]
}

export const experiences: Experience[] = [
  {
    company: 'Popai Technologies',
    companyUrl: 'https://popai.agency',
    role: 'AI/ML Engineer',
    period: 'Mar 2025 - Present',
    highlights: [
      'Build full-stack software, including products with AI built in',
      'Design and deploy autonomous AI agents for recurring workflows',
      'Fine-tune LLMs for faster, more accurate task handling',
    ],
  },
  {
    company: 'MantiQ Infotech',
    companyUrl: 'https://mantiqinfotech.com/',
    role: 'AI Engineer',
    period: 'Jan 2025 - Mar 2025',
    highlights: [
      'Built full-stack apps with AI features, chatbots and automation',
      'Fine-tuned LLMs for text generation to improve output accuracy',
      'Deployed models to the cloud for scalability',
    ],
  },
  {
    company: 'MantiQ Infotech',
    companyUrl: 'https://mantiqinfotech.com/',
    role: 'Node.js Developer & AI Researcher',
    period: 'July 2023 - Dec 2024',
    highlights: [
      'Built scalable backend services and full-stack applications',
      'Implemented secure authentication and access control for users',
      'Built ML models and integrated AI features into backend systems',
    ],
  },
]
