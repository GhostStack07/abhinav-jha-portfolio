'use client'
import { useEffect, useState } from 'react'

export default function Clock() {
  const [time, setTime] = useState('--:--')
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      setTime(`${hh}:${mm} IST`)

      // Flash orange on every new minute
      if (d.getSeconds() === 0) {
        setPulse(true)
        setTimeout(() => setPulse(false), 1200)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      id="clock"
      style={{
        transition: 'color 400ms ease',
        color: pulse ? 'var(--accent)' : undefined,
      }}
    >
      {time}
    </span>
  )
}
