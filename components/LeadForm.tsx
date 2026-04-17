'use client'
import { useState } from 'react'

const SERVICES = [
  'Paid media', 'AI agents', 'Marketing automation', 'SEO',
  'Analytics / tracking', 'Lead gen systems', 'Full retainer', 'Not sure yet',
]

function fmtBudget(n: number) {
  if (n >= 2500000) return '₹25L+'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1) + 'L'
  return '₹' + Math.round(n / 1000) + 'K'
}

export default function LeadForm() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [budget, setBudget] = useState(200000)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [firstName, setFirstName] = useState('')

  function toggleChip(v: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(v) ? next.delete(v) : next.add(v)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = (data.get('name') as string).trim()
    const email = (data.get('email') as string).trim()

    if (!name || !email || !/.+@.+\..+/.test(email)) {
      setErrMsg('✕ Name and a valid email are required.')
      return
    }

    setStatus('sending')
    setErrMsg('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company: data.get('company') || undefined,
          role: data.get('role') || undefined,
          services: [...selected].join(', ') || undefined,
          sector: data.get('sector') || undefined,
          timeline: data.get('timeline') || undefined,
          budget: fmtBudget(budget),
          message: data.get('message') || undefined,
        }),
      })

      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error ?? 'Submit failed')
      }

      setFirstName(name.split(' ')[0])
      setStatus('sent')
    } catch (err) {
      setErrMsg('✕ ' + (err instanceof Error ? err.message : 'Something went wrong.'))
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="success">
        <b>◊ Transmission received</b>
        Thanks {firstName}. I&apos;ll reply from <i>connect@abhinavjha.com</i> within 24 hours with next steps.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row-2">
        <div className="field">
          <label htmlFor="lf-name">Name <span className="req">*</span></label>
          <input id="lf-name" name="name" type="text" placeholder="Your full name" required />
        </div>
        <div className="field">
          <label htmlFor="lf-email">Email <span className="req">*</span></label>
          <input id="lf-email" name="email" type="email" placeholder="you@company.com" required />
        </div>
      </div>

      <div className="row-2">
        <div className="field">
          <label htmlFor="lf-co">Company</label>
          <input id="lf-co" name="company" type="text" placeholder="Company / brand" />
        </div>
        <div className="field">
          <label htmlFor="lf-role">Your role</label>
          <input id="lf-role" name="role" type="text" placeholder="Founder, CMO, etc." />
        </div>
      </div>

      <div className="field">
        <label>What do you need help with? <span className="req">choose any</span></label>
        <div className="chips">
          {SERVICES.map(s => (
            <button
              key={s}
              type="button"
              className={`chip${selected.has(s) ? ' on' : ''}`}
              onClick={() => toggleChip(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="row-2">
        <div className="field">
          <label htmlFor="lf-sector">Sector</label>
          <select id="lf-sector" name="sector">
            <option value="">Select…</option>
            <option>Hospitality</option>
            <option>Education</option>
            <option>Real Estate</option>
            <option>SaaS / AI</option>
            <option>E-commerce</option>
            <option>Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="lf-timeline">Timeline</label>
          <select id="lf-timeline" name="timeline">
            <option value="">Select…</option>
            <option>ASAP (this month)</option>
            <option>Next 1–2 months</option>
            <option>This quarter</option>
            <option>Just exploring</option>
          </select>
        </div>
      </div>

      <div className="field budget">
        <label htmlFor="lf-budget">
          Monthly budget · <span className="out">{fmtBudget(budget)}</span>
        </label>
        <div className="rail">
          <span className="note">₹50K</span>
          <input
            id="lf-budget"
            name="budget"
            type="range"
            min={50000}
            max={2500000}
            step={25000}
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
          />
          <span className="note">₹25L+</span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="lf-msg">The problem, in a few lines</label>
        <textarea id="lf-msg" name="message" rows={3} placeholder="What are you trying to fix, ship, or grow?" />
      </div>

      <div className="btn-row">
        <span className="note" style={{ color: errMsg ? 'var(--accent-2)' : undefined }}>
          {errMsg || '◊ Your info stays between us. No newsletter, no sales funnel.'}
        </span>
        <button className="submit" type="submit" data-cursor="Send" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : <>Send brief <span>↗</span></>}
        </button>
      </div>
    </form>
  )
}
