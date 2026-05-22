import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
const loginHero = '/login-hero.png'

// ── Sakura petals — pink tones, fall + rotate through air ────────────────
const PETALS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (i * 37 + 5) % 96,            // spread full width with edge margin
  y: (i * 23 + 8) % 75 + 10,       // 10–85% vertical spread so screen is always populated
  size: 10 + (i % 5) * 3,          // 10–22px
  duration: 9 + (i % 6) * 1.5,     // 9–17.5s — languid float cycle
  delay: (i * 0.6) % 14,           // staggered so no two leaves are in sync
  opacity: 0.5 + (i % 4) * 0.1,
  anim: ['leafFloat', 'leafFloatL', 'leafFloat', 'leafFloatWide', 'leafFloatL'][i % 5],
  color: ['#F2C4CF', '#EDB8C6', '#F5D5DC', '#E8A5B8', '#FAE0E6'][i % 5],
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
        @keyframes leafFloat {
          0%   { transform: translateY(20px)  translateX(0px)   rotate(-4deg); }
          28%  { transform: translateY(-55px) translateX(10px)  rotate(6deg);  }
          55%  { transform: translateY(-80px) translateX(-6px)  rotate(-2deg); }
          78%  { transform: translateY(-45px) translateX(12px)  rotate(7deg);  }
          100% { transform: translateY(20px)  translateX(0px)   rotate(-4deg); }
        }
        @keyframes leafFloatL {
          0%   { transform: translateY(15px)  translateX(0px)   rotate(5deg);  }
          30%  { transform: translateY(-60px) translateX(-14px) rotate(-6deg); }
          58%  { transform: translateY(-75px) translateX(5px)   rotate(3deg);  }
          80%  { transform: translateY(-40px) translateX(-10px) rotate(-8deg); }
          100% { transform: translateY(15px)  translateX(0px)   rotate(5deg);  }
        }
        @keyframes leafFloatWide {
          0%   { transform: translateY(22px)  translateX(0px)   rotate(-6deg); }
          25%  { transform: translateY(-42px) translateX(22px)  rotate(4deg);  }
          52%  { transform: translateY(-72px) translateX(-14px) rotate(-9deg); }
          78%  { transform: translateY(-30px) translateX(18px)  rotate(5deg);  }
          100% { transform: translateY(22px)  translateX(0px)   rotate(-6deg); }
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

      {/* ── Sakura petals ─────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {PETALS.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            opacity: p.opacity,
            animation: `${p.anim} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: 'transform',
          }}>
            {/* Botanical leaf from SVG Repo — body + vein detail paths */}
            <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" opacity={p.opacity}>
              {/* Outer leaf body */}
              <path
                d="M60.893,1.549c-0.136-0.269-0.386-0.462-0.679-0.525c-2.98-0.652-6.97-0.982-11.856-0.982c-4.922,0-10.564,0.353-15.481,0.967C17.641,2.912,7,13.601,7,27v18.678L3.103,60.225c-0.428,1.598,0.523,3.244,2.122,3.674c1.598,0.426,3.245-0.525,3.673-2.121L11.25,53H31c14.337,0,26-11.663,26-26c0-6.663,0-15.788,3.914-24.594C61.036,2.132,61.028,1.816,60.893,1.549z M6.966,61.26c-0.143,0.532-0.691,0.849-1.224,0.707c-0.534-0.145-0.851-0.691-0.708-1.225l2.552-9.686c0.405,0.672,0.998,1.212,1.712,1.55L6.966,61.26z M55,27c0,13.233-10.767,24-24,24H11c-1.104,0-2-0.896-2-2v-1V27C9,14.641,18.92,4.769,33.124,2.992c4.839-0.604,10.391-0.951,15.233-0.951c4.048,0,7.553,0.242,10.238,0.705C55,11.565,55,20.443,55,27z"
                fill={p.color} opacity="0.82"
              />
              {/* Internal vein details */}
              <path
                d="M34.929,7.629c-0.205-0.513-0.787-0.763-1.297-0.557c-0.513,0.203-0.764,0.784-0.562,1.297c0.019,0.047,1.84,4.804-0.032,11.356c0,0-0.001,0.007-0.001,0.011c-1.215,1.103-2.459,2.271-3.744,3.557c-1.357,1.357-2.591,2.671-3.745,3.948c0.998-9.183-0.498-16.128-0.571-16.458c-0.12-0.539-0.654-0.876-1.193-0.76c-0.539,0.12-0.879,0.654-0.76,1.193c0.019,0.086,1.823,8.469,0.13,18.763c-2.26,2.695-4.05,5.14-5.464,7.261c0.709-7.9-0.644-14.145-0.713-14.457c-0.12-0.539-0.65-0.886-1.193-0.759c-0.539,0.119-0.879,0.653-0.76,1.192c0.02,0.087,1.885,8.75,0.048,18.297c-1.383,2.488-1.953,3.988-2.01,4.141c-0.19,0.518,0.074,1.092,0.592,1.283C13.768,46.979,13.885,47,14,47c0.406,0,0.788-0.25,0.938-0.653c0.013-0.034,0.5-1.302,1.684-3.468c10.438-2.726,19.995,0.051,20.092,0.079C36.809,42.986,36.905,43,37,43c0.431,0,0.828-0.28,0.958-0.714c0.158-0.528-0.142-1.085-0.671-1.244C36.897,40.924,28.2,38.391,18,40.506c1.416-2.316,3.406-5.218,6.108-8.52c0.052-0.006,0.104-0.008,0.154-0.021c10.595-2.889,21.367-0.029,21.475,0C45.825,31.988,45.913,32,46,32c0.44,0,0.844-0.292,0.965-0.737c0.145-0.533-0.169-1.082-0.702-1.228c-0.425-0.116-9.801-2.598-20.012-0.576c1.341-1.524,2.814-3.109,4.456-4.752c1.41-1.41,2.777-2.693,4.103-3.88c6.452-1.649,12.852,0.116,12.916,0.135C47.817,20.987,47.909,21,48,21c0.436,0,0.836-0.287,0.961-0.727c0.151-0.53-0.155-1.083-0.687-1.235c-0.239-0.067-4.9-1.367-10.473-0.779c8.531-7.021,14.472-9.294,14.545-9.321c0.518-0.191,0.782-0.767,0.591-1.284c-0.191-0.519-0.766-0.779-1.283-0.592c-0.326,0.12-6.805,2.58-16.068,10.431C36.527,11.735,35.004,7.816,34.929,7.629z"
                fill={p.color} opacity="0.55"
              />
            </svg>
          </div>
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
