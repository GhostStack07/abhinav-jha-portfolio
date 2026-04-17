import { NextRequest, NextResponse } from 'next/server'

const COOKIE = 'aj_admin'

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret'
  const password = process.env.ADMIN_PASSWORD ?? 'admin'
  const expected = await hmac(secret, password)
  return token === expected
}

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /admin routes (not /admin/login itself)
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE)?.value

  if (!token || !(await verifyToken(token))) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
