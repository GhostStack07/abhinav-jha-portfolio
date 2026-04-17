import { prisma } from '@/lib/db'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } })
  if (!post) return {}
  return {
    title: post.seoTitle ?? `${post.title} — Abhinav Jha`,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      images: post.seoImage ? [post.seoImage] : post.coverImage ? [post.coverImage] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug, published: true } })
  if (!post) notFound()

  const tags: string[] = (() => { try { return JSON.parse(post.tags) } catch { return [] } })()
  const date = post.publishedAt ?? post.createdAt

  return (
    <main className="blog-post-main">
      <div className="blog-post-nav">
        <Link href="/blog" className="blog-back">← All posts</Link>
        <Link href="/" className="blog-back">abhinavjha.com ↗</Link>
      </div>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt={post.title} className="blog-post-cover" />
      )}

      <article className="blog-post-article">
        <header className="blog-post-header">
          <div className="blog-card-meta">
            <span className="blog-card-date">
              {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {tags.map(t => <span key={t} className="blog-tag">{t}</span>)}
          </div>
          <h1 className="blog-post-title">{post.title}</h1>
          {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}
        </header>

        <div
          className="blog-post-body"
          dangerouslySetInnerHTML={{ __html: mdToHtml(post.content) }}
        />
      </article>

      <div className="blog-post-footer">
        <Link href="/blog" className="adm-btn">← Back to blog</Link>
        <Link href="/#contact" className="adm-btn primary">Work with Abhinav ↗</Link>
      </div>
    </main>
  )
}

function mdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, '<ul>$&</ul>')
    .replace(/\n\n+/g, '\n\n')
    .split('\n\n')
    .map(block => block.startsWith('<') ? block : `<p>${block}</p>`)
    .join('\n')
}
