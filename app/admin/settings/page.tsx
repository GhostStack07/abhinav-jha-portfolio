'use client'
import { useEffect, useState } from 'react'

interface Settings {
  gaMeasurementId: string
  metaPixelId: string
  gtmId: string
  customHeadCode: string
  siteTitle: string
  siteDescription: string
  siteOgImage: string
  siteCanonical: string
}

const EMPTY: Settings = {
  gaMeasurementId: '', metaPixelId: '', gtmId: '', customHeadCode: '',
  siteTitle: '', siteDescription: '', siteOgImage: '', siteCanonical: '',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings)
  }, [])

  function set(key: keyof Settings, val: string) {
    setSettings(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="adm-page-header">
        <h1 className="adm-page-title">Settings</h1>
        <button className="adm-btn primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>

      {/* ── Tracking ──────────────────────────── */}
      <section className="adm-card">
        <h2 className="adm-section-title">
          <span className="adm-section-icon">📡</span> Tracking Codes
        </h2>
        <p className="adm-section-desc">Paste your IDs below. Scripts are injected automatically in the &lt;head&gt; on every page.</p>

        <div className="adm-field-grid">
          <Field label="Google Analytics 4 — Measurement ID" hint="Format: G-XXXXXXXXXX">
            <input className="adm-input" placeholder="G-XXXXXXXXXX" value={settings.gaMeasurementId}
              onChange={e => set('gaMeasurementId', e.target.value)} />
          </Field>

          <Field label="Meta Pixel ID" hint="Found in Events Manager → Pixels">
            <input className="adm-input" placeholder="1234567890" value={settings.metaPixelId}
              onChange={e => set('metaPixelId', e.target.value)} />
          </Field>

          <Field label="Google Tag Manager ID" hint="Format: GTM-XXXXXXX (leave blank if using GA4 directly)">
            <input className="adm-input" placeholder="GTM-XXXXXXX" value={settings.gtmId}
              onChange={e => set('gtmId', e.target.value)} />
          </Field>
        </div>

        <Field label="Custom Head Code" hint="Any additional <script> or <link> tags — pasted verbatim into <head>">
          <textarea className="adm-input adm-textarea adm-code" rows={6}
            placeholder={'<!-- e.g. Hotjar, Clarity, custom pixels -->\n<script>...</script>'}
            value={settings.customHeadCode}
            onChange={e => set('customHeadCode', e.target.value)} />
        </Field>
      </section>

      {/* ── Global SEO ────────────────────────── */}
      <section className="adm-card" style={{ marginTop: 24 }}>
        <h2 className="adm-section-title">
          <span className="adm-section-icon">🔍</span> Global SEO
        </h2>
        <p className="adm-section-desc">Default metadata used on pages that don't override it.</p>

        <div className="adm-field-grid">
          <Field label="Site Title" hint="Shown in browser tab and search results">
            <input className="adm-input" placeholder="Abhinav Jha — Digital Marketing & AI Operator"
              value={settings.siteTitle} onChange={e => set('siteTitle', e.target.value)} />
            <CharCount val={settings.siteTitle} max={60} />
          </Field>

          <Field label="Meta Description" hint="Shown in Google search snippets (aim for 150–160 chars)">
            <textarea className="adm-input adm-textarea" rows={3}
              placeholder="Senior digital marketer with 7+ years…"
              value={settings.siteDescription} onChange={e => set('siteDescription', e.target.value)} />
            <CharCount val={settings.siteDescription} max={160} />
          </Field>

          <Field label="OG / Social Image URL" hint="Recommended: 1200×630px. Use a full URL or /assets/og.png">
            <input className="adm-input" placeholder="https://…/og-image.png"
              value={settings.siteOgImage} onChange={e => set('siteOgImage', e.target.value)} />
          </Field>

          <Field label="Canonical URL" hint="Your primary domain, e.g. https://abhinavjha.com">
            <input className="adm-input" placeholder="https://abhinavjha.com"
              value={settings.siteCanonical} onChange={e => set('siteCanonical', e.target.value)} />
          </Field>
        </div>
      </section>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      {hint && <p className="adm-hint">{hint}</p>}
      {children}
    </div>
  )
}

function CharCount({ val, max }: { val: string; max: number }) {
  const n = val.length
  return (
    <span className="adm-charcount" style={{ color: n > max ? '#f87171' : undefined }}>
      {n}/{max}
    </span>
  )
}
