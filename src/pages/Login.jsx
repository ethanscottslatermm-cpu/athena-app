import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImg    from '../assets/athena-hero.webp'
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

const PARTICLES = Array.from({ length: 170 }, (_, i) => ({
  id: i,
  // ~65% of particles clustered behind the figure (centre of frame x:22–76%)
  x: i < 110
    ? 22 + (i * 41 + 7) % 54
    : (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: 0.7 + (i % 5) * 0.45,
  duration: 3.0 + (i % 7) * 0.85,
  delay: (i * 0.22) % 8,
  opacity: 0.35 + (i % 6) * 0.11,
  anim: ANIM_TYPES[i % ANIM_TYPES.length],
  color: GOLD_COLORS[i % GOLD_COLORS.length],
}))


export default function Login() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
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
  const videoRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {
        navigate(navDest.current, { replace: true })
      })
    }
  }, [showVideo])

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
        @keyframes breathe {
          0%,100% { opacity: 0.35; transform: translateX(-50%) scale(1); }
          50%     { opacity: 0.65; transform: translateX(-50%) scale(1.08); }
        }
        @keyframes headFogA {
          0%   { transform: translateX(-10%) scaleX(1);    opacity: 0.4; }
          28%  { transform: translateX(7%)   scaleX(1.14); opacity: 0.65; }
          55%  { transform: translateX(-4%)  scaleX(0.96); opacity: 0.48; }
          82%  { transform: translateX(5%)   scaleX(1.08); opacity: 0.6; }
          100% { transform: translateX(-10%) scaleX(1);    opacity: 0.4; }
        }
        @keyframes headFogB {
          0%   { transform: translateX(9%)  translateY(0%)  scaleX(1.06); opacity: 0.32; }
          32%  { transform: translateX(-8%) translateY(-2%) scaleX(0.93); opacity: 0.58; }
          64%  { transform: translateX(6%)  translateY(1%)  scaleX(1.12); opacity: 0.42; }
          100% { transform: translateX(9%)  translateY(0%)  scaleX(1.06); opacity: 0.32; }
        }
        @keyframes headFogC {
          0%   { transform: translateX(-5%) translateY(1%)  scaleX(1);    opacity: 0.5; }
          22%  { transform: translateX(8%)  translateY(-2%) scaleX(1.1);  opacity: 0.68; }
          48%  { transform: translateX(-7%) translateY(0%)  scaleX(0.91); opacity: 0.44; }
          75%  { transform: translateX(4%)  translateY(-1%) scaleX(1.07); opacity: 0.62; }
          100% { transform: translateX(-5%) translateY(1%)  scaleX(1);    opacity: 0.5; }
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
          0%   { filter: drop-shadow(0 0 0px rgba(212,160,160,0)); }
          50%  { filter: drop-shadow(0 0 14px rgba(212,160,160,0.4)); }
          100% { filter: drop-shadow(0 2px 8px rgba(212,160,160,0.15)); }
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
          0%, 25% { color: rgba(215,210,232,0.65); text-shadow: 0 0 6px rgba(230,226,248,0.22); }
          50%     { color: rgba(240,237,252,1);    text-shadow: 0 0 10px rgba(255,255,255,0.9), 0 0 24px rgba(228,224,250,0.6), 0 0 48px rgba(208,204,240,0.26); }
          75%, 100%{ color: rgba(215,210,232,0.65); text-shadow: 0 0 6px rgba(230,226,248,0.22); }
        }
        @keyframes accessWordPulse {
          0%, 100% { opacity: 0.68; filter: drop-shadow(0 0 2px rgba(255,255,255,0.2)); }
          50%      { opacity: 1;    filter: drop-shadow(0 0 12px rgba(255,255,255,0.95)) drop-shadow(0 0 28px rgba(255,255,255,0.5)); }
        }
        @keyframes iconColorPulse {
          0%, 25% { color: rgba(215,210,232,0.65); filter: drop-shadow(0 0 4px rgba(228,225,248,0.28)); }
          50%     { color: rgba(240,237,252,1);    filter: drop-shadow(0 0 11px rgba(255,255,255,0.9)) drop-shadow(0 0 24px rgba(222,218,248,0.42)); }
          75%, 100%{ color: rgba(215,210,232,0.65); filter: drop-shadow(0 0 4px rgba(228,225,248,0.28)); }
        }
        @keyframes inputIconShimmer {
          0%, 35%   { background-position: -250% 0; }
          65%, 100% { background-position:  250% 0; }
        }
        @keyframes linePulse {
          0%   { border-bottom-color: rgba(235,215,140,0.42); box-shadow: 0 1px 4px rgba(255,242,195,0.1); }
          40%  { border-bottom-color: rgba(255,242,168,1);    box-shadow: 0 1px 16px rgba(255,248,215,0.72), 0 2px 38px rgba(255,236,188,0.34); }
          100% { border-bottom-color: rgba(235,215,140,0.48); box-shadow: 0 1px 7px rgba(255,244,205,0.18); }
        }

        .iw {
          position: relative;
          margin-bottom: 20px;
          max-width: 285px;
        }
        .iw input {
          padding: 14px 16px 14px 42px;
        }
        .input-icon-img {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          display: block;
          pointer-events: none;
          animation: iconColorPulse 2.5s ease-in-out infinite;
        }
        .iw input:focus {
          background: rgba(255,252,245,0.015);
        }

        .athena-input {
          background: transparent;
          border: none;
          outline: none;
          color: rgba(59,51,48,0.92);
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px;
          letter-spacing: 0.22em;
          padding: 7px 0 7px 6px;
          width: 100%;
          transition: box-shadow 0.3s;
          caret-color: rgba(255,230,120,0.9);
          -webkit-appearance: none;
        }
        .athena-input::placeholder {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 500;
          letter-spacing: 0.24em;
          animation: placeholderPulse 2.5s ease-in-out infinite;
        }
        .athena-input:-webkit-autofill,
        .athena-input:-webkit-autofill:hover,
        .athena-input:-webkit-autofill:focus {
          -webkit-text-fill-color: rgba(59,51,48,0.88);
          -webkit-box-shadow: 0 0 0 1000px transparent inset;
          box-shadow: 0 0 0 1000px transparent inset;
          transition: background-color 5000s ease-in-out 0s, border-color 0.3s, filter 0.3s;
        }

        .athena-hero-img { filter: contrast(1.28) brightness(1.22) saturate(1.1); }
        @media (min-width: 769px) {
          .athena-hero-img {
            filter: contrast(1.14) brightness(1.12) saturate(1.04);
            object-position: center 20%;
          }
        }

        .terms-scroll { overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(212,160,160,0.25) transparent; }
        .terms-scroll::-webkit-scrollbar { width: 3px; }
        .terms-scroll::-webkit-scrollbar-track { background: transparent; }
        .terms-scroll::-webkit-scrollbar-thumb { background: rgba(212,160,160,0.25); border-radius: 2px; }

        .access-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          border: 1px solid rgba(212,160,160,0.52);
          border-radius: 2px;
          cursor: pointer;
          transition: border-color 0.3s, box-shadow 0.3s;
          -webkit-appearance: none;
        }
        .access-btn:active { border-color: rgba(212,160,160,0.8); box-shadow: 0 0 16px rgba(212,160,160,0.12); }
        .access-btn:disabled { cursor: wait; opacity: 0.6; }
        @keyframes inputsOut {
          from { opacity: 1; transform: translateY(0); max-height: 120px; }
          to   { opacity: 0; transform: translateY(-10px); max-height: 0; }
        }
        @keyframes videoFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes videoFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      <div className="fixed inset-0 bg-[#F2EDE8] overflow-hidden md:absolute">

        {/* ── 1. Hero image ── */}
        <div className="absolute inset-0" style={{ transform: 'scale(1.04)', transformOrigin: 'top center' }}>
          <img
            src={heroImg}
            alt="Athena"
            className="athena-hero-img w-full h-full object-cover object-top"
            fetchpriority="high"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* ── 2. Base vignette ── */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent via-40% to-black/10" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/8 via-transparent to-black/8" />

        {/* ── 2b. Feminine light bloom ── */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 90% 65% at 50% 35%, rgba(255,245,248,0.22) 0%, rgba(245,235,245,0.1) 50%, transparent 75%)',
          mixBlendMode: 'screen',
        }} />

        {/* ── 3. Cloud A ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translate(${mouse.x * 4}px, ${mouse.y * 3}px)`, transition: '2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 35% at 25% 15%, rgba(212,160,160,0.28) 0%, rgba(212,160,160,0.1) 40%, transparent 70%)',
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
            background: 'radial-gradient(ellipse 55% 40% at 75% 20%, rgba(212,160,160,0.25) 0%, rgba(212,160,160,0.08) 50%, transparent 70%)',
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
            background: 'radial-gradient(ellipse 80% 30% at 50% 35%, rgba(212,160,160,0.22) 0%, transparent 65%)',
            animation: 'cloudC 30s ease-in-out infinite 5s',
            filter: 'blur(30px)',
          }} />
        </div>

        {/* ── 6. Haze pulse ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(212,160,160,0.22) 0%, transparent 65%)',
            animation: 'hazePulse 8s ease-in-out infinite',
          }}
        />

        {/* ── 7. Light rays ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ mixBlendMode: 'screen' }}>
          <div style={{
            position: 'absolute', top: '-10%', left: '12%',
            width: '25%', height: '110%',
            background: 'linear-gradient(175deg, rgba(212,160,160,0.4) 0%, transparent 60%)',
            animation: 'rayPulse 11s ease-in-out infinite',
            filter: 'blur(16px)',
            transform: 'skewX(-12deg)',
          }} />
          <div style={{
            position: 'absolute', top: '-10%', right: '18%',
            width: '16%', height: '90%',
            background: 'linear-gradient(175deg, rgba(212,160,160,0.28) 0%, transparent 60%)',
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
              backgroundColor: `${p.color}${p.opacity})`,
              boxShadow: p.size >= 2.5
                ? `0 0 ${p.size * 3}px ${p.color}${p.opacity * 0.8}), 0 0 ${p.size * 6}px ${p.color}${p.opacity * 0.35})`
                : `0 0 ${p.size * 2}px ${p.color}${p.opacity * 0.5})`,
              animation: `${p.anim} ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }} />
          ))}
        </div>

        {/* ── 10. Head fog / crown mist ── */}
        <div className="absolute inset-x-0 pointer-events-none overflow-hidden" style={{ top: '0%', height: '34%' }}>
          <div style={{
            position: 'absolute', top: '18%', left: '5%',
            width: '90%', height: '55%',
            background: 'radial-gradient(ellipse 100% 55% at 50% 30%, rgba(222,216,208,0.55) 0%, rgba(222,216,208,0.18) 55%, transparent 78%)',
            animation: 'headFogA 14s ease-in-out infinite',
            filter: 'blur(24px)',
          }} />
          <div style={{
            position: 'absolute', top: '5%', left: '-5%',
            width: '110%', height: '50%',
            background: 'radial-gradient(ellipse 90% 45% at 50% 22%, rgba(215,208,198,0.42) 0%, rgba(215,208,198,0.12) 60%, transparent 80%)',
            animation: 'headFogB 19s ease-in-out infinite 4s',
            filter: 'blur(30px)',
          }} />
          <div style={{
            position: 'absolute', top: '25%', left: '8%',
            width: '84%', height: '50%',
            background: 'radial-gradient(ellipse 85% 40% at 50% 20%, rgba(228,220,208,0.38) 0%, transparent 72%)',
            animation: 'headFogC 24s ease-in-out infinite 8s',
            filter: 'blur(34px)',
          }} />
        </div>

        {/* ── 11. Ground steam / mist ── */}
        <div className="absolute inset-x-0 pointer-events-none overflow-hidden" style={{ bottom: '0%', height: '35%' }}>
          <div style={{
            position: 'absolute', bottom: '15%', left: '-5%',
            width: '75%', height: '45%',
            background: 'radial-gradient(ellipse 100% 60% at 50% 80%, rgba(220,210,200,0.75) 0%, rgba(220,210,200,0.3) 50%, transparent 75%)',
            animation: 'steamDriftA 12s ease-in-out infinite',
            filter: 'blur(14px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '8%', right: '-5%',
            width: '65%', height: '40%',
            background: 'radial-gradient(ellipse 100% 55% at 50% 85%, rgba(220,210,200,0.65) 0%, rgba(220,210,200,0.2) 55%, transparent 75%)',
            animation: 'steamDriftB 16s ease-in-out infinite 2s',
            filter: 'blur(18px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', left: '5%',
            width: '90%', height: '35%',
            background: 'radial-gradient(ellipse 100% 50% at 50% 90%, rgba(210,205,195,0.65) 0%, transparent 70%)',
            animation: 'steamDriftC 20s ease-in-out infinite 5s',
            filter: 'blur(20px)',
          }} />
          {/* extra organic foot layers */}
          <div style={{
            position: 'absolute', bottom: '18%', left: '15%',
            width: '70%', height: '38%',
            background: 'radial-gradient(ellipse 100% 50% at 50% 75%, rgba(218,210,198,0.55) 0%, transparent 72%)',
            animation: 'headFogA 17s ease-in-out infinite 3s',
            filter: 'blur(22px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', left: '-8%',
            width: '80%', height: '42%',
            background: 'radial-gradient(ellipse 100% 45% at 50% 82%, rgba(212,205,194,0.48) 0%, transparent 70%)',
            animation: 'headFogB 21s ease-in-out infinite 9s',
            filter: 'blur(26px)',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '25%',
            background: 'linear-gradient(to top, rgba(200,195,185,0.6) 0%, transparent 100%)',
            filter: 'blur(10px)',
          }} />
        </div>

        {/* ── 12. Warrior ground glow ── */}
        <div style={{
          position: 'absolute',
          bottom: '20%', left: '50%',
          width: '60%', height: '30%',
          background: 'radial-gradient(ellipse, rgba(212,160,160,0.32) 0%, transparent 70%)',
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
              background: 'transparent',
              animation: 'overlayIn 0.35s ease',
              zIndex: 30,
              padding: '28px 20px',
            }}
          >
            <div style={{
              width: '100%',
              maxWidth: '360px',
              maxHeight: '80vh',
              background: 'transparent',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(212,160,160,0.25)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 8px 48px rgba(0,0,0,0.25)',
            }}>

              {/* Modal header */}
              <div style={{ padding: '22px 22px 14px', borderBottom: '1px solid rgba(212,160,160,0.2)', flexShrink: 0 }}>
                <p style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '9px', letterSpacing: '0.3em',
                  color: 'rgba(212,160,160,0.7)',
                  marginBottom: '7px',
                }}>ATHENA</p>
                <h2 style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '16px', fontWeight: 400,
                  color: 'rgba(59,51,48,0.88)',
                  letterSpacing: '0.1em',
                  margin: 0,
                }}>Terms & Conditions</h2>
              </div>

              {/* Scrollable body */}
              <div className="terms-scroll" style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
                <div style={{
                  fontFamily: "'The Seasons', 'Cormorant Garamond', serif",
                  fontSize: '13px', lineHeight: 1.8,
                  color: 'rgba(59,51,48,0.75)',
                  letterSpacing: '0.02em',
                }}>
                  <p style={{ marginBottom: '14px' }}>
                    Welcome to Athena. By accessing or using our platform, you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. Please read them carefully before proceeding.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(212,160,160,0.75)', marginBottom: '6px', marginTop: '18px' }}>1. ACCEPTANCE OF TERMS</p>
                  <p style={{ marginBottom: '14px' }}>
                    By creating an account or using the Athena application, you acknowledge that you have read, understood, and agree to these terms. If you do not agree, please do not use our services.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(212,160,160,0.75)', marginBottom: '6px', marginTop: '18px' }}>2. HEALTH INFORMATION</p>
                  <p style={{ marginBottom: '14px' }}>
                    Athena provides wellness guidance for informational purposes only. The content within this application is not intended as medical advice. Always consult a qualified healthcare professional before making changes to your health regimen.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(212,160,160,0.75)', marginBottom: '6px', marginTop: '18px' }}>3. PRIVACY &amp; DATA</p>
                  <p style={{ marginBottom: '14px' }}>
                    We take your privacy seriously. Your personal health data is encrypted and stored securely. We will never sell your personal information to third parties. Your cycle data, mood logs, and wellness entries remain private to you.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(212,160,160,0.75)', marginBottom: '6px', marginTop: '18px' }}>4. USER RESPONSIBILITIES</p>
                  <p style={{ marginBottom: '14px' }}>
                    You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to notify us immediately of any unauthorized use of your account.
                  </p>

                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(212,160,160,0.75)', marginBottom: '6px', marginTop: '18px' }}>5. MODIFICATIONS</p>
                  <p style={{ marginBottom: '4px' }}>
                    Athena reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes your acceptance of the updated terms.
                  </p>
                </div>
              </div>

              {/* Modal footer */}
              <div style={{ padding: '14px 22px 22px', borderTop: '1px solid rgba(212,160,160,0.2)', flexShrink: 0 }}>
                <label
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', cursor: 'pointer', marginBottom: '16px' }}
                  onClick={() => setTermsChecked(v => !v)}
                >
                  {/* Custom checkbox */}
                  <div style={{
                    width: '15px', height: '15px',
                    border: `1px solid ${termsChecked ? 'rgba(212,160,160,0.75)' : 'rgba(212,160,160,0.35)'}`,
                    borderRadius: '2px',
                    background: termsChecked ? 'rgba(212,160,160,0.12)' : 'transparent',
                    flexShrink: 0, marginTop: '2px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                    animation: termsChecked ? 'checkboxGlow 0.6s ease' : 'none',
                  }}>
                    {termsChecked && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5l2 2L8 1" stroke="rgba(212,160,160,0.9)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'The Seasons', 'Cormorant Garamond', serif",
                    fontSize: '12px', lineHeight: 1.55,
                    color: 'rgba(59,51,48,0.6)',
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
                    border: `1px solid ${termsChecked ? 'rgba(212,160,160,0.55)' : 'rgba(212,160,160,0.2)'}`,
                    borderRadius: '3px',
                    color: termsChecked ? 'rgba(59,51,48,0.88)' : 'rgba(59,51,48,0.3)',
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
              <div className="iw">
                <span className="input-icon-img">
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
                    pointerEvents: 'none',
                  }} />
                </span>
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
              <div className="iw">
                <span className="input-icon-img">
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
                    pointerEvents: 'none',
                  }} />
                </span>
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

              {/* Loading dots */}
              {loading && (
                <div style={{ display: 'flex', gap: '7px', paddingLeft: '24px', marginBottom: '6px', animation: 'formIn 0.2s ease' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '5px', height: '5px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(212,160,160,0.75)',
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

              <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
            </form>
          </div>
        )}

        {/* ── ACCESS button — appears after auth, triggers loading video ── */}
        {authed && !showVideo && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 11,
            animation: 'formIn 0.4s ease',
          }}>
            <button
              onClick={() => setShowVideo(true)}
              className="access-btn"
              style={{ minWidth: '160px', animation: 'goldSuccessPulse 1s ease 0.4s both' }}
            >
              <span style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '12px',
                fontWeight: 500,
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


        {/* ── Loading video — plays once after ACCESS tap, fades to linen ── */}
        {showVideo && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: '#F2EDE8',
            animation: videoFading
              ? 'videoFadeOut 0.7s ease forwards'
              : 'videoFadeIn 0.9s ease forwards',
          }}>
            <video
              ref={videoRef}
              src="/athena-loading.mp4"
              playsInline
              preload="auto"
              onEnded={() => {
                setVideoFading(true)
                setTimeout(() => navigate(navDest.current, { replace: true }), 700)
              }}
              onError={() => navigate(navDest.current, { replace: true })}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
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
            background: 'linear-gradient(to right, transparent, rgba(212,160,160,0.5), transparent)',
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
            backgroundImage: 'linear-gradient(90deg, rgba(212,208,232,0.82) 0%, rgba(212,208,232,0.82) 30%, rgba(240,237,252,0.95) 44%, rgba(248,246,255,1) 50%, rgba(240,237,252,0.95) 56%, rgba(212,208,232,0.82) 70%, rgba(212,208,232,0.82) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 3px rgba(238,234,255,0.55)) drop-shadow(0 0 10px rgba(222,218,248,0.38)) drop-shadow(0 0 22px rgba(210,206,242,0.2))',
            animation: 'shimmer 5s linear infinite',
          }}>
            ATHENA
          </span>
        </div>

      </div>
    </>
  )
}
