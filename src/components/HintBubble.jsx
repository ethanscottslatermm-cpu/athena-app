import { useHint } from '../hooks/useHint'

export default function HintBubble({ hintKey, hints = [] }) {
  const { visible, hint, dismiss, disableAll } = useHint(hintKey, hints)
  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes hintUp {
          from { opacity: 0; transform: translateX(-50%) translateY(14px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: 84,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 380,
        zIndex: 45,
        animation: 'hintUp 0.38s cubic-bezier(0.34,1.4,0.64,1) both',
      }}>
        <div style={{
          background: 'rgba(242,237,232,0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          border: '1px solid rgba(212,160,160,0.38)',
          boxShadow: '0 8px 32px rgba(59,51,48,0.13), 0 1px 4px rgba(59,51,48,0.06)',
          padding: '13px 14px 11px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}>
          {/* Athena avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #D4A0A0 0%, #C4859A 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 1,
            boxShadow: '0 2px 8px rgba(212,160,160,0.35)',
          }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              A
            </span>
          </div>

          {/* Text + actions */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'italic',
              fontSize: 14.5,
              color: '#3B3330',
              lineHeight: 1.52,
              margin: '0 0 10px',
            }}>
              {hint}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={dismiss}
                style={{
                  padding: '5px 16px', borderRadius: 20,
                  background: '#D4A0A0', border: 'none', cursor: 'pointer',
                  fontFamily: 'Cinzel, serif', fontSize: 8,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: '#fff',
                }}
              >
                Got it
              </button>
              <button
                onClick={disableAll}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 12,
                  color: 'rgba(59,51,48,0.38)',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(59,51,48,0.18)',
                }}
              >
                Turn off tips
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
