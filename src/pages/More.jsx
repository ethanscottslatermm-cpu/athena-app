import { useNavigate } from 'react-router-dom'

const gold       = '#C9A86C'
const linen      = '#F2EDE8'
const mutedText  = 'rgba(242,237,232,0.45)'
const fontSerif  = "'Cormorant Garamond', serif"
const fontSans   = "'Tenor Sans', sans-serif"
const fontDisplay = "'Cinzel', serif"

const MM = name => `/images/My%20Modules/${encodeURIComponent(name)}.png`

const MODULES = [
  {
    key:   'pilates',
    label: 'Pilates Studio',
    sub:   'Guided sessions & workouts',
    img:   MM('Pilates'),
    to:    '/pilates',
  },
  {
    key:   'nourish',
    label: 'Body Fuel',
    sub:   'Track nutrition & macros',
    img:   MM('Body Fuel'),
    to:    '/nourish',
  },
  {
    key:   'grocery',
    label: 'Grocery',
    sub:   'Build your wellness list',
    img:   MM('Grocery'),
    to:    '/grocery',
  },
  {
    key:   'skin',
    label: 'Skin',
    sub:   'Track skin & environment',
    img:   MM('Skin'),
    to:    '/skin',
  },
  {
    key:   'sleep',
    label: 'Sleep',
    sub:   'Monitor rest & recovery',
    img:   MM('Sleep'),
    to:    '/sleep',
  },
  {
    key:   'community',
    label: 'Community',
    sub:   'Connect & share',
    img:   MM('Community'),
    to:    '/community',
  },
  {
    key:   'athena',
    label: 'Athena AI',
    sub:   'Your personal wellness guide',
    img:   null,
    to:    null,
  },
]

export default function More() {
  const navigate = useNavigate()

  function handleTap(mod) {
    if (mod.key === 'athena') {
      window.dispatchEvent(new CustomEvent('athena:open'))
    } else {
      navigate(mod.to)
    }
  }

  return (
    <div style={{
      minHeight:     '100svh',
      background:    'linear-gradient(180deg, #1E1128 0%, #140A18 100%)',
      overflowY:     'auto',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ padding: 'max(env(safe-area-inset-top, 0px), 52px) 1.25rem 0' }}>
        <p style={{
          fontFamily: fontDisplay, fontSize: 9,
          letterSpacing: '0.28em', textTransform: 'uppercase',
          color: 'rgba(201,168,108,0.6)', margin: '0 0 6px',
        }}>
          All Modules
        </p>
        <p style={{ fontFamily: fontSerif, fontSize: 28, color: linen, margin: 0, letterSpacing: '-0.01em' }}>
          Explore
        </p>
        <p style={{ fontFamily: fontSans, fontSize: 12, color: mutedText, margin: '4px 0 0' }}>
          Your full wellness toolkit
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(201,168,108,0.1)', margin: '1.25rem 1.25rem 0' }} />

      {/* Module grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        padding: '1rem 1.25rem 0',
      }}>
        {MODULES.map(mod => (
          <button
            key={mod.key}
            onClick={() => handleTap(mod)}
            style={{
              position:   'relative',
              borderRadius: 18,
              overflow:   'hidden',
              minHeight:  130,
              border:     mod.img ? '1px solid rgba(201,168,108,0.12)' : '1px solid rgba(201,168,108,0.25)',
              background: mod.img ? 'transparent' : 'linear-gradient(145deg, #2A1A32 0%, #1A0E20 100%)',
              backgroundImage:    mod.img ? `url("${mod.img}")` : 'none',
              backgroundSize:     'cover',
              backgroundPosition: 'center',
              cursor: 'pointer',
              textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Photo gradient overlay */}
            {mod.img && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(14,8,20,0.3) 0%, rgba(14,8,20,0.82) 100%)',
              }} />
            )}

            {/* Athena sparkle */}
            {mod.key === 'athena' && (
              <span style={{
                position: 'absolute', top: 14, right: 14,
                color: gold, fontSize: 22, opacity: 0.5,
                fontFamily: 'serif',
              }}>✦</span>
            )}

            {/* Text content */}
            <div style={{
              position: 'relative',
              padding: '14px 14px 14px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              minHeight: 130,
              boxSizing: 'border-box',
            }}>
              <p style={{
                fontFamily:    fontDisplay,
                fontSize:      8.5,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         gold,
                opacity:       0.85,
                margin:        '0 0 5px',
              }}>
                {mod.label}
              </p>
              <p style={{
                fontFamily: fontSans,
                fontSize:   11,
                color:      'rgba(242,237,232,0.5)',
                margin:     0,
                lineHeight: 1.4,
              }}>
                {mod.sub}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
