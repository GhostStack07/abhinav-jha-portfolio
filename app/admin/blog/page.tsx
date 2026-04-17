'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post { id: number; title: string; slug: string; published: boolean; publishedAt: string | null; createdAt: string; tags: string; excerpt: string | null }

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/blog?all=1')
    setPosts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function togglePublish(post: Post) {
    await fetch(`/api/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    })
    load()
  }

  async function del(post: Post) {
    if (!confirm(`Delete "${post.title}"?`)) return
    await fetch(`/api/blog/${post.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Blog Posts</h1>
        <Link href="/admin/blog/new" className="adm-btn primary">+ New post</Link>
      </div>

      {loading ? <p className="adm-muted">Loading…</p> : posts.length === 0 ? (
        <div className="adm-empty">
          <p>No posts yet.</p>
          <Link href="/admin/blog/new" className="adm-btn primary">Write your first post</Link>
        </div>
      ) : (
        <div className="adm-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/admin/blog/${post.id}`} className="adm-link">{post.title || <em>Untitled</em>}</Link>
                    {post.slug && <span className="adm-slug">/{post.slug}</span>}
                  </td>
                  <td>
                    <span className={`adm-badge ${post.published ? 'published' : 'draft'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="adm-muted">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="adm-row-actions">
                      <Link href={`/admin/blog/${post.id}`} className="adm-action-btn">Edit</Link>
                      <button className="adm-action-btn" onClick={() => togglePublish(post)}>
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      {post.published && (
                        <Link href={`/blog/${post.slug}`} target="_blank" className="adm-action-btn">View ↗</Link>
                      )}
                      <button className="adm-action-btn danger" onClick={() => del(post)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
