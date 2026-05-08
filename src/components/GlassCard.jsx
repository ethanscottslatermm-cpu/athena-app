export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  )
}
