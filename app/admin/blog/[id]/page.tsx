'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import BlogEditor from '@/components/BlogEditor'

export default function EditPostPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetch(`/api/blog/${id}`).then(r => r.json()).then(setPost)
  }, [id])

  async function save(data: Record<string, unknown>) {
    await fetch(`/api/blog/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  if (!post) return <p className="adm-muted" style={{ padding: 40 }}>Loading…</p>
  return <BlogEditor initial={post} onSave={save} />
}
