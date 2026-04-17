import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip the login page itself
  if (pathname.startsWith('/admin/login')) {
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
