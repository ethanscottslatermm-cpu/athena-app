import { usePhase } from '../hooks/usePhase'

const PHASE_DOTS = {
  follicular: '#8FA58C',
  ovulation:  '#C9A86C',
  luteal:     '#E8829A',
  menstrual:  '#7A5A6A',
}

export default function AthenaBriefModal({ brief, onClose }) {
  const { phase } = usePhase()
  const dot = PHASE_DOTS[phase] ?? '#C9A86C'

  function handleTalkToAthena() {
    onClose()
    window.dispatchEvent(new CustomEvent('athena:open'))
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <style>{`
        @keyframes briefSheetUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,14,12,0.55)' }} />

      {/* Sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          background: '#1A0E14',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: '1px solid rgba(201,168,108,0.35)',
          padding: '24px 24px 40px',
          animation: 'briefSheetUp 0.4s ease-out',
          maxHeight: '85svh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 3, borderRadius: 2, background: 'rgba(201,168,108,0.3)', margin: '0 auto 20px' }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 20,
            color: 'rgba(242,237,232,0.35)', fontSize: 22, lineHeight: 1,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >×</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ color: '#C9A86C', fontSize: 14 }}>✦</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(201,168,108,0.7)' }}>
            Your Daily Brief
          </span>
        </div>

        {/* Greeting */}
        {brief.greeting && (
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 20, color: '#F2EDE8', lineHeight: 1.4, marginBottom: 20 }}>
            {brief.greeting}
          </p>
        )}

        <div style={{ height: '1px', background: 'rgba(201,168,108,0.18)', marginBottom: 20 }} />

        {/* Sections */}
        {[
          { label: 'YOUR RHYTHM',    content: brief.rhythm_insight },
          { label: 'NOURISH FOCUS',  content: brief.action_focus   },
          { label: 'INTENTION',      content: brief.intention       },
        ].filter(s => s.content).map(({ label, content }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,108,0.65)' }}>
                {label}
              </span>
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: 'rgba(242,237,232,0.85)', lineHeight: 1.65, margin: 0 }}>
              {content}
            </p>
          </div>
        ))}

        {brief.phase_day && (
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(201,168,108,0.45)', marginBottom: 20 }}>
            {brief.phase_day}
          </p>
        )}

        <div style={{ height: '1px', background: 'rgba(201,168,108,0.18)', marginBottom: 20 }} />

        <button
          onClick={handleTalkToAthena}
          style={{
            width: '100%', padding: '14px',
            border: '1px solid rgba(201,168,108,0.4)',
            borderRadius: 14, background: 'transparent',
            fontFamily: 'Cinzel, serif', fontSize: 10,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#C9A86C', cursor: 'pointer',
          }}
        >
          Talk to Athena →
        </button>
      </div>
    </div>
  )
}
