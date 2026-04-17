'use client'
import { useEffect, useState } from 'react'

const ACCENTS: Record<string, { c: string; c2: string }> = {
  lime:      { c: '#d4ff3a', c2: '#ff5c38' },
  amber:     { c: '#ffb347', c2: '#d4ff3a' },
  vermilion: { c: '#ff5c38', c2: '#d4ff3a' },
  lilac:     { c: '#c9a8ff', c2: '#ffb347' },
  paper:     { c: '#eae5d8', c2: '#d4ff3a' },
}

interface Tweaks {
  theme: 'dark' | 'light'
  accent: keyof typeof ACCENTS
  display: 'serif' | 'sans'
  cursor: 'blob' | 'native'
  highlight: 'on' | 'off'
}

const DEFAULT_TWEAKS: Tweaks = {
  theme: 'dark',
  accent: 'vermilion',
  display: 'serif',
  cursor: 'blob',
  highlight: 'on',
}

export default function TweaksPanel() {
  const [open, setOpen] = useState(false)
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS)

  useEffect(() => {
    applyTweaks(tweaks)
  }, [tweaks])

  function applyTweaks(t: Tweaks) {
    const root = document.documentElement
    const a = ACCENTS[t.accent] ?? ACCENTS.vermilion
    root.style.setProperty('--accent', a.c)
    root.style.setProperty('--accent-2', a.c2)
    root.setAttribute('data-theme', t.theme === 'light' ? 'light' : 'dark')
    const lbl = document.getElementById('themeLbl')
    if (lbl) lbl.textContent = t.theme === 'light' ? 'LIGHT' : 'DARK'
    root.style.setProperty(
      '--serif',
      t.display === 'sans'
        ? 'var(--font-sans), system-ui, sans-serif'
        : "var(--font-serif), 'GT Sectra', Georgia, serif"
    )
    document.body.style.cursor = t.cursor === 'native' ? 'auto' : 'none'
    const blob = document.getElementById('blob')
    if (blob) blob.style.display = t.cursor === 'native' ? 'none' : 'block'
    document.querySelectorAll<HTMLElement>('.hl').forEach(el => {
      if (t.highlight === 'off') {
        el.style.background = 'transparent'
        el.style.padding = '0'
      } else {
        el.style.background = ''
        el.style.padding = ''
      }
    })
  }

  function set<K extends keyof Tweaks>(key: K, val: Tweaks[K]) {
    setTweaks(prev => ({ ...prev, [key]: val }))
  }

  const accentColors = [
    { k: 'lime', bg: '#d4ff3a' },
    { k: 'amber', bg: '#ffb347' },
    { k: 'vermilion', bg: '#ff5c38' },
    { k: 'lilac', bg: '#c9a8ff' },
    { k: 'paper', bg: '#eae5d8' },
  ]

  return (
    <>
      <div className={`tweaks${open ? ' open' : ''}`} role="dialog" aria-label="Tweaks">
        <h5>
          TWEAKS{' '}
          <span className="x" onClick={() => setOpen(false)}>×</span>
        </h5>

        <div className="trow">
          <label>Theme</label>
          <div className="seg">
            {(['dark', 'light'] as const).map(v => (
              <button key={v} className={tweaks.theme === v ? 'on' : ''} onClick={() => set('theme', v)}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="trow">
          <label>Accent</label>
          <div className="sw">
            {accentColors.map(({ k, bg }) => (
              <button
                key={k}
                className={tweaks.accent === k ? 'on' : ''}
                style={{ background: bg }}
                onClick={() => set('accent', k as Tweaks['accent'])}
                aria-label={k}
              />
            ))}
          </div>
        </div>

        <div className="trow">
          <label>Display</label>
          <div className="seg">
            {(['serif', 'sans'] as const).map(v => (
              <button key={v} className={tweaks.display === v ? 'on' : ''} onClick={() => set('display', v)}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="trow">
          <label>Cursor</label>
          <div className="seg">
            {(['blob', 'native'] as const).map(v => (
              <button key={v} className={tweaks.cursor === v ? 'on' : ''} onClick={() => set('cursor', v)}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="trow">
          <label>Highlight</label>
          <div className="seg">
            {(['on', 'off'] as const).map(v => (
              <button key={v} className={tweaks.highlight === v ? 'on' : ''} onClick={() => set('highlight', v)}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!open && (
        <button className="tweaks-btn" onClick={() => setOpen(true)} aria-label="Open tweaks">
          TWEAKS
        </button>
      )}
    </>
  )
}
