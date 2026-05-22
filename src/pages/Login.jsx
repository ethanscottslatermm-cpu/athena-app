import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import knightIcon from '../assets/knight-icon.png'
import { supabase } from '../lib/supabase'

const ANIM_TYPES  = ['dustUp', 'dustUp', 'dustDriftL', 'dustUp', 'dustDriftR', 'dustUp']
const GOLD_COLORS = [
  'rgba(255,252,225,',
  'rgba(245,232,170,',
  'rgba(255,245,195,',
  'rgba(238,220,150,',
  'rgba(255,250,210,',
  'rgba(242,225,158,',
]

const PARTICLES = Array.from({ length: 140 }, (_, i) => ({
  id: i,
  x: i < 90 ? 22 + (i * 41 + 7) % 54 : (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: 0.6 + (i % 5) * 0.4,
  duration: 3.0 + (i % 7) * 0.85,
  delay: (i * 0.22) % 8,
  opacity: 0.25 + (i % 6) * 0.09,
  anim: ANIM_TYPES[i % ANIM_TYPES.length],
  color: GOLD_COLORS[i % GOLD_COLORS.length],
}))

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
  const bgVideoRef = useRef(null)
  const loadVideoRef = useRef(null)
  const navigate = useNavigate()

  // Start background loop
  useEffect(() => {
    const v = bgVideoRef.current
    if (!v) return
    v.muted = true
    v.playbackRate = 0.65
    v.play().catch(() => {})
  }, [])

  // Start loading video on trigger
  useEffect(() => {
    if (showVideo && loadVideoRef.current) {
      loadVideoRef.current.muted = true
      loadVideoRef.current.play().catch(() => {
        navigate(navDest.current, { replace: true })
      })
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
        @import url('https://fonts.cdnfonts.com/css/the-seasons');

        @keyframes dustUp {
          0%   { transform: translateY(0px)   translateX(0px);   opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(-80px)  translateX(6px);   opacity: 0; }
        }
        @keyframes dustDriftL {
          0%   { transform: translateY(0px)  translateX(0px);   opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(-82px) translateX(-14px); opacity: 0; }
        }
        @keyframes dustDriftR {
          0%   { transform: translateY(0px)  translateX(0px);   opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translateY(-78px) translateX(14px);  opacity: 0; }
        }
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes wordmarkIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wordmarkPulse {
          0%,100% { opacity: 0.82; }
          50%     { opacity: 1; }
        }
        @keyframes formIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes loadingDot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes checkboxGlow {
          0%   { box-shadow: 0 0 0px rgba(212,160,160,0); }
          50%  { box-shadow: 0 0 14px rgba(212,160,160,0.5); }
          100% { box-shadow: 0 0 4px rgba(212,160,160,0.2); }
        }
        @keyframes goldSuccessPulse {
          0%   { box-shadow: 0 0 0px rgba(212,160,160,0); border-color: rgba(212,160,160,0.52); }
          40%  { box-shadow: 0 0 28px rgba(212,160,160,0.55), 0 0 60px rgba(212,160,160,0.22); border-color: rgba(212,160,160,0.95); }
          100% { box-shadow: 0 0 8px rgba(212,160,160,0.18); border-color: rgba(212,160,160,0.52); }
        }
        @keyframes placeholderPulse {
          0%, 25%   { color: rgba(215,210,232,0.65); }
          50%       { color: rgba(240,237,252,1); }
          75%, 100% { color: rgba(215,210,232,0.65); }
        }
        @keyframes accessWordPulse {
          0%, 100% { opacity: 0.68; }
          50%      { opacity: 1; filter: drop-shadow(0 0 12px rgba(255,255,255,0.95)); }
        }
        @keyframes inputIconShimmer {
          0%, 35%   { background-position: -250% 0; }
          65%, 100% { background-position:  250% 0; }
        }
        @keyframes videoFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes videoFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes bgPulse {
          0%,100% { opacity: 0.88; }
          50%     { opacity: 1; }
        }

        .iw {
          position: relative;
          margin-bottom: 20px;
          width: 100%;
        }
        .iw input { padding: 14px 16px 14px 42px; }

        .input-icon-wrap {
          position: absolute;
          left: 12px; top: 50%;
          transform: translateY(-50%);
          width: 20px; height: 20px;
          pointer-events: none;
        }

        .athena-input {
          background: rgba(255,255,255,0.06);
          border: none;
          border-bottom: 1px solid rgba(235,215,140,0.42);
          outline: none;
          color: rgba(242,237,232,0.92);
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px;
          letter-spacing: 0.22em;
          padding: 10px 0 10px 6px;
          width: 100%;
          caret-color: rgba(255,230,120,0.9);
          -webkit-appearance: none;
          transition: border-bottom-color 0.3s;
        }
        .athena-input::placeholder {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          letter-spacing: 0.24em;
          animation: placeholderPulse 2.5s ease-in-out infinite;
        }
        .athena-input:focus {
          border-bottom-color: rgba(255,230,120,0.85);
        }
        .athena-input:-webkit-autofill,
        .athena-input:-webkit-autofill:focus {
          -webkit-text-fill-color: rgba(242,237,232,0.88);
          -webkit-box-shadow: 0 0 0 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        .terms-scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(212,160,160,0.25) transparent; }
        .terms-scroll::-webkit-scrollbar { width: 3px; }
        .terms-scroll::-webkit-scrollbar-thumb { background: rgba(212,160,160,0.25); border-radius: 2px; }

        .access-btn {
          padding: 13px 36px;
          background: transparent;
          border: 1px solid rgba(212,160,160,0.52);
          border-radius: 2px;
          cursor: pointer;
          -webkit-appearance: none;
        }
      `}</style>

      <div className="fixed inset-0 overflow-hidden md:absolute">

        {/* ── 1. Background video loop ───────────────────────────────────── */}
        <video
          ref={bgVideoRef}
          src="/athena-bg-loop.mp4"
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            animation: 'bgPulse 8s ease-in-out infinite',
          }}
        />

        {/* ── 2. Cinematic overlays over video ──────────────────────────── */}
        {/* Dark base layer — gives depth and text contrast */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(15,10,8,0.38) 0%, rgba(15,10,8,0.18) 40%, rgba(15,10,8,0.55) 100%)',
        }} />
        {/* Warm linen tint — keeps Athena's palette alive over any video */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 100% 80% at 50% 60%, rgba(242,237,232,0.12) 0%, transparent 70%)',
        }} />
        {/* Rose bloom */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(212,160,160,0.14) 0%, transparent 65%)',
          mixBlendMode: 'screen',
        }} />
        {/* Bottom vignette — grounds the wordmark */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(10,6,4,0.72) 0%, rgba(10,6,4,0.32) 28%, transparent 55%)',
        }} />

        {/* ── 3. Dust particles ─────────────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: `${p.color}${p.opacity})`,
              boxShadow: p.size >= 2.5
                ? `0 0 ${p.size * 3}px ${p.color}${p.opacity * 0.8}), 0 0 ${p.size * 6}px ${p.color}${p.opacity * 0.35})`
                : `0 0 ${p.size * 2}px ${p.color}${p.opacity * 0.5})`,
              animation: `${p.anim} ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }} />
          ))}
        </div>

        {/* ── T&C Overlay ───────────────────────────────────────────────── */}
        {phase === 'terms' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'overlayIn 0.35s ease',
            zIndex: 30, padding: '28px 20px',
          }}>
            <div style={{
              width: '100%', maxWidth: '360px', maxHeight: '80vh',
              background: 'rgba(10,6,4,0.55)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(212,160,160,0.22)',
              borderRadius: '10px',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              boxShadow: '0 8px 48px rgba(0,0,0,0.4)',
            }}>
              <div style={{ padding: '22px 22px 14px', borderBottom: '1px solid rgba(212,160,160,0.18)', flexShrink: 0 }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: '9px', letterSpacing: '0.3em',
                  color: 'rgba(212,160,160,0.7)', marginBottom: '7px' }}>ATHENA</p>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '16px', fontWeight: 400,
                  color: 'rgba(242,237,232,0.88)', letterSpacing: '0.1em', margin: 0 }}>
                  Terms & Conditions
                </h2>
              </div>

              <div className="terms-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
                <div style={{ fontFamily: "'The Seasons', 'Cormorant Garamond', serif", fontSize: '13px',
                  lineHeight: 1.8, color: 'rgba(242,237,232,0.65)', letterSpacing: '0.02em' }}>
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
                        color: 'rgba(212,160,160,0.65)', marginBottom: '6px', marginTop: '18px' }}>{title}</p>
                      <p style={{ marginBottom: '4px' }}>{body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '14px 22px 22px', borderTop: '1px solid rgba(212,160,160,0.18)', flexShrink: 0 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '11px',
                  cursor: 'pointer', marginBottom: '16px' }}
                  onClick={() => setTermsChecked(v => !v)}>
                  <div style={{
                    width: '15px', height: '15px', flexShrink: 0, marginTop: '2px',
                    border: `1px solid ${termsChecked ? 'rgba(212,160,160,0.75)' : 'rgba(212,160,160,0.3)'}`,
                    borderRadius: '2px',
                    background: termsChecked ? 'rgba(212,160,160,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    animation: termsChecked ? 'checkboxGlow 0.6s ease' : 'none',
                  }}>
                    {termsChecked && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5l2 2L8 1" stroke="rgba(212,160,160,0.9)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontFamily: "'The Seasons', 'Cormorant Garamond', serif",
                    fontSize: '12px', lineHeight: 1.55, color: 'rgba(242,237,232,0.55)',
                    letterSpacing: '0.02em', userSelect: 'none' }}>
                    I agree to the Terms &amp; Conditions and Privacy Policy
                  </span>
                </label>
                <button onClick={handleAcceptTerms} disabled={!termsChecked}
                  style={{
                    width: '100%', padding: '12px', background: 'transparent',
                    border: `1px solid ${termsChecked ? 'rgba(212,160,160,0.55)' : 'rgba(212,160,160,0.18)'}`,
                    borderRadius: '3px',
                    color: termsChecked ? 'rgba(242,237,232,0.88)' : 'rgba(242,237,232,0.28)',
                    fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.32em',
                    cursor: termsChecked ? 'pointer' : 'not-allowed', transition: 'all 0.25s',
                  }}>
                  CONTINUE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Login form ────────────────────────────────────────────────── */}
        {phase === 'form' && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom) + 116px)',
            left: 0, right: 0,
            padding: '0 40px',
            animation: 'formIn 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
            zIndex: 10,
            opacity: authed ? 0 : 1,
            transition: 'opacity 0.4s ease',
            pointerEvents: authed ? 'none' : 'auto',
          }}>
            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="iw">
                <span className="input-icon-wrap" style={{ color: 'rgba(215,210,232,0.65)' }}>
                  <span style={{
                    display: 'block', width: '100%', height: '100%',
                    WebkitMask: `url(${knightIcon}) no-repeat center / contain`,
                    mask: `url(${knightIcon}) no-repeat center / contain`,
                    backgroundColor: 'currentColor',
                  }} />
                  <span style={{
                    position: 'absolute', inset: 0,
                    WebkitMask: `url(${knightIcon}) no-repeat center / contain`,
                    mask: `url(${knightIcon}) no-repeat center / contain`,
                    background: 'linear-gradient(110deg, transparent 25%, rgba(250,248,255,0.85) 50%, transparent 75%)',
                    backgroundSize: '250% 100%',
                    animation: 'inputIconShimmer 4s ease-in-out infinite',
                    mixBlendMode: 'screen',
                  }} />
                </span>
                <input className="athena-input" type="email" placeholder="EMAIL"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email" autoCapitalize="none" autoCorrect="off"
                  spellCheck={false} enterKeyHint="next" disabled={loading} />
              </div>

              {/* Password */}
              <div className="iw">
                <span className="input-icon-wrap" style={{ color: 'rgba(215,210,232,0.65)' }}>
                  <span style={{
                    display: 'block', width: '100%', height: '100%',
                    WebkitMask: `url(${knightIcon}) no-repeat center / contain`,
                    mask: `url(${knightIcon}) no-repeat center / contain`,
                    backgroundColor: 'currentColor',
                  }} />
                  <span style={{
                    position: 'absolute', inset: 0,
                    WebkitMask: `url(${knightIcon}) no-repeat center / contain`,
                    mask: `url(${knightIcon}) no-repeat center / contain`,
                    background: 'linear-gradient(110deg, transparent 25%, rgba(250,248,255,0.85) 50%, transparent 75%)',
                    backgroundSize: '250% 100%',
                    animation: 'inputIconShimmer 4s ease-in-out infinite 0.6s',
                    mixBlendMode: 'screen',
                  }} />
                </span>
                <input className="athena-input" type="password" placeholder="PASSWORD"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" enterKeyHint="go"
                  onBlur={() => { if (email.trim() && password.trim()) doAuth() }}
                  disabled={loading} />
              </div>

              {loading && (
                <div style={{ display: 'flex', gap: '7px', paddingLeft: '6px', marginBottom: '6px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      backgroundColor: 'rgba(212,160,160,0.75)',
                      animation: `loadingDot 1.1s ease-in-out infinite ${i * 0.18}s`,
                    }} />
                  ))}
                </div>
              )}

              {error && (
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                  fontSize: '13px', color: 'rgba(220,120,120,0.9)', marginBottom: '14px',
                  letterSpacing: '0.03em', lineHeight: 1.4 }}>
                  {error}
                </p>
              )}

              <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
            </form>
          </div>
        )}

        {/* ── ACCESS button ─────────────────────────────────────────────── */}
        {authed && !showVideo && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 11, animation: 'formIn 0.4s ease',
          }}>
            <button onClick={() => setShowVideo(true)} className="access-btn"
              style={{ animation: 'goldSuccessPulse 1s ease 0.4s both' }}>
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: '12px', fontWeight: 500,
                letterSpacing: '0.38em',
                backgroundImage: 'linear-gradient(90deg, rgba(205,198,186,0.82) 0%, rgba(205,198,186,0.82) 30%, rgba(255,255,255,1) 50%, rgba(205,198,186,0.82) 70%, rgba(205,198,186,0.82) 100%)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 5s linear infinite, accessWordPulse 2.5s ease-in-out infinite',
                display: 'inline-block',
              }}>
                ACCESS
              </span>
            </button>
          </div>
        )}

        {/* ── Post-login loading video ───────────────────────────────────── */}
        {showVideo && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: '#F2EDE8',
            animation: videoFading ? 'videoFadeOut 0.7s ease forwards' : 'none',
          }}>
            <video
              ref={loadVideoRef}
              src="/athena-loading.mp4"
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

        {/* ── ATHENA wordmark ───────────────────────────────────────────── */}
        <div
          onClick={handleWordmarkTap}
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom) + 30px)',
            left: 0, right: 0,
            textAlign: 'center',
            padding: '0 24px',
            cursor: phase === 'idle' ? 'pointer' : 'default',
            zIndex: 10,
            transition: 'opacity 0.5s ease',
            opacity: phase === 'form' ? 0.45 : 1,
            animation: 'wordmarkIn 1.2s cubic-bezier(0.22,1,0.36,1) both, wordmarkPulse 3.5s ease-in-out 1.4s infinite',
          }}
        >
          <div style={{
            width: '36px', height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(212,160,160,0.45), transparent)',
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
            backgroundImage: 'linear-gradient(90deg, rgba(212,208,232,0.82) 0%, rgba(212,208,232,0.82) 30%, rgba(240,237,252,0.95) 44%, rgba(248,246,255,1) 50%, rgba(240,237,252,0.95) 56%, rgba(212,208,232,0.82) 70%, rgba(212,208,232,0.82) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 3px rgba(238,234,255,0.55)) drop-shadow(0 0 10px rgba(222,218,248,0.38)) drop-shadow(0 0 22px rgba(210,206,242,0.2))',
            animation: 'shimmer 5s linear infinite',
          }}>
            ATHENA
          </span>
          {phase === 'idle' && (
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '11px', letterSpacing: '0.22em',
              color: 'rgba(242,237,232,0.45)',
              marginTop: '10px',
              animation: 'wordmarkPulse 3s ease-in-out infinite 0.5s',
            }}>
              tap to enter
            </p>
          )}
        </div>

      </div>
    </>
  )
}
