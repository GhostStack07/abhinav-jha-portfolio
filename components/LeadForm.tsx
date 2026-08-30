'use client'
import { useState } from 'react'

export default function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [firstName, setFirstName] = useState('')

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
        <label htmlFor="lf-msg">What are you trying to fix, ship, or grow? <span className="req">*</span></label>
        <textarea id="lf-msg" name="message" rows={4} placeholder="Give me the short version — I'll ask the right questions in my reply." required />
      </div>

      <div className="btn-row">
        <span className="note" style={{ color: errMsg ? '#ef4444' : undefined }}>
          {errMsg || '◊ Your info stays between us. No newsletter, no sales funnel.'}
        </span>
        <button className="submit" type="submit" data-cursor="Send" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : <>Send brief <span>↗</span></>}
        </button>
      </div>
    </form>
  )
}
