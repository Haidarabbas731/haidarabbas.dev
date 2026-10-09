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
  {
    title: 'Plan Generator',
    description:
      'Turn a goal into a plan for every day. Say what you want to learn and how much time you have, and the plan is written block by block while you read it. Chat with it to reshape the plan, undo any change, and keep a daily streak. Bring your own AI key.',
    techStack: ['SvelteKit', 'Svelte 5', 'TypeScript', 'PostgreSQL', 'Redis', 'BullMQ', 'Docker'],
    liveUrl: 'https://plan-generator.haidarabbas.dev',
    githubUrl: 'https://github.com/Haidarabbas731/Plan-Generator',
    screenshots: [
      { path: 'plan-generator/plan-generator-preview-1.png', label: 'Landing Page' },
      { path: 'plan-generator/plan-generator-preview-2.png', label: 'Your Plans' },
      { path: 'plan-generator/plan-generator-preview-3.png', label: 'Plan View' },
      { path: 'plan-generator/plan-generator-preview-4.png', label: 'AI Chat' },
      { path: 'plan-generator/plan-generator-preview-5.png', label: 'New Plan' },
    ],
  },
]
