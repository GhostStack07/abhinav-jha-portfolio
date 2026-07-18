import { NextRequest, NextResponse } from 'next/server'
import { makeToolToken, TOOL_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const code = process.env.SMART_RESIZE_CODE
  if (!code) {
    return NextResponse.json({ error: 'Access code not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const attempt = typeof body?.code === 'string' ? body.code.trim() : ''

  if (!attempt || attempt !== code) {
    // slow down brute-force guessing
    await new Promise((r) => setTimeout(r, 600))
    return NextResponse.json({ error: 'Wrong code' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  // Session cookie (no maxAge) — unlocks until the browser is closed
  res.cookies.set(TOOL_COOKIE, await makeToolToken(code), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return res
}
