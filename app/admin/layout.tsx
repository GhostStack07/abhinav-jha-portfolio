import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

const NAV = [
  { href: '/admin', label: 'Leads', icon: '◈' },
  { href: '/admin/blog', label: 'Blog', icon: '✦' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-logo">
          AJ<span className="adm-logo-dot"><span className="adm-dot-core" /><span className="adm-dot-ring" /><span className="adm-dot-ring adm-dot-ring-2" /></span>
        </div>
        <nav className="adm-nav">
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="adm-nav-link">
              <span className="adm-nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <Link href="/" className="adm-nav-link adm-back">← Live site</Link>
          <LogoutButton />
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  )
}
