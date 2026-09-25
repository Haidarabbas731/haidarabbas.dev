export interface ProjectScreenshot {
  /** Path relative to src/assets, e.g. "ragify/ragify-preview-1.png" */
  path: string
  label: string
}

export interface Project {
  title: string
  description: string
  techStack: string[]
  liveUrl: string
  githubUrl: string
  screenshots: ProjectScreenshot[]
}

export const projects: Project[] = [
  {
    title: 'Ragify',
    description:
      'A production RAG app for chatting with your own documents. Upload files, they get chunked and embedded into a vector store, then ask questions and get context-grounded, streamed answers.',
    techStack: ['FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'Milvus', 'Redis', 'Gemini'],
    liveUrl: 'https://ragifyai.netlify.app/',
    githubUrl: 'https://github.com/Haidarabbas731/Ragify',
    screenshots: [
      { path: 'ragify/ragify-preview-1.png', label: 'Landing Page' },
      { path: 'ragify/ragify-preview-2.png', label: 'Dashboard' },
      { path: 'ragify/ragify-preview-3.png', label: 'AI Chat' },
    ],
  },
]
