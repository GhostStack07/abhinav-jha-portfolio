import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'
  try {
    const posts = await prisma.blogPost.findMany({
      where: all ? {} : { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverImage: true, tags: true, published: true,
        publishedAt: true, createdAt: true,
        seoTitle: true, seoDescription: true, seoImage: true,
      },
    })
    return NextResponse.json(posts)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const post = await prisma.blogPost.create({ data: body })
    return NextResponse.json(post, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
