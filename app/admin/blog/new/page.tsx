'use client'
import { useRouter } from 'next/navigation'
import BlogEditor from '@/components/BlogEditor'

export default function NewPostPage() {
  const router = useRouter()

  async function create(data: Record<string, unknown>) {
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const post = await res.json()
    router.push(`/admin/blog/${post.id}`)
  }

  return <BlogEditor onSave={create} />
}
