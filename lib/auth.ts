import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const COOKIE = 'aj_admin'
export const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

async function sha256(str: string): Promise<string> {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function makeToken(password: string): Promise<string> {
  return sha256(password + 'aj-admin-salt-2026')
}

export async function verifyToken(token: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD ?? 'admin'
  const expected = await makeToken(password)
  return token === expected
}

// --- Smart Resize tool gate (see proxy.ts) ---
export const TOOL_COOKIE = 'aj_tool'

export async function makeToolToken(code: string): Promise<string> {
  return sha256(code + 'aj-tool-salt-2026')
}

export async function verifyToolToken(token: string): Promise<boolean> {
  const code = process.env.SMART_RESIZE_CODE
  if (!code) return false
  return token === (await makeToolToken(code))
}

// For tool API routes — 401 unless the tool session cookie is valid.
// Mirrors the proxy's fail-open behaviour when no access code is configured.
export async function requireToolAuth(): Promise<NextResponse | null> {
  if (!process.env.SMART_RESIZE_CODE) return null
  const jar = await cookies()
  const token = jar.get(TOOL_COOKIE)?.value
  if (!token || !(await verifyToolToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

// Use in API route handlers — returns 401 response if not authed, null if ok
export async function requireAuth(): Promise<NextResponse | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
