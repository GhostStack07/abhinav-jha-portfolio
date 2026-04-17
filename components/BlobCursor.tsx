'use client'
import { useEffect, useRef } from 'react'

export default function BlobCursor() {
  const blobRef = useRef<HTMLDivElement>(null)
  const capRef = useRef<HTMLSpanElement>(null)
  const pos = useRef({ mx: 0, my: 0, bx: 0, by: 0 })

  useEffect(() => {
    const blob = blobRef.current
    const cap = capRef.current
    if (!blob || !cap) return

    const handleMove = (e: MouseEvent) => {
      pos.current.mx = e.clientX
      pos.current.my = e.clientY
    }

    const handleOver = (e: MouseEvent) => {
      const t = (e.target as Element).closest('[data-cursor], a, button, .case, .email')
      if (t) {
        blob.classList.add('lg')
        const el = t as HTMLElement
        cap.textContent =
          el.dataset?.cursor ||
          (t.matches('.case') ? 'Read' : t.matches('button') ? 'Tap' : 'Open')
      } else {
        blob.classList.remove('lg')
        cap.textContent = ''
      }
    }

    let rafId: number
    const raf = () => {
      pos.current.bx += (pos.current.mx - pos.current.bx) * 0.18
      pos.current.by += (pos.current.my - pos.current.by) * 0.18
      blob.style.transform = `translate(${pos.current.bx}px, ${pos.current.by}px)`
      rafId = requestAnimationFrame(raf)
    }

    pos.current.mx = window.innerWidth / 2
    pos.current.my = window.innerHeight / 2
    pos.current.bx = pos.current.mx
    pos.current.by = pos.current.my

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseover', handleOver)
    rafId = requestAnimationFrame(raf)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="blob" ref={blobRef}>
      <span className="cap" ref={capRef} />
    </div>
  )
}
