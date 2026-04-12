import { blogPosts } from '@/data/blog'
import SectionTitle from './SectionTitle'

const Blog = () => (
  <section className="py-16 md:py-20 px-6 max-w-6xl mx-auto">
    <SectionTitle number="06" title="Writing" id="blog" />

    <div className="grid md:grid-cols-3 gap-6">
      {blogPosts.map((post) => (
        <a
          key={post.title}
          href={post.url}
          className="group rounded-lg border p-6 transition-all hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg"
          style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2 py-0.5 text-xs rounded-full border"
              style={{
                borderColor: 'hsl(var(--primary) / 0.3)',
                color: 'hsl(var(--primary))',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {post.tag}
            </span>
            <span
              className="text-xs"
              style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}
            >
              {post.readTime}
            </span>
          </div>
          <h3
            className="text-lg font-bold mb-2 group-hover:text-primary transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {post.title}
          </h3>
          <span
            className="text-xs"
            style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)' }}
          >
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </a>
      ))}
    </div>
  </section>
)

export default Blog
