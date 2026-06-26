import { useState } from 'react'

export default function GlassCard({ children, className = '', color = '#C4859A' }) {
  const [isHovered, setIsHovered] = useState(false)

  const hoverStyles = {
    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
    boxShadow: isHovered
      ? `0 12px 32px ${color}30, 0 4px 8px rgba(0, 0, 0, 0.08)`
      : '0 2px 8px rgba(0, 0, 0, 0.04)',
    borderColor: isHovered ? `${color}40` : 'rgba(196,175,168,0.4)',
    transition: 'all 0.25s ease',
  }

  return (
    <div
      className={`rounded-2xl p-4 ${className}`}
      style={{
        background: 'rgba(242,237,232,0.85)',
        border: '1px solid rgba(196,175,168,0.4)',
        ...hoverStyles,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  )
}
