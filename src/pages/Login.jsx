import { useState, useEffect } from 'react'
import heroImg from '../assets/athena-hero.png'

// Deterministic particles — fixed so they don't regenerate on re-render
const PARTICLES = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: 0.8 + (i % 3) * 0.6,
  duration: 5 + (i % 7),
  delay: (i * 0.4) % 6,
  opacity: 0.15 + (i % 5) * 0.07,
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

  const ease = '0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)'

  return (
    <>
      <style>{`
        @keyframes cloudA {
          0%,100% { transform: translateX(-4%) scale(1); }
          50%      { transform: translateX(4%) scale(1.04); }
        }
        @keyframes cloudB {
          0%,100% { transform: translateX(6%) translateY(2%); }
          55%     { transform: translateX(-4%) translateY(-1%); }
        }
        @keyframes hazePulse {
          0%,100% { opacity: 0.12; }
          50%     { opacity: 0.26; }
        }
        @keyframes rayA {
          0%,100% { opacity: 0.05; transform: skewX(-14deg) translateX(-8%); }
          50%     { opacity: 0.14; transform: skewX(-14deg) translateX(2%); }
        }
        @keyframes rayB {
          0%,100% { opacity: 0.02; transform: skewX(18deg) translateX(6%); }
          50%     { opacity: 0.09; transform: skewX(18deg) translateX(-4%); }
        }
        @keyframes dust {
          0%   { transform: translateY(0);    opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
        @keyframes breathe {
          0%,100% { opacity: 0.25; transform: scale(1); }
          50%     { opacity: 0.55; transform: scale(1.06); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative flex-1 min-h-dvh bg-[#060404] overflow-hidden">

        {/* ── 1. Hero image — parallax ──────────────────────────── */}
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(1.1) translate(${mouse.x * -10}px, ${mouse.y * -10}px)`,
            transition: ease,
          }}
        >
          <img
            src={heroImg}
            alt="Athena"
            className="w-full h-full object-cover object-top"
            style={{ filter: 'contrast(1.1) brightness(0.9) saturate(1.12)' }}
            draggable={false}
          />
        </div>

        {/* ── 2. Base vignette ──────────────────────────────────── */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent via-40% to-black/88 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25 pointer-events-none" />

        {/* ── 3. Cloud drift A — gold tinted ───────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 85% 45% at 28% 18%, rgba(201,168,108,0.07) 0%, transparent 70%)',
            animation: 'cloudA 20s ease-in-out infinite',
            filter: 'blur(45px)',
            transform: `translate(${mouse.x * 14}px, ${mouse.y * 9}px)`,
            transition: '1.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />

        {/* ── 4. Cloud drift B — ivory tinted ──────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 65% 50% at 72% 25%, rgba(244,239,230,0.05) 0%, transparent 65%)',
            animation: 'cloudB 28s ease-in-out infinite 3s',
            filter: 'blur(65px)',
            transform: `translate(${mouse.x * -7}px, ${mouse.y * -5}px)`,
            transition: '1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />

        {/* ── 5. Atmospheric haze top ───────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 110% 55% at 50% 0%, rgba(201,168,108,0.09) 0%, transparent 70%)',
            animation: 'hazePulse 9s ease-in-out infinite',
          }}
        />

        {/* ── 6. Light rays ─────────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ mixBlendMode: 'screen' }}>
          <div style={{
            position: 'absolute', top: '-15%', left: '8%',
            width: '28%', height: '115%',
            background: 'linear-gradient(to bottom, rgba(201,168,108,0.14), transparent 80%)',
            animation: 'rayA 14s ease-in-out infinite',
            filter: 'blur(22px)',
          }} />
          <div style={{
            position: 'absolute', top: '-15%', right: '12%',
            width: '18%', height: '100%',
            background: 'linear-gradient(to bottom, rgba(244,239,230,0.07), transparent 70%)',
            animation: 'rayB 19s ease-in-out infinite 5s',
            filter: 'blur(32px)',
          }} />
        </div>

        {/* ── 7. Dust particles ─────────────────────────────────── */}
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

        {/* ── 8. Warrior ambient glow ───────────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: '18%', left: '50%',
          transform: 'translateX(-50%)',
          width: '55%', height: '28%',
          background: 'radial-gradient(ellipse, rgba(201,168,108,0.14) 0%, transparent 70%)',
          animation: 'breathe 6s ease-in-out infinite',
          filter: 'blur(22px)',
          pointerEvents: 'none',
        }} />

        {/* ── 9. Glass UI panel ─────────────────────────────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center"
          style={{
            paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))',
            animation: 'fadeUp 1.4s ease-out 0.4s both',
          }}
        >
          <div style={{
            background: 'rgba(6,4,4,0.38)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(201,168,108,0.22)',
            borderRadius: '22px',
            padding: '26px 44px',
            boxShadow: [
              '0 8px 48px rgba(0,0,0,0.5)',
              '0 1px 0 rgba(201,168,108,0.12) inset',
              '0 -1px 0 rgba(0,0,0,0.3) inset',
            ].join(', '),
            textAlign: 'center',
            minWidth: '260px',
          }}>
            <h1
              className="font-cinzel text-5xl tracking-[0.32em]"
              style={{
                background: 'linear-gradient(135deg, #F4EFE6 0%, #C9A86C 35%, #F4EFE6 55%, #C9A86C 80%, #F4EFE6 100%)',
                backgroundSize: '250% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 7s linear infinite',
                filter: 'drop-shadow(0 0 18px rgba(201,168,108,0.45))',
              }}
            >
              ATHENA
            </h1>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: 'rgba(244,239,230,0.58)',
              letterSpacing: '0.22em',
              fontSize: '0.78rem',
              marginTop: '8px',
            }}>
              Your strength. Your cycle. Your story.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
