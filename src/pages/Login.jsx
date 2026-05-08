import { useState, useEffect } from 'react'
import heroImg from '../assets/athena-hero.webp'

const PARTICLES = Array.from({ length: 68 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: i < 40
    ? (i * 53 + 7) % 100
    : 56 + ((i * 31 + 17) % 38),
  size: 0.8 + (i % 3) * 0.65,
  duration: 3 + (i % 7),
  delay: (i * 0.28) % 6,
  opacity: 0.18 + (i % 5) * 0.1,
}))

export default function Login() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

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

  return (
    <>
      <style>{`
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
        @keyframes borderGlow {
          0%,100% { box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 0 20px rgba(255,252,245,0.08), inset 0 1px 0 rgba(255,252,245,0.1); }
          50%     { box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 0 40px rgba(255,252,245,0.18), inset 0 1px 0 rgba(255,252,245,0.18); }
        }
        @keyframes haloBreath {
          0%,100% { opacity: 0.75; }
          50%     { opacity: 1; }
        }

        /* ── Hero image ─────────────────────────────────────────── */
        .athena-hero-img {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: top center;
        }

        /* ── PWA standalone: size by width to match browser composition ── */
        @media (display-mode: standalone) {
          .athena-hero-img {
            left: -10%;
            width: 120%;
            height: auto;
            object-fit: initial;
            object-position: initial;
          }
          .athena-steam {
            height: 55% !important;
          }
          .athena-grad {
            height: 62% !important;
            background: linear-gradient(to top,
              rgba(4,3,3,1) 0%,
              rgba(4,3,3,1) 16%,
              rgba(4,3,3,0.92) 30%,
              rgba(4,3,3,0.6) 46%,
              rgba(4,3,3,0.15) 66%,
              transparent 100%
            ) !important;
          }
        }
      `}</style>

      <div
        className="relative flex-1 bg-[#060404] overflow-hidden"
        style={{
          marginTop: 'calc(-1 * env(safe-area-inset-top))',
          minHeight: 'calc(100dvh + env(safe-area-inset-top))',
        }}
      >

        {/* ── 1. Hero image — parallax wrapper ─────────────────── */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${mouse.x * -8}px, ${mouse.y * -8}px)`,
            transition: '0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <img
            src={heroImg}
            alt="Athena"
            className="athena-hero-img"
            style={{ filter: 'contrast(1.38) brightness(1.07) saturate(1.22)' }}
            fetchpriority="high"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* ── 2. Base vignette ──────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent via-40% to-black/20" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/18 via-transparent to-black/18" />

        {/* ── 3. Cloud A ────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${mouse.x * 16}px, ${mouse.y * 10}px)`,
            transition: '1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 35% at 25% 15%, rgba(201,168,108,0.14) 0%, rgba(201,168,108,0.05) 40%, transparent 70%)',
            animation: 'cloudA 16s ease-in-out infinite',
            filter: 'blur(18px)',
          }} />
        </div>

        {/* ── 4. Cloud B ────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${mouse.x * -8}px, ${mouse.y * -6}px)`,
            transition: '1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 55% 40% at 75% 20%, rgba(244,239,230,0.1) 0%, rgba(244,239,230,0.03) 50%, transparent 70%)',
            animation: 'cloudB 22s ease-in-out infinite 2s',
            filter: 'blur(25px)',
          }} />
        </div>

        {/* ── 5. Cloud C ────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${mouse.x * 6}px, ${mouse.y * 4}px)`,
            transition: '2.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 30% at 50% 35%, rgba(201,168,108,0.14) 0%, transparent 65%)',
            animation: 'cloudC 30s ease-in-out infinite 5s',
            filter: 'blur(30px)',
          }} />
        </div>

        {/* ── 6. Haze pulse ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(201,168,108,0.15) 0%, transparent 65%)',
            animation: 'hazePulse 8s ease-in-out infinite',
          }}
        />

        {/* ── 7. Light rays ─────────────────────────────────────── */}
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

        {/* ── 8. Cinematic backlighting — head / cape ───────────── */}
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

        {/* ── 9. Dust particles ─────────────────────────────────── */}
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

        {/* ── 10. Ground steam / mist ───────────────────────────── */}
        <div className="athena-steam absolute inset-x-0 pointer-events-none overflow-hidden" style={{ bottom: '0%', height: '35%' }}>
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

        {/* ── 11. Warrior ground glow ───────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: '20%', left: '50%',
          width: '60%', height: '30%',
          background: 'radial-gradient(ellipse, rgba(201,168,108,0.2) 0%, transparent 70%)',
          animation: 'breathe 5s ease-in-out infinite',
          filter: 'blur(18px)',
          pointerEvents: 'none',
        }} />

        {/* ── 12. Bottom dark gradient ──────────────────────────── */}
        <div
          className="athena-grad absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '30%',
            background: 'linear-gradient(to top, rgba(4,3,3,0.9) 0%, rgba(4,3,3,0.6) 40%, transparent 100%)',
          }}
        />

        {/* ── 13. Athena wordmark — bottom pinned ───────────────── */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom) + 26px)',
            left: 0, right: 0,
            textAlign: 'center',
            padding: '0 24px',
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
            color: 'rgba(244,239,230,0.97)',
            display: 'block',
            letterSpacing: '0.34em',
            textShadow: '0 0 22px rgba(255,255,255,0.26), 0 0 44px rgba(255,255,255,0.1), 0 1px 5px rgba(0,0,0,0.8)',
            lineHeight: 1,
          }}>
            ATHENA
          </span>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(11px, 3vw, 15px)',
            fontStyle: 'italic',
            fontWeight: 300,
            color: 'rgba(201,168,108,0.68)',
            display: 'block',
            letterSpacing: '0.2em',
            marginTop: '10px',
          }}>
            Your story.
          </span>
        </div>

      </div>
    </>
  )
}
