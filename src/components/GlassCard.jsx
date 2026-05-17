export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl p-4 ${className}`} style={{ background: 'rgba(242,237,232,0.85)', border: '1px solid rgba(196,175,168,0.58)' }}>
      {children}
    </div>
  )
}
