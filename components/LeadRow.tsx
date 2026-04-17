'use client'
import { useState } from 'react'

interface Lead {
  id: number
  createdAt: string
  name: string
  email: string
  company?: string | null
  role?: string | null
  services?: string | null
  sector?: string | null
  timeline?: string | null
  budget?: string | null
  message?: string | null
  status: string
  notes?: string | null
}

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'closed', 'spam']

function statusClass(s: string) {
  return `status-pill status-${s}`
}

export default function LeadRow({ lead: initial }: { lead: Lead }) {
  const [lead, setLead] = useState(initial)
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState(initial.notes ?? '')

  async function updateStatus(status: string) {
    setSaving(true)
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    })
    if (res.ok) {
      const updated = await res.json()
      setLead(updated)
      setNotes(updated.notes ?? '')
    }
    setSaving(false)
  }

  async function saveNotes() {
    setSaving(true)
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: lead.status, notes }),
    })
    if (res.ok) {
      const updated = await res.json()
      setLead(updated)
    }
    setSaving(false)
  }

  async function deleteLead() {
    if (!confirm(`Delete lead from ${lead.name}?`)) return
    await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })
    // Reload page to reflect deletion
    window.location.reload()
  }

  const date = new Date(lead.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <>
      <tr>
        <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-faint)' }}>
          #{lead.id}
        </td>
        <td style={{ whiteSpace: 'nowrap', fontSize: 13, color: 'var(--ink-dim)' }}>{date}</td>
        <td>
          <div style={{ fontWeight: 500 }}>{lead.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-dim)', fontFamily: 'var(--mono)' }}>
            {lead.email}
          </div>
        </td>
        <td style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          {lead.company ?? '—'}
        </td>
        <td>
          <select
            className="crm-select"
            value={lead.status}
            onChange={e => updateStatus(e.target.value)}
            disabled={saving}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </td>
        <td style={{ fontSize: 13, color: 'var(--ink-dim)' }}>
          {lead.budget ?? '—'}
        </td>
        <td>
          <button
            className="crm-btn"
            onClick={() => setExpanded(v => !v)}
            style={{ fontSize: 10 }}
          >
            {expanded ? '▲ Less' : '▼ More'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={7} className="crm-row-detail">
            <div className="lead-detail" style={{ marginBottom: 16 }}>
              <div>
                <dt>Services</dt>
                <dd>{lead.services ?? '—'}</dd>
              </div>
              <div>
                <dt>Sector</dt>
                <dd>{lead.sector ?? '—'}</dd>
              </div>
              <div>
                <dt>Timeline</dt>
                <dd>{lead.timeline ?? '—'}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{lead.role ?? '—'}</dd>
              </div>
              {lead.message && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <dt>Message</dt>
                  <dd style={{ whiteSpace: 'pre-wrap' }}>{lead.message}</dd>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 600 }}>
              <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                Notes
              </label>
              <textarea
                className="crm-notes"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add internal notes…"
              />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="crm-btn primary" onClick={saveNotes} disabled={saving}>
                  {saving ? 'Saving…' : 'Save notes'}
                </button>
                <button
                  className="crm-btn"
                  style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  onClick={deleteLead}
                >
                  Delete
                </button>
                <a
                  href={`mailto:${lead.email}?subject=Re: Your brief — ${lead.name}`}
                  className="crm-btn"
                  style={{ color: 'var(--accent-2)', borderColor: 'var(--accent-2)', textDecoration: 'none' }}
                >
                  Reply via email ↗
                </a>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
