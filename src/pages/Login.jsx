import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [phase, setPhase] = useState('form') // 'form' | 'terms'
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [btnHover, setBtnHover] = useState(false)
  const [accessHover, setAccessHover] = useState(false)

  const navDest = useRef('/')
  const loadVideoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (showVideo && loadVideoRef.current) {
      loadVideoRef.current.play().catch(() => navigate(navDest.current, { replace: true }))
    }
  }, [showVideo])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 38
    const particles = Array.from({ length: COUNT }, () => ({
      x:    Math.random(),
      y:    Math.random(),
      r:    Math.random() * 1.2 + 0.4,
      speed: Math.random() * 0.28 + 0.1,
      opacity: Math.random() * 0.28 + 0.06,
    }))

    let raf
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.y -= p.speed / canvas.height
        if (p.y < 0) { p.y = 1; p.x = Math.random() }
        ctx.beginPath()
        ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232,213,176,${p.opacity})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

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
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes athenaPulse {
          0%, 100% {
            text-shadow:
              0 2px 28px rgba(0,0,0,0.8),
              0 0 18px rgba(248,232,175,0.14),
              0 0 40px rgba(248,232,175,0.05);
            letter-spacing: 0.52em;
          }
          50% {
            text-shadow:
              0 2px 28px rgba(0,0,0,0.72),
              0 0 18px rgba(248,232,175,0.58),
              0 0 48px rgba(248,232,175,0.26),
              0 0 88px rgba(248,232,175,0.09);
            letter-spacing: 0.54em;
          }
        }
        @keyframes eyeGlow {
          0% {
            opacity: 0.28;
            filter: drop-shadow(0 0 0px rgba(232,213,176,0));
            transform: scale(1);
          }
          42% {
            opacity: 0.92;
            filter: drop-shadow(0 0 7px rgba(232,213,176,0.85)) drop-shadow(0 0 18px rgba(232,213,176,0.4)) drop-shadow(0 0 32px rgba(232,213,176,0.15));
            transform: scale(1.14);
          }
          58% {
            opacity: 0.92;
            filter: drop-shadow(0 0 7px rgba(232,213,176,0.85)) drop-shadow(0 0 18px rgba(232,213,176,0.4)) drop-shadow(0 0 32px rgba(232,213,176,0.15));
            transform: scale(1.14);
          }
          100% {
            opacity: 0.28;
            filter: drop-shadow(0 0 0px rgba(232,213,176,0));
            transform: scale(1);
          }
        }
        @keyframes rulePulse {
          0%, 100% { opacity: 0.18; }
          50%       { opacity: 0.42; }
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
        @keyframes accessSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 0px rgba(232,213,176,0); border-color: rgba(232,213,176,0.3); }
          50%       { box-shadow: 0 0 14px rgba(232,213,176,0.35), 0 0 30px rgba(232,213,176,0.12); border-color: rgba(232,213,176,0.8); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%           { opacity: 1;    transform: scale(1.15); }
        }
        @keyframes linkBreath {
          0%, 100% {
            color: rgba(196,133,154,0.62);
            text-shadow: none;
            border-color: rgba(196,133,154,0.28);
          }
          50% {
            color: rgba(196,133,154,0.98);
            text-shadow: 0 0 8px rgba(196,133,154,0.55), 0 0 20px rgba(196,133,154,0.24);
            border-color: rgba(196,133,154,0.75);
          }
        }
        @keyframes videoFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes termsIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }

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
          color: rgba(232,213,176,0.72);
          letter-spacing: 0.32em;
          font-size: 11px;
        }
        .a-link {
          cursor: pointer;
          border-bottom: 1px solid rgba(196,133,154,0.28);
          padding-bottom: 1px;
          animation: linkBreath 5s ease-in-out infinite 3.2s;
        }
        .a-input:-webkit-autofill,
        .a-input:-webkit-autofill:focus {
          -webkit-text-fill-color: rgba(255,246,240,0.9);
          -webkit-box-shadow: 0 0 0 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        .a-input-wrap { position: relative; }
        .a-input-wrap::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(196,133,154,0.28);
          animation: lineBreath 5s ease-in-out infinite;
          transition: background 0.35s, box-shadow 0.35s;
          pointer-events: none;
        }
        .a-input-wrap:focus-within::after {
          background: rgba(196,133,154,0.85) !important;
          box-shadow: 0 0 10px 1px rgba(196,133,154,0.42), 0 0 22px 2px rgba(196,133,154,0.18) !important;
          animation: none !important;
        }
        .a-input-wrap--pw::after { animation-delay: 1.4s; }
        .a-btn { animation: btnBreath 6s ease-in-out infinite 1s; }
        .a-btn:hover {
          box-shadow: 0 0 18px rgba(196,133,154,0.38), 0 0 36px rgba(196,133,154,0.15) !important;
          animation: none !important;
        }
        .a-access {
          animation: accessSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both,
                     borderPulse 2s ease-in-out infinite 0.8s;
        }
        .terms-scroll {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(232,213,176,0.3) transparent;
        }
        .terms-scroll::-webkit-scrollbar { width: 3px; }
        .terms-scroll::-webkit-scrollbar-thumb {
          background: rgba(232,213,176,0.3);
          border-radius: 2px;
        }
      `}</style>

      {/* ── Background ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundColor: '#0E0A08',
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
            objectPosition: '22% 8%',
            opacity: 0.72,
            filter: 'contrast(1.08) brightness(1.04) saturate(1.1)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
        {/* Light top — warrior fully visible */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '22%',
          background: 'linear-gradient(to bottom, rgba(10,7,5,0.22) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Mid-band — frames the wordmark zone */}
        <div style={{
          position: 'absolute', top: '30%', left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(8,5,3,0.52) 40%, rgba(8,5,3,0.52) 60%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Right edge */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '38%',
          background: 'linear-gradient(to left, rgba(10,7,5,0.68) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Bottom — form zone */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '52%',
          background: 'linear-gradient(to top, rgba(10,7,5,0.97) 0%, rgba(10,7,5,0.75) 30%, rgba(10,7,5,0.12) 68%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Particles ──────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0,
          width: '100%', height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>

        {/* ── Eye + WELLNESS — top group ───────────────────────────────────── */}
        <div style={{
          position: 'absolute', top: '5vh', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px',
          animation: 'floatIn 2s ease 0.4s both',
        }}>
          <svg
            width="22" height="14" viewBox="0 0 22 14" fill="none"
            aria-hidden
            style={{ animation: 'eyeGlow 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite' }}
          >
            <ellipse cx="11" cy="7" rx="10.5" ry="6.5" stroke="rgba(232,213,176,0.78)" strokeWidth="0.8"/>
            <circle cx="11" cy="7" r="2.5" stroke="rgba(232,213,176,0.78)" strokeWidth="0.8"/>
            <circle cx="11" cy="7" r="1" fill="rgba(232,213,176,0.78)"/>
          </svg>
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '9px', letterSpacing: '0.62em',
            color: 'rgba(255,250,242,0.32)',
            margin: 0,
            textTransform: 'uppercase',
          }}>WELLNESS</p>
        </div>

        {/* ── ATHENA — centered gateway wordmark ───────────────────────────── */}
        <div style={{
          position: 'absolute', top: '40vh', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 0,
          animation: 'riseIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both',
        }}>
          {/* Top rule */}
          <div style={{
            width: '48px', height: '0.5px',
            background: 'rgba(255,248,236,1)',
            marginBottom: '14px',
            animation: 'rulePulse 6s ease-in-out infinite',
          }} />

          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(46px, 11.5vw, 58px)',
            fontWeight: 300,
            letterSpacing: '0.52em',
            color: 'rgba(248,243,220,0.97)',
            margin: '0 0 14px',
            lineHeight: 1,
            animation: 'athenaPulse 7s ease-in-out infinite',
          }}>ATHENA</h1>

          {/* Bottom rule */}
          <div style={{
            width: '48px', height: '0.5px',
            background: 'rgba(255,248,236,1)',
            animation: 'rulePulse 6s ease-in-out infinite 0.5s',
          }} />
        </div>

        {/* ── Form — anchored to bottom ─────────────────────────────────────── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 52px)',
          animation: 'riseIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both',
        }}>
          <div style={{ width: '100%', maxWidth: '480px', padding: '0 44px' }}>

            {!authed && (
              <>
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

                  {error && (
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic', fontSize: '13px',
                      color: 'rgba(196,133,154,0.85)',
                      marginBottom: '14px', lineHeight: 1.5,
                    }}>{error}</p>
                  )}

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
                  >ENTER</button>
                </form>

                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '11px', letterSpacing: '0.05em',
                  color: 'rgba(255,246,240,0.22)',
                  textAlign: 'center', marginTop: '22px',
                  lineHeight: 1.7,
                }}>
                  By continuing you agree to our{' '}
                  <span
                    className="a-link"
                    onClick={() => { setPendingSubmit(false); setPhase('terms') }}
                  >Terms &amp; Conditions</span>
                </p>
              </>
            )}

            {authed && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                onMouseEnter={() => setAccessHover(true)}
                onMouseLeave={() => setAccessHover(false)}
                className="a-access"
                style={{
                  width: '100%', padding: '16px 0',
                  background: accessHover ? 'rgba(232,213,176,0.06)' : 'transparent',
                  border: '1px solid rgba(232,213,176,0.3)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: "'Cinzel', serif",
                  fontSize: '10px', letterSpacing: '0.44em',
                  color: 'rgba(240,222,187,0.95)',
                  WebkitAppearance: 'none',
                  transition: 'background 0.3s ease',
                }}
              >ACCESS</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Linen cover ─────────────────────────────────────────────────────── */}
      {showVideo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 5, backgroundColor: '#F2EDE8' }} />
      )}

      {/* ── Post-login loading video ──────────────────────────────────────── */}
      {showVideo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: '#F2EDE8' }}>
          <video
            ref={loadVideoRef}
            src="/athena-loading.mp4"
            autoPlay muted playsInline preload="auto"
            onEnded={() => {
              window.dispatchEvent(new CustomEvent('athena:welcome'))
              navigate(navDest.current, { replace: true })
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
          background: 'rgba(10,8,6,0.85)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: '360px', maxHeight: '80vh',
            background: 'transparent',
            border: '1px solid rgba(232,213,176,0.35)',
            borderRadius: '10px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 0 40px rgba(232,213,176,0.07), 0 16px 72px rgba(0,0,0,0.65)',
            animation: 'termsIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
            <div style={{
              padding: '20px 22px 14px',
              borderBottom: '1px solid rgba(232,213,176,0.15)',
              flexShrink: 0, position: 'relative',
            }}>
              <p style={{
                fontFamily: "'Cinzel', serif", fontSize: '9px',
                letterSpacing: '0.3em', color: 'rgba(232,213,176,0.55)',
                margin: '0 0 6px',
              }}>ATHENA</p>
              <h2 style={{
                fontFamily: "'Cinzel', serif", fontSize: '16px',
                fontWeight: 400, color: '#e8d5b0',
                letterSpacing: '0.1em', margin: 0,
              }}>Terms &amp; Conditions</h2>
              <button
                onClick={() => setPhase('form')}
                style={{
                  position: 'absolute', top: '16px', right: '18px',
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', padding: '4px',
                  color: 'rgba(232,213,176,0.45)',
                  fontSize: '16px', lineHeight: 1,
                  WebkitAppearance: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(232,213,176,0.9)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(232,213,176,0.45)' }}
              >✕</button>
            </div>

            <div className="terms-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '13px', lineHeight: 1.8, color: '#e8d5b0',
              }}>
                <p style={{ marginBottom: '14px', opacity: 0.72 }}>
                  Welcome to Athena. By accessing or using our platform, you agree to be bound by these Terms &amp; Conditions and our Privacy Policy.
                </p>
                {[
                  ['1. ACCEPTANCE OF TERMS', 'By creating an account or using the Athena application, you acknowledge that you have read, understood, and agree to these terms.'],
                  ['2. HEALTH INFORMATION', 'Athena provides wellness guidance for informational purposes only. The content is not intended as medical advice.'],
                  ['3. PRIVACY & DATA', 'Your personal health data is encrypted and stored securely. We will never sell your personal information to third parties.'],
                  ['4. USER RESPONSIBILITIES', 'You are responsible for maintaining the confidentiality of your account credentials.'],
                  ['5. MODIFICATIONS', 'Athena reserves the right to modify these terms at any time. Continued use constitutes your acceptance.'],
                ].map(([title, body]) => (
                  <div key={title}>
                    <p style={{
                      fontFamily: "'Cinzel', serif", fontSize: '10px',
                      letterSpacing: '0.18em', color: 'rgba(232,213,176,0.85)',
                      marginBottom: '6px', marginTop: '18px',
                    }}>{title}</p>
                    <p style={{ opacity: 0.72 }}>{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '14px 22px 22px',
              borderTop: '1px solid rgba(232,213,176,0.15)',
              flexShrink: 0,
            }}>
              <button
                onClick={handleAcceptTerms}
                style={{
                  width: '100%', padding: '13px',
                  background: 'transparent',
                  border: '1px solid rgba(232,213,176,0.5)',
                  borderRadius: '3px',
                  color: '#e8d5b0',
                  fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.38em',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(232,213,176,0.85)'
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(232,213,176,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(232,213,176,0.5)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >I AGREE</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
