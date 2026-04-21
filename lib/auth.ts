export const COOKIE = 'aj_admin'
export const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// Token = SHA-256(password + fixed salt)
// No ADMIN_SECRET needed — just ADMIN_PASSWORD in Railway Variables
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
