import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [phase, setPhase] = useState('idle') // 'idle' | 'terms' | 'form'
  const [termsChecked, setTermsChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [videoFading, setVideoFading] = useState(false)
  const navDest = useRef('/')
  const loadVideoRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (showVideo && loadVideoRef.current) {
      loadVideoRef.current.play().catch(() => navigate(navDest.current, { replace: true }))
    }
  }, [showVideo])

  function handleWordmarkTap() {
    if (phase !== 'idle') return
    if (localStorage.getItem('athena_terms_accepted')) {
      setPhase('form')
    } else {
      setPhase('terms')
    }
  }

  function handleAcceptTerms() {
    localStorage.setItem('athena_terms_accepted', '1')
    setPhase('form')
  }

  async function doAuth() {
    if (!email.trim() || !password.trim() || loading || authed) return
    setLoading(true)
    setError('')
    const { data: { user: authUser }, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      const { data: prof } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', authUser.id)
        .single()
      navDest.current = prof?.preferences?.onboarding_done ? '/' : '/onboarding'
      setLoading(false)
      setAuthed(true)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    doAuth()
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes videoFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes videoFadeOut { from { opacity: 1; } to { opacity: 0; } }

        .athena-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(196,175,168,0.5);
          outline: none;
          color: #3B3330;
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          letter-spacing: 0.22em;
          padding: 10px 0;
          width: 100%;
          caret-color: #C4859A;
          -webkit-appearance: none;
          transition: border-bottom-color 0.3s;
        }
        .athena-input::placeholder { color: rgba(122,106,101,0.5); letter-spacing: 0.24em; }
        .athena-input:focus { border-bottom-color: #C4859A; }
        .athena-input:-webkit-autofill,
        .athena-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #3B3330;
          -webkit-box-shadow: 0 0 0 1000px #F2EDE8 inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        .terms-scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(196,175,168,0.4) transparent; }
        .terms-scroll::-webkit-scrollbar { width: 3px; }
        .terms-scroll::-webkit-scrollbar-thumb { background: rgba(196,175,168,0.4); border-radius: 2px; }
      `}</style>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, background: '#F2EDE8' }} />

      {/* Post-login loading video */}
      {showVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: '#F2EDE8',
          animation: videoFading ? 'videoFadeOut 0.7s ease forwards' : 'none',
        }}>
          <video
            ref={loadVideoRef}
            src="/athena-loading.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
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

      {/* T&C overlay */}
      {phase === 'terms' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '28px 20px',
          background: 'rgba(242,237,232,0.92)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: '360px', maxHeight: '80vh',
            background: '#fff',
            border: '1px solid rgba(196,175,168,0.35)',
            borderRadius: '10px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 4px 32px rgba(59,51,48,0.08)',
          }}>
            <div style={{ padding: '22px 22px 14px', borderBottom: '1px solid rgba(196,175,168,0.2)', flexShrink: 0 }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.3em',
                color: '#C4859A', marginBottom: '7px' }}>ATHENA</p>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 400,
                color: '#3B3330', letterSpacing: '0.1em', margin: 0 }}>
                Terms & Conditions
              </h2>
            </div>

            <div className="terms-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '13px',
                lineHeight: 1.8, color: '#7A6A65', letterSpacing: '0.02em' }}>
                <p style={{ marginBottom: '14px' }}>
                  Welcome to Athena. By accessing or using our platform, you agree to be bound by these Terms &amp; Conditions and our Privacy Policy.
                </p>
                {[
                  ['1. ACCEPTANCE OF TERMS', 'By creating an account or using the Athena application, you acknowledge that you have read, understood, and agree to these terms.'],
                  ['2. HEALTH INFORMATION', 'Athena provides wellness guidance for informational purposes only. The content within this application is not intended as medical advice.'],
                  ['3. PRIVACY & DATA', 'We take your privacy seriously. Your personal health data is encrypted and stored securely. We will never sell your personal information to third parties.'],
                  ['4. USER RESPONSIBILITIES', 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.'],
                  ['5. MODIFICATIONS', 'Athena reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes your acceptance.'],
                ].map(([title, body]) => (
                  <div key={title}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em',
                      color: '#C4859A', marginBottom: '6px', marginTop: '18px' }}>{title}</p>
                    <p style={{ marginBottom: '4px' }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '14px 22px 22px', borderTop: '1px solid rgba(196,175,168,0.2)', flexShrink: 0 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '11px',
                cursor: 'pointer', marginBottom: '16px' }}
                onClick={() => setTermsChecked(v => !v)}>
                <div style={{
                  width: '15px', height: '15px', flexShrink: 0, marginTop: '2px',
                  border: `1px solid ${termsChecked ? '#C4859A' : 'rgba(196,175,168,0.5)'}`,
                  borderRadius: '2px',
                  background: termsChecked ? 'rgba(196,133,154,0.1)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {termsChecked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5l2 2L8 1" stroke="#C4859A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '12px', lineHeight: 1.55, color: '#7A6A65',
                  letterSpacing: '0.02em', userSelect: 'none' }}>
                  I agree to the Terms &amp; Conditions and Privacy Policy
                </span>
              </label>
              <button onClick={handleAcceptTerms} disabled={!termsChecked} style={{
                width: '100%', padding: '12px', background: 'transparent',
                border: `1px solid ${termsChecked ? '#C4859A' : 'rgba(196,175,168,0.3)'}`,
                borderRadius: '3px',
                color: termsChecked ? '#3B3330' : 'rgba(122,106,101,0.35)',
                fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.32em',
                cursor: termsChecked ? 'pointer' : 'not-allowed', transition: 'all 0.25s',
              }}>
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login form */}
      {phase === 'form' && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom) + 110px)',
          left: 0, right: 0,
          padding: '0 40px',
          animation: 'fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          zIndex: 10,
          opacity: authed ? 0 : 1,
          transition: 'opacity 0.4s ease',
          pointerEvents: authed ? 'none' : 'auto',
        }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '20px' }}>
              <input className="athena-input" type="email" placeholder="EMAIL"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" autoCapitalize="none" autoCorrect="off"
                spellCheck={false} enterKeyHint="next" disabled={loading} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input className="athena-input" type="password" placeholder="PASSWORD"
                value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" enterKeyHint="go"
                onBlur={() => { if (email.trim() && password.trim()) doAuth() }}
                disabled={loading} />
            </div>

            {loading && (
              <div style={{ display: 'flex', gap: '7px', marginBottom: '6px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    backgroundColor: '#C4859A',
                    animation: `dotPulse 1.1s ease-in-out infinite ${i * 0.18}s`,
                  }} />
                ))}
              </div>
            )}

            {error && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                fontSize: '13px', color: 'rgba(180,60,60,0.85)', marginBottom: '14px',
                letterSpacing: '0.03em', lineHeight: 1.4 }}>
                {error}
              </p>
            )}

            <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
          </form>
        </div>
      )}

      {/* ACCESS button */}
      {authed && !showVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.4s ease',
        }}>
          <button onClick={() => setShowVideo(true)} style={{
            padding: '13px 40px', background: 'transparent',
            border: '1px solid rgba(196,133,154,0.5)',
            borderRadius: '2px', cursor: 'pointer',
            WebkitAppearance: 'none',
          }}>
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 500,
              letterSpacing: '0.38em', color: '#3B3330',
            }}>
              ACCESS
            </span>
          </button>
        </div>
      )}

      {/* ATHENA wordmark */}
      <div
        onClick={handleWordmarkTap}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom) + 30px)',
          left: 0, right: 0,
          textAlign: 'center',
          padding: '0 24px',
          cursor: phase === 'idle' ? 'pointer' : 'default',
          zIndex: 10,
          opacity: phase === 'form' ? 0.4 : 1,
          transition: 'opacity 0.5s ease',
          animation: 'fadeUp 1.2s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        <div style={{
          width: '36px', height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(196,133,154,0.4), transparent)',
          margin: '0 auto 12px',
        }} />
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(28px, 8vw, 50px)',
          fontWeight: 400,
          display: 'block',
          letterSpacing: '0.26em',
          lineHeight: 1,
          transform: 'scaleX(0.84)',
          color: '#3B3330',
        }}>
          ATHENA
        </span>
        {phase === 'idle' && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '11px', letterSpacing: '0.22em',
            color: 'rgba(122,106,101,0.55)',
            marginTop: '10px',
          }}>
            tap to enter
          </p>
        )}
      </div>
    </>
  )
}
