'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'

interface Post {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  coverImage?: string
  tags?: string
  published?: boolean
  seoTitle?: string
  seoDescription?: string
  seoImage?: string
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function BlogEditor({
  initial = {},
  onSave,
}: {
  initial?: Record<string, unknown>
  onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [post, setPost] = useState<Post>({
    title: '', slug: '', excerpt: '', content: '', coverImage: '',
    tags: '[]', published: false, seoTitle: '', seoDescription: '', seoImage: '',
    ...initial,
  })
  const [tab, setTab] = useState<'write' | 'preview' | 'seo'>('write')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [autoSlug, setAutoSlug] = useState(!initial?.slug)

  const set = useCallback((key: keyof Post, val: unknown) => {
    setPost(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }, [])

  function handleTitle(val: string) {
    set('title', val)
    if (autoSlug) set('slug', slugify(val))
  }

  function handleSlug(val: string) {
    setAutoSlug(false)
    set('slug', slugify(val))
  }

  async function save(publish?: boolean) {
    setSaving(true)
    const data: Record<string, unknown> = { ...post }
    if (publish !== undefined) data.published = publish
    if (data.published && !initial?.publishedAt) data.publishedAt = new Date().toISOString()
    await onSave(data)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tagsArr: string[] = (() => {
    try { return JSON.parse(post.tags ?? '[]') } catch { return [] }
  })()

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    const el = e.currentTarget
    if (e.key === 'Enter' && el.value.trim()) {
      set('tags', JSON.stringify([...tagsArr, el.value.trim()]))
      el.value = ''
    }
  }

  function removeTag(t: string) {
    set('tags', JSON.stringify(tagsArr.filter(x => x !== t)))
  }

  return (
    <div className="blog-editor">
      {/* ── Top bar ────────────────────────── */}
      <div className="adm-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/blog" className="adm-back-btn">← Posts</Link>
          <span className={`adm-badge ${post.published ? 'published' : 'draft'}`}>
            {post.published ? 'Published' : 'Draft'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {post.published && post.slug && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="adm-btn">View ↗</Link>
          )}
          {post.published
            ? <button className="adm-btn" onClick={() => save(false)} disabled={saving}>Unpublish</button>
            : <button className="adm-btn primary" onClick={() => save(true)} disabled={saving}>Publish</button>
          }
          <button className="adm-btn" onClick={() => save()} disabled={saving}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save draft'}
          </button>
        </div>
      </div>

      {/* ── Title & slug ───────────────────── */}
      <div className="adm-card be-meta">
        <input
          className="be-title-input"
          placeholder="Post title…"
          value={post.title}
          onChange={e => handleTitle(e.target.value)}
        />
        <div className="be-slug-row">
          <span className="adm-muted">/blog/</span>
          <input
            className="be-slug-input"
            placeholder="auto-generated-slug"
            value={post.slug}
            onChange={e => handleSlug(e.target.value)}
          />
        </div>
        <input
          className="adm-input"
          placeholder="Short excerpt shown in post listings…"
          value={post.excerpt ?? ''}
          onChange={e => set('excerpt', e.target.value)}
        />
      </div>

      {/* ── Tabs ───────────────────────────── */}
      <div className="be-tabs">
        {(['write', 'preview', 'seo'] as const).map(t => (
          <button key={t} className={`be-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'write' ? '✏ Write' : t === 'preview' ? '👁 Preview' : '🔍 SEO'}
          </button>
        ))}
      </div>

      {tab === 'write' && (
        <div className="adm-card be-write">
          <textarea
            className="be-content-area"
            placeholder={"# Start writing in Markdown\n\nUse **bold**, *italic*, [links](url), and more…"}
            value={post.content}
            onChange={e => set('content', e.target.value)}
          />
        </div>
      )}

      {tab === 'preview' && (
        <div className="adm-card be-preview">
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt="Cover" className="be-cover-preview" />
          )}
          <h1 className="be-preview-title">{post.title || 'Untitled'}</h1>
          {post.excerpt && <p className="be-preview-excerpt">{post.excerpt}</p>}
          <div className="be-preview-body" dangerouslySetInnerHTML={{ __html: mdToHtml(post.content ?? '') }} />
        </div>
      )}

      {tab === 'seo' && (
        <div className="adm-card">
          <h2 className="adm-section-title">SEO & Social</h2>
          <p className="adm-section-desc">Overrides the global site defaults for this post.</p>
          <div className="adm-field-grid">
            <div className="adm-field">
              <label className="adm-label">SEO Title</label>
              <p className="adm-hint">Shown in browser tab and Google (50–60 chars)</p>
              <input className="adm-input" placeholder={post.title ?? 'Post title'} value={post.seoTitle ?? ''}
                onChange={e => set('seoTitle', e.target.value)} />
              <span className="adm-charcount" style={{ color: (post.seoTitle?.length ?? 0) > 60 ? '#f87171' : undefined }}>
                {post.seoTitle?.length ?? 0}/60
              </span>
            </div>
            <div className="adm-field">
              <label className="adm-label">Meta Description</label>
              <p className="adm-hint">Shown in Google snippets (150–160 chars)</p>
              <textarea className="adm-input adm-textarea" rows={3} placeholder={post.excerpt ?? 'Short description…'}
                value={post.seoDescription ?? ''} onChange={e => set('seoDescription', e.target.value)} />
              <span className="adm-charcount" style={{ color: (post.seoDescription?.length ?? 0) > 160 ? '#f87171' : undefined }}>
                {post.seoDescription?.length ?? 0}/160
              </span>
            </div>
            <div className="adm-field">
              <label className="adm-label">OG Image URL</label>
              <p className="adm-hint">Shown when shared on social (1200×630px recommended)</p>
              <input className="adm-input" placeholder="https://…/image.png" value={post.seoImage ?? ''}
                onChange={e => set('seoImage', e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar panels ─────────────────── */}
      <div className="be-sidebar-panels">
        <div className="adm-card">
          <h3 className="adm-section-title" style={{ fontSize: 12 }}>Cover Image</h3>
          <input className="adm-input" placeholder="https://… or /assets/…" value={post.coverImage ?? ''}
            onChange={e => set('coverImage', e.target.value)} />
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt="" className="be-cover-thumb" />
          )}
        </div>
        <div className="adm-card">
          <h3 className="adm-section-title" style={{ fontSize: 12 }}>Tags</h3>
          <input className="adm-input" placeholder="Type tag + Enter" onKeyDown={addTag} />
          <div className="be-tags">
            {tagsArr.map(t => (
              <span key={t} className="be-tag">
                {t} <button onClick={() => removeTag(t)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Minimal markdown → HTML (no dependency)
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
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hup])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
}
