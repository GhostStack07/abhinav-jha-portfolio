import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, role, services, sector, timeline, budget, message } = body

    if (!name || !email || !/.+@.+\..+/.test(email)) {
      return NextResponse.json({ error: 'Name and valid email are required.' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: { name, email, company, role, services, sector, timeline, budget, message },
    })

    // Optional email notification — fires async, never blocks the response
    void sendNotification(lead).catch(err =>
      console.error('[leads] notification failed:', err)
    )

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 })
  } catch (err) {
    console.error('[leads] POST error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(leads)
  } catch (err) {
    console.error('[leads] GET error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

async function sendNotification(lead: {
  id: number
  name: string
  email: string
  company?: string | null
  services?: string | null
  budget?: string | null
}) {
  const smtpHost = process.env.SMTP_HOST
  if (!smtpHost) return // skip if SMTP not configured

  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL ?? 'connect@abhinavjha.com',
    subject: `New brief from ${lead.name}${lead.company ? ` / ${lead.company}` : ''}`,
    text: [
      `New lead #${lead.id} received on abhinavjha.com`,
      '',
      `Name:     ${lead.name}`,
      `Email:    ${lead.email}`,
      `Company:  ${lead.company ?? '—'}`,
      `Services: ${lead.services ?? '—'}`,
      `Budget:   ${lead.budget ?? '—'}`,
      '',
      `View in CRM: ${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/admin`,
    ].join('\n'),
  })
}
