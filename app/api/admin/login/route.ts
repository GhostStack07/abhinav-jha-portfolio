import { NextResponse } from 'next/server'
import { makeToken, COOKIE, MAX_AGE } from '@/lib/auth'

export async function POST(req: Request) {
  const { password } = await req.json()
  const expected = process.env.ADMIN_PASSWORD ?? 'admin'

  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = await makeToken(password)
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
