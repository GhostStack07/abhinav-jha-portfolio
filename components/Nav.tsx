'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#about',      num: '01', label: 'About' },
  { href: '#work',       num: '02', label: 'Work' },
  { href: '#experience', num: '03', label: 'Experience' },
  { href: '#stack',      num: '04', label: 'Stack' },
  { href: '#now',        num: '05', label: 'Now' },
  { href: '#start',      num: '06', label: 'Start' },
  { href: '#contact',    num: '07', label: 'Contact' },
]

export default function Nav() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const lbl = document.getElementById('themeLbl')
    if (lbl) lbl.textContent = theme === 'light' ? 'LIGHT' : 'DARK'
  }, [theme])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function close() { setOpen(false) }

  function toggleTheme() {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      <nav className="top">
        {/* Logo */}
        <Link href="#top" className="mark" onClick={close}>
          <b>Abhinav</b> <i>Jha</i><span className="mark-dot" />
        </Link>

        {/* Desktop links */}
        <div className="links">
          {LINKS.map(({ href, num, label }) => (
            <Link key={href} href={href}>
              <span className="num">{num}</span>{label}
            </Link>
          ))}
          <button className="theme" onClick={toggleTheme}>
            <span className="pip" />
            <span id="themeLbl">DARK</span>
          </button>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className={`hamburger${open ? ' open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile overlay — tap backdrop to close */}
      <div className={`mob-menu${open ? ' open' : ''}`} aria-hidden={!open} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
        <button className="mob-close" onClick={close} aria-label="Close menu">×</button>
        <nav className="mob-nav">
          {LINKS.map(({ href, num, label }) => (
            <Link key={href} href={href} className="mob-link" onClick={close}>
              <span className="mob-num">{num}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Theme toggle inside mobile menu */}
        <div className="mob-footer">
          <button className="mob-theme-btn" onClick={toggleTheme}>
            <span className="pip" />
            <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
            <span className="mob-theme-badge">{theme === 'dark' ? 'DARK' : 'LIGHT'}</span>
          </button>
          <Link href="/#contact" className="mob-cta" onClick={close}>
            Start a project <span>↗</span>
          </Link>
        </div>
      </div>
    </>
  )
}
