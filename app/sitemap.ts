import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://abhinavjha.com'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const static_pages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Dynamic blog posts
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
    blogPages = posts.map(post => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // DB not available during static build — skip blog posts
  }

  return [...static_pages, ...blogPages]
}
