'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Nav() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.getElementById('themeLbl')!.textContent = theme === 'light' ? 'LIGHT' : 'DARK'
  }, [theme])

  return (
    <nav className="top">
      <Link href="#top" className="mark">
        <b>Abhinav</b> <i>Jha</i>
      </Link>
      <div className="links">
        <Link href="#about"><span className="num">01</span>About</Link>
        <Link href="#work"><span className="num">02</span>Work</Link>
        <Link href="#experience"><span className="num">03</span>Experience</Link>
        <Link href="#stack"><span className="num">04</span>Stack</Link>
        <Link href="#now"><span className="num">05</span>Now</Link>
        <Link href="#start"><span className="num">06</span>Start</Link>
        <Link href="#contact" className="theme-wrap"><span className="num">07</span>Contact</Link>
        <button
          className="theme"
          onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
        >
          <span className="pip" />
          <span id="themeLbl">DARK</span>
        </button>
      </div>
    </nav>
  )
}
