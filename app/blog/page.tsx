import { prisma } from '@/lib/db'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog — Abhinav Jha',
  description: 'Thoughts on digital marketing, AI automation, and building systems that scale.',
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, tags: true, publishedAt: true, createdAt: true },
  })

  return (
    <main className="blog-main">
      <div className="blog-header">
        <Link href="/" className="blog-back">← abhinavjha.com</Link>
        <div className="eyebrow" style={{ marginTop: 32 }}>
          <span className="pip" />
          <span>Writing</span>
          <span className="rule" />
          <span>{posts.length} posts</span>
        </div>
        <h1 className="blog-page-title">Blog</h1>
        <p className="blog-page-sub">Marketing, AI, automation — and how they connect.</p>
      </div>

      {posts.length === 0 ? (
        <div className="blog-empty">
          <p>No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map(post => {
            const tags: string[] = (() => { try { return JSON.parse(post.tags) } catch { return [] } })()
            const date = post.publishedAt ?? post.createdAt
            return (
              <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt={post.title} className="blog-card-cover" />
                )}
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span className="blog-card-date">
                      {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {tags.slice(0, 3).map(t => <span key={t} className="blog-tag">{t}</span>)}
                  </div>
                  <h2 className="blog-card-title">{post.title}</h2>
                  {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                  <span className="blog-card-cta">Read →</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
