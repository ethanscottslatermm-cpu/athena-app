import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [phase, setPhase] = useState('form') // 'form' | 'terms'
  const [termsChecked, setTermsChecked] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [videoFading, setVideoFading] = useState(false)
  const [btnHover, setBtnHover] = useState(false)

  const navDest = useRef('/')
  const loadVideoRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (showVideo && loadVideoRef.current) {
      loadVideoRef.current.play().catch(() => navigate(navDest.current, { replace: true }))
    }
  }, [showVideo])

  async function doAuth() {
    if (!email.trim() || !password.trim() || loading || authed) return
    setLoading(true)
    setError('')
    const { data: { user: authUser }, error: authError } =
      await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      const { data: prof } = await supabase
        .from('profiles').select('preferences').eq('id', authUser.id).single()
      navDest.current = prof?.preferences?.onboarding_done ? '/' : '/onboarding'
      setLoading(false)
      setAuthed(true)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim() || loading || authed) return
    if (!localStorage.getItem('athena_terms_accepted')) {
      setPendingSubmit(true)
      setPhase('terms')
      return
    }
    doAuth()
  }

  function handleAcceptTerms() {
    localStorage.setItem('athena_terms_accepted', '1')
    const proceed = pendingSubmit
    setPendingSubmit(false)
    setPhase('form')
    if (proceed) doAuth()
  }

  return (
    <>
      <style>{`
        @keyframes loginEnter {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wordmarkPulse {
          0%, 100% {
            text-shadow: 0 0 28px rgba(196,133,154,0.14), 0 0 60px rgba(196,133,154,0.06);
            letter-spacing: 0.48em;
          }
          50% {
            text-shadow: 0 0 48px rgba(196,133,154,0.52), 0 0 100px rgba(196,133,154,0.22), 0 0 180px rgba(196,133,154,0.08);
            letter-spacing: 0.50em;
          }
        }
        @keyframes wellnessPulse {
          0%, 100% { opacity: 0.55; text-shadow: none; }
          50%       { opacity: 0.9;  text-shadow: 0 0 10px rgba(196,133,154,0.55), 0 0 22px rgba(196,133,154,0.25); }
        }
        @keyframes taglinePulse {
          0%, 100% { opacity: 0.32; text-shadow: none; }
          50%       { opacity: 0.58; text-shadow: 0 0 12px rgba(255,246,240,0.18), 0 0 28px rgba(196,133,154,0.12); }
        }
        @keyframes eyeGlow {
          0%, 100% { opacity: 0.42; filter: drop-shadow(0 0 0px rgba(196,133,154,0)); }
          50%       { opacity: 0.72; filter: drop-shadow(0 0 5px rgba(196,133,154,0.55)); }
        }
        @keyframes lineBreath {
          0%, 100% {
            background: rgba(196,133,154,0.28);
            box-shadow: 0 0 0px rgba(196,133,154,0);
          }
          50% {
            background: rgba(196,133,154,0.62);
            box-shadow: 0 0 8px 1px rgba(196,133,154,0.32), 0 0 18px 2px rgba(196,133,154,0.13);
          }
        }
        @keyframes btnBreath {
          0%, 100% { box-shadow: 0 0 0px rgba(196,133,154,0); }
          50%       { box-shadow: 0 0 14px rgba(196,133,154,0.24), 0 0 28px rgba(196,133,154,0.09); }
        }
        @keyframes dividerGlow {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.65; }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8);  }
          40%           { opacity: 1;    transform: scale(1.15); }
        }
        @keyframes videoFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes videoFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .a-input {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(255,246,240,0.9);
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          letter-spacing: 0.2em;
          padding: 13px 0;
          width: 100%;
          caret-color: #C4859A;
          -webkit-appearance: none;
        }
        .a-input::placeholder {
          color: rgba(255,246,240,0.28);
          letter-spacing: 0.32em;
          font-size: 11px;
        }
        .a-input:-webkit-autofill,
        .a-input:-webkit-autofill:focus {
          -webkit-text-fill-color: rgba(255,246,240,0.9);
          -webkit-box-shadow: 0 0 0 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        .a-input-wrap {
          position: relative;
        }
        .a-input-wrap::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(196,133,154,0.28);
          box-shadow: 0 0 0px rgba(196,133,154,0);
          animation: lineBreath 5s ease-in-out infinite;
          transition: background 0.35s, box-shadow 0.35s;
          pointer-events: none;
        }
        .a-input-wrap:focus-within::after {
          background: rgba(196,133,154,0.85) !important;
          box-shadow: 0 0 10px 1px rgba(196,133,154,0.42), 0 0 22px 2px rgba(196,133,154,0.18) !important;
          animation: none !important;
        }
        .a-input-wrap--pw::after {
          animation-delay: 1.4s;
        }
        .a-btn {
          animation: btnBreath 6s ease-in-out infinite 1s;
        }
        .a-btn:hover {
          box-shadow: 0 0 18px rgba(196,133,154,0.38), 0 0 36px rgba(196,133,154,0.15) !important;
          animation: none !important;
        }
        .terms-scroll {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(196,133,154,0.3) transparent;
        }
        .terms-scroll::-webkit-scrollbar { width: 3px; }
        .terms-scroll::-webkit-scrollbar-thumb {
          background: rgba(196,133,154,0.3);
          border-radius: 2px;
        }
      `}</style>

      {/* ── Background ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundColor: '#140E0C',
        overflow: 'hidden',
        zIndex: 0,
      }}>
        <img
          src="/login-hero.png"
          alt=""
          aria-hidden
          draggable={false}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: '18% 12%',
            opacity: 0.78,
            filter: 'contrast(1.12) brightness(1.08) saturate(1.15)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
        {/* Top vignette — light, just anchors the sky */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '28%',
          background: 'linear-gradient(to bottom, rgba(16,10,8,0.38) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Right-side vignette — fades the empty mauve background edge */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '42%',
          background: 'linear-gradient(to left, rgba(16,10,8,0.72) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Bottom vignette — deep only in the form zone, lets figure breathe above */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(to top, rgba(16,10,8,0.96) 0%, rgba(16,10,8,0.72) 28%, rgba(16,10,8,0.18) 65%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 10,
          opacity: authed ? 0 : 1,
          transition: 'opacity 0.4s ease',
          pointerEvents: authed ? 'none' : 'auto',
        }}
      >
        {/* ── WELLNESS + ATHENA + tagline — anchored to upper screen ──────────── */}
        <div style={{
          position: 'absolute', top: '7vh', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          animation: 'loginEnter 1s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <svg width="16" height="10" viewBox="0 0 18 12" fill="none" style={{ marginBottom: '10px', animation: 'eyeGlow 5s ease-in-out infinite' }}>
            <ellipse cx="9" cy="6" rx="8.5" ry="5.5" stroke="rgba(196,133,154,0.7)" strokeWidth="0.75"/>
            <circle cx="9" cy="6" r="2" stroke="rgba(196,133,154,0.7)" strokeWidth="0.75"/>
            <circle cx="9" cy="6" r="0.75" fill="rgba(196,133,154,0.7)"/>
          </svg>

          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '11px', letterSpacing: '0.55em',
            color: 'rgba(255,240,228,0.92)',
            margin: '0 0 10px',
            textTransform: 'uppercase',
            textShadow: '0 1px 12px rgba(0,0,0,0.75), 0 0 24px rgba(196,133,154,0.3)',
            animation: 'wellnessPulse 5s ease-in-out infinite 0.8s',
          }}>WELLNESS</p>

          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '46px', fontWeight: 300,
            letterSpacing: '0.48em',
            color: 'rgba(255,248,242,0.98)',
            margin: '0 0 16px',
            lineHeight: 1,
            textShadow: '0 2px 24px rgba(0,0,0,0.65), 0 0 48px rgba(196,133,154,0.18)',
            animation: 'wordmarkPulse 6s ease-in-out infinite',
          }}>ATHENA</h1>

          {/* Tagline — sits directly below ATHENA, above the helmet */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '28px', height: '0.5px',
              background: 'linear-gradient(to right, transparent, rgba(196,133,154,0.6))',
              animation: 'dividerGlow 4s ease-in-out infinite',
            }} />
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic', fontSize: '15px',
              letterSpacing: '0.16em',
              color: 'rgba(255,246,240,0.88)',
              margin: 0,
              textShadow: '0 1px 10px rgba(0,0,0,0.8), 0 0 20px rgba(196,133,154,0.2)',
              animation: 'taglinePulse 7s ease-in-out infinite 2.5s',
            }}>your sacred space</p>
            <div style={{
              width: '28px', height: '0.5px',
              background: 'linear-gradient(to left, transparent, rgba(196,133,154,0.6))',
              animation: 'dividerGlow 4s ease-in-out infinite',
            }} />
          </div>
        </div>

        {/* ── Form — anchored to bottom ─────────────────────────────────────── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 52px)',
          animation: 'loginEnter 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both',
        }}>
        <div style={{ width: '100%', maxWidth: '480px', padding: '0 44px' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="a-input-wrap" style={{ marginBottom: '20px' }}>
              <input
                className="a-input"
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                disabled={loading}
              />
            </div>

            <div className="a-input-wrap a-input-wrap--pw" style={{ marginBottom: '36px' }}>
              <input
                className="a-input"
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                enterKeyHint="go"
                disabled={loading}
              />
            </div>

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: '7px', marginBottom: '16px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    backgroundColor: '#C4859A',
                    animation: `dotPulse 1.1s ease-in-out infinite ${i * 0.18}s`,
                  }} />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic', fontSize: '13px',
                color: 'rgba(196,133,154,0.85)',
                marginBottom: '14px', lineHeight: 1.5,
              }}>{error}</p>
            )}

            {/* ENTER button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              className="a-btn"
              style={{
                width: '100%', padding: '16px 0',
                background: btnHover ? 'rgba(196,133,154,0.08)' : 'transparent',
                border: `1px solid ${btnHover ? 'rgba(196,133,154,0.72)' : 'rgba(196,133,154,0.38)'}`,
                borderRadius: '2px',
                cursor: loading ? 'default' : 'pointer',
                fontFamily: "'Cinzel', serif",
                fontSize: '10px', letterSpacing: '0.44em',
                color: btnHover ? 'rgba(255,246,240,0.95)' : 'rgba(255,246,240,0.7)',
                WebkitAppearance: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              ENTER
            </button>
          </form>

          {/* T&C notice */}
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '11px', letterSpacing: '0.05em',
            color: 'rgba(255,246,240,0.22)',
            textAlign: 'center', marginTop: '22px',
            lineHeight: 1.7,
          }}>
            By continuing you agree to our{' '}
            <span
              onClick={() => { setPendingSubmit(false); setPhase('terms') }}
              style={{
                color: 'rgba(196,133,154,0.55)',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                textDecorationColor: 'rgba(196,133,154,0.35)',
              }}
            >Terms &amp; Conditions</span>
          </p>
        </div>
        </div>
      </div>

      {/* ── Post-login loading video ──────────────────────────────────────── */}
      {showVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: '#F2EDE8',
          animation: videoFading ? 'videoFadeOut 0.7s ease forwards' : 'none',
        }}>
          <video
            ref={loadVideoRef}
            src="/athena-loading.mp4"
            autoPlay muted playsInline preload="auto"
            onEnded={() => {
              setVideoFading(true)
              setTimeout(() => navigate(navDest.current, { replace: true }), 700)
            }}
            onError={() => navigate(navDest.current, { replace: true })}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              animation: 'videoFadeIn 0.9s ease forwards',
            }}
          />
        </div>
      )}

      {/* ── T&C overlay ───────────────────────────────────────────────────── */}
      {phase === 'terms' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '28px 20px',
          background: 'rgba(16,10,8,0.65)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: '360px', maxHeight: '80vh',
            background: 'rgba(244,239,230,0.97)',
            border: '1px solid rgba(196,133,154,0.18)',
            borderRadius: '12px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 16px 72px rgba(0,0,0,0.5)',
          }}>
            <div style={{ padding: '22px 22px 14px', borderBottom: '1px solid rgba(196,133,154,0.15)', flexShrink: 0 }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.3em', color: '#C4859A', marginBottom: '7px' }}>ATHENA</p>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 400, color: '#3B3330', letterSpacing: '0.1em', margin: 0 }}>
                Terms & Conditions
              </h2>
            </div>
            <div className="terms-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px', lineHeight: 1.8, color: '#7A6A65' }}>
                <p style={{ marginBottom: '14px' }}>Welcome to Athena. By accessing or using our platform, you agree to be bound by these Terms &amp; Conditions and our Privacy Policy.</p>
                {[
                  ['1. ACCEPTANCE OF TERMS', 'By creating an account or using the Athena application, you acknowledge that you have read, understood, and agree to these terms.'],
                  ['2. HEALTH INFORMATION', 'Athena provides wellness guidance for informational purposes only. The content is not intended as medical advice.'],
                  ['3. PRIVACY & DATA', 'Your personal health data is encrypted and stored securely. We will never sell your personal information to third parties.'],
                  ['4. USER RESPONSIBILITIES', 'You are responsible for maintaining the confidentiality of your account credentials.'],
                  ['5. MODIFICATIONS', 'Athena reserves the right to modify these terms at any time. Continued use constitutes your acceptance.'],
                ].map(([title, body]) => (
                  <div key={title}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: '#C4859A', marginBottom: '6px', marginTop: '18px' }}>{title}</p>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px 22px 22px', borderTop: '1px solid rgba(196,133,154,0.15)', flexShrink: 0 }}>
              <label
                style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', cursor: 'pointer', marginBottom: '16px' }}
                onClick={() => setTermsChecked(v => !v)}
              >
                <div style={{
                  width: '15px', height: '15px', flexShrink: 0, marginTop: '2px',
                  border: `1px solid ${termsChecked ? '#C4859A' : 'rgba(196,133,154,0.4)'}`,
                  borderRadius: '2px',
                  background: termsChecked ? 'rgba(196,133,154,0.12)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {termsChecked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5l2 2L8 1" stroke="#C4859A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '12px', lineHeight: 1.55, color: '#7A6A65', userSelect: 'none' }}>
                  I agree to the Terms &amp; Conditions and Privacy Policy
                </span>
              </label>
              <button
                onClick={handleAcceptTerms}
                disabled={!termsChecked}
                style={{
                  width: '100%', padding: '12px', background: 'transparent',
                  border: `1px solid ${termsChecked ? '#C4859A' : 'rgba(196,133,154,0.25)'}`,
                  borderRadius: '3px',
                  color: termsChecked ? '#3B3330' : 'rgba(122,106,101,0.35)',
                  fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.32em',
                  cursor: termsChecked ? 'pointer' : 'not-allowed',
                  transition: 'all 0.25s',
                }}
              >CONTINUE</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCESS button ─────────────────────────────────────────────────── */}
      {authed && !showVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.4s ease',
          backgroundColor: 'rgba(16,10,8,0.55)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        }}>
          <button
            onClick={() => setShowVideo(true)}
            style={{
              padding: '13px 40px', background: 'transparent',
              border: '1px solid rgba(255,246,240,0.45)',
              borderRadius: '2px', cursor: 'pointer', WebkitAppearance: 'none',
            }}
          >
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: '12px', letterSpacing: '0.38em', color: 'rgba(255,246,240,0.9)' }}>
              ACCESS
            </span>
          </button>
        </div>
      )}
    </>
  )
}
