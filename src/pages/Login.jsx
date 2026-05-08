import { useState, useEffect } from 'react'
import heroImg from '../assets/athena-hero.png'

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: 1 + (i % 3) * 0.7,
  duration: 4 + (i % 6),
  delay: (i * 0.35) % 5,
  opacity: 0.3 + (i % 4) * 0.1,
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
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
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
          0%,100% { box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 0 20px rgba(201,168,108,0.1), inset 0 1px 0 rgba(201,168,108,0.12); }
          50%     { box-shadow: 0 8px 48px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,108,0.22), inset 0 1px 0 rgba(201,168,108,0.22); }
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
            className="w-full h-full object-cover object-top"
            style={{ filter: 'contrast(1.22) brightness(1.05) saturate(1.18)' }}
            fetchpriority="high"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* ── 2. Base vignette ──────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/35 via-transparent via-40% to-black/35" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/15 via-transparent to-black/15" />

        {/* ── 3. Cloud A — parallax outer, animation inner ─────── */}
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

        {/* ── 5. Cloud C — lower drift ──────────────────────────── */}
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

        {/* ── 8. Dust particles ─────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: '50%',
              backgroundColor: `rgba(201,168,108,${p.opacity})`,
              animation: `dust ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }} />
          ))}
        </div>

        {/* ── 9. Ground steam / mist ────────────────────────────── */}
        <div className="absolute inset-x-0 pointer-events-none overflow-hidden" style={{ bottom: '0%', height: '35%' }}>
          {/* Steam wisp A */}
          <div style={{
            position: 'absolute', bottom: '15%', left: '-5%',
            width: '75%', height: '45%',
            background: 'radial-gradient(ellipse 100% 60% at 50% 80%, rgba(230,225,215,0.55) 0%, rgba(230,225,215,0.2) 50%, transparent 75%)',
            animation: 'steamDriftA 12s ease-in-out infinite',
            filter: 'blur(14px)',
          }} />
          {/* Steam wisp B */}
          <div style={{
            position: 'absolute', bottom: '8%', right: '-5%',
            width: '65%', height: '40%',
            background: 'radial-gradient(ellipse 100% 55% at 50% 85%, rgba(230,225,215,0.45) 0%, rgba(230,225,215,0.15) 55%, transparent 75%)',
            animation: 'steamDriftB 16s ease-in-out infinite 2s',
            filter: 'blur(18px)',
          }} />
          {/* Steam wisp C — wide center */}
          <div style={{
            position: 'absolute', bottom: '5%', left: '5%',
            width: '90%', height: '35%',
            background: 'radial-gradient(ellipse 100% 50% at 50% 90%, rgba(210,205,195,0.4) 0%, transparent 70%)',
            animation: 'steamDriftC 20s ease-in-out infinite 5s',
            filter: 'blur(20px)',
          }} />
          {/* Permanent ground haze */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '25%',
            background: 'linear-gradient(to top, rgba(200,195,185,0.35) 0%, transparent 100%)',
            filter: 'blur(10px)',
          }} />
        </div>

        {/* ── 10. Warrior glow ──────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: '20%', left: '50%',
          width: '60%', height: '30%',
          background: 'radial-gradient(ellipse, rgba(201,168,108,0.2) 0%, transparent 70%)',
          animation: 'breathe 5s ease-in-out infinite',
          filter: 'blur(18px)',
          pointerEvents: 'none',
        }} />


      </div>
    </>
  )
}
