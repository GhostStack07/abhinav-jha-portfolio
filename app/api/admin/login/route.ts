import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const COOKIE = 'aj_admin'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function makeToken(): string {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret'
  const password = process.env.ADMIN_PASSWORD ?? 'admin'
  return createHmac('sha256', secret).update(password).digest('hex')
}

export async function POST(req: Request) {
  const { password } = await req.json()
  const expected = process.env.ADMIN_PASSWORD ?? 'admin'

  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = makeToken()
  const res = NextResponse.json({ ok: true })

  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })

  return res
}
