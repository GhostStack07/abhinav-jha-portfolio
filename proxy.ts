import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE, verifyToolToken, TOOL_COOKIE } from '@/lib/auth'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
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

  if (pathname.startsWith('/tools')) {
    // Gate is off until SMART_RESIZE_CODE is configured
    if (!process.env.SMART_RESIZE_CODE) {
      return NextResponse.next()
    }

    // The unlock page must stay reachable
    if (pathname.startsWith('/tools/unlock')) {
      return NextResponse.next()
    }

    const token = req.cookies.get(TOOL_COOKIE)?.value

    if (!token || !(await verifyToolToken(token))) {
      const unlockUrl = new URL('/tools/unlock', req.url)
      unlockUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(unlockUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/tools/:path*'],
}
