'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <button onClick={logout} className="adm-nav-link adm-logout-btn">
      <span className="adm-nav-icon">⏻</span>
      Sign out
    </button>
  )
}
