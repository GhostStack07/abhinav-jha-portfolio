import Link from 'next/link'

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
          <span className="adm-logo-dot" />
          AJ Admin
        </div>
        <nav className="adm-nav">
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="adm-nav-link">
              <span className="adm-nav-icon">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="adm-nav-link adm-back" style={{ marginTop: 'auto' }}>
          ← Live site
        </Link>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  )
}
