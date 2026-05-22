import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
const loginHero = '/login-hero.png'

// ── Particles — gold/cream, slow, visible on pink ─────────────────────────
const PARTICLES = Array.from({ length: 48 }, (_, i) => ({
  id: i,
  x: 3 + (i * 41 + 7) % 72,
  y: (i * 53 + 11) % 100,
  size: 0.8 + (i % 5) * 0.38,
  duration: 4 + (i % 5) * 1.1, // 4–9s — noticeably livelier
  delay: (i * 0.32) % 7,       // tighter delays = more visible at once
  opacity: 0.6 + (i % 4) * 0.1,
  anim: ['dustUp', 'dustDriftL', 'dustUp', 'dustDriftR', 'dustUp'][i % 5],
  color: [
    'rgba(255,245,190,',
    'rgba(255,255,220,',
    'rgba(255,230,140,',
    'rgba(255,250,210,',
  ][i % 4],
}))

// ── Mist clouds — 5 soft opacity-animated radial blobs ────────────────────
const MIST = [
  { id: 0, left: '-8%',  bottom: '2%',  w: '55%', h: '10%', delay: 0,   dur: 9  },
  { id: 1, left: '10%',  bottom: '0%',  w: '60%', h: '8%',  delay: 2.5, dur: 11 },
  { id: 2, left: '-5%',  bottom: '5%',  w: '45%', h: '8%',  delay: 5,   dur: 8  },
  { id: 3, left: '25%',  bottom: '1%',  w: '50%', h: '7%',  delay: 1.5, dur: 13 },
  { id: 4, left: '5%',   bottom: '3%',  w: '38%', h: '6%',  delay: 3.5, dur: 10 },
]

export default function Login() {
  const [phase, setPhase] = useState('idle')
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

  function handleScreenTap() {
    if (phase !== 'idle') return
    localStorage.getItem('athena_terms_accepted') ? setPhase('form') : setPhase('terms')
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
      const { data: prof } = await supabase.from('profiles').select('preferences').eq('id', authUser.id).single()
      navDest.current = prof?.preferences?.onboarding_done ? '/' : '/onboarding'
      setLoading(false)
      setAuthed(true)
    }
  }

  return (
    <>
      <style>{`
        @keyframes dustUp {
          0%   { transform: translateY(0)   translateX(0);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(-90px) translateX(5px);  opacity: 0; }
        }
        @keyframes dustDriftL {
          0%   { transform: translateY(0)  translateX(0);    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.7; }
          100% { transform: translateY(-85px) translateX(-18px); opacity: 0; }
        }
        @keyframes dustDriftR {
          0%   { transform: translateY(0)  translateX(0);    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.7; }
          100% { transform: translateY(-88px) translateX(18px);  opacity: 0; }
        }
        @keyframes mistPulse {
          0%, 100% { opacity: 0; }
          40%, 60% { opacity: 1; }
        }
        @keyframes mistDrift {
          0%   { transform: translateX(0)   scaleX(1);   opacity: 0; }
          20%  { opacity: 1; }
          50%  { transform: translateX(12px) scaleX(1.06); }
          80%  { opacity: 0.7; }
          100% { transform: translateX(-6px) scaleX(0.96); opacity: 0; }
        }
        @keyframes lightSweep {
          0%        { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          5%        { opacity: 1; }
          35%       { opacity: 0.6; }
          55%, 100% { transform: translateX(300%) skewX(-18deg); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes videoFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes videoFadeOut { from { opacity: 1; } to { opacity: 0; } }

        .login-input {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(255,255,255,0.45);
          outline: none;
          color: #fff;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          letter-spacing: 0.2em;
          padding: 12px 0;
          width: 100%;
          caret-color: #fff;
          -webkit-appearance: none;
          transition: border-bottom-color 0.3s;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.45); letter-spacing: 0.24em; }
        .login-input:focus { border-bottom-color: rgba(255,255,255,0.9); }
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s;
        }

        .terms-scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(196,133,154,0.3) transparent; }
        .terms-scroll::-webkit-scrollbar { width: 3px; }
        .terms-scroll::-webkit-scrollbar-thumb { background: rgba(196,133,154,0.3); border-radius: 2px; }

        /* Mobile: cover + left-bottom anchored so warrior fills portrait screen */
        .login-hero-bg {
          background-size: cover;
          background-position: 20% bottom;
        }
        /* Desktop: contain + centered so full figure is visible, bg color fills the rest */
        @media (min-width: 768px) {
          .login-hero-bg {
            background-size: contain;
            background-position: center center;
            background-repeat: no-repeat;
          }
        }
      `}</style>

      {/* ── Hero background ───────────────────────────────────────────── */}
      <div
        className="login-hero-bg"
        onClick={handleScreenTap}
        style={{
          position: 'fixed', inset: 0,
          backgroundImage: `url(${loginHero})`,
          backgroundColor: '#B8AABB',
          cursor: phase === 'idle' ? 'pointer' : 'default',
        }}
      />

      {/* Ground shadow — grey-mauve to match image background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(125,112,122,0.9) 0%, rgba(132,118,128,0.52) 8%, rgba(138,124,134,0.18) 18%, transparent 30%)',
      }} />


      {/* ── Light sweep — diagonal gleam across the figure ────────────── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '18%', height: '100%',
          background: 'linear-gradient(to right, transparent, rgba(255,248,220,0.12), transparent)',
          animation: 'lightSweep 10s ease-in-out infinite 2s',
          willChange: 'transform',
        }} />
      </div>

      {/* ── Mist clouds ───────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {MIST.map(m => (
          <div key={m.id} style={{
            position: 'absolute',
            left: m.left, bottom: m.bottom,
            width: m.w, height: m.h,
            background: 'radial-gradient(ellipse at center, rgba(255,240,235,0.22) 0%, rgba(255,230,225,0.1) 50%, transparent 100%)',
            borderRadius: '50%',
            animation: `mistDrift ${m.dur}s ease-in-out infinite ${m.delay}s`,
          }} />
        ))}
      </div>

      {/* ── Gold dust particles ────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {PARTICLES.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            backgroundColor: `${p.color}${p.opacity})`,
            animation: `${p.anim} ${p.duration}s ease-in-out infinite ${p.delay}s`,
            willChange: 'transform',
          }} />
        ))}
      </div>

      {/* ── Post-login loading video ──────────────────────────────────── */}
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
            onEnded={() => { setVideoFading(true); setTimeout(() => navigate(navDest.current, { replace: true }), 700) }}
            onError={() => navigate(navDest.current, { replace: true })}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'videoFadeIn 0.9s ease forwards' }}
          />
        </div>
      )}

      {/* ── T&C overlay ───────────────────────────────────────────────── */}
      {phase === 'terms' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '28px 20px',
          background: 'rgba(90,30,40,0.5)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: '360px', maxHeight: '80vh',
            background: 'rgba(255,250,248,0.97)',
            border: '1px solid rgba(196,133,154,0.2)',
            borderRadius: '12px',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 8px 48px rgba(90,30,40,0.25)',
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
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', cursor: 'pointer', marginBottom: '16px' }}
                onClick={() => setTermsChecked(v => !v)}>
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
              <button onClick={handleAcceptTerms} disabled={!termsChecked} style={{
                width: '100%', padding: '12px', background: 'transparent',
                border: `1px solid ${termsChecked ? '#C4859A' : 'rgba(196,133,154,0.25)'}`,
                borderRadius: '3px',
                color: termsChecked ? '#3B3330' : 'rgba(122,106,101,0.35)',
                fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.32em',
                cursor: termsChecked ? 'pointer' : 'not-allowed', transition: 'all 0.25s',
              }}>CONTINUE</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Login form — slides up from bottom ────────────────────────── */}
      {phase === 'form' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
          display: 'flex', justifyContent: 'center',
          animation: 'slideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <div style={{
            width: '100%', maxWidth: '480px',
            background: 'rgba(90,30,45,0.55)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '20px 20px 0 0',
            padding: '32px 36px calc(env(safe-area-inset-bottom) + 36px)',
            opacity: authed ? 0 : 1,
            transition: 'opacity 0.4s ease',
            pointerEvents: authed ? 'none' : 'auto',
          }}>
            <form onSubmit={e => { e.preventDefault(); doAuth() }} noValidate>
              <div style={{ marginBottom: '24px' }}>
                <input className="login-input" type="email" placeholder="EMAIL"
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email" autoCapitalize="none" autoCorrect="off"
                  spellCheck={false} enterKeyHint="next" disabled={loading} />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <input className="login-input" type="password" placeholder="PASSWORD"
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" enterKeyHint="go"
                  onBlur={() => { if (email.trim() && password.trim()) doAuth() }}
                  disabled={loading} />
              </div>
              {loading && (
                <div style={{ display: 'flex', gap: '7px', marginBottom: '8px' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.75)',
                      animation: `dotPulse 1.1s ease-in-out infinite ${i * 0.18}s`,
                    }} />
                  ))}
                </div>
              )}
              {error && (
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
                  fontSize: '13px', color: 'rgba(255,200,200,0.95)', marginBottom: '14px', lineHeight: 1.4 }}>
                  {error}
                </p>
              )}
              <button type="submit" style={{ display: 'none' }} aria-hidden />
            </form>
          </div>
        </div>
      )}

      {/* ── ACCESS button ─────────────────────────────────────────────── */}
      {authed && !showVideo && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.4s ease',
        }}>
          <button onClick={() => setShowVideo(true)} style={{
            padding: '13px 40px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.6)',
            borderRadius: '2px', cursor: 'pointer', WebkitAppearance: 'none',
          }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: '12px', letterSpacing: '0.38em', color: '#fff' }}>
              ACCESS
            </span>
          </button>
        </div>
      )}
    </>
  )
}
