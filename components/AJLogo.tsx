import Link from 'next/link'

interface Props {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AJLogo({ href = '/', size = 'md', className = '' }: Props) {
  const content = (
    <span className={`aj-logo aj-logo--${size} ${className}`}>
      <span className="aj-wordmark">AJ</span>
      <span className="aj-period">.</span>
      <span className="aj-dot" aria-hidden="true">
        <span className="aj-dot-core" />
        <span className="aj-dot-ring" />
        <span className="aj-dot-ring aj-dot-ring-2" />
      </span>
    </span>
  )

  return href ? <Link href={href} className="aj-logo-link">{content}</Link> : content
}
