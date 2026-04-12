export interface BlogPost {
  title: string
  date: string
  tag: string
  readTime: string
  url: string
}

export const blogPosts: BlogPost[] = [
  {
    title: 'Why RAG Is Not Enough: Building Reliable LLM Systems',
    date: '2024-12-15',
    tag: 'LLMs',
    readTime: '8 min read',
    url: '#',
  },
  {
    title: 'The MLOps Maturity Model Nobody Talks About',
    date: '2024-10-22',
    tag: 'MLOps',
    readTime: '12 min read',
    url: '#',
  },
  {
    title: 'Designing APIs That ML Engineers Actually Want to Use',
    date: '2024-08-05',
    tag: 'System Design',
    readTime: '6 min read',
    url: '#',
  },
]
