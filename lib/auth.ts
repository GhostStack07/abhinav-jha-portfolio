// Shared auth helpers — Web Crypto only (works in both Edge middleware and API routes)

export const COOKIE = 'aj_admin'
export const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function makeToken(password: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(password))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyToken(token: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD ?? 'admin'
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret'
  const expected = await makeToken(password, secret)
  return token === expected
}
