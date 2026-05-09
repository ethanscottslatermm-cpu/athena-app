import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImg from '../assets/athena-hero.webp'
import { supabase } from '../lib/supabase'

const PARTICLES = Array.from({ length: 96 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: i < 40
    ? (i * 53 + 7) % 100
    : i < 68
    ? 56 + ((i * 31 + 17) % 38)
    : 4 + ((i * 43 + 11) % 38),
  size: i >= 68 ? 0.4 + (i % 3) * 0.4 : 0.8 + (i % 3) * 0.65,
  duration: 1.8 + (i % 4),
  delay: (i * 0.28) % 6,
  opacity: i >= 68 ? 0.12 + (i % 5) * 0.06 : 0.18 + (i % 5) * 0.1,
}))

function LockIcon() {
  return (
    <svg
      width="13" height="16" viewBox="0 0 13 16"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, marginBottom: '1px' }}
    >
      <rect x="0.8" y="7" width="11.4" height="8.2" rx="1.4"
        stroke="rgba(201,168,108,0.6)" strokeWidth="1.1" />
      <path d="M3.2 7V4.8a3.3 3.3 0 0 1 6.6 0V7"
        stroke="rgba(201,168,108,0.6)" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

export default function Login() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [phase, setPhase] = useState('idle') // 'idle' | 'terms' | 'form'
  const [termsChecked, setTermsChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authed, setAuthed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onMouse = (e) => setMouse({
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    })
    const onTilt = (e) => {
      if (e.gamma != null) setMouse({
        x: Math.max(-1, Math.min(1, e.gamma / 20)),
        y: Math.max(-1, Math.min(1, (e.beta - 45) / 25)),
      })
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [])

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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setAuthed(true)
      setLoading(false)
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

        @keyframes cloudA {
          0%   { transform: translateX(-6%); }
          50%  { transform: translateX(6%); }
          100% { transform: translateX(-6%); }
        }
        @keyframes cloudB {
          0%   { transform: translateX(8%) translateY(-3%); }
          50%  { transform: translateX(-6%) translateY(3%); }
          100% { transform: translateX(8%) translateY(-3%); }
        }
        @keyframes cloudC {
          0%   { transform: translateX(-10%) translateY(2%); }
          50%  { transform: translateX(4%) translateY(-2%); }
          100% { transform: translateX(-10%) translateY(2%); }
        }
        @keyframes hazePulse {
          0%,100% { opacity: 0.35; }
          50%     { opacity: 0.65; }
        }
        @keyframes rayPulse {
          0%,100% { opacity: 0.08; }
          50%     { opacity: 0.22; }
        }
        @keyframes rayPulse2 {
          0%,100% { opacity: 0.04; }
          50%     { opacity: 0.15; }
        }
        @keyframes dust {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(-60px) translateX(10px); opacity: 0; }
        }
        @keyframes breathe {
          0%,100% { opacity: 0.35; transform: translateX(-50%) scale(1); }
          50%     { opacity: 0.65; transform: translateX(-50%) scale(1.08); }
        }
        @keyframes steamDriftA {
          0%   { transform: translateX(-8%) translateY(0%) scaleX(1); opacity: 0.5; }
          50%  { transform: translateX(8%) translateY(-5%) scaleX(1.15); opacity: 1; }
          100% { transform: translateX(-8%) translateY(0%) scaleX(1); opacity: 0.5; }
        }
        @keyframes steamDriftB {
          0%   { transform: translateX(6%) translateY(0%) scaleX(1); opacity: 0.4; }
          50%  { transform: translateX(-8%) translateY(-4%) scaleX(1.2); opacity: 0.9; }
          100% { transform: translateX(6%) translateY(0%) scaleX(1); opacity: 0.4; }
        }
        @keyframes steamDriftC {
          0%   { transform: translateX(-5%) scaleX(1); opacity: 0.6; }
          50%  { transform: translateX(8%) scaleX(1.25); opacity: 1; }
          100% { transform: translateX(-5%) scaleX(1); opacity: 0.6; }
        }
        @keyframes haloBreath {
          0%,100% { opacity: 0.75; }
          50%     { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes wordmarkPulse {
          0%,100% { opacity: 0.72; }
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
        @keyframes inputFocusPulse {
          0%   { filter: drop-shadow(0 0 0px rgba(201,168,108,0)); }
          50%  { filter: drop-shadow(0 0 14px rgba(201,168,108,0.45)); }
          100% { filter: drop-shadow(0 2px 8px rgba(201,168,108,0.18)); }
        }
        @keyframes checkboxGlow {
          0%   { box-shadow: 0 0 0px rgba(201,168,108,0); }
          50%  { box-shadow: 0 0 14px rgba(201,168,108,0.55); }
          100% { box-shadow: 0 0 4px rgba(201,168,108,0.2); }
        }
        @keyframes goldSuccessPulse {
          0%   { box-shadow: 0 0 0px rgba(201,168,108,0); border-color: rgba(201,168,108,0.52); }
          40%  { box-shadow: 0 0 28px rgba(201,168,108,0.65), 0 0 60px rgba(201,168,108,0.28); border-color: rgba(201,168,108,0.95); }
          100% { box-shadow: 0 0 8px rgba(201,168,108,0.18); border-color: rgba(201,168,108,0.52); }
        }
        @keyframes placeholderPulse {
          0%, 100% { color: rgba(244,239,230,0.45); text-shadow: none; }
          50%      { color: rgba(244,239,230,0.92); text-shadow: 0 0 10px rgba(244,239,230,0.55); }
        }
        @keyframes accessWordPulse {
          0%, 100% { opacity: 0.72; filter: drop-shadow(0 0 2px rgba(255,255,255,0.2)); }
          50%      { opacity: 1;    filter: drop-shadow(0 0 10px rgba(255,255,255,0.7)) drop-shadow(0 0 20px rgba(255,255,255,0.3)); }
        }

        .athena-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(201,168,108,0.72);
          outline: none;
          color: rgba(244,239,230,0.95);
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px;
          letter-spacing: 0.22em;
          padding: 7px 0 7px 6px;
          width: 100%;
          transition: border-color 0.3s;
          caret-color: rgba(201,168,108,0.8);
          -webkit-appearance: none;
        }
        .athena-input::placeholder {
          font-family: 'Cormorant Garamond', serif;
          letter-spacing: 0.24em;
          animation: placeholderPulse 2.5s ease-in-out infinite;
        }
        .athena-input:focus {
          border-bottom-color: rgba(201,168,108,1);
          animation: inputFocusPulse 0.5s ease forwards;
        }
        .athena-input:-webkit-autofill,
        .athena-input:-webkit-autofill:hover,
        .athena-input:-webkit-autofill:focus {
          -webkit-text-fill-color: rgba(244,239,230,0.92);
          -webkit-box-shadow: 0 0 0 1000px transparent inset;
          box-shadow: 0 0 0 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s, border-color 0.3s, filter 0.3s;
        }

        .terms-scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(201,168,108,0.25) transparent; }
        .terms-scroll::-webkit-scrollbar { width: 3px; }
        .terms-scroll::-webkit-scrollbar-track { background: transparent; }
        .terms-scroll::-webkit-scrollbar-thumb { background: rgba(201,168,108,0.25); border-radius: 2px; }

        .access-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 1px solid rgba(201,168,108,0.52);
          border-radius: 2px;
          cursor: pointer;
          transition: border-color 0.3s, box-shadow 0.3s;
          -webkit-appearance: none;
        }
        .access-btn:active { border-color: rgba(201,168,108,0.8); box-shadow: 0 0 16px rgba(201,168,108,0.12); }
        .access-btn:disabled { cursor: wait; opacity: 0.6; }
        @keyframes inputsOut {
          from { opacity: 1; transform: translateY(0); max-height: 120px; }
          to   { opacity: 0; transform: translateY(-10px); max-height: 0; }
        }
      `}</style>

      <div className="fixed inset-0 bg-[#060404] overflow-hidden md:absolute">

        {/* ── 1. Hero image ── */}
        <div className="absolute inset-0" style={{ transform: 'scale(1.04)', transformOrigin: 'top center' }}>
          <img
            src={heroImg}
            alt="Athena"
            className="w-full h-full object-cover object-top"
            style={{ filter: 'contrast(1.38) brightness(1.07) saturate(1.22)' }}
            fetchpriority="high"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* ── 2. Base vignette ── */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent via-40% to-black/20" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/18 via-transparent to-black/18" />

        {/* ── 3. Cloud A ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translate(${mouse.x * 4}px, ${mouse.y * 3}px)`, transition: '2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 35% at 25% 15%, rgba(201,168,108,0.14) 0%, rgba(201,168,108,0.05) 40%, transparent 70%)',
            animation: 'cloudA 16s ease-in-out infinite',
            filter: 'blur(18px)',
          }} />
        </div>

        {/* ── 4. Cloud B ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translate(${mouse.x * -2}px, ${mouse.y * -2}px)`, transition: '2.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 55% 40% at 75% 20%, rgba(244,239,230,0.1) 0%, rgba(244,239,230,0.03) 50%, transparent 70%)',
            animation: 'cloudB 22s ease-in-out infinite 2s',
            filter: 'blur(25px)',
          }} />
        </div>

        {/* ── 5. Cloud C ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translate(${mouse.x * 2}px, ${mouse.y * 1}px)`, transition: '2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 30% at 50% 35%, rgba(201,168,108,0.14) 0%, transparent 65%)',
            animation: 'cloudC 30s ease-in-out infinite 5s',
            filter: 'blur(30px)',
          }} />
        </div>

        {/* ── 6. Haze pulse ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(201,168,108,0.15) 0%, transparent 65%)',
            animation: 'hazePulse 8s ease-in-out infinite',
          }}
        />

        {/* ── 7. Light rays ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ mixBlendMode: 'screen' }}>
          <div style={{
            position: 'absolute', top: '-10%', left: '12%',
            width: '25%', height: '110%',
            background: 'linear-gradient(175deg, rgba(201,168,108,0.35) 0%, transparent 60%)',
            animation: 'rayPulse 11s ease-in-out infinite',
            filter: 'blur(16px)',
            transform: 'skewX(-12deg)',
          }} />
          <div style={{
            position: 'absolute', top: '-10%', right: '18%',
            width: '16%', height: '90%',
            background: 'linear-gradient(175deg, rgba(244,239,230,0.25) 0%, transparent 60%)',
            animation: 'rayPulse2 17s ease-in-out infinite 4s',
            filter: 'blur(24px)',
            transform: 'skewX(14deg)',
          }} />
        </div>

        {/* ── 8. Cinematic backlighting ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
          <div style={{
            position: 'absolute', top: '-6%', left: '50%',
            transform: 'translateX(-50%)',
            width: '90%', height: '62%',
            background: 'radial-gradient(ellipse 52% 48% at 50% 26%, rgba(255,252,244,0.13) 0%, rgba(230,220,200,0.06) 45%, transparent 70%)',
            animation: 'haloBreath 6s ease-in-out infinite',
            filter: 'blur(22px)',
          }} />
          <div style={{
            position: 'absolute', top: '2%', left: '50%',
            transform: 'translateX(-50%)',
            width: '55%', height: '38%',
            background: 'radial-gradient(ellipse 55% 55% at 50% 22%, rgba(255,250,240,0.1) 0%, transparent 65%)',
            animation: 'haloBreath 8s ease-in-out infinite 1.5s',
            filter: 'blur(14px)',
          }} />
        </div>

        {/* ── 9. Dust particles ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: `rgba(244,239,230,${p.opacity})`,
              animation: `dust ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }} />
          ))}
        </div>

        {/* ── 10. Ground steam / mist ── */}
        <div className="absolute inset-x-0 pointer-events-none overflow-hidden" style={{ bottom: '0%', height: '35%' }}>
          <div style={{
            position: 'absolute', bottom: '15%', left: '-5%',
            width: '75%', height: '45%',
            background: 'radial-gradient(ellipse 100% 60% at 50% 80%, rgba(230,225,215,0.55) 0%, rgba(230,225,215,0.2) 50%, transparent 75%)',
            animation: 'steamDriftA 12s ease-in-out infinite',
            filter: 'blur(14px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '8%', right: '-5%',
            width: '65%', height: '40%',
            background: 'radial-gradient(ellipse 100% 55% at 50% 85%, rgba(230,225,215,0.45) 0%, rgba(230,225,215,0.15) 55%, transparent 75%)',
            animation: 'steamDriftB 16s ease-in-out infinite 2s',
            filter: 'blur(18px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', left: '5%',
            width: '90%', height: '35%',
            background: 'radial-gradient(ellipse 100% 50% at 50% 90%, rgba(210,205,195,0.4) 0%, transparent 70%)',
            animation: 'steamDriftC 20s ease-in-out infinite 5s',
            filter: 'blur(20px)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '25%',
            background: 'linear-gradient(to top, rgba(200,195,185,0.35) 0%, transparent 100%)',
            filter: 'blur(10px)',
          }} />
        </div>

        {/* ── 11. Warrior ground glow ── */}
        <div style={{
          position: 'absolute',
          bottom: '20%', left: '50%',
          width: '60%', height: '30%',
          background: 'radial-gradient(ellipse, rgba(201,168,108,0.2) 0%, transparent 70%)',
          animation: 'breathe 5s ease-in-out infinite',
          filter: 'blur(18px)',
          pointerEvents: 'none',
        }} />

        {/* ── T&C Overlay ── */}
        {phase === 'terms' && (
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(6,4,4,0.4)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              animation: 'overlayIn 0.35s ease',
              zIndex: 30,
              padding: '28px 20px',
            }}
          >
            <div style={{
              width: '100%',
              maxWidth: '360px',
              maxHeight: '80vh',
              background: 'rgba(6,4,4,0.38)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(201,168,108,0.22)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
            }}>

              {/* Modal header */}
              <div style={{ padding: '22px 22px 14px', borderBottom: '1px solid rgba(201,168,108,0.1)', flexShrink: 0 }}>
                <p style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '9px', letterSpacing: '0.3em',
                  color: 'rgba(201,168,108,0.6)',
                  marginBottom: '7px',
                }}>ATHENA</p>
                <h2 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '16px', fontWeight: 400,
                  color: 'rgba(244,239,230,0.92)',
                  letterSpacing: '0.1em',
                  margin: 0,
                }}>Terms & Conditions</h2>
              </div>

              {/* Scrollable body */}
              <div className="terms-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
                <div style={{
                  fontFamily: "'The Seasons', 'Cormorant Garamond', serif",
                  fontSize: '13px', lineHeight: 1.8,
                  color: 'rgba(244,239,230,0.82)',
                  letterSpacing: '0.02em',
                }}>
                  <p style={{ marginBottom: '14px' }}>
                    Welcome to Athena. By accessing or using our platform, you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. Please read them carefully before proceeding.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(201,168,108,0.6)', marginBottom: '6px', marginTop: '18px' }}>1. ACCEPTANCE OF TERMS</p>
                  <p style={{ marginBottom: '14px' }}>
                    By creating an account or using the Athena application, you acknowledge that you have read, understood, and agree to these terms. If you do not agree, please do not use our services.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(201,168,108,0.6)', marginBottom: '6px', marginTop: '18px' }}>2. HEALTH INFORMATION</p>
                  <p style={{ marginBottom: '14px' }}>
                    Athena provides wellness guidance for informational purposes only. The content within this application is not intended as medical advice. Always consult a qualified healthcare professional before making changes to your health regimen.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(201,168,108,0.6)', marginBottom: '6px', marginTop: '18px' }}>3. PRIVACY &amp; DATA</p>
                  <p style={{ marginBottom: '14px' }}>
                    We take your privacy seriously. Your personal health data is encrypted and stored securely. We will never sell your personal information to third parties. Your cycle data, mood logs, and wellness entries remain private to you.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(201,168,108,0.6)', marginBottom: '6px', marginTop: '18px' }}>4. USER RESPONSIBILITIES</p>
                  <p style={{ marginBottom: '14px' }}>
                    You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to notify us immediately of any unauthorized use of your account.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(201,168,108,0.6)', marginBottom: '6px', marginTop: '18px' }}>5. MODIFICATIONS</p>
                  <p style={{ marginBottom: '4px' }}>
                    Athena reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes your acceptance of the updated terms.
                  </p>
                </div>
              </div>

              {/* Modal footer */}
              <div style={{ padding: '14px 22px 22px', borderTop: '1px solid rgba(201,168,108,0.1)', flexShrink: 0 }}>
                <label
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', cursor: 'pointer', marginBottom: '16px' }}
                  onClick={() => setTermsChecked(v => !v)}
                >
                  {/* Custom checkbox */}
                  <div style={{
                    width: '15px', height: '15px',
                    border: `1px solid ${termsChecked ? 'rgba(201,168,108,0.75)' : 'rgba(201,168,108,0.3)'}`,
                    borderRadius: '2px',
                    background: termsChecked ? 'rgba(201,168,108,0.12)' : 'transparent',
                    flexShrink: 0, marginTop: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    animation: termsChecked ? 'checkboxGlow 0.6s ease' : 'none',
                  }}>
                    {termsChecked && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5l2 2L8 1" stroke="rgba(201,168,108,0.9)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'The Seasons', 'Cormorant Garamond', serif",
                    fontSize: '12px', lineHeight: 1.55,
                    color: 'rgba(244,239,230,0.58)',
                    letterSpacing: '0.02em',
                    userSelect: 'none',
                  }}>
                    I agree to the Terms &amp; Conditions and Privacy Policy
                  </span>
                </label>

                <button
                  onClick={handleAcceptTerms}
                  disabled={!termsChecked}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'transparent',
                    border: `1px solid ${termsChecked ? 'rgba(201,168,108,0.45)' : 'rgba(201,168,108,0.15)'}`,
                    borderRadius: '3px',
                    color: termsChecked ? 'rgba(244,239,230,0.85)' : 'rgba(244,239,230,0.28)',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '10px', letterSpacing: '0.32em',
                    cursor: termsChecked ? 'pointer' : 'not-allowed',
                    transition: 'all 0.25s',
                  }}
                >
                  CONTINUE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Login form ── */}
        {phase === 'form' && (
          <>
            {/* Inputs + inline ACCESS — fades out on auth success */}
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(env(safe-area-inset-bottom) + 108px)',
                left: 0, right: 0,
                padding: '0 38px',
                animation: 'formIn 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
                zIndex: 10,
                opacity: authed ? 0 : 1,
                transition: 'opacity 0.4s ease',
                pointerEvents: authed ? 'none' : 'auto',
              }}
            >
              <form onSubmit={handleSubmit} noValidate>
                {/* Email row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '20px', maxWidth: '285px' }}>
                  <LockIcon />
                  <input
                    className="athena-input"
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

                {/* Password row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '20px', maxWidth: '285px' }}>
                  <LockIcon />
                  <input
                    className="athena-input"
                    type="password"
                    placeholder="PASSWORD"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    enterKeyHint="go"
                    onBlur={() => { if (email.trim() && password.trim()) doAuth() }}
                    disabled={loading}
                  />
                </div>

                {/* Loading dots — immediate feedback while Supabase auth runs */}
                {loading && (
                  <div style={{ display: 'flex', gap: '7px', paddingLeft: '24px', marginBottom: '6px', animation: 'formIn 0.2s ease' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: '5px', height: '5px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(201,168,108,0.75)',
                        animation: `loadingDot 1.1s ease-in-out infinite ${i * 0.18}s`,
                      }} />
                    ))}
                  </div>
                )}

                {/* Inline error */}
                {error && (
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: '13px',
                    color: 'rgba(190,80,80,0.85)',
                    marginBottom: '14px',
                    letterSpacing: '0.03em',
                    lineHeight: 1.4,
                  }}>
                    {error}
                  </p>
                )}

                {/* Hidden submit — allows Enter key to submit */}
                <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
              </form>
            </div>

            {/* Centered ACCESS — appears only after Supabase confirms auth */}
            {authed && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 11,
                animation: 'formIn 0.4s ease',
              }}>
                <button
                  onClick={() => navigate('/')}
                  className="access-btn"
                  style={{
                    minWidth: '160px',
                    animation: 'goldSuccessPulse 1s ease 0.4s both',
                  }}
                >
                  <span style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '11px',
                    letterSpacing: '0.38em',
                    backgroundImage: 'linear-gradient(90deg, rgba(205,198,186,0.82) 0%, rgba(205,198,186,0.82) 30%, rgba(255,255,255,1) 50%, rgba(205,198,186,0.82) 70%, rgba(205,198,186,0.82) 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'shimmer 5s linear infinite, accessWordPulse 2.5s ease-in-out infinite',
                    display: 'inline-block',
                  }}>
                    ACCESS
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ── ATHENA wordmark ── */}
        <div
          onClick={handleWordmarkTap}
          style={{
            position: 'absolute',
            bottom: 'calc(env(safe-area-inset-bottom) + 26px)',
            left: 0, right: 0,
            textAlign: 'center',
            padding: '0 24px',
            animation: 'wordmarkPulse 3s ease-in-out infinite',
            cursor: phase === 'idle' ? 'pointer' : 'default',
            zIndex: 10,
            transition: 'opacity 0.5s ease',
            opacity: phase === 'form' ? 0.4 : 1,
          }}
        >
          <div style={{
            width: '44px', height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(201,168,108,0.6), transparent)',
            margin: '0 auto 13px',
          }} />
          <span style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(28px, 8vw, 50px)',
            fontWeight: 400,
            display: 'block',
            letterSpacing: '0.26em',
            lineHeight: 1,
            transform: 'scaleX(0.84)',
            backgroundImage: 'linear-gradient(90deg, rgba(205,198,186,0.82) 0%, rgba(205,198,186,0.82) 30%, rgba(248,246,242,0.95) 44%, rgba(255,255,255,1) 50%, rgba(248,246,242,0.95) 56%, rgba(205,198,186,0.82) 70%, rgba(205,198,186,0.82) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5)) drop-shadow(0 0 10px rgba(255,255,255,0.35)) drop-shadow(0 0 22px rgba(255,255,255,0.18))',
            animation: 'shimmer 5s linear infinite',
          }}>
            ATHENA
          </span>
        </div>

      </div>
    </>
  )
}
